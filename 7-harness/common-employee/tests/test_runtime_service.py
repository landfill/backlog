import sys
import importlib.util
import os
import tempfile
import threading
import unittest
from pathlib import Path
import json
import subprocess
import base64
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

    def test_confluence_config_can_override_base_url_from_workspace_dotenv(self) -> None:
        with tempfile.TemporaryDirectory() as tempdir:
            workspace = Path(tempdir)
            (workspace / ".env").write_text(
                "\n".join(
                    [
                        "ATLASSIAN_BASE_URL=https://jira.example.atlassian.net",
                        "ATLASSIAN_CONFLUENCE_BASE_URL=https://wiki.example.atlassian.net",
                        "ATLASSIAN_EMAIL=agent@example.com",
                        "ATLASSIAN_API_TOKEN=secret-token",
                        "ATLASSIAN_CONFLUENCE_SPACE=501",
                    ]
                ),
                encoding="utf-8",
            )

            from common_employee_runtime.confluence import ConfluenceConfig

            config = ConfluenceConfig.from_workspace(workspace)

            self.assertIsNotNone(config)
            assert config is not None
            self.assertEqual(config.base_url, "https://wiki.example.atlassian.net")
            self.assertEqual(config.space_id, "501")

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

    def test_confluence_config_and_client_flow(self) -> None:
        module_spec = importlib.util.find_spec("common_employee_runtime.confluence")
        self.assertIsNotNone(module_spec, "Confluence client module should exist for the new phase.")
        if module_spec is None:
            return
        from common_employee_runtime.confluence import ConfluenceClient, ConfluenceConfig

        class FakeConfluenceHandler(BaseHTTPRequestHandler):
            auth_headers: list[str] = []
            create_payloads: list[dict[str, object]] = []
            update_payloads: list[dict[str, object]] = []

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
                FakeConfluenceHandler.auth_headers.append(self.headers.get("Authorization", ""))
                if self.path.startswith("/wiki/api/v2/pages?"):
                    self._write_json(
                        {
                            "results": [
                                {
                                    "id": "2001",
                                    "title": "Payroll Recovery Notes",
                                    "spaceId": "501",
                                    "status": "current",
                                }
                            ]
                        }
                    )
                    return
                if self.path.startswith("/wiki/api/v2/pages/2001"):
                    self._write_json(
                        {
                            "id": "2001",
                            "title": "Payroll Recovery Notes",
                            "spaceId": "501",
                            "status": "current",
                            "version": {"number": 3},
                            "body": {"storage": {"value": "<p>Existing body</p>"}},
                        }
                    )
                    return
                self.send_error(404)

            def do_POST(self) -> None:  # noqa: N802
                FakeConfluenceHandler.auth_headers.append(self.headers.get("Authorization", ""))
                length = int(self.headers.get("Content-Length", "0"))
                payload = json.loads(self.rfile.read(length).decode("utf-8")) if length else {}
                if self.path == "/wiki/api/v2/pages":
                    FakeConfluenceHandler.create_payloads.append(payload)
                    self._write_json({"id": "3001", "version": {"number": 1}}, status=200)
                    return
                self.send_error(404)

            def do_PUT(self) -> None:  # noqa: N802
                FakeConfluenceHandler.auth_headers.append(self.headers.get("Authorization", ""))
                length = int(self.headers.get("Content-Length", "0"))
                payload = json.loads(self.rfile.read(length).decode("utf-8")) if length else {}
                if self.path == "/wiki/api/v2/pages/2001":
                    FakeConfluenceHandler.update_payloads.append(payload)
                    self._write_json({"id": "2001", "version": {"number": 4}}, status=200)
                    return
                self.send_error(404)

        with tempfile.TemporaryDirectory() as tempdir:
            workspace = Path(tempdir)
            server = HTTPServer(("127.0.0.1", 0), FakeConfluenceHandler)
            thread = threading.Thread(target=server.serve_forever, daemon=True)
            thread.start()
            try:
                (workspace / ".env").write_text(
                    "\n".join(
                        [
                            f"ATLASSIAN_BASE_URL=http://127.0.0.1:{server.server_port}",
                            "ATLASSIAN_EMAIL=agent@example.com",
                            "ATLASSIAN_API_TOKEN=jira-token",
                            "ATLASSIAN_CONFLUENCE_SPACE=501",
                            "ATLASSIAN_CONFLUENCE_PARENT_PAGE_ID=1000",
                            "ATLASSIAN_CONFLUENCE_PUBLISH_MODE=manual",
                        ]
                    ),
                    encoding="utf-8",
                )

                config = ConfluenceConfig.from_workspace(workspace)
                self.assertIsNotNone(config)
                assert config is not None
                self.assertEqual(config.space_id, "501")
                self.assertEqual(config.parent_page_id, "1000")
                self.assertEqual(config.publish_mode, "manual")
                self.assertEqual(config.api_token, "jira-token")

                client = ConfluenceClient(config)
                results = client.search_pages(title="Payroll", limit=5)
                self.assertEqual(results[0]["id"], "2001")

                page = client.get_page("2001")
                self.assertEqual(page["version"]["number"], 3)
                self.assertIn("Existing body", page["body"]["storage"]["value"])

                created = client.create_page("Run Report", "<p>Created body</p>")
                self.assertEqual(created["id"], "3001")
                self.assertEqual(FakeConfluenceHandler.create_payloads[0]["spaceId"], "501")
                self.assertEqual(FakeConfluenceHandler.create_payloads[0]["parentId"], "1000")

                updated = client.update_page("2001", "Run Report", "<p>Updated body</p>", version_number=3)
                self.assertEqual(updated["id"], "2001")
                self.assertEqual(FakeConfluenceHandler.update_payloads[0]["version"]["number"], 4)
                expected_auth = "Basic " + base64.b64encode(b"agent@example.com:jira-token").decode("ascii")
                self.assertEqual(FakeConfluenceHandler.auth_headers[0], expected_auth)
            finally:
                server.shutdown()
                server.server_close()
                thread.join(timeout=5)

    def test_runtime_confluence_publish_modes(self) -> None:
        module_spec = importlib.util.find_spec("common_employee_runtime.confluence")
        self.assertIsNotNone(module_spec, "Confluence publish flow should exist for the new phase.")
        self.assertTrue(hasattr(AutonomousRuntimeService, "publish_run_to_confluence"))
        if module_spec is None or not hasattr(AutonomousRuntimeService, "publish_run_to_confluence"):
            return
        from common_employee_runtime.confluence import ConfluenceClient, ConfluenceConfig

        class FakeConfluenceHandler(BaseHTTPRequestHandler):
            create_payloads: list[dict[str, object]] = []
            update_payloads: list[dict[str, object]] = []

            def log_message(self, format: str, *args: object) -> None:  # noqa: A003
                return

            def _write_json(self, payload: dict[str, object], status: int = 200) -> None:
                body = json.dumps(payload).encode("utf-8")
                self.send_response(status)
                self.send_header("Content-Type", "application/json")
                self.send_header("Content-Length", str(len(body)))
                self.end_headers()
                self.wfile.write(body)

            def do_POST(self) -> None:  # noqa: N802
                length = int(self.headers.get("Content-Length", "0"))
                payload = json.loads(self.rfile.read(length).decode("utf-8")) if length else {}
                if self.path == "/wiki/api/v2/pages":
                    FakeConfluenceHandler.create_payloads.append(payload)
                    self._write_json({"id": str(8000 + len(FakeConfluenceHandler.create_payloads)), "version": {"number": 1}})
                    return
                self.send_error(404)

            def do_PUT(self) -> None:  # noqa: N802
                length = int(self.headers.get("Content-Length", "0"))
                payload = json.loads(self.rfile.read(length).decode("utf-8")) if length else {}
                if self.path == "/wiki/api/v2/pages/8001":
                    FakeConfluenceHandler.update_payloads.append(payload)
                    self._write_json({"id": "8001", "version": {"number": payload["version"]["number"]}})
                    return
                self.send_error(404)

        with tempfile.TemporaryDirectory() as tempdir:
            workspace = Path(tempdir)
            server = HTTPServer(("127.0.0.1", 0), FakeConfluenceHandler)
            thread = threading.Thread(target=server.serve_forever, daemon=True)
            thread.start()
            try:
                config = ConfluenceConfig(
                    base_url=f"http://127.0.0.1:{server.server_port}",
                    email="agent@example.com",
                    api_token="secret-token",
                    space_id="501",
                    parent_page_id="1000",
                    publish_mode="manual",
                )
                service = AutonomousRuntimeService(workspace, confluence_client=ConfluenceClient(config))
                payload = {
                    "ticket": {
                        "key": "OPS-701",
                        "summary": "Confluence publish report",
                        "description": "Publish a runtime report to Confluence.",
                        "issue_type": "Incident",
                        "project": "OPS",
                        "priority": "High",
                        "labels": ["ops"],
                    },
                    "knowledge": {
                        "runbook_refs": ["runbooks/confluence.md#report"],
                        "past_solution_refs": ["OPS-700"],
                        "selected_solution": "Publish the redacted runtime report.",
                        "alternatives": [{"option": "Skip publish", "reason": "The report is part of this phase."}],
                        "risks": ["Keep the published body redacted."],
                    },
                    "actions": [
                        {
                            "system": "Confluence",
                            "action": "publish",
                            "risk": "low",
                            "description": "Create the runtime report page.",
                        }
                    ],
                }

                manual_result = service.process_ticket(payload, confluence_publish_mode="manual")
                self.assertEqual(manual_result["state"], "completed")
                self.assertEqual(manual_result["confluence_sync"]["mode"], "manual")
                self.assertFalse(manual_result["confluence_sync"]["published"])
                self.assertEqual(FakeConfluenceHandler.create_payloads, [])

                published = service.publish_run_to_confluence("OPS-701", page_title="OPS-701 runtime report")
                self.assertTrue(published["published"])
                self.assertEqual(published["page_id"], "8001")
                self.assertEqual(len(FakeConfluenceHandler.create_payloads), 1)

                updated = service.publish_run_to_confluence(
                    "OPS-701",
                    page_id="8001",
                    page_title="OPS-701 runtime report",
                    version_number=1,
                )
                self.assertTrue(updated["published"])
                self.assertEqual(len(FakeConfluenceHandler.update_payloads), 1)
                self.assertEqual(FakeConfluenceHandler.update_payloads[0]["version"]["number"], 2)

                immediate_payload = dict(payload)
                immediate_payload["ticket"] = dict(payload["ticket"], key="OPS-702")
                immediate_result = service.process_ticket(immediate_payload, confluence_publish_mode="immediate")
                self.assertEqual(immediate_result["confluence_sync"]["mode"], "immediate")
                self.assertTrue(immediate_result["confluence_sync"]["published"])
                self.assertEqual(len(FakeConfluenceHandler.create_payloads), 2)
            finally:
                server.shutdown()
                server.server_close()
                thread.join(timeout=5)

    def test_runtime_immediate_confluence_publish_failure_keeps_local_completion(self) -> None:
        module_spec = importlib.util.find_spec("common_employee_runtime.confluence")
        self.assertIsNotNone(module_spec, "Confluence publish flow should exist for failure handling.")
        if module_spec is None:
            return
        from common_employee_runtime.confluence import ConfluenceClient, ConfluenceConfig

        class FailingConfluenceClient(ConfluenceClient):
            def __init__(self) -> None:
                super().__init__(
                    ConfluenceConfig(
                        base_url="http://example.invalid",
                        email="agent@example.com",
                        api_token="secret-token",
                        space_id="501",
                        parent_page_id="1000",
                        publish_mode="immediate",
                    )
                )

            def create_page(self, title: str, body_storage_value: str, *, parent_page_id: str | None = None) -> dict[str, object]:
                raise RuntimeError("publish failed")

        with tempfile.TemporaryDirectory() as tempdir:
            workspace = Path(tempdir)
            service = AutonomousRuntimeService(workspace, confluence_client=FailingConfluenceClient())
            payload = {
                "ticket": {
                    "key": "OPS-704",
                    "summary": "Immediate publish fallback",
                    "description": "The local run should still complete if Confluence publish fails.",
                    "issue_type": "Incident",
                    "project": "OPS",
                    "priority": "High",
                    "labels": ["ops"],
                },
                "knowledge": {
                    "runbook_refs": ["runbooks/confluence.md#fallback"],
                    "past_solution_refs": ["OPS-703"],
                    "selected_solution": "Complete the local run first and capture the publish failure.",
                    "alternatives": [{"option": "Abort the run", "reason": "The local runtime still has value."}],
                    "risks": ["Confluence may be unavailable during publish."],
                },
                "actions": [
                    {
                        "system": "Confluence",
                        "action": "publish",
                        "risk": "low",
                        "description": "Attempt immediate report publish.",
                    }
                ],
            }

            result = service.process_ticket(payload, confluence_publish_mode="immediate")

            self.assertEqual(result["state"], "completed")
            self.assertFalse(result["confluence_sync"]["published"])
            self.assertIn("publish failed", result["confluence_sync"]["error"])
            self.assertIsNotNone(service.store.get_run("OPS-704"))

    def test_smtp_and_webhook_config_and_clients(self) -> None:
        smtp_spec = importlib.util.find_spec("common_employee_runtime.smtp_delivery")
        teams_spec = importlib.util.find_spec("common_employee_runtime.teams_webhook")
        self.assertIsNotNone(smtp_spec, "SMTP delivery module should exist for the manual-send phase.")
        self.assertIsNotNone(teams_spec, "Teams webhook module should exist for the webhook phase.")
        if smtp_spec is None or teams_spec is None:
            return
        from common_employee_runtime.smtp_delivery import SMTPDeliveryClient, SMTPDeliveryConfig
        from common_employee_runtime.teams_webhook import TeamsWebhookClient, TeamsWebhookConfig

        class FakeSMTP:
            instances: list["FakeSMTP"] = []

            def __init__(self, host: str, port: int, timeout: float = 10.0) -> None:
                self.host = host
                self.port = port
                self.timeout = timeout
                self.started_tls = False
                self.login_args: tuple[str, str] | None = None
                self.messages: list[tuple[str, list[str], str]] = []
                FakeSMTP.instances.append(self)

            def __enter__(self) -> "FakeSMTP":
                return self

            def __exit__(self, exc_type, exc, tb) -> None:
                return None

            def starttls(self) -> None:
                self.started_tls = True

            def login(self, username: str, password: str) -> None:
                self.login_args = (username, password)

            def sendmail(self, sender: str, recipients: list[str], message: str) -> None:
                self.messages.append((sender, recipients, message))

        class FakeWebhookHandler(BaseHTTPRequestHandler):
            payloads: list[dict[str, object]] = []

            def log_message(self, format: str, *args: object) -> None:  # noqa: A003
                return

            def do_POST(self) -> None:  # noqa: N802
                length = int(self.headers.get("Content-Length", "0"))
                payload = json.loads(self.rfile.read(length).decode("utf-8")) if length else {}
                FakeWebhookHandler.payloads.append(payload)
                self.send_response(200)
                self.end_headers()

        with tempfile.TemporaryDirectory() as tempdir:
            workspace = Path(tempdir)
            webhook_server = HTTPServer(("127.0.0.1", 0), FakeWebhookHandler)
            webhook_thread = threading.Thread(target=webhook_server.serve_forever, daemon=True)
            webhook_thread.start()
            try:
                (workspace / ".env").write_text(
                    "\n".join(
                        [
                            "SMTP_HOST=smtp.example.com",
                            "SMTP_PORT=587",
                            "SMTP_USERNAME=mailer@example.com",
                            "SMTP_PASSWORD=secret-password",
                            "SMTP_FROM_ADDRESS=agent@example.com",
                            "SMTP_FROM_NAME=Common Employee",
                            "SMTP_USE_STARTTLS=true",
                            f"TEAMS_PROGRESS_WEBHOOK_URL=http://127.0.0.1:{webhook_server.server_port}/teams",
                        ]
                    ),
                    encoding="utf-8",
                )

                smtp_config = SMTPDeliveryConfig.from_workspace(workspace)
                webhook_config = TeamsWebhookConfig.from_workspace(workspace)
                self.assertIsNotNone(smtp_config)
                self.assertIsNotNone(webhook_config)
                assert smtp_config is not None
                assert webhook_config is not None
                self.assertEqual(smtp_config.host, "smtp.example.com")
                self.assertEqual(smtp_config.port, 587)
                self.assertEqual(smtp_config.from_address, "agent@example.com")

                smtp_client = SMTPDeliveryClient(smtp_config, smtp_factory=FakeSMTP)
                smtp_result = smtp_client.send_message(
                    recipients=["leader@example.com"],
                    subject="Runtime update",
                    html_body="<p>hello</p>",
                )
                self.assertTrue(smtp_result["sent"])
                self.assertEqual(FakeSMTP.instances[0].login_args, ("mailer@example.com", "secret-password"))
                self.assertEqual(FakeSMTP.instances[0].messages[0][1], ["leader@example.com"])

                webhook_client = TeamsWebhookClient(webhook_config)
                webhook_result = webhook_client.send_message("processing complete")
                self.assertTrue(webhook_result["sent"])
                self.assertEqual(FakeWebhookHandler.payloads[0]["text"], "processing complete")
            finally:
                webhook_server.shutdown()
                webhook_server.server_close()
                webhook_thread.join(timeout=5)

    def test_service_manual_delivery_flows(self) -> None:
        smtp_spec = importlib.util.find_spec("common_employee_runtime.smtp_delivery")
        teams_spec = importlib.util.find_spec("common_employee_runtime.teams_webhook")
        self.assertIsNotNone(smtp_spec, "SMTP service flow should exist for the manual-send phase.")
        self.assertIsNotNone(teams_spec, "Teams webhook flow should exist for the webhook phase.")
        if smtp_spec is None or teams_spec is None:
            return

        class FakeSMTPClient:
            def __init__(self) -> None:
                self.sent_messages: list[dict[str, object]] = []

            def send_message(self, *, recipients: list[str], subject: str, html_body: str) -> dict[str, object]:
                payload = {"recipients": recipients, "subject": subject, "html_body": html_body}
                self.sent_messages.append(payload)
                return {"sent": True, **payload}

        class FakeTeamsWebhookClient:
            def __init__(self) -> None:
                self.payloads: list[str] = []

            def send_message(self, text: str) -> dict[str, object]:
                self.payloads.append(text)
                return {"sent": True, "text": text}

        with tempfile.TemporaryDirectory() as tempdir:
            workspace = Path(tempdir)
            service = AutonomousRuntimeService(workspace)
            service.smtp_client = FakeSMTPClient()
            service.teams_webhook_client = FakeTeamsWebhookClient()

            mail_result = service.send_outlook_message(
                ["leader@example.com", "ops@example.com"],
                subject="Subject",
                html_body="<p>Body</p>",
            )
            self.assertTrue(mail_result["sent"])
            self.assertEqual(service.smtp_client.sent_messages[0]["recipients"], ["leader@example.com", "ops@example.com"])

            teams_result = service.send_teams_message("processing complete")
            self.assertTrue(teams_result["sent"])
            self.assertEqual(service.teams_webhook_client.payloads[0], "processing complete")

    def test_runtime_emits_teams_webhook_alerts_for_completed_and_blocked_runs(self) -> None:
        with tempfile.TemporaryDirectory() as tempdir:
            workspace = Path(tempdir)

            class FakeTeamsWebhookClient:
                def __init__(self) -> None:
                    self.payloads: list[str] = []

                def send_message(self, text: str) -> dict[str, object]:
                    self.payloads.append(text)
                    return {"sent": True, "text": text}

            webhook_client = FakeTeamsWebhookClient()
            service = AutonomousRuntimeService(workspace, teams_webhook_client=webhook_client)

            completed_payload = {
                "ticket": {
                    "key": "OPS-801",
                    "summary": "Completed webhook emission",
                    "description": "The runtime should emit Teams self-alerts on completion.",
                    "issue_type": "Incident",
                    "project": "OPS",
                    "priority": "High",
                    "labels": ["ops"],
                },
                "knowledge": {
                    "runbook_refs": ["runbooks/payroll-timeout.md#recovery"],
                    "past_solution_refs": ["OPS-77"],
                    "selected_solution": "Reset the worker and validate health checks.",
                    "alternatives": [{"option": "Rollback", "reason": "Documented worker reset is lower risk."}],
                    "risks": ["Confirm no duplicate jobs are active."],
                },
                "actions": [
                    {
                        "system": "Jira",
                        "action": "comment",
                        "risk": "low",
                        "description": "Share the recovery plan with stakeholders.",
                    }
                ],
            }
            completed_result = service.process_ticket(completed_payload)
            self.assertEqual(completed_result["state"], "completed")

            blocked_payload = {
                "ticket": {
                    "key": "OPS-802",
                    "summary": "Blocked webhook emission",
                    "description": "The runtime should emit Teams self-alerts on blocked runs.",
                    "issue_type": "Incident",
                    "project": "OPS",
                    "priority": "High",
                    "labels": ["ops"],
                },
                "knowledge": {
                    "runbook_refs": ["runbooks/credential-incident.md#rotate"],
                    "past_solution_refs": ["OPS-91"],
                    "selected_solution": "Rotate the service credential and validate the API health check.",
                    "alternatives": [{"option": "Retry", "reason": "Known expired credential pattern makes this unsafe."}],
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
            blocked_result = service.process_ticket(blocked_payload)
            self.assertEqual(blocked_result["state"], "blocked")

            self.assertGreaterEqual(len(webhook_client.payloads), 4)
            self.assertTrue(any("OPS-801" in payload and "started" in payload.lower() for payload in webhook_client.payloads))
            self.assertTrue(any("OPS-801" in payload and "completed" in payload.lower() for payload in webhook_client.payloads))
            self.assertTrue(any("OPS-802" in payload and "started" in payload.lower() for payload in webhook_client.payloads))
            self.assertTrue(any("OPS-802" in payload and "blocked" in payload.lower() for payload in webhook_client.payloads))

    def test_outlook_manual_send_records_prepared_and_sent_events_for_a_run(self) -> None:
        with tempfile.TemporaryDirectory() as tempdir:
            workspace = Path(tempdir)

            class FakeSMTPClient:
                def send_message(self, *, recipients: list[str], subject: str, html_body: str) -> dict[str, object]:
                    return {"sent": True, "recipients": recipients, "subject": subject, "html_body": html_body}

            service = AutonomousRuntimeService(workspace, smtp_client=FakeSMTPClient())
            service.process_ticket(
                {
                    "ticket": {
                        "key": "OPS-803",
                        "summary": "Prepared mail evidence",
                        "description": "A completed run should leave prepared and sent mail evidence.",
                        "issue_type": "Incident",
                        "project": "OPS",
                        "priority": "High",
                        "labels": ["ops"],
                    },
                    "knowledge": {
                        "runbook_refs": ["runbooks/payroll-timeout.md#recovery"],
                        "past_solution_refs": ["OPS-77"],
                        "selected_solution": "Reset the worker and validate health checks.",
                        "alternatives": [{"option": "Rollback", "reason": "Documented worker reset is lower risk."}],
                        "risks": ["Confirm no duplicate jobs are active."],
                    },
                    "actions": [
                        {
                            "system": "Jira",
                            "action": "comment",
                            "risk": "low",
                            "description": "Share the recovery plan with stakeholders.",
                        }
                    ],
                }
            )

            mail_result = service.send_outlook_message(
                ["leader@example.com"],
                subject="OPS-803 update",
                html_body="<p>Done</p>",
                ticket_key="OPS-803",
            )
            self.assertTrue(mail_result["sent"])

            events = service.store.list_events("OPS-803", limit=10)
            stages = [event["stage"] for event in events]
            self.assertIn("outlook-prepared", stages)
            self.assertIn("outlook-sent", stages)

    def test_runtime_records_teams_webhook_failures_as_events(self) -> None:
        with tempfile.TemporaryDirectory() as tempdir:
            workspace = Path(tempdir)

            class FailingTeamsWebhookClient:
                def send_message(self, text: str) -> dict[str, object]:
                    raise RuntimeError("webhook down")

            service = AutonomousRuntimeService(workspace, teams_webhook_client=FailingTeamsWebhookClient())
            result = service.process_ticket(
                {
                    "ticket": {
                        "key": "OPS-804",
                        "summary": "Webhook failure evidence",
                        "description": "Webhook delivery failures should be recorded instead of dropped.",
                        "issue_type": "Incident",
                        "project": "OPS",
                        "priority": "High",
                        "labels": ["ops"],
                    },
                    "knowledge": {
                        "runbook_refs": ["runbooks/payroll-timeout.md#recovery"],
                        "past_solution_refs": ["OPS-77"],
                        "selected_solution": "Reset the worker and validate health checks.",
                        "alternatives": [{"option": "Rollback", "reason": "Documented worker reset is lower risk."}],
                        "risks": ["Confirm no duplicate jobs are active."],
                    },
                    "actions": [
                        {
                            "system": "Jira",
                            "action": "comment",
                            "risk": "low",
                            "description": "Share the recovery plan with stakeholders.",
                        }
                    ],
                }
            )
            self.assertEqual(result["state"], "completed")

            events = service.store.list_events("OPS-804", limit=20)
            failure_events = [event for event in events if event["stage"] == "teams-webhook-failed"]
            self.assertTrue(failure_events)
            self.assertIn("webhook down", json.dumps(failure_events[0]["payload"], ensure_ascii=False))

    def test_web_console_confluence_controls(self) -> None:
        module_spec = importlib.util.find_spec("common_employee_runtime.confluence")
        self.assertIsNotNone(module_spec, "Confluence UI controls should exist for the new phase.")
        if module_spec is None:
            return

        class FakeConfluenceHandler(BaseHTTPRequestHandler):
            create_payloads: list[dict[str, object]] = []

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
                if self.path.startswith("/wiki/api/v2/pages?"):
                    self._write_json(
                        {
                            "results": [
                                {"id": "9001", "title": "Runbook Report", "spaceId": "501", "status": "current"}
                            ]
                        }
                    )
                    return
                if self.path.startswith("/wiki/api/v2/pages/9001"):
                    self._write_json(
                        {
                            "id": "9001",
                            "title": "Runbook Report",
                            "spaceId": "501",
                            "status": "current",
                            "version": {"number": 2},
                            "body": {"storage": {"value": "<p>Existing report</p>"}},
                        }
                    )
                    return
                self.send_error(404)

            def do_POST(self) -> None:  # noqa: N802
                length = int(self.headers.get("Content-Length", "0"))
                payload = json.loads(self.rfile.read(length).decode("utf-8")) if length else {}
                if self.path == "/wiki/api/v2/pages":
                    FakeConfluenceHandler.create_payloads.append(payload)
                    self._write_json({"id": "9002", "version": {"number": 1}})
                    return
                self.send_error(404)

        with tempfile.TemporaryDirectory() as tempdir:
            workspace = Path(tempdir)
            (workspace / ".env").write_text(
                    "\n".join(
                        [
                            "ATLASSIAN_EMAIL=agent@example.com",
                            "ATLASSIAN_API_TOKEN=jira-token",
                            "ATLASSIAN_CONFLUENCE_SPACE=501",
                            "ATLASSIAN_CONFLUENCE_PARENT_PAGE_ID=1000",
                            "ATLASSIAN_CONFLUENCE_PUBLISH_MODE=manual",
                    ]
                ),
                encoding="utf-8",
            )
            server = HTTPServer(("127.0.0.1", 0), FakeConfluenceHandler)
            thread = threading.Thread(target=server.serve_forever, daemon=True)
            thread.start()
            env_backup = os.environ.get("ATLASSIAN_BASE_URL")
            try:
                os.environ["ATLASSIAN_BASE_URL"] = f"http://127.0.0.1:{server.server_port}"
                app = build_web_app(workspace)
                with make_server("127.0.0.1", 0, app) as web_server:
                    web_thread = threading.Thread(target=web_server.serve_forever, daemon=True)
                    web_thread.start()
                    try:
                        dashboard = request.urlopen(
                            f"http://127.0.0.1:{web_server.server_port}/?confluence_title=Runbook"
                        ).read().decode("utf-8")
                        self.assertIn("Confluence pages", dashboard)
                        self.assertIn("manual", dashboard)
                        self.assertIn("Runbook Report", dashboard)

                        page_html = request.urlopen(
                            f"http://127.0.0.1:{web_server.server_port}/confluence/pages/9001"
                        ).read().decode("utf-8")
                        self.assertIn("Existing report", page_html)
                        self.assertIn("Runbook Report", page_html)

                        run_payload = parse.urlencode(
                            {
                                "payload_json": json.dumps(
                                    {
                                        "ticket": {
                                            "key": "OPS-703",
                                            "summary": "Web publish control",
                                            "description": "Exercise Confluence publish controls.",
                                            "issue_type": "Incident",
                                            "project": "OPS",
                                            "priority": "Medium",
                                            "labels": ["ops"],
                                        },
                                        "knowledge": {
                                            "runbook_refs": ["runbooks/web-console.md#publish"],
                                            "past_solution_refs": ["OPS-702"],
                                            "selected_solution": "Publish from the web console after the run.",
                                            "alternatives": [{"option": "Skip publish", "reason": "This phase requires it."}],
                                            "risks": ["Keep the page body redacted."],
                                        },
                                        "actions": [
                                            {
                                                "system": "Confluence",
                                                "action": "publish",
                                                "risk": "low",
                                                "description": "Prepare the report body.",
                                            }
                                        ],
                                    },
                                    ensure_ascii=False,
                                ),
                                "confluence_publish_mode": "manual",
                            }
                        ).encode("utf-8")

                        run_detail = request.urlopen(
                            request.Request(
                                f"http://127.0.0.1:{web_server.server_port}/runs",
                                data=run_payload,
                                headers={"Content-Type": "application/x-www-form-urlencoded"},
                                method="POST",
                            )
                        ).read().decode("utf-8")
                        self.assertIn("Publish to Confluence", run_detail)
                        self.assertIn("manual", run_detail)

                        publish_payload = parse.urlencode(
                            {
                                "ticket_key": "OPS-703",
                                "page_title": "OPS-703 runtime report",
                            }
                        ).encode("utf-8")
                        publish_detail = request.urlopen(
                            request.Request(
                                f"http://127.0.0.1:{web_server.server_port}/confluence/publish",
                                data=publish_payload,
                                headers={"Content-Type": "application/x-www-form-urlencoded"},
                                method="POST",
                            )
                        ).read().decode("utf-8")
                        self.assertIn("OPS-703 runtime report", json.dumps(FakeConfluenceHandler.create_payloads[0], ensure_ascii=False))
                        self.assertIn("Run detail: OPS-703", publish_detail)
                    finally:
                        web_server.shutdown()
                        web_server.server_close()
                        web_thread.join(timeout=5)
            finally:
                if env_backup is None:
                    os.environ.pop("ATLASSIAN_BASE_URL", None)
                else:
                    os.environ["ATLASSIAN_BASE_URL"] = env_backup
                server.shutdown()
                server.server_close()
                thread.join(timeout=5)

    def test_web_console_manual_delivery_controls(self) -> None:
        with tempfile.TemporaryDirectory() as tempdir:
            workspace = Path(tempdir)
            service = AutonomousRuntimeService(workspace)

            class FakeSMTPClient:
                def send_message(self, *, recipients: list[str], subject: str, html_body: str) -> dict[str, object]:
                    return {"sent": True, "recipients": recipients, "subject": subject, "html_body": html_body}

            class FakeTeamsWebhookClient:
                def send_message(self, text: str) -> dict[str, object]:
                    return {"sent": True, "text": text}

            service.smtp_client = FakeSMTPClient()
            service.teams_webhook_client = FakeTeamsWebhookClient()
            (workspace / ".env").write_text(
                "\n".join(
                    [
                        "SMTP_HOST=smtp.example.com",
                        "SMTP_PORT=587",
                        "SMTP_USERNAME=mailer@example.com",
                        "SMTP_PASSWORD=secret-password",
                        "SMTP_FROM_ADDRESS=agent@example.com",
                        "SMTP_FROM_NAME=Common Employee",
                        "SMTP_USE_STARTTLS=true",
                        "TEAMS_PROGRESS_WEBHOOK_URL=https://example.webhook.office.com/teams",
                    ]
                ),
                encoding="utf-8",
            )

            app = build_web_app(workspace, service=service)
            with make_server("127.0.0.1", 0, app) as web_server:
                web_thread = threading.Thread(target=web_server.serve_forever, daemon=True)
                web_thread.start()
                try:
                    dashboard = request.urlopen(f"http://127.0.0.1:{web_server.server_port}/").read().decode("utf-8")
                    self.assertIn("Outlook manual delivery", dashboard)
                    self.assertIn("Teams webhook", dashboard)
                    self.assertNotIn("Graph messaging", dashboard)

                    mail_payload = parse.urlencode(
                        {
                            "recipients": "leader@example.com,ops@example.com",
                            "subject": "Smoke",
                            "html_body": "<p>Body</p>",
                        }
                    ).encode("utf-8")
                    mail_result = request.urlopen(
                        request.Request(
                            f"http://127.0.0.1:{web_server.server_port}/outlook/send",
                            data=mail_payload,
                            headers={"Content-Type": "application/x-www-form-urlencoded"},
                            method="POST",
                        )
                    ).read().decode("utf-8")
                    self.assertIn("Outlook send result", mail_result)
                    self.assertIn("leader@example.com", mail_result)

                    teams_payload = parse.urlencode({"message_text": "Runtime complete"}).encode("utf-8")
                    teams_result = request.urlopen(
                        request.Request(
                            f"http://127.0.0.1:{web_server.server_port}/teams/webhook",
                            data=teams_payload,
                            headers={"Content-Type": "application/x-www-form-urlencoded"},
                            method="POST",
                        )
                    ).read().decode("utf-8")
                    self.assertIn("Teams webhook result", teams_result)
                    self.assertIn("Runtime complete", teams_result)
                finally:
                    web_server.shutdown()
                    web_server.server_close()
                    web_thread.join(timeout=5)

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
