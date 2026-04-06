from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
import re

from .jira import JiraClient, JiraIssue
from .models import CleanupStatus, GateRecord, Verdict
from .store import RuntimeStore


DEFAULT_NOW = datetime(2026, 4, 6, 9, 0, 0)
OPERATIONAL_TYPES = {"Bug", "Service Request", "Incident", "Task"}
PROJECT_TYPES = {"Story", "Epic", "Feature Request", "Improvement"}
SENSITIVE_PATTERNS = ("token", "secret", "password", "cookie")


@dataclass(slots=True)
class TicketContext:
    key: str
    summary: str
    description: str
    issue_type: str
    project: str
    priority: str
    labels: list[str]


class AutonomousRuntimeService:
    def __init__(self, workspace: Path, *, jira_client: JiraClient | None = None) -> None:
        self.workspace = Path(workspace)
        self.store = RuntimeStore(self.workspace)
        self.jira_client = jira_client or JiraClient.from_workspace(self.workspace)

    def process_ticket(self, payload: dict[str, object]) -> dict[str, object]:
        now = DEFAULT_NOW
        ticket = self._build_ticket(payload["ticket"])
        knowledge = payload.get("knowledge", {})
        actions = payload.get("actions", [])
        classification = self._classify(ticket)
        confidence = self._confidence(ticket, knowledge)
        slug = self._slug(ticket.key)
        existing_run = self.store.get_run(ticket.key)

        gate_results: dict[str, str] = {}
        attempts = int(existing_run["attempts"]) + 1 if existing_run is not None else 1
        state = "running"
        current_stage = "planned"

        self._write_task_brief(ticket, classification, slug)
        self._write_ongoing_plan(
            ticket,
            slug,
            current_owner="Lead",
            current_step="Classify and prepare the runtime work package.",
            current_state="The runtime opened the task and fixed the initial scope.",
            verdict="APPROVED",
            attempts=attempts,
            evidence=["Lead created the task brief and initialized runtime state."],
            next_owner="Analyst",
            next_step="Analyze the ticket and prepare gate evidence.",
        )

        gate1 = self._run_gate1(ticket, knowledge)
        gate_results["gate1"] = gate1.verdict.value
        self._write_review_report(ticket, slug, "guardian-gate1", gate1, "Lead", "Approve execution plan.")
        if gate1.verdict is not Verdict.APPROVED:
            return self._finalize_non_happy_path(
                ticket=ticket,
                classification=classification,
                confidence=confidence,
                gate_results=gate_results,
                state="changes_requested",
                current_stage="gate1",
                attempts=attempts,
                reason=gate1.reason,
                updated_at=now.isoformat(),
            )

        lead_approval = self._approve_execution(confidence, actions)
        if lead_approval.verdict is not Verdict.APPROVED:
            gate_results["gate2"] = lead_approval.verdict.value
            return self._finalize_non_happy_path(
                ticket=ticket,
                classification=classification,
                confidence=confidence,
                gate_results=gate_results,
                state="blocked",
                current_stage="approval",
                attempts=attempts,
                reason=lead_approval.reason,
                updated_at=now.isoformat(),
            )

        execution_evidence = self._execute_actions(actions)
        gate2 = self._run_gate2(actions, execution_evidence)
        gate_results["gate2"] = gate2.verdict.value
        self._write_review_report(ticket, slug, "guardian-gate2", gate2, "Reporter", "Write decision log and external updates.")
        if gate2.verdict is not Verdict.APPROVED:
            return self._finalize_non_happy_path(
                ticket=ticket,
                classification=classification,
                confidence=confidence,
                gate_results=gate_results,
                state="blocked" if gate2.verdict is Verdict.BLOCKED else "changes_requested",
                current_stage="gate2",
                attempts=attempts,
                reason=gate2.reason,
                updated_at=now.isoformat(),
            )

        decision_log_path = self._write_decision_log(ticket, classification, confidence, knowledge, execution_evidence, gate_results)
        gate3 = self._run_gate3(decision_log_path)
        gate_results["gate3"] = gate3.verdict.value
        self._write_review_report(ticket, slug, "guardian-gate3", gate3, "Lead", "Approve the completed runtime cycle.")
        if gate3.verdict is not Verdict.APPROVED:
            return self._finalize_non_happy_path(
                ticket=ticket,
                classification=classification,
                confidence=confidence,
                gate_results=gate_results,
                state="changes_requested",
                current_stage="gate3",
                attempts=attempts,
                reason=gate3.reason,
                updated_at=now.isoformat(),
            )

        state = "completed"
        current_stage = "completed"
        self._write_ongoing_plan(
            ticket,
            slug,
            current_owner="Lead",
            current_step="Approve and archive the completed run.",
            current_state="All gates passed and artifacts are synchronized.",
            verdict="APPROVED",
            attempts=attempts,
            evidence=[
                "Gate 1 approved analysis evidence.",
                "Gate 2 approved execution and security evidence.",
                "Gate 3 approved reporting evidence.",
            ],
            next_owner="Lead",
            next_step="Move the runtime record to completed artifacts.",
        )
        self._archive_completed_artifacts(ticket, slug)
        self._write_tracker(
            phase="phase-8-autonomous-runtime-foundation",
            status="completed",
            owner="Lead",
            state_text="The autonomous runtime processed an operational ticket end-to-end.",
            title=f"Autonomous runtime ticket run: {ticket.key}",
            path=f"docs/status/completed/2026-04-06-{slug}-autonomous-runtime-task-brief.md",
            verdict="APPROVED",
            attempts=attempts,
            evidence="Runtime state, gate reports, and decision log were generated from one service run.",
            cleanup_status="CLEAN",
            next_owner="Lead",
            next_action="Review follow-up learning signals or process the next intake event.",
        )
        self.store.upsert_run(
            ticket_key=ticket.key,
            state=state,
            current_stage=current_stage,
            classification=classification,
            confidence=confidence,
            attempts=attempts,
            gate_results=gate_results,
            updated_at=now.isoformat(),
        )
        self.store.append_event(
            ticket_key=ticket.key,
            stage="completed",
            verdict=Verdict.APPROVED.value,
            payload={"decision_log": str(decision_log_path)},
            created_at=now.isoformat(),
        )
        return {
            "ticket_key": ticket.key,
            "state": state,
            "current_stage": current_stage,
            "classification": classification,
            "confidence": confidence,
            "gate_results": gate_results,
            "attempts": attempts,
            "database_path": str(self.store.db_path),
            "decision_log_path": str(decision_log_path),
        }

    def process_jira_issue(
        self,
        issue_key: str,
        *,
        knowledge: dict[str, object] | None = None,
        actions: list[dict[str, object]] | None = None,
        comment_on_complete: bool = True,
        transition_on_complete: str | None = None,
    ) -> dict[str, object]:
        if self.jira_client is None:
            raise RuntimeError("Jira client is not configured in the environment.")
        issue = self.jira_client.get_issue(issue_key)
        result = self.process_ticket(
            {
                "ticket": self._ticket_payload_from_jira(issue),
                "knowledge": knowledge or {},
                "actions": actions or [],
            }
        )
        jira_sync: dict[str, object] = {"issue_key": issue.key, "commented": False, "transitioned": False}
        if comment_on_complete:
            comment = self.jira_client.add_comment(issue.key, self._build_jira_comment(result))
            jira_sync["commented"] = True
            jira_sync["comment_id"] = comment.get("id")
        if transition_on_complete and result["state"] == "completed":
            self.jira_client.transition_issue(issue.key, transition_on_complete)
            jira_sync["transitioned"] = True
            jira_sync["transition_name"] = transition_on_complete
        result["jira_sync"] = jira_sync
        return result

    def list_jira_issues(self, *, jql: str | None = None, max_results: int = 10) -> list[dict[str, object]]:
        if self.jira_client is None:
            return []
        return [
            {
                "key": issue.key,
                "summary": issue.summary,
                "status": issue.status,
                "issue_type": issue.issue_type,
                "priority": issue.priority,
                "project": issue.project,
            }
            for issue in self.jira_client.search_issues(jql=jql, max_results=max_results)
        ]

    def get_jira_issue_payload(self, issue_key: str) -> dict[str, object]:
        if self.jira_client is None:
            raise RuntimeError("Jira client is not configured in the environment.")
        issue = self.jira_client.get_issue(issue_key)
        return {
            "ticket": {
                **self._ticket_payload_from_jira(issue),
                "status": issue.status,
                "assignee": issue.assignee,
                "reporter": issue.reporter,
            },
            "knowledge": {
                "runbook_refs": [],
                "past_solution_refs": [],
                "selected_solution": "",
                "alternatives": [],
                "risks": [],
            },
            "actions": [
                {
                    "system": "Jira",
                    "action": "comment",
                    "risk": "low",
                    "description": "Share the runtime outcome with stakeholders.",
                }
            ],
        }

    def _build_ticket(self, payload: object) -> TicketContext:
        data = dict(payload)
        return TicketContext(
            key=str(data["key"]),
            summary=str(data["summary"]),
            description=str(data["description"]),
            issue_type=str(data["issue_type"]),
            project=str(data["project"]),
            priority=str(data["priority"]),
            labels=[str(label) for label in data.get("labels", [])],
        )

    def _ticket_payload_from_jira(self, issue: JiraIssue) -> dict[str, object]:
        return {
            "key": issue.key,
            "summary": issue.summary,
            "description": issue.description,
            "issue_type": issue.issue_type,
            "project": issue.project,
            "priority": issue.priority,
            "labels": issue.labels,
        }

    def _classify(self, ticket: TicketContext) -> str:
        if ticket.issue_type in OPERATIONAL_TYPES:
            return "operational"
        if ticket.issue_type in PROJECT_TYPES:
            return "project"
        return "ambiguous"

    def _confidence(self, ticket: TicketContext, knowledge: object) -> str:
        info = dict(knowledge)
        if ticket.issue_type in OPERATIONAL_TYPES and info.get("runbook_refs") and info.get("selected_solution"):
            return "high"
        if info.get("selected_solution"):
            return "medium"
        return "low"

    def _run_gate1(self, ticket: TicketContext, knowledge: object) -> GateRecord:
        info = dict(knowledge)
        missing = []
        if not info.get("runbook_refs"):
            missing.append("primary evidence")
        if not info.get("past_solution_refs"):
            missing.append("secondary evidence")
        if not info.get("alternatives"):
            missing.append("alternative or rejection reason")
        if not info.get("risks"):
            missing.append("execution risk notes")
        if missing:
            return GateRecord(
                verdict=Verdict.CHANGES_REQUESTED,
                reason=f"Gate 1 missing required evidence: {', '.join(missing)}.",
                checked=["Problem framing", "Evidence completeness", "Execution readiness"],
                evidence=["Task brief exists but analysis evidence is incomplete."],
                cleanup_status=CleanupStatus.REMAINING_OK,
                open_risks=["Executor cannot safely continue without the missing analysis evidence."],
            )
        return GateRecord(
            verdict=Verdict.APPROVED,
            reason="Gate 1 evidence satisfies the analysis quality contract.",
            checked=["Problem framing", "Primary and secondary evidence", "Risk notes"],
            evidence=[
                f"Ticket summary: {ticket.summary}",
                f"Runbook refs: {', '.join(info['runbook_refs'])}",
            ],
        )

    def _approve_execution(self, confidence: str, actions: object) -> GateRecord:
        highest_risk = "low"
        for action in actions:
            risk = str(dict(action).get("risk", "low"))
            if risk == "high":
                highest_risk = "high"
                break
            if risk == "medium":
                highest_risk = "medium"
        if confidence == "low":
            return GateRecord(
                verdict=Verdict.BLOCKED,
                reason="Low confidence execution requires explicit human approval.",
                checked=["Confidence threshold", "Approval path"],
                evidence=["The runtime classified the solution confidence as low."],
                cleanup_status=CleanupStatus.BLOCKED,
                open_risks=["Execution remains paused until approval is recorded."],
            )
        if highest_risk == "high":
            return GateRecord(
                verdict=Verdict.BLOCKED,
                reason="High-risk actions require an additional lead confirmation path.",
                checked=["Risk tier", "Approval path"],
                evidence=["Detected a high-risk action in the execution plan."],
                cleanup_status=CleanupStatus.BLOCKED,
                open_risks=["Irreversible change would exceed the minimum autonomous path."],
            )
        return GateRecord(
            verdict=Verdict.APPROVED,
            reason="Execution plan fits the allowed confidence and risk thresholds.",
            checked=["Confidence threshold", "Risk tier"],
            evidence=[f"Execution confidence: {confidence}", f"Highest risk: {highest_risk}"],
        )

    def _execute_actions(self, actions: object) -> list[str]:
        evidence = []
        for index, raw_action in enumerate(actions, start=1):
            action = dict(raw_action)
            evidence.append(
                f"Action {index}: {action['system']} {action['action']} -> {action['description']}"
            )
        return evidence

    def _run_gate2(self, actions: object, execution_evidence: list[str]) -> GateRecord:
        lowered = " ".join(execution_evidence).lower()
        for pattern in SENSITIVE_PATTERNS:
            if pattern in lowered:
                return GateRecord(
                    verdict=Verdict.BLOCKED,
                    reason="Sensitive material appeared in execution evidence.",
                    checked=["Execution trace", "Sensitive data exposure"],
                    evidence=execution_evidence,
                    cleanup_status=CleanupStatus.BLOCKED,
                    open_risks=["Artifacts would expose restricted data if reporting continued."],
                )
        if not execution_evidence:
            return GateRecord(
                verdict=Verdict.CHANGES_REQUESTED,
                reason="Execution evidence is empty.",
                checked=["Execution trace"],
                evidence=["No actions were recorded."],
                cleanup_status=CleanupStatus.REMAINING_OK,
                open_risks=["Reporter cannot prove what changed."],
            )
        return GateRecord(
            verdict=Verdict.APPROVED,
            reason="Execution evidence is complete and clean.",
            checked=["Execution trace", "Sensitive data exposure"],
            evidence=execution_evidence,
        )

    def _run_gate3(self, decision_log_path: Path) -> GateRecord:
        if not decision_log_path.exists():
            return GateRecord(
                verdict=Verdict.CHANGES_REQUESTED,
                reason="Decision log was not written.",
                checked=["Decision log output", "Artifact sync"],
                evidence=["Missing decision log file."],
                cleanup_status=CleanupStatus.REMAINING_OK,
                open_risks=["Reporting stage is incomplete."],
            )
        return GateRecord(
            verdict=Verdict.APPROVED,
            reason="Reporting artifacts are synchronized.",
            checked=["Decision log output", "Artifact sync"],
            evidence=[str(decision_log_path)],
        )

    def _write_task_brief(self, ticket: TicketContext, classification: str, slug: str) -> None:
        content = (
            f"# {ticket.key} autonomous runtime kickoff\n\n"
            "## Goal\n"
            f"- Process `{ticket.key}` through the autonomous runtime service.\n\n"
            "## Primary Output\n"
            "- A ticket run with synced task brief, tracker, ongoing plan, review reports, and decision log.\n\n"
            "## In Scope\n"
            "- Lead-driven classification and planning.\n"
            "- Guardian Gate 1/2/3 enforcement.\n"
            "- Execution trace and reporting artifacts.\n\n"
            "## Out of Scope\n"
            "- UI dashboards.\n"
            "- New external action types beyond documented Jira flow.\n\n"
            "## Done When\n"
            "- The runtime reaches a terminal state and writes the required artifacts.\n\n"
            "## Verification Plan\n"
            "- Run the ticket through the runtime and check the generated state artifacts.\n\n"
            "## Inputs\n"
            f"- Ticket `{ticket.key}` classified as `{classification}`.\n\n"
            "## Expected Output\n"
            "- Completed artifacts under `docs/status/completed/` and `docs/generated/decision-logs/`.\n\n"
            "## Risk Notes\n"
            "- none\n"
        )
        path = self.workspace / f"docs/status/ongoing/2026-04-06-{slug}-autonomous-runtime-task-brief.md"
        self._write_text(path, content)

    def _write_ongoing_plan(
        self,
        ticket: TicketContext,
        slug: str,
        *,
        current_owner: str,
        current_step: str,
        current_state: str,
        verdict: str,
        attempts: int,
        evidence: list[str],
        next_owner: str,
        next_step: str,
    ) -> None:
        content = (
            f"# {ticket.key} autonomous runtime kickoff\n\n"
            "## Goal\n"
            "- Run the documented operational ticket lifecycle in the service.\n\n"
            "## Scope\n"
            "- Lead, Analyst, Executor, Reporter, Guardian orchestration.\n\n"
            "## Current Owner\n"
            f"- {current_owner}\n\n"
            "## Current Step\n"
            f"- {current_step}\n\n"
            "## Current State\n"
            f"- {current_state}\n\n"
            "## Operating State\n"
            "- checkpoint_ref: none\n"
            "- cleanup_status: CLEAN\n\n"
            "## Verification\n"
            f"- verdict: {verdict}\n"
            f"- attempts: {attempts}\n\n"
            "## Verification Evidence\n"
            + "".join(f"- {line}\n" for line in evidence)
            + "\n## Failure Record\n"
            "- root_cause: none\n"
            "- rollback_point: none\n\n"
            "## Next Owner\n"
            f"- {next_owner}\n\n"
            "## Next Step\n"
            f"- {next_step}\n\n"
            "## Issues\n"
            "- none\n"
        )
        path = self.workspace / f"docs/status/ongoing/2026-04-06-{slug}-autonomous-runtime-ongoing-plan.md"
        self._write_text(path, content)

    def _write_review_report(
        self,
        ticket: TicketContext,
        slug: str,
        stage_slug: str,
        record: GateRecord,
        next_owner: str,
        next_step: str,
    ) -> None:
        content = (
            f"# {ticket.key} {stage_slug}\n\n"
            "## Verdict\n"
            f"- {record.verdict.value}\n\n"
            "## Reason\n"
            f"- {record.reason}\n\n"
            "## Scope\n"
            f"- {ticket.summary}\n\n"
            "## Checked\n"
            + "".join(f"- {item}\n" for item in record.checked)
            + "\n## Passed\n"
            f"- {'yes' if record.verdict is Verdict.APPROVED else 'no'}\n\n"
            "## Evidence\n"
            + "".join(f"- {item}\n" for item in record.evidence)
            + "\n## Checkpoint\n"
            "- ref: none\n\n"
            "## Cleanup\n"
            f"- status: {record.cleanup_status.value}\n"
            "- cleaned: stage evidence synchronized\n"
            "- remaining: none\n\n"
            "## Open Risks\n"
            + ("".join(f"- {item}\n" for item in record.open_risks) if record.open_risks else "- none\n")
            + "\n## Next Owner\n"
            f"- {next_owner}\n\n"
            "## Next Step\n"
            f"- {next_step}\n"
        )
        path = self.workspace / f"docs/status/ongoing/2026-04-06-{slug}-review-report-{stage_slug}.md"
        self._write_text(path, content)

    def _write_decision_log(
        self,
        ticket: TicketContext,
        classification: str,
        confidence: str,
        knowledge: object,
        execution_evidence: list[str],
        gate_results: dict[str, str],
    ) -> Path:
        info = dict(knowledge)
        content = (
            f"# {ticket.key}: {ticket.summary}\n\n"
            "## 메타 정보\n\n"
            "| 항목 | 값 |\n"
            "|---|---|\n"
            f"| ticket_id | {ticket.key} |\n"
            f"| 분류 | {classification} |\n"
            f"| 처리 시작 | {DEFAULT_NOW.isoformat()} |\n"
            f"| 처리 완료 | {DEFAULT_NOW.isoformat()} |\n"
            "| 최종 상태 | 해결 |\n\n"
            "## 판단 근거\n\n"
            "### 분류 근거 (Lead)\n"
            f"- **판단**: {classification}\n"
            f"- **근거**: issue type `{ticket.issue_type}` and labels `{', '.join(ticket.labels)}`\n"
            f"- **확신도**: {confidence}\n\n"
            "### 솔루션 탐색 결과 (Analyst)\n"
            f"- 참조한 매뉴얼: {', '.join(info.get('runbook_refs', []))}\n"
            f"- 참조한 과거 사례: {', '.join(info.get('past_solution_refs', []))}\n"
            f"- 선택한 솔루션: {self._redact(str(info.get('selected_solution', 'none')))}\n\n"
            "## 게이트 판정 (Guardian)\n"
            f"- Gate 1: {gate_results.get('gate1', 'n/a')}\n"
            f"- Gate 2: {gate_results.get('gate2', 'n/a')}\n"
            f"- Gate 3: {gate_results.get('gate3', 'n/a')}\n\n"
            "## 실행 내역 (Executor)\n"
            + "".join(f"- {self._redact(line)}\n" for line in execution_evidence)
            + "\n## 학습 포인트\n"
            "- 새 패턴 발견: 없음\n"
            "- 매뉴얼 업데이트 필요: 없음\n"
        )
        path = self.workspace / "docs/generated/decision-logs/2026/04" / f"2026-04-06-{ticket.key}.md"
        self._write_text(path, content)
        return path

    def _archive_completed_artifacts(self, ticket: TicketContext, slug: str) -> None:
        names = [
            ("task-brief", "task-brief"),
            ("ongoing-plan", "ongoing-plan"),
            ("review-report-guardian-gate1", "review-report-guardian-gate1"),
            ("review-report-guardian-gate2", "review-report-guardian-gate2"),
            ("review-report-guardian-gate3", "review-report-guardian-gate3"),
        ]
        for source_name, target_name in names:
            source = self.workspace / f"docs/status/ongoing/2026-04-06-{slug}-autonomous-runtime-{source_name}.md"
            if "review-report" in source_name:
                source = self.workspace / f"docs/status/ongoing/2026-04-06-{slug}-{source_name}.md"
                target = self.workspace / f"docs/status/completed/2026-04-06-{slug}-{target_name}.md"
            else:
                target = self.workspace / f"docs/status/completed/2026-04-06-{slug}-autonomous-runtime-{target_name}.md"
            if source.exists():
                self._write_text(target, source.read_text(encoding="utf-8"))

    def _write_tracker(
        self,
        *,
        phase: str,
        status: str,
        owner: str,
        state_text: str,
        title: str,
        path: str,
        verdict: str,
        attempts: int,
        evidence: str,
        cleanup_status: str,
        next_owner: str,
        next_action: str,
    ) -> None:
        content = (
            "# Tracker\n\n"
            "## Current Phase\n"
            f"- phase: {phase}\n"
            f"- status: {status}\n\n"
            "## Current Step\n"
            f"- owner: {owner}\n"
            f"- state: {state_text}\n\n"
            "## Current Work\n"
            f"- title: {title}\n"
            f"- path: {path}\n\n"
            "## Verification\n"
            f"- verdict: {verdict}\n"
            f"- attempts: {attempts}\n"
            f"- evidence: {evidence}\n\n"
            "## Operating State\n"
            "- checkpoint_ref: none\n"
            f"- cleanup_status: {cleanup_status}\n\n"
            "## Next Owner\n"
            f"- owner: {next_owner}\n\n"
            "## Next Action\n"
            f"- next: {next_action}\n\n"
            "## Issues\n"
            "- none\n"
        )
        self._write_text(self.workspace / "docs/status/tracker.md", content)

    def _finalize_non_happy_path(
        self,
        *,
        ticket: TicketContext,
        classification: str,
        confidence: str,
        gate_results: dict[str, str],
        state: str,
        current_stage: str,
        attempts: int,
        reason: str,
        updated_at: str,
    ) -> dict[str, object]:
        repeated_root_cause_count = self.store.count_matching_root_cause(ticket.key, reason) + 1
        rollback_candidate = repeated_root_cause_count >= 3 or attempts >= 5
        tracker_status = "in_progress"
        tracker_verdict = Verdict.BLOCKED.value if state == "blocked" else Verdict.CHANGES_REQUESTED.value
        tracker_cleanup = "BLOCKED" if state == "blocked" else "REMAINING_OK"
        tracker_state_text = reason
        next_action = "Review the blocking condition and schedule the next attempt."
        if rollback_candidate:
            state = "rollback_candidate"
            tracker_status = "rollback_candidate"
            tracker_verdict = Verdict.BLOCKED.value
            tracker_cleanup = "BLOCKED"
            tracker_state_text = f"{reason} Rollback candidate recorded after repeated root cause."
            next_action = "Shrink scope or restore the last safe checkpoint before another attempt."
        self._write_tracker(
            phase="phase-8-autonomous-runtime-foundation",
            status=tracker_status,
            owner="Guardian",
            state_text=tracker_state_text,
            title="Autonomous runtime foundation",
            path=f"docs/status/ongoing/2026-04-06-{self._slug(ticket.key)}-autonomous-runtime-ongoing-plan.md",
            verdict=tracker_verdict,
            attempts=attempts,
            evidence=reason,
            cleanup_status=tracker_cleanup,
            next_owner="Lead",
            next_action=next_action,
        )
        self.store.upsert_run(
            ticket_key=ticket.key,
            state=state,
            current_stage=current_stage,
            classification=classification,
            confidence=confidence,
            attempts=attempts,
            gate_results=gate_results,
            updated_at=updated_at,
        )
        self.store.append_event(
            ticket_key=ticket.key,
            stage=current_stage,
            verdict=tracker_verdict,
            payload={"reason": reason, "rollback_candidate": rollback_candidate},
            created_at=updated_at,
        )
        return {
            "ticket_key": ticket.key,
            "state": state,
            "current_stage": current_stage,
            "classification": classification,
            "confidence": confidence,
            "gate_results": gate_results,
            "attempts": attempts,
            "rollback_candidate": rollback_candidate,
            "database_path": str(self.store.db_path),
        }

    def _redact(self, text: str) -> str:
        redacted = text
        redacted = re.sub(
            r"\b(token|secret|password|cookie)\b[\s:=]+[A-Za-z0-9._-]+",
            "[REDACTED]",
            redacted,
            flags=re.IGNORECASE,
        )
        for pattern in SENSITIVE_PATTERNS:
            redacted = re.sub(pattern, "[REDACTED]", redacted, flags=re.IGNORECASE)
        return redacted

    def _slug(self, value: str) -> str:
        return value.lower().replace("_", "-")

    def _write_text(self, path: Path, content: str) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content, encoding="utf-8")

    def _build_jira_comment(self, result: dict[str, object]) -> str:
        gate_results = dict(result.get("gate_results", {}))
        gate_summary = ", ".join(f"{key}={value}" for key, value in sorted(gate_results.items())) or "none"
        return (
            "[🤖 팀원에이전트] runtime update\n"
            f"- state: {result.get('state', 'unknown')}\n"
            f"- stage: {result.get('current_stage', 'unknown')}\n"
            f"- classification: {result.get('classification', 'unknown')}\n"
            f"- confidence: {result.get('confidence', 'unknown')}\n"
            f"- gates: {gate_summary}\n"
            "- local artifacts and decision log were updated in the service workspace."
        )
