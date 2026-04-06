import sys
import os
import tempfile
import threading
import unittest
from pathlib import Path
import json
import subprocess
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib import parse, request
from urllib.error import HTTPError
from wsgiref.simple_server import make_server


PROJECT_ROOT = Path(__file__).resolve().parents[1]
SRC_ROOT = PROJECT_ROOT / "src"
if str(SRC_ROOT) not in sys.path:
    sys.path.insert(0, str(SRC_ROOT))


from common_employee_runtime.jira import JiraClient, JiraConfig
from common_employee_runtime.service import AutonomousRuntimeService
from common_employee_runtime.web import build_web_app


class RuntimeServiceTests(unittest.TestCase):
    def test_jira_config_can_load_from_workspace_dotenv(self) -> None:
        with tempfile.TemporaryDirectory() as tempdir:
            workspace = Path(tempdir)
            (workspace / ".env").write_text(
                "\n".join(
                    [
                        "ATLASSIAN_BASE_URL=https://example.atlassian.net",
                        "ATLASSIAN_EMAIL=agent@example.com",
                        "ATLASSIAN_API_TOKEN=secret-token",
                        "ATLASSIAN_JIRA_POLL_JQL=project = OPS ORDER BY updated DESC",
                    ]
                ),
                encoding="utf-8",
            )

            config = JiraConfig.from_workspace(workspace)

            self.assertIsNotNone(config)
            assert config is not None
            self.assertEqual(config.base_url, "https://example.atlassian.net")
            self.assertEqual(config.email, "agent@example.com")
            self.assertEqual(config.api_token, "secret-token")
            self.assertEqual(config.poll_jql, "project = OPS ORDER BY updated DESC")

    def test_process_operational_ticket_generates_completed_run_and_artifacts(self) -> None:
        with tempfile.TemporaryDirectory() as tempdir:
            workspace = Path(tempdir)
            service = AutonomousRuntimeService(workspace)

            result = service.process_ticket(
                {
                    "ticket": {
                        "key": "OPS-101",
                        "summary": "Service timeout on payroll sync",
                        "description": "Payroll sync timed out after deployment.",
                        "issue_type": "Incident",
                        "project": "OPS",
                        "priority": "High",
                        "labels": ["ops", "incident"],
                    },
                    "knowledge": {
                        "runbook_refs": ["runbooks/payroll-timeout.md#recovery"],
                        "past_solution_refs": ["OPS-77"],
                        "selected_solution": "Reset the payroll sync worker and confirm health checks.",
                        "alternatives": [
                            {
                                "option": "Rollback the deployment",
                                "reason": "Not needed because worker reset is sufficient.",
                            }
                        ],
                        "risks": ["Confirm no duplicate payroll jobs are running."],
                    },
                    "actions": [
                        {
                            "system": "Jira",
                            "action": "comment",
                            "risk": "low",
                            "description": "Share the recovery plan with stakeholders.",
                        },
                        {
                            "system": "Jira",
                            "action": "transition",
                            "risk": "medium",
                            "description": "Move the ticket to resolved after validation.",
                        },
                    ],
                }
            )

            self.assertEqual(result["state"], "completed")
            self.assertEqual(result["current_stage"], "completed")
            self.assertEqual(result["gate_results"]["gate1"], "APPROVED")
            self.assertEqual(result["gate_results"]["gate2"], "APPROVED")
            self.assertEqual(result["gate_results"]["gate3"], "APPROVED")

            tracker = workspace / "docs/status/tracker.md"
            self.assertTrue(tracker.exists())
            self.assertIn("status: completed", tracker.read_text(encoding="utf-8"))

            completed_brief = (
                workspace
                / "docs/status/completed/2026-04-06-ops-101-autonomous-runtime-task-brief.md"
            )
            self.assertTrue(completed_brief.exists())

            decision_log = (
                workspace / "docs/generated/decision-logs/2026/04/2026-04-06-OPS-101.md"
            )
            self.assertTrue(decision_log.exists())
            self.assertIn("Reset the payroll sync worker", decision_log.read_text(encoding="utf-8"))

    def test_blocks_gate2_when_execution_evidence_contains_sensitive_material(self) -> None:
        with tempfile.TemporaryDirectory() as tempdir:
            workspace = Path(tempdir)
            service = AutonomousRuntimeService(workspace)

            result = service.process_ticket(
                {
                    "ticket": {
                        "key": "OPS-102",
                        "summary": "Rotate broken integration credential",
                        "description": "Integration failed after a credential rollover.",
                        "issue_type": "Incident",
                        "project": "OPS",
                        "priority": "High",
                        "labels": ["ops"],
                    },
                    "knowledge": {
                        "runbook_refs": ["runbooks/credential-incident.md#rotate"],
                        "past_solution_refs": ["OPS-91"],
                        "selected_solution": "Rotate the service credential and validate the API health check.",
                        "alternatives": [
                            {
                                "option": "Retry without rotation",
                                "reason": "Known expired credential pattern makes this unsafe.",
                            }
                        ],
                        "risks": ["Do not copy the credential into any artifact."],
                    },
                    "actions": [
                        {
                            "system": "Jira",
                            "action": "comment",
                            "risk": "low",
                            "description": "Token ABC-123 was rotated and validated.",
                        }
                    ],
                }
            )

            self.assertEqual(result["state"], "blocked")
            self.assertEqual(result["current_stage"], "gate2")
            self.assertEqual(result["gate_results"]["gate1"], "APPROVED")
            self.assertEqual(result["gate_results"]["gate2"], "BLOCKED")

            tracker = workspace / "docs/status/tracker.md"
            tracker_text = tracker.read_text(encoding="utf-8")
            self.assertIn("cleanup_status: BLOCKED", tracker_text)
            self.assertNotIn("ABC-123", tracker_text)

    def test_marks_rollback_candidate_after_repeated_same_root_cause(self) -> None:
        with tempfile.TemporaryDirectory() as tempdir:
            workspace = Path(tempdir)
            service = AutonomousRuntimeService(workspace)
            payload = {
                "ticket": {
                    "key": "OPS-103",
                    "summary": "Underdocumented service outage",
                    "description": "There is not enough runbook coverage yet.",
                    "issue_type": "Incident",
                    "project": "OPS",
                    "priority": "High",
                    "labels": ["ops"],
                },
                "knowledge": {
                    "runbook_refs": [],
                    "past_solution_refs": [],
                    "selected_solution": "",
                    "alternatives": [],
                    "risks": [],
                },
                "actions": [],
            }

            first = service.process_ticket(payload)
            second = service.process_ticket(payload)
            third = service.process_ticket(payload)

            self.assertEqual(first["state"], "changes_requested")
            self.assertEqual(second["state"], "changes_requested")
            self.assertEqual(third["state"], "rollback_candidate")
            self.assertTrue(third["rollback_candidate"])
            self.assertEqual(third["attempts"], 3)

            tracker = workspace / "docs/status/tracker.md"
            tracker_text = tracker.read_text(encoding="utf-8")
            self.assertIn("attempts: 3", tracker_text)
            self.assertIn("rollback candidate", tracker_text.lower())

    def test_redacts_sensitive_values_from_decision_log(self) -> None:
        with tempfile.TemporaryDirectory() as tempdir:
            workspace = Path(tempdir)
            service = AutonomousRuntimeService(workspace)

            result = service.process_ticket(
                {
                    "ticket": {
                        "key": "OPS-104",
                        "summary": "Credential rotation guidance",
                        "description": "Prepare the recovery notes after a rotation event.",
                        "issue_type": "Incident",
                        "project": "OPS",
                        "priority": "Medium",
                        "labels": ["ops"],
                    },
                    "knowledge": {
                        "runbook_refs": ["runbooks/rotation.md#notes"],
                        "past_solution_refs": ["OPS-55"],
                        "selected_solution": "Rotate token ABC-123 and confirm the downstream health checks.",
                        "alternatives": [
                            {
                                "option": "Skip the rotation note",
                                "reason": "The note is required for the audit trail.",
                            }
                        ],
                        "risks": ["Never include raw token material in generated artifacts."],
                    },
                    "actions": [
                        {
                            "system": "Jira",
                            "action": "comment",
                            "risk": "low",
                            "description": "Share the redacted recovery summary.",
                        }
                    ],
                }
            )

            self.assertEqual(result["state"], "completed")

            decision_log = (
                workspace / "docs/generated/decision-logs/2026/04/2026-04-06-OPS-104.md"
            )
            decision_log_text = decision_log.read_text(encoding="utf-8")
            self.assertNotIn("ABC-123", decision_log_text)
            self.assertIn("[REDACTED]", decision_log_text)

    def test_cli_runs_mock_intake_and_prints_terminal_state(self) -> None:
        with tempfile.TemporaryDirectory() as tempdir:
            workspace = Path(tempdir)
            scenario_path = workspace / "scenario.json"
            scenario_path.write_text(
                json.dumps(
                    {
                        "ticket": {
                            "key": "OPS-105",
                            "summary": "CLI intake smoke test",
                            "description": "Exercise the runtime from the command line.",
                            "issue_type": "Incident",
                            "project": "OPS",
                            "priority": "Medium",
                            "labels": ["ops"],
                        },
                        "knowledge": {
                            "runbook_refs": ["runbooks/cli-smoke.md#recover"],
                            "past_solution_refs": ["OPS-88"],
                            "selected_solution": "Run the smoke recovery sequence and capture the result.",
                            "alternatives": [
                                {
                                    "option": "Wait for manual handling",
                                    "reason": "The smoke scenario should remain autonomous.",
                                }
                            ],
                            "risks": ["Keep the output redacted and short."],
                        },
                        "actions": [
                            {
                                "system": "Jira",
                                "action": "comment",
                                "risk": "low",
                                "description": "Publish the smoke-test recovery summary.",
                            }
                        ],
                    }
                ),
                encoding="utf-8",
            )

            completed = subprocess.run(
                [
                    sys.executable,
                    "-m",
                    "common_employee_runtime.cli",
                    str(scenario_path),
                    "--workspace",
                    str(workspace),
                ],
                check=False,
                capture_output=True,
                text=True,
                env={"PYTHONPATH": str(SRC_ROOT)},
            )

            self.assertEqual(completed.returncode, 0, completed.stderr)
            self.assertIn('"state": "completed"', completed.stdout)

    def test_web_console_submits_payload_and_serves_artifact(self) -> None:
        with tempfile.TemporaryDirectory() as tempdir:
            workspace = Path(tempdir)
            app = build_web_app(workspace)
            with make_server("127.0.0.1", 0, app) as server:
                port = server.server_port
                thread = threading.Thread(target=server.serve_forever, daemon=True)
                thread.start()
                try:
                    dashboard_html = request.urlopen(f"http://127.0.0.1:{port}/").read().decode("utf-8")
                    self.assertIn("common-employee Web Console", dashboard_html)
                    self.assertIn("Process payload", dashboard_html)

                    payload = parse.urlencode(
                        {
                            "payload_json": json.dumps(
                                {
                                    "ticket": {
                                        "key": "OPS-301",
                                        "summary": "Web console runtime smoke",
                                        "description": "Submit a runtime ticket through the browser flow.",
                                        "issue_type": "Incident",
                                        "project": "OPS",
                                        "priority": "Medium",
                                        "labels": ["ops", "web"],
                                    },
                                    "knowledge": {
                                        "runbook_refs": ["runbooks/web-console.md#recover"],
                                        "past_solution_refs": ["OPS-120"],
                                        "selected_solution": "Run the browser-submitted recovery flow and validate the artifacts.",
                                        "alternatives": [
                                            {
                                                "option": "Keep CLI-only intake",
                                                "reason": "This test specifically covers the browser flow.",
                                            }
                                        ],
                                        "risks": ["Keep generated artifacts redacted and local-only."],
                                    },
                                    "actions": [
                                        {
                                            "system": "Jira",
                                            "action": "comment",
                                            "risk": "low",
                                            "description": "Publish the browser recovery summary.",
                                        }
                                    ],
                                },
                                ensure_ascii=False,
                            )
                        }
                    ).encode("utf-8")

                    detail_html = request.urlopen(
                        request.Request(
                            f"http://127.0.0.1:{port}/runs",
                            data=payload,
                            headers={"Content-Type": "application/x-www-form-urlencoded"},
                            method="POST",
                        )
                    ).read().decode("utf-8")
                    self.assertIn("Run detail: OPS-301", detail_html)
                    self.assertIn("gate1", detail_html)
                    self.assertIn("APPROVED", detail_html)
                    self.assertIn("docs/generated/decision-logs/2026/04/2026-04-06-OPS-301.md", detail_html)

                    artifact_html = request.urlopen(
                        f"http://127.0.0.1:{port}/artifacts?path="
                        "docs%2Fgenerated%2Fdecision-logs%2F2026%2F04%2F2026-04-06-OPS-301.md"
                    ).read().decode("utf-8")
                    self.assertIn("Web console runtime smoke", artifact_html)
                    self.assertIn("Artifact", artifact_html)

                    with self.assertRaises(HTTPError) as blocked:
                        request.urlopen(f"http://127.0.0.1:{port}/artifacts?path=../../etc/passwd")
                    self.assertEqual(blocked.exception.code, 403)
                    blocked.exception.close()
                finally:
                    server.shutdown()
                    server.server_close()
                    thread.join(timeout=5)

    def test_jira_client_and_jira_backed_runtime_flow(self) -> None:
        class FakeJiraHandler(BaseHTTPRequestHandler):
            comment_payloads: list[dict[str, object]] = []
            transition_payloads: list[dict[str, object]] = []
            auth_headers: list[str] = []

            def log_message(self, format: str, *args: object) -> None:  # noqa: A003
                return

            def _write_json(self, payload: dict[str, object], status: int = 200) -> None:
                body = json.dumps(payload).encode("utf-8")
                self.send_response(status)
                self.send_header("Content-Type", "application/json")
                self.send_header("Content-Length", str(len(body)))
                self.end_headers()
                if status != 204:
                    self.wfile.write(body)

            def do_GET(self) -> None:  # noqa: N802
                FakeJiraHandler.auth_headers.append(self.headers.get("Authorization", ""))
                if self.path.startswith("/rest/api/3/issue/OPS-501/transitions"):
                    self._write_json(
                        {
                            "transitions": [
                                {"id": "31", "name": "Resolve issue", "to": {"name": "Done"}},
                                {"id": "21", "name": "Start progress", "to": {"name": "In Progress"}},
                            ]
                        }
                    )
                    return
                if self.path.startswith("/rest/api/3/issue/OPS-501"):
                    self._write_json(
                        {
                            "key": "OPS-501",
                            "fields": {
                                "summary": "Live Jira issue",
                                "description": {
                                    "type": "doc",
                                    "content": [
                                        {
                                            "type": "paragraph",
                                            "content": [{"type": "text", "text": "Customer payroll sync is timing out."}],
                                        }
                                    ],
                                },
                                "issuetype": {"name": "Incident"},
                                "project": {"key": "OPS"},
                                "priority": {"name": "High"},
                                "labels": ["ops", "live"],
                                "status": {"name": "Open"},
                                "assignee": {"displayName": "Agent User"},
                                "reporter": {"displayName": "Requester"},
                            },
                        }
                    )
                    return
                self.send_error(404)

            def do_POST(self) -> None:  # noqa: N802
                FakeJiraHandler.auth_headers.append(self.headers.get("Authorization", ""))
                length = int(self.headers.get("Content-Length", "0"))
                payload = json.loads(self.rfile.read(length).decode("utf-8")) if length else {}
                if self.path.startswith("/rest/api/3/search/jql"):
                    self._write_json(
                        {
                            "issues": [
                                {
                                    "key": "OPS-501",
                                    "fields": {
                                        "summary": "Live Jira issue",
                                        "description": "Customer payroll sync is timing out.",
                                        "issuetype": {"name": "Incident"},
                                        "project": {"key": "OPS"},
                                        "priority": {"name": "High"},
                                        "labels": ["ops", "live"],
                                        "status": {"name": "Open"},
                                        "assignee": {"displayName": "Agent User"},
                                        "reporter": {"displayName": "Requester"},
                                    },
                                }
                            ]
                        }
                    )
                    return
                if self.path.startswith("/rest/api/3/issue/OPS-501/comment"):
                    FakeJiraHandler.comment_payloads.append(payload)
                    self._write_json({"id": "9001"}, status=201)
                    return
                if self.path.startswith("/rest/api/3/issue/OPS-501/transitions"):
                    FakeJiraHandler.transition_payloads.append(payload)
                    self._write_json({}, status=204)
                    return
                self.send_error(404)

        with tempfile.TemporaryDirectory() as tempdir:
            workspace = Path(tempdir)
            server = HTTPServer(("127.0.0.1", 0), FakeJiraHandler)
            thread = threading.Thread(target=server.serve_forever, daemon=True)
            thread.start()
            try:
                config = JiraConfig(
                    base_url=f"http://127.0.0.1:{server.server_port}",
                    email="agent@example.com",
                    api_token="secret-token",
                )
                service = AutonomousRuntimeService(workspace, jira_client=JiraClient(config))

                listed = service.list_jira_issues()
                self.assertEqual(listed[0]["key"], "OPS-501")

                payload = service.get_jira_issue_payload("OPS-501")
                self.assertEqual(payload["ticket"]["summary"], "Live Jira issue")

                result = service.process_jira_issue(
                    "OPS-501",
                    knowledge={
                        "runbook_refs": ["runbooks/payroll-timeout.md#recovery"],
                        "past_solution_refs": ["OPS-77"],
                        "selected_solution": "Reset the payroll sync worker and confirm health checks.",
                        "alternatives": [{"option": "Rollback", "reason": "Worker reset is lower risk."}],
                        "risks": ["Confirm no duplicate payroll jobs are active."],
                    },
                    actions=[
                        {
                            "system": "Jira",
                            "action": "comment",
                            "risk": "low",
                            "description": "Share the runtime outcome.",
                        }
                    ],
                    comment_on_complete=True,
                    transition_on_complete="Done",
                )

                self.assertEqual(result["state"], "completed")
                self.assertTrue(result["jira_sync"]["commented"])
                self.assertTrue(result["jira_sync"]["transitioned"])
                self.assertEqual(FakeJiraHandler.transition_payloads[0]["transition"]["id"], "31")
                self.assertIn("Basic ", FakeJiraHandler.auth_headers[0])
                serialized_comment = json.dumps(FakeJiraHandler.comment_payloads[0], ensure_ascii=False)
                self.assertIn("runtime update", serialized_comment)
                self.assertIn("completed", serialized_comment)
            finally:
                server.shutdown()
                server.server_close()
                thread.join(timeout=5)

    def test_web_console_renders_jira_search_and_issue_page_when_configured(self) -> None:
        class FakeJiraHandler(BaseHTTPRequestHandler):
            def log_message(self, format: str, *args: object) -> None:  # noqa: A003
                return

            def _write_json(self, payload: dict[str, object], status: int = 200) -> None:
                body = json.dumps(payload).encode("utf-8")
                self.send_response(status)
                self.send_header("Content-Type", "application/json")
                self.send_header("Content-Length", str(len(body)))
                self.end_headers()
                self.wfile.write(body)

            def do_GET(self) -> None:  # noqa: N802
                if self.path.startswith("/rest/api/3/issue/OPS-601"):
                    self._write_json(
                        {
                            "key": "OPS-601",
                            "fields": {
                                "summary": "Configured Jira issue",
                                "description": "Live issue body",
                                "issuetype": {"name": "Incident"},
                                "project": {"key": "OPS"},
                                "priority": {"name": "High"},
                                "labels": ["ops"],
                                "status": {"name": "Open"},
                                "assignee": {"displayName": "Agent User"},
                                "reporter": {"displayName": "Requester"},
                            },
                        }
                    )
                    return
                self.send_error(404)

            def do_POST(self) -> None:  # noqa: N802
                length = int(self.headers.get("Content-Length", "0"))
                _ = self.rfile.read(length) if length else b""
                if self.path.startswith("/rest/api/3/search/jql"):
                    self._write_json(
                        {
                            "issues": [
                                {
                                    "key": "OPS-601",
                                    "fields": {
                                        "summary": "Configured Jira issue",
                                        "description": "Live issue body",
                                        "issuetype": {"name": "Incident"},
                                        "project": {"key": "OPS"},
                                        "priority": {"name": "High"},
                                        "labels": ["ops"],
                                        "status": {"name": "Open"},
                                        "assignee": {"displayName": "Agent User"},
                                        "reporter": {"displayName": "Requester"},
                                    },
                                }
                            ]
                        }
                    )
                    return
                self.send_error(404)

        with tempfile.TemporaryDirectory() as tempdir:
            workspace = Path(tempdir)
            server = HTTPServer(("127.0.0.1", 0), FakeJiraHandler)
            thread = threading.Thread(target=server.serve_forever, daemon=True)
            thread.start()
            env_backup = {key: os.environ.get(key) for key in ("ATLASSIAN_BASE_URL", "ATLASSIAN_EMAIL", "ATLASSIAN_API_TOKEN")}
            try:
                for key in env_backup:
                    os.environ.pop(key, None)
                (workspace / ".env").write_text(
                    "\n".join(
                        [
                            f"ATLASSIAN_BASE_URL=http://127.0.0.1:{server.server_port}",
                            "ATLASSIAN_EMAIL=agent@example.com",
                            "ATLASSIAN_API_TOKEN=secret-token",
                        ]
                    ),
                    encoding="utf-8",
                )
                app = build_web_app(workspace)
                with make_server("127.0.0.1", 0, app) as web_server:
                    web_thread = threading.Thread(target=web_server.serve_forever, daemon=True)
                    web_thread.start()
                    try:
                        dashboard = request.urlopen(
                            f"http://127.0.0.1:{web_server.server_port}/?jql=project%20%3D%20OPS"
                        ).read().decode("utf-8")
                        self.assertIn("Jira Cloud issues", dashboard)
                        self.assertIn("OPS-601", dashboard)

                        issue_page = request.urlopen(
                            f"http://127.0.0.1:{web_server.server_port}/jira/issues/OPS-601"
                        ).read().decode("utf-8")
                        self.assertIn("Process this Jira issue", issue_page)
                        self.assertIn("Configured Jira issue", issue_page)
                    finally:
                        web_server.shutdown()
                        web_server.server_close()
                        web_thread.join(timeout=5)
            finally:
                for key, value in env_backup.items():
                    if value is None:
                        os.environ.pop(key, None)
                    else:
                        os.environ[key] = value
                server.shutdown()
                server.server_close()
                thread.join(timeout=5)


if __name__ == "__main__":
    unittest.main()
