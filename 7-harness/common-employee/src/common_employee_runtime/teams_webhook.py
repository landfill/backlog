from __future__ import annotations

import json
import os
from pathlib import Path
from urllib import request

from .jira import _read_dotenv


class TeamsWebhookError(RuntimeError):
    pass


class TeamsWebhookConfig:
    def __init__(self, *, webhook_url: str) -> None:
        self.webhook_url = webhook_url

    @classmethod
    def from_workspace(cls, workspace: Path) -> TeamsWebhookConfig | None:
        dotenv_values = _read_dotenv(workspace / ".env")
        merged = dict(dotenv_values)
        for key, value in os.environ.items():
            merged[key] = value
        return cls.from_mapping(merged)

    @classmethod
    def from_mapping(cls, mapping: dict[str, str] | os._Environ[str]) -> TeamsWebhookConfig | None:
        webhook_url = str(mapping.get("TEAMS_PROGRESS_WEBHOOK_URL", "")).strip()
        if not webhook_url:
            return None
        return cls(webhook_url=webhook_url)


class TeamsWebhookClient:
    def __init__(self, config: TeamsWebhookConfig, *, opener: request.OpenerDirector | None = None) -> None:
        self.config = config
        self._opener = opener or request.build_opener()

    @classmethod
    def from_workspace(cls, workspace: Path) -> TeamsWebhookClient | None:
        config = TeamsWebhookConfig.from_workspace(workspace)
        if config is None:
            return None
        return cls(config)

    def send_message(self, text: str) -> dict[str, object]:
        payload = json.dumps({"text": text}, ensure_ascii=False).encode("utf-8")
        req = request.Request(
            self.config.webhook_url,
            data=payload,
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        try:
            with self._opener.open(req) as response:
                response.read()
        except Exception as error:  # pragma: no cover
            raise TeamsWebhookError(str(error)) from error
        return {"sent": True, "text": text}
