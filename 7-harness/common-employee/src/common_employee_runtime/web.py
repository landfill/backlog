from __future__ import annotations

import argparse
from html import escape
import json
from pathlib import Path
from typing import Callable
from urllib.parse import parse_qs, quote, unquote
from wsgiref.simple_server import make_server

from .service import AutonomousRuntimeService
from .store import RuntimeStore


ALLOWED_ARTIFACT_ROOTS = ("docs/generated/decision-logs", "docs/status")
BUILTIN_SAMPLE_PAYLOAD: dict[str, object] = {
    "ticket": {
        "key": "OPS-201",
        "summary": "Payroll sync timeout after deployment",
        "description": "The payroll synchronization job timed out after a deployment and needs runtime recovery.",
        "issue_type": "Incident",
        "project": "OPS",
        "priority": "High",
        "labels": ["ops", "incident"],
    },
    "knowledge": {
        "runbook_refs": ["runbooks/payroll-timeout.md#recovery"],
        "past_solution_refs": ["OPS-77"],
        "selected_solution": "Reset the payroll sync worker and confirm the downstream health checks.",
        "alternatives": [
            {
                "option": "Rollback the deployment",
                "reason": "The worker reset path is documented and lower risk.",
            }
        ],
        "risks": ["Confirm no duplicate payroll jobs are active before resolving the ticket."],
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
            "description": "Move the ticket to resolved after the runtime validation.",
        },
    ],
}


Headers = list[tuple[str, str]]
StartResponse = Callable[[str, Headers], None]


