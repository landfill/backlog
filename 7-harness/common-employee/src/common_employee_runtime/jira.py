from __future__ import annotations

import base64
from dataclasses import dataclass
import json
import os
from pathlib import Path
from typing import Any
from urllib import parse, request


DEFAULT_JIRA_FIELDS = [
    "summary",
    "description",
    "issuetype",
    "project",
    "priority",
    "labels",
    "status",
    "assignee",
    "reporter",
]


class JiraRequestError(RuntimeError):
    pass


@dataclass(slots=True)
class JiraConfig:
    base_url: str
    email: str
    api_token: str
    poll_jql: str = "assignee = currentUser() AND statusCategory != Done ORDER BY updated DESC"

    @classmethod
    def from_env(cls) -> JiraConfig | None:
        return cls.from_mapping(os.environ)

    @classmethod
    def from_workspace(cls, workspace: Path) -> JiraConfig | None:
        dotenv_values = _read_dotenv(workspace / ".env")
        merged = dict(dotenv_values)
        for key, value in os.environ.items():
            merged[key] = value
        return cls.from_mapping(merged)

    @classmethod
    def from_mapping(cls, mapping: dict[str, str] | os._Environ[str]) -> JiraConfig | None:
        base_url = str(mapping.get("ATLASSIAN_BASE_URL", "")).strip().rstrip("/")
        email = str(mapping.get("ATLASSIAN_EMAIL", "")).strip()
        api_token = str(mapping.get("ATLASSIAN_API_TOKEN", "")).strip()
        poll_jql = str(
            mapping.get(
                "ATLASSIAN_JIRA_POLL_JQL",
                "assignee = currentUser() AND statusCategory != Done ORDER BY updated DESC",
            )
        ).strip()
        if not (base_url and email and api_token):
            return None
        return cls(
            base_url=base_url,
            email=email,
            api_token=api_token,
            poll_jql=poll_jql,
        )


@dataclass(slots=True)
class JiraIssue:
    key: str
    summary: str
    description: str
    issue_type: str
    project: str
    priority: str
    labels: list[str]
    status: str
    assignee: str
    reporter: str


