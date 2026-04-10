from __future__ import annotations

import json
import os
from pathlib import Path
import time
from typing import Any
from urllib import error as urlerror
from urllib import parse, request

from .jira import _read_dotenv


class GraphRequestError(RuntimeError):
    pass


class GraphConfig:
    def __init__(
        self,
        *,
        tenant_id: str,
        client_id: str,
        client_secret: str,
        mail_sender_user: str = "",
        sender_user: str = "",
        auth_base_url: str = "https://login.microsoftonline.com",
        graph_base_url: str = "https://graph.microsoft.com",
    ) -> None:
        self.tenant_id = tenant_id
        self.client_id = client_id
        self.client_secret = client_secret
        self.mail_sender_user = mail_sender_user
        self.sender_user = sender_user
        self.auth_base_url = auth_base_url.rstrip("/")
        self.graph_base_url = graph_base_url.rstrip("/")

    @classmethod
    def from_workspace(cls, workspace: Path) -> GraphConfig | None:
        dotenv_values = _read_dotenv(workspace / ".env")
        merged = dict(dotenv_values)
        for key, value in os.environ.items():
            merged[key] = value
        return cls.from_mapping(merged)

    @classmethod
    def from_mapping(cls, mapping: dict[str, str] | os._Environ[str]) -> GraphConfig | None:
        tenant_id = str(mapping.get("MS_TENANT_ID", "")).strip()
        client_id = str(mapping.get("MS_CLIENT_ID", "")).strip()
        client_secret = str(mapping.get("MS_CLIENT_SECRET", "")).strip()
        mail_sender_user = str(mapping.get("MS_OUTLOOK_SENDER_USER", "")).strip()
        sender_user = str(mapping.get("MS_TEAMS_SENDER_USER", "")).strip()
        auth_base_url = str(mapping.get("MS_AUTH_BASE_URL", "https://login.microsoftonline.com")).strip()
        graph_base_url = str(mapping.get("MS_GRAPH_BASE_URL", "https://graph.microsoft.com")).strip()
        if not (tenant_id and client_id and client_secret):
            return None
        return cls(
            tenant_id=tenant_id,
            client_id=client_id,
            client_secret=client_secret,
            mail_sender_user=mail_sender_user,
            sender_user=sender_user,
            auth_base_url=auth_base_url,
            graph_base_url=graph_base_url,
        )


class GraphClient:
    def __init__(
        self,
        config: GraphConfig,
        *,
        opener: request.OpenerDirector | None = None,
    ) -> None:
        self.config = config
        self._opener = opener or request.build_opener()
        self._access_token: str | None = None
        self._access_token_expires_at: float = 0.0

    @classmethod
    def from_workspace(cls, workspace: Path) -> GraphClient | None:
        config = GraphConfig.from_workspace(workspace)
        if config is None:
            return None
        return cls(config)

    def get_user(self, user_principal_name: str) -> dict[str, object]:
        return self._request_json("GET", f"/v1.0/users/{parse.quote(user_principal_name, safe='@')}")

    def send_mail(self, mailbox_user: str, *, to_recipients: list[str], subject: str, html_body: str) -> None:
        self._request_json(
            "POST",
            f"/v1.0/users/{parse.quote(mailbox_user, safe='@')}/sendMail",
            payload={
                "message": {
                    "subject": subject,
                    "body": {"contentType": "HTML", "content": html_body},
                    "toRecipients": [{"emailAddress": {"address": recipient}} for recipient in to_recipients],
                },
                "saveToSentItems": "false",
            },
            allow_empty_response=True,
        )

    def create_one_on_one_chat(self, sender_user: str, target_user: str) -> dict[str, object]:
        sender = self.get_user(sender_user)
        target = self.get_user(target_user)
        return self._request_json(
            "POST",
            "/v1.0/chats",
            payload={
                "chatType": "oneOnOne",
                "members": [
                    self._chat_member(sender["id"]),
                    self._chat_member(target["id"]),
                ],
            },
        )

    def send_chat_message(self, chat_id: str, message_text: str) -> dict[str, object]:
        return self._request_json(
            "POST",
            f"/v1.0/chats/{parse.quote(chat_id, safe='')}/messages",
            payload={
                "body": {
                    "contentType": "html",
                    "content": message_text,
                }
            },
        )

    def _chat_member(self, user_id: object) -> dict[str, object]:
        return {
            "@odata.type": "#microsoft.graph.aadUserConversationMember",
            "roles": ["owner"],
            "user@odata.bind": f"{self.config.graph_base_url}/v1.0/users('{user_id}')",
        }

    def _request_json(
        self,
        method: str,
        path: str,
        *,
        payload: dict[str, Any] | None = None,
        allow_empty_response: bool = False,
    ) -> dict[str, Any]:
        url = f"{self.config.graph_base_url}{path}"
        data = None
        token = self._get_access_token()
        headers = {
            "Accept": "application/json",
            "Authorization": f"Bearer {token}",
        }
        if payload is not None:
            data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
            headers["Content-Type"] = "application/json"
        req = request.Request(url, data=data, headers=headers, method=method)
        try:
            with self._opener.open(req) as response:
                raw = response.read()
        except Exception as error:  # pragma: no cover
            http_error = error if isinstance(error, urlerror.HTTPError) else getattr(error, "__cause__", None)
            if isinstance(http_error, urlerror.HTTPError) and http_error.code == 401:
                self._access_token = None
                self._access_token_expires_at = 0.0
                retry_headers = dict(headers)
                retry_headers["Authorization"] = f"Bearer {self._get_access_token()}"
                retry_req = request.Request(url, data=data, headers=retry_headers, method=method)
                try:
                    with self._opener.open(retry_req) as response:
                        raw = response.read()
                    return json.loads(raw.decode("utf-8")) if raw else ({} if allow_empty_response else {})
                except Exception as retry_error:  # pragma: no cover
                    raise GraphRequestError(str(retry_error)) from retry_error
            raise GraphRequestError(str(error)) from error
        if not raw:
            return {} if allow_empty_response else {}
        return json.loads(raw.decode("utf-8"))

    def _get_access_token(self) -> str:
        now = time.time()
        if self._access_token and now < self._access_token_expires_at:
            return self._access_token
        body = parse.urlencode(
            {
                "client_id": self.config.client_id,
                "client_secret": self.config.client_secret,
                "scope": "https://graph.microsoft.com/.default",
                "grant_type": "client_credentials",
            }
        ).encode("utf-8")
        req = request.Request(
            f"{self.config.auth_base_url}/{parse.quote(self.config.tenant_id, safe='')}/oauth2/v2.0/token",
            data=body,
            headers={"Content-Type": "application/x-www-form-urlencoded", "Accept": "application/json"},
            method="POST",
        )
        try:
            with self._opener.open(req) as response:
                raw = response.read()
        except Exception as error:  # pragma: no cover
            self._access_token = None
            self._access_token_expires_at = 0.0
            raise GraphRequestError(str(error)) from error
        payload = json.loads(raw.decode("utf-8")) if raw else {}
        token = str(payload.get("access_token", "")).strip()
        if not token:
            raise GraphRequestError("Graph token response did not include an access token.")
        self._access_token = token
        expires_in = int(payload.get("expires_in", 3600) or 3600)
        self._access_token_expires_at = now + max(0, expires_in - 60)
        return token