def build_web_app(workspace: Path):
    workspace = Path(workspace)
    service = AutonomousRuntimeService(workspace)
    store = service.store

    def app(environ: dict[str, object], start_response: StartResponse) -> list[bytes]:
        method = str(environ.get("REQUEST_METHOD", "GET")).upper()
        path = str(environ.get("PATH_INFO", "/"))
        query = parse_qs(str(environ.get("QUERY_STRING", "")), keep_blank_values=True)
        try:
            if method == "GET" and path == "/":
                return _html_response(
                    start_response,
                    _render_dashboard(
                        workspace,
                        store,
                        sample_payload=_load_sample_payload(workspace),
                        jira_enabled=service.jira_client is not None,
                        jira_results=service.list_jira_issues(jql=query.get("jql", [""])[0] or None)
                        if service.jira_client
                        else [],
                        jira_jql=query.get("jql", [""])[0] if service.jira_client else "",
                    ),
                )
            if method == "POST" and path == "/runs":
                body = _read_request_body(environ)
                payload_text = _extract_payload_json_from_form_body(body)
                payload = json.loads(payload_text)
                result = service.process_ticket(payload)
                ticket_key = quote(str(result["ticket_key"]), safe="")
                start_response("303 See Other", [("Location", f"/runs/{ticket_key}")])
                return [b""]
            if method == "GET" and path.startswith("/jira/issues/"):
                issue_key = unquote(path.removeprefix("/jira/issues/"))
                if service.jira_client is None:
                    return _html_response(
                        start_response,
                        _render_message(title="Jira unavailable", message="Jira client is not configured."),
                        status="503 Service Unavailable",
                    )
                payload = service.get_jira_issue_payload(issue_key)
                return _html_response(start_response, _render_jira_issue(issue_key, payload))
            if method == "POST" and path == "/jira/process":
                if service.jira_client is None:
                    return _html_response(
                        start_response,
                        _render_message(title="Jira unavailable", message="Jira client is not configured."),
                        status="503 Service Unavailable",
                    )
                body = _read_request_body(environ)
                form = parse_qs(body, keep_blank_values=True)
                issue_key = form.get("issue_key", [""])[0]
                knowledge = json.loads(form.get("knowledge_json", ["{}"])[0])
                actions = json.loads(form.get("actions_json", ["[]"])[0])
                transition_name = form.get("transition_on_complete", [""])[0].strip() or None
                comment_on_complete = form.get("comment_on_complete", [""])[0] == "on"
                result = service.process_jira_issue(
                    issue_key,
                    knowledge=knowledge,
                    actions=actions,
                    comment_on_complete=comment_on_complete,
                    transition_on_complete=transition_name,
                )
                ticket_key = quote(str(result["ticket_key"]), safe="")
                start_response("303 See Other", [("Location", f"/runs/{ticket_key}")])
                return [b""]
            if method == "GET" and path.startswith("/runs/"):
                ticket_key = unquote(path.removeprefix("/runs/"))
                run = store.get_run(ticket_key)
                if run is None:
                    return _html_response(
                        start_response,
                        _render_message(
                            title="Run not found",
                            message=f"No run found for `{ticket_key}`.",
                        ),
                        status="404 Not Found",
                    )
                return _html_response(
                    start_response,
                    _render_run_detail(workspace, run, store.list_events(ticket_key)),
                )
            if method == "GET" and path == "/artifacts":
                relative_path = query.get("path", [""])[0]
                artifact_path = _resolve_artifact_path(workspace, relative_path)
                if artifact_path is None:
                    return _html_response(
                        start_response,
                        _render_message(
                            title="Artifact blocked",
                            message="Only generated status and decision-log artifacts inside the workspace can be opened.",
                        ),
                        status="403 Forbidden",
                    )
                if not artifact_path.exists():
                    return _html_response(
                        start_response,
                        _render_message(title="Artifact missing", message="The requested artifact does not exist."),
                        status="404 Not Found",
                    )
                artifact_text = artifact_path.read_text(encoding="utf-8")
                return _html_response(
                    start_response,
                    _render_artifact(relative_path, artifact_text),
                )
        except json.JSONDecodeError as error:
            body = _read_request_body(environ, allow_reuse=True)
            return _html_response(
                start_response,
                _render_dashboard(
                    workspace,
                    store,
                    sample_payload=_load_sample_payload(workspace),
                    error_message=f"Payload JSON을 해석하지 못했습니다: {error.msg}",
                    payload_override=_extract_payload_json_from_form_body(body),
                    jira_enabled=service.jira_client is not None,
                ),
                status="400 Bad Request",
            )
        except Exception as error:  # pragma: no cover - defensive last resort
            return _html_response(
                start_response,
                _render_message(title="Unhandled error", message=str(error)),
                status="500 Internal Server Error",
            )
        return _html_response(
            start_response,
            _render_message(title="Not found", message="요청한 페이지를 찾지 못했습니다."),
            status="404 Not Found",
        )

    return app


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="common-employee-web",
        description="Serve the common-employee local web console.",
    )
    parser.add_argument("--workspace", type=Path, required=True, help="Workspace root for runtime artifacts.")
    parser.add_argument("--host", default="127.0.0.1", help="Bind host. Default: 127.0.0.1")
    parser.add_argument("--port", type=int, default=8000, help="Bind port. Default: 8000")
    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    with make_server(args.host, args.port, build_web_app(args.workspace)) as server:
        print(f"Serving common-employee web console on http://{args.host}:{args.port}")
        server.serve_forever()
    return 0


def _read_request_body(environ: dict[str, object], *, allow_reuse: bool = False) -> str:
    cached = environ.get("cached.request_body")
    if allow_reuse and isinstance(cached, str):
        return cached
    length = int(str(environ.get("CONTENT_LENGTH", "0") or "0"))
    if length <= 0:
        body = ""
    else:
        body = environ["wsgi.input"].read(length).decode("utf-8")
    environ["cached.request_body"] = body
    return body


def _html_response(start_response: StartResponse, html: str, *, status: str = "200 OK") -> list[bytes]:
    encoded = html.encode("utf-8")
    start_response(
        status,
        [
            ("Content-Type", "text/html; charset=utf-8"),
            ("Content-Length", str(len(encoded))),
        ],
    )
    return [encoded]


def _extract_payload_json_from_form_body(body: str) -> str:
    if not body:
        return ""
    return parse_qs(body, keep_blank_values=True).get("payload_json", [""])[0]