class JiraClient:
    def __init__(
        self,
        config: JiraConfig,
        *,
        opener: request.OpenerDirector | None = None,
    ) -> None:
        self.config = config
        self._opener = opener or request.build_opener()

    @classmethod
    def from_env(cls) -> JiraClient | None:
        config = JiraConfig.from_env()
        if config is None:
            return None
        return cls(config)

    @classmethod
    def from_workspace(cls, workspace: Path) -> JiraClient | None:
        config = JiraConfig.from_workspace(workspace)
        if config is None:
            return None
        return cls(config)

    def get_issue(self, issue_key: str, *, fields: list[str] | None = None) -> JiraIssue:
        payload = self._request_json(
            "GET",
            f"/rest/api/3/issue/{parse.quote(issue_key, safe='')}",
            query={"fields": ",".join(fields or DEFAULT_JIRA_FIELDS)},
        )
        return self._parse_issue(payload)

    def search_issues(
        self,
        *,
        jql: str | None = None,
        max_results: int = 20,
        fields: list[str] | None = None,
    ) -> list[JiraIssue]:
        payload = self._request_json(
            "POST",
            "/rest/api/3/search/jql",
            payload={
                "jql": jql or self.config.poll_jql,
                "maxResults": max_results,
                "fields": fields or DEFAULT_JIRA_FIELDS,
            },
        )
        return [self._parse_issue(issue) for issue in payload.get("issues", [])]

    def add_comment(self, issue_key: str, body_text: str) -> dict[str, Any]:
        return self._request_json(
            "POST",
            f"/rest/api/3/issue/{parse.quote(issue_key, safe='')}/comment",
            payload={"body": _text_to_adf(body_text)},
        )

    def get_transitions(self, issue_key: str) -> list[dict[str, Any]]:
        payload = self._request_json(
            "GET",
            f"/rest/api/3/issue/{parse.quote(issue_key, safe='')}/transitions",
        )
        return list(payload.get("transitions", []))

    def transition_issue(self, issue_key: str, target_name: str) -> dict[str, Any]:
        lowered = target_name.casefold()
        target = None
        for transition in self.get_transitions(issue_key):
            transition_name = str(transition.get("name", "")).casefold()
            to_name = str(dict(transition.get("to", {})).get("name", "")).casefold()
            if lowered in {transition_name, to_name}:
                target = transition
                break
        if target is None:
            raise JiraRequestError(f"Transition `{target_name}` is not available for {issue_key}.")
        return self._request_json(
            "POST",
            f"/rest/api/3/issue/{parse.quote(issue_key, safe='')}/transitions",
            payload={"transition": {"id": str(target["id"])}},
            allow_empty_response=True,
        )

    def _request_json(
        self,
        method: str,
        path: str,
        *,
        query: dict[str, str] | None = None,
        payload: dict[str, Any] | None = None,
        allow_empty_response: bool = False,
    ) -> dict[str, Any]:
        url = f"{self.config.base_url}{path}"
        if query:
            url = f"{url}?{parse.urlencode(query)}"
        data = None
        headers = {
            "Accept": "application/json",
            "Authorization": f"Basic {self._basic_auth_token()}",
        }
        if payload is not None:
            data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
            headers["Content-Type"] = "application/json"
        req = request.Request(url, data=data, headers=headers, method=method)
        try:
            with self._opener.open(req) as response:
                raw = response.read()
        except Exception as error:  # pragma: no cover
            raise JiraRequestError(str(error)) from error
        if not raw:
            return {} if allow_empty_response else {}
        return json.loads(raw.decode("utf-8"))

    def _basic_auth_token(self) -> str:
        raw = f"{self.config.email}:{self.config.api_token}".encode("utf-8")
        return base64.b64encode(raw).decode("ascii")

    def _parse_issue(self, payload: dict[str, Any]) -> JiraIssue:
        fields = dict(payload.get("fields", {}))
        return JiraIssue(
            key=str(payload["key"]),
            summary=str(fields.get("summary", "")),
            description=_adf_to_text(fields.get("description", "")),
            issue_type=str(dict(fields.get("issuetype", {})).get("name", "")),
            project=str(dict(fields.get("project", {})).get("key", "")),
            priority=str(dict(fields.get("priority", {})).get("name", "")),
            labels=[str(label) for label in fields.get("labels", [])],
            status=str(dict(fields.get("status", {})).get("name", "")),
            assignee=str(dict(fields.get("assignee", {})).get("displayName", "")),
            reporter=str(dict(fields.get("reporter", {})).get("displayName", "")),
        )


def _adf_to_text(value: Any) -> str:
    if isinstance(value, str):
        return value
    if isinstance(value, list):
        return "".join(_adf_to_text(item) for item in value)
    if not isinstance(value, dict):
        return ""
    node_type = str(value.get("type", ""))
    content = value.get("content", [])
    if node_type == "text":
        return str(value.get("text", ""))
    if node_type == "hardBreak":
        return "\n"
    if node_type in {"paragraph", "heading"}:
        text = "".join(_adf_to_text(item) for item in content).strip()
        return f"{text}\n" if text else ""
    if node_type == "listItem":
        text = "".join(_adf_to_text(item) for item in content).strip()
        return f"- {text}\n" if text else ""
    return "".join(_adf_to_text(item) for item in content)


def _text_to_adf(text: str) -> dict[str, Any]:
    paragraphs = []
    for line in text.splitlines():
        if line.strip():
            paragraphs.append(
                {
                    "type": "paragraph",
                    "content": [{"type": "text", "text": line}],
                }
            )
    if not paragraphs:
        paragraphs = [{"type": "paragraph", "content": []}]
    return {"type": "doc", "version": 1, "content": paragraphs}


def _read_dotenv(path: Path) -> dict[str, str]:
    if not path.exists():
        return {}
    values: dict[str, str] = {}
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip()
        if value.startswith(("'", '"')) and value.endswith(("'", '"')) and len(value) >= 2:
            value = value[1:-1]
        values[key] = value
    return values
