from __future__ import annotations

import base64
import json
import os
from pathlib import Path
from typing import Any
from urllib import parse, request

from .jira import _read_dotenv


DEFAULT_CONFLUENCE_PUBLISH_MODE = "manual"


class ConfluenceRequestError(RuntimeError):
    pass


class ConfluenceConfig:
    def __init__(
        self,
        *,
        base_url: str,
        email: str,
        api_token: str,
        space_id: str,
        parent_page_id: str = "",
        publish_mode: str = DEFAULT_CONFLUENCE_PUBLISH_MODE,
    ) -> None:
        self.base_url = base_url.rstrip("/")
        self.email = email
        self.api_token = api_token
        self.space_id = space_id
        self.parent_page_id = parent_page_id
        self.publish_mode = self.normalize_publish_mode(publish_mode)

    @classmethod
    def from_workspace(cls, workspace: Path) -> ConfluenceConfig | None:
        dotenv_values = _read_dotenv(workspace / ".env")
        merged = dict(dotenv_values)
        for key, value in os.environ.items():
            merged[key] = value
        return cls.from_mapping(merged)

    @classmethod
    def from_mapping(cls, mapping: dict[str, str] | os._Environ[str]) -> ConfluenceConfig | None:
        base_url = str(
            mapping.get("ATLASSIAN_CONFLUENCE_BASE_URL", "")
            or mapping.get("ATLASSIAN_BASE_URL", "")
        ).strip().rstrip("/")
        email = str(mapping.get("ATLASSIAN_EMAIL", "")).strip()
        api_token = str(mapping.get("ATLASSIAN_API_TOKEN", "")).strip()
        space_id = str(mapping.get("ATLASSIAN_CONFLUENCE_SPACE", "")).strip()
        parent_page_id = str(mapping.get("ATLASSIAN_CONFLUENCE_PARENT_PAGE_ID", "")).strip()
        publish_mode = str(mapping.get("ATLASSIAN_CONFLUENCE_PUBLISH_MODE", DEFAULT_CONFLUENCE_PUBLISH_MODE)).strip()
        if not (base_url and email and api_token and space_id):
            return None
        return cls(
            base_url=base_url,
            email=email,
            api_token=api_token,
            space_id=space_id,
            parent_page_id=parent_page_id,
            publish_mode=publish_mode,
        )

    @staticmethod
    def normalize_publish_mode(value: str | None) -> str:
        normalized = str(value or DEFAULT_CONFLUENCE_PUBLISH_MODE).strip().lower()
        if normalized not in {"manual", "immediate"}:
            return DEFAULT_CONFLUENCE_PUBLISH_MODE
        return normalized


class ConfluenceClient:
    def __init__(
        self,
        config: ConfluenceConfig,
        *,
        opener: request.OpenerDirector | None = None,
    ) -> None:
        self.config = config
        self._opener = opener or request.build_opener()

    @classmethod
    def from_workspace(cls, workspace: Path) -> ConfluenceClient | None:
        config = ConfluenceConfig.from_workspace(workspace)
        if config is None:
            return None
        return cls(config)

    def search_pages(self, *, title: str, limit: int = 10) -> list[dict[str, Any]]:
        payload = self._request_json(
            "GET",
            "/wiki/api/v2/pages",
            query={
                "title": title,
                "space-id": self.config.space_id,
                "limit": str(limit),
            },
        )
        return list(payload.get("results", []))

    def get_page(self, page_id: str) -> dict[str, Any]:
        return self._request_json(
            "GET",
            f"/wiki/api/v2/pages/{parse.quote(page_id, safe='')}",
            query={"body-format": "storage"},
        )

    def create_page(
        self,
        title: str,
        body_storage_value: str,
        *,
        parent_page_id: str | None = None,
    ) -> dict[str, Any]:
        payload: dict[str, Any] = {
            "spaceId": self.config.space_id,
            "status": "current",
            "title": title,
            "body": {
                "representation": "storage",
                "value": body_storage_value,
            },
        }
        parent_id = parent_page_id if parent_page_id is not None else self.config.parent_page_id
        if parent_id:
            payload["parentId"] = parent_id
        return self._request_json("POST", "/wiki/api/v2/pages", payload=payload)

    def update_page(
        self,
        page_id: str,
        title: str,
        body_storage_value: str,
        *,
        version_number: int,
    ) -> dict[str, Any]:
        payload: dict[str, Any] = {
            "id": page_id,
            "status": "current",
            "title": title,
            "spaceId": self.config.space_id,
            "body": {
                "representation": "storage",
                "value": body_storage_value,
            },
            "version": {"number": version_number + 1},
        }
        if self.config.parent_page_id:
            payload["parentId"] = self.config.parent_page_id
        return self._request_json(
            "PUT",
            f"/wiki/api/v2/pages/{parse.quote(page_id, safe='')}",
            payload=payload,
        )

    def _request_json(
        self,
        method: str,
        path: str,
        *,
        query: dict[str, str] | None = None,
        payload: dict[str, Any] | None = None,
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
            raise ConfluenceRequestError(str(error)) from error
        if not raw:
            return {}
        return json.loads(raw.decode("utf-8"))

    def _basic_auth_token(self) -> str:
        raw = f"{self.config.email}:{self.config.api_token}".encode("utf-8")
        return base64.b64encode(raw).decode("ascii")