def _render_dashboard(
    workspace: Path,
    store: RuntimeStore,
    *,
    sample_payload: str,
    error_message: str | None = None,
    payload_override: str | None = None,
    jira_enabled: bool = False,
    jira_results: list[dict[str, object]] | None = None,
    jira_jql: str = "",
) -> str:
    payload_text = payload_override or sample_payload
    runs = store.list_runs(limit=20)
    if runs:
        rows = "".join(
            "<tr>"
            f"<td><a href=\"/runs/{quote(str(run['ticket_key']), safe='')}\">{escape(str(run['ticket_key']))}</a></td>"
            f"<td>{escape(str(run['state']))}</td>"
            f"<td>{escape(str(run['current_stage']))}</td>"
            f"<td>{escape(str(run['attempts']))}</td>"
            f"<td>{escape(str(run['updated_at']))}</td>"
            "</tr>"
            for run in runs
        )
        runs_markup = (
            "<table><thead><tr><th>Ticket</th><th>State</th><th>Stage</th><th>Attempts</th><th>Updated</th></tr></thead>"
            f"<tbody>{rows}</tbody></table>"
        )
    else:
        runs_markup = "<p>아직 처리된 run이 없습니다.</p>"

    if jira_enabled:
        results = jira_results or []
        if results:
            jira_rows = "".join(
                "<tr>"
                f"<td><a href=\"/jira/issues/{quote(str(issue['key']), safe='')}\">{escape(str(issue['key']))}</a></td>"
                f"<td>{escape(str(issue['summary']))}</td>"
                f"<td>{escape(str(issue['status']))}</td>"
                f"<td>{escape(str(issue['issue_type']))}</td>"
                f"<td>{escape(str(issue['priority']))}</td>"
                "</tr>"
                for issue in results
            )
            jira_results_markup = (
                "<table><thead><tr><th>Key</th><th>Summary</th><th>Status</th><th>Type</th><th>Priority</th></tr></thead>"
                f"<tbody>{jira_rows}</tbody></table>"
            )
        else:
            jira_results_markup = "<p>검색 결과가 없습니다. JQL을 바꾸거나 이슈 키로 직접 불러오세요.</p>"
        jira_section = f"""
        <section>
          <h2>Jira Cloud issues</h2>
          <form method="get" action="/">
            <label for="jql">JQL</label>
            <textarea id="jql" name="jql" rows="3">{escape(jira_jql)}</textarea>
            <div class="actions"><button type="submit">Search Jira</button></div>
          </form>
          {jira_results_markup}
          <form method="get" action="/jira/issues/" onsubmit="event.preventDefault(); window.location='/jira/issues/' + encodeURIComponent(this.issue_key.value);">
            <label for="issue_key">Issue key</label>
            <input id="issue_key" name="issue_key" placeholder="OPS-123" />
            <div class="actions"><button type="submit">Load issue</button></div>
          </form>
        </section>
        """
    else:
        jira_section = """
        <section>
          <h2>Jira Cloud integration</h2>
          <p>환경 변수 `ATLASSIAN_BASE_URL`, `ATLASSIAN_EMAIL`, `ATLASSIAN_API_TOKEN`이 설정되면 실제 Jira issue 검색/처리가 활성화됩니다.</p>
        </section>
        """

    error_markup = f"<p class=\"error\">{escape(error_message)}</p>" if error_message else ""
    body = f"""
    <section>
      <h1>common-employee Web Console</h1>
      <p>로컬 전용 운영 콘솔입니다. mock/manual intake JSON을 제출하면 기존 autonomous runtime을 실행합니다.</p>
      {error_markup}
    </section>
    <section>
      <h2>Run intake</h2>
      <form method="post" action="/runs">
        <textarea name="payload_json" rows="24">{escape(payload_text)}</textarea>
        <div class="actions"><button type="submit">Process payload</button></div>
      </form>
    </section>
    {jira_section}
    <section>
      <h2>Recent runs</h2>
      {runs_markup}
    </section>
    <section>
      <h2>Workspace</h2>
      <p>{escape(str(workspace))}</p>
    </section>
    """
    return _layout("common-employee Web Console", body)


