from __future__ import annotations

from email.message import EmailMessage
import os
from pathlib import Path
import smtplib
from typing import Callable

from .jira import _read_dotenv


class SMTPDeliveryError(RuntimeError):
    pass


class SMTPDeliveryConfig:
    def __init__(
        self,
        *,
        host: str,
        port: int,
        username: str,
        password: str,
        from_address: str,
        from_name: str = "",
        use_starttls: bool = True,
    ) -> None:
        self.host = host
        self.port = port
        self.username = username
        self.password = password
        self.from_address = from_address
        self.from_name = from_name
        self.use_starttls = use_starttls

    @classmethod
    def from_workspace(cls, workspace: Path) -> SMTPDeliveryConfig | None:
        dotenv_values = _read_dotenv(workspace / ".env")
        merged = dict(dotenv_values)
        for key, value in os.environ.items():
            merged[key] = value
        return cls.from_mapping(merged)

    @classmethod
    def from_mapping(cls, mapping: dict[str, str] | os._Environ[str]) -> SMTPDeliveryConfig | None:
        host = str(mapping.get("SMTP_HOST", "")).strip()
        port_text = str(mapping.get("SMTP_PORT", "")).strip()
        username = str(mapping.get("SMTP_USERNAME", "")).strip()
        password = str(mapping.get("SMTP_PASSWORD", "")).strip()
        from_address = str(mapping.get("SMTP_FROM_ADDRESS", "")).strip()
        from_name = str(mapping.get("SMTP_FROM_NAME", "")).strip()
        use_starttls = str(mapping.get("SMTP_USE_STARTTLS", "true")).strip().lower() not in {"0", "false", "no", "off"}
        if not (host and port_text and username and password and from_address):
            return None
        return cls(
            host=host,
            port=int(port_text),
            username=username,
            password=password,
            from_address=from_address,
            from_name=from_name,
            use_starttls=use_starttls,
        )


class SMTPDeliveryClient:
    def __init__(
        self,
        config: SMTPDeliveryConfig,
        *,
        smtp_factory: Callable[..., object] | None = None,
    ) -> None:
        self.config = config
        self._smtp_factory = smtp_factory or smtplib.SMTP

    @classmethod
    def from_workspace(cls, workspace: Path) -> SMTPDeliveryClient | None:
        config = SMTPDeliveryConfig.from_workspace(workspace)
        if config is None:
            return None
        return cls(config)

    def send_message(self, *, recipients: list[str], subject: str, html_body: str) -> dict[str, object]:
        if not recipients:
            raise SMTPDeliveryError("At least one recipient is required.")
        message = EmailMessage()
        sender = self.config.from_address
        if self.config.from_name:
            sender = f"{self.config.from_name} <{self.config.from_address}>"
        message["From"] = sender
        message["To"] = ", ".join(recipients)
        message["Subject"] = subject
        message.set_content("HTML body omitted in plain-text fallback.")
        message.add_alternative(html_body, subtype="html")

        try:
            with self._smtp_factory(self.config.host, self.config.port, timeout=10.0) as smtp:
                if self.config.use_starttls:
                    smtp.starttls()
                smtp.login(self.config.username, self.config.password)
                smtp.send_message(message)
        except Exception as error:  # pragma: no cover
            raise SMTPDeliveryError(str(error)) from error
        return {"sent": True, "recipients": recipients, "subject": subject}
