# Autonomous Runtime Foundation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the first autonomous runtime path that processes a Jira-style intake event into runtime state, gates, and synced Markdown artifacts.

**Architecture:** A Python runtime service orchestrates Lead, Analyst, Executor, Reporter, and Guardian stages. SQLite stores authoritative runtime state, and Markdown artifacts under `docs/status/` and `docs/generated/decision-logs/` are generated from that state.

**Tech Stack:** Python 3.14, sqlite3, unittest, argparse

---

### Task 1: Bootstrap Runtime Package

**Files:**
- Create: `common-employee/pyproject.toml`
- Create: `common-employee/src/common_employee_runtime/__init__.py`
- Create: `common-employee/src/common_employee_runtime/__main__.py`
- Create: `common-employee/src/common_employee_runtime/cli.py`

**Step 1: Write the failing test**

```python
def test_cli_runs_mock_intake_and_prints_terminal_state(self) -> None:
    ...
```

**Step 2: Run test to verify it fails**

Run: `python3 -m unittest common-employee/tests/test_runtime_service.py -v`
Expected: FAIL with missing CLI module error

**Step 3: Write minimal implementation**

```python
def main() -> int:
    payload = json.loads(args.scenario.read_text(encoding="utf-8"))
    result = AutonomousRuntimeService(args.workspace).process_ticket(payload)
    print(json.dumps(result, ensure_ascii=False, indent=2, sort_keys=True))
    return 0
```

**Step 4: Run test to verify it passes**

Run: `python3 -m unittest common-employee/tests/test_runtime_service.py -v`
Expected: PASS for CLI smoke path

### Task 2: Implement Runtime Orchestrator And Store

**Files:**
- Create: `common-employee/src/common_employee_runtime/models.py`
- Create: `common-employee/src/common_employee_runtime/store.py`
- Create: `common-employee/src/common_employee_runtime/service.py`
- Test: `common-employee/tests/test_runtime_service.py`

**Step 1: Write the failing test**

```python
def test_process_operational_ticket_generates_completed_run_and_artifacts(self) -> None:
    ...
```

**Step 2: Run test to verify it fails**

Run: `python3 -m unittest common-employee/tests/test_runtime_service.py -v`
Expected: FAIL with missing service module

**Step 3: Write minimal implementation**

```python
class AutonomousRuntimeService:
    def process_ticket(self, payload: dict[str, object]) -> dict[str, object]:
        ...
```

**Step 4: Run test to verify it passes**

Run: `python3 -m unittest common-employee/tests/test_runtime_service.py -v`
Expected: PASS for completed runtime path

### Task 3: Enforce Gate 2 Security And Redaction

**Files:**
- Modify: `common-employee/src/common_employee_runtime/service.py`
- Test: `common-employee/tests/test_runtime_service.py`

**Step 1: Write the failing tests**

```python
def test_blocks_gate2_when_execution_evidence_contains_sensitive_material(self) -> None:
    ...

def test_redacts_sensitive_values_from_decision_log(self) -> None:
    ...
```

**Step 2: Run test to verify it fails**

Run: `python3 -m unittest common-employee/tests/test_runtime_service.py -v`
Expected: FAIL when sensitive value remains in artifacts or gate 2 does not block

**Step 3: Write minimal implementation**

```python
def _run_gate2(...):
    ...

def _redact(...):
    ...
```

**Step 4: Run test to verify it passes**

Run: `python3 -m unittest common-employee/tests/test_runtime_service.py -v`
Expected: PASS for gate 2 blocking and redaction

### Task 4: Track Retries And Rollback Candidate

**Files:**
- Modify: `common-employee/src/common_employee_runtime/store.py`
- Modify: `common-employee/src/common_employee_runtime/service.py`
- Test: `common-employee/tests/test_runtime_service.py`

**Step 1: Write the failing test**

```python
def test_marks_rollback_candidate_after_repeated_same_root_cause(self) -> None:
    ...
```

**Step 2: Run test to verify it fails**

Run: `python3 -m unittest common-employee/tests/test_runtime_service.py -v`
Expected: FAIL because repeated failures stay `changes_requested`

**Step 3: Write minimal implementation**

```python
repeated_root_cause_count = self.store.count_matching_root_cause(ticket.key, reason) + 1
rollback_candidate = repeated_root_cause_count >= 3 or attempts >= 5
```

**Step 4: Run test to verify it passes**

Run: `python3 -m unittest common-employee/tests/test_runtime_service.py -v`
Expected: PASS with `rollback_candidate` terminal state

### Task 5: Align App Docs And Status Artifacts

**Files:**
- Modify: `common-employee/ARCHITECTURE.md`
- Modify: `common-employee/AGENTS.md`
- Modify: `common-employee/docs/design-docs/data-flow.md`
- Modify: `common-employee/docs/design-docs/design-freeze-matrix.md`
- Modify: `common-employee/docs/SECURITY.md`
- Modify: `common-employee/docs/RELIABILITY.md`
- Modify: `common-employee/docs/status/README.md`
- Modify: `common-employee/docs/PLANS.md`
- Modify: `common-employee/docs/status/tracker.md`
- Create: `common-employee/docs/status/completed/2026-04-06-autonomous-runtime-foundation-task-brief.md`
- Create: `common-employee/docs/status/completed/2026-04-06-autonomous-runtime-foundation-ongoing-plan.md`
- Create: `common-employee/docs/status/completed/2026-04-06-autonomous-runtime-foundation-review-report-lead.md`

**Step 1: Write the target artifact shape**

```md
- runtime DB path
- markdown projection rule
- phase 8 complete evidence
```

**Step 2: Apply the documentation changes**

Run: update the files above
Expected: docs describe runtime truth source, artifact sync, and completed status

**Step 3: Verify the docs are consistent**

Run: `python3 -m unittest common-employee/tests/test_runtime_service.py -v`
Expected: PASS remains green while docs reflect the same behavior