def _render_run_detail(workspace: Path, run: dict[str, object], events: list[dict[str, object]]) -> str:
    gate_results = dict(run.get("gate_results", {}))
    gate_items = "".join(
        f"<li><strong>{escape(str(key))}</strong>: {escape(str(value))}</li>"
        for key, value in sorted(gate_results.items())
    ) or "<li>none</li>"
    event_items = "".join(
        "<li>"
        f"<strong>{escape(str(event['stage']))}</strong> / {escape(str(event['verdict']))}"
        f" <span class=\"muted\">({escape(str(event['created_at']))})</span>"
        f"<pre>{escape(json.dumps(event['payload'], ensure_ascii=False, indent=2, sort_keys=True))}</pre>"
        "</li>"
        for event in events
    ) or "<li>none</li>"

    artifact_links = _render_artifact_links(workspace, str(run["ticket_key"]))
    body = f"""
    <section>
      <p><a href="/">← Dashboard</a></p>
      <h1>Run detail: {escape(str(run['ticket_key']))}</h1>
      <ul>
        <li><strong>State</strong>: {escape(str(run['state']))}</li>
        <li><strong>Stage</strong>: {escape(str(run['current_stage']))}</li>
        <li><strong>Classification</strong>: {escape(str(run['classification']))}</li>
        <li><strong>Confidence</strong>: {escape(str(run['confidence']))}</li>
        <li><strong>Attempts</strong>: {escape(str(run['attempts']))}</li>
        <li><strong>Updated</strong>: {escape(str(run['updated_at']))}</li>
      </ul>
    </section>
    <section>
      <h2>Gate results</h2>
      <ul>{gate_items}</ul>
    </section>
    <section>
      <h2>Recorded events</h2>
      <ul class="event-list">{event_items}</ul>
    </section>
    <section>
      <h2>Artifacts</h2>
      {artifact_links}
    </section>
    """
    return _layout(f"Run detail: {run['ticket_key']}", body)


def _render_artifact(relative_path: str, content: str) -> str:
    body = f"""
    <section>
      <p><a href="/">← Dashboard</a></p>
      <h1>Artifact</h1>
      <p>{escape(relative_path)}</p>
      <pre>{escape(content)}</pre>
    </section>
    """
    return _layout(f"Artifact: {relative_path}", body)


def _render_jira_issue(issue_key: str, payload: dict[str, object]) -> str:
    ticket = dict(payload.get("ticket", {}))
    knowledge = json.dumps(payload.get("knowledge", {}), ensure_ascii=False, indent=2)
    actions = json.dumps(payload.get("actions", []), ensure_ascii=False, indent=2)
    body = f"""
    <section>
      <p><a href="/">← Dashboard</a></p>
      <h1>Jira issue: {escape(issue_key)}</h1>
      <ul>
        <li><strong>Summary</strong>: {escape(str(ticket.get('summary', '')))}</li>
        <li><strong>Status</strong>: {escape(str(ticket.get('status', 'n/a')))}</li>
        <li><strong>Type</strong>: {escape(str(ticket.get('issue_type', '')))}</li>
        <li><strong>Priority</strong>: {escape(str(ticket.get('priority', '')))}</li>
      </ul>
      <pre>{escape(str(ticket.get('description', '')))}</pre>
    </section>
    <section>
      <h2>Process this Jira issue</h2>
      <form method="post" action="/jira/process">
        <input type="hidden" name="issue_key" value="{escape(issue_key)}" />
        <label for="knowledge_json">Knowledge JSON</label>
        <textarea id="knowledge_json" name="knowledge_json" rows="14">{escape(knowledge)}</textarea>
        <label for="actions_json">Actions JSON</label>
        <textarea id="actions_json" name="actions_json" rows="12">{escape(actions)}</textarea>
        <label for="transition_on_complete">Transition on complete</label>
        <input id="transition_on_complete" name="transition_on_complete" placeholder="Done / Resolved" />
        <label><input type="checkbox" name="comment_on_complete" checked /> Add Jira comment after processing</label>
        <div class="actions"><button type="submit">Process Jira issue</button></div>
      </form>
    </section>
    """
    return _layout(f"Jira issue: {issue_key}", body)


def _render_message(*, title: str, message: str) -> str:
    body = f"""
    <section>
      <p><a href="/">← Dashboard</a></p>
      <h1>{escape(title)}</h1>
      <p>{escape(message)}</p>
    </section>
    """
    return _layout(title, body)


def _render_artifact_links(workspace: Path, ticket_key: str) -> str:
    artifact_paths = _find_artifacts(workspace, ticket_key)
    if not artifact_paths:
        return "<p>연결된 artifact를 찾지 못했습니다.</p>"
    items = "".join(
        f"<li><a href=\"/artifacts?path={quote(path, safe='')}\">{escape(path)}</a></li>"
        for path in artifact_paths
    )
    return f"<ul>{items}</ul>"


def _find_artifacts(workspace: Path, ticket_key: str) -> list[str]:
    slug = ticket_key.lower().replace("_", "-")
    relative_paths: set[str] = set()
    patterns = (
        f"docs/status/ongoing/**/*{slug}*.md",
        f"docs/status/completed/**/*{slug}*.md",
        f"docs/generated/decision-logs/**/*{ticket_key}.md",
    )
    for pattern in patterns:
        for path in workspace.glob(pattern):
            if path.is_file():
                relative_paths.add(path.relative_to(workspace).as_posix())
    return sorted(relative_paths)


def _resolve_artifact_path(workspace: Path, relative_path: str) -> Path | None:
    if not relative_path:
        return None
    candidate = (workspace / relative_path).resolve()
    workspace_root = workspace.resolve()
    if workspace_root not in candidate.parents and candidate != workspace_root:
        return None
    if not any(relative_path == root or relative_path.startswith(f"{root}/") for root in ALLOWED_ARTIFACT_ROOTS):
        return None
    return candidate


def _load_sample_payload(workspace: Path) -> str:
    sample_path = workspace / "examples" / "operational-ticket.json"
    if sample_path.exists():
        return sample_path.read_text(encoding="utf-8")
    return json.dumps(BUILTIN_SAMPLE_PAYLOAD, ensure_ascii=False, indent=2)


def _layout(title: str, body: str) -> str:
    return f"""<!doctype html>
<html lang="ko">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{escape(title)}</title>
    <style>
      body {{
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        margin: 0;
        background: #f5f7fb;
        color: #1f2937;
      }}
      main {{
        max-width: 1080px;
        margin: 0 auto;
        padding: 24px;
      }}
      section {{
        background: white;
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 20px;
        box-shadow: 0 4px 14px rgba(15, 23, 42, 0.08);
      }}
      textarea {{
        width: 100%;
        box-sizing: border-box;
        font-family: ui-monospace, SFMono-Regular, monospace;
      }}
      input {{
        width: 100%;
        box-sizing: border-box;
        padding: 10px;
        margin: 8px 0 12px;
      }}
      label {{
        display: block;
        font-weight: 600;
        margin-top: 8px;
      }}
      table {{
        width: 100%;
        border-collapse: collapse;
      }}
      th, td {{
        text-align: left;
        padding: 10px;
        border-bottom: 1px solid #e5e7eb;
      }}
      .actions {{
        margin-top: 12px;
      }}
      button {{
        background: #2563eb;
        color: white;
        border: 0;
        border-radius: 8px;
        padding: 10px 16px;
        cursor: pointer;
      }}
      .error {{
        color: #b91c1c;
        font-weight: 600;
      }}
      .muted {{
        color: #6b7280;
      }}
      pre {{
        overflow: auto;
        background: #111827;
        color: #f9fafb;
        padding: 14px;
        border-radius: 10px;
      }}
      ul.event-list {{
        padding-left: 18px;
      }}
      a {{
        color: #2563eb;
      }}
    </style>
  </head>
  <body>
    <main>{body}</main>
  </body>
</html>
"""


if __name__ == "__main__":
    raise SystemExit(main())
