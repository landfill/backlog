from __future__ import annotations

import argparse
import json
from pathlib import Path
import sys

from .service import AutonomousRuntimeService


def build_run_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="common-employee-runtime",
        description="Run the common-employee autonomous runtime against a mock intake payload.",
    )
    parser.add_argument("scenario", type=Path, help="Path to the mock intake JSON payload.")
    parser.add_argument(
        "--workspace",
        type=Path,
        required=True,
        help="Workspace root where runtime artifacts should be written.",
    )
    return parser


def build_smoke_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="common-employee-runtime manual-delivery-smoke",
        description="Report readiness and optionally execute standalone Outlook SMTP / Teams webhook smoke checks.",
    )
    parser.add_argument(
        "--workspace",
        type=Path,
        required=True,
        help="Workspace root where runtime artifacts should be written.",
    )
    parser.add_argument(
        "--outlook-to",
        action="append",
        default=[],
        help="Recipient email for explicit Outlook SMTP smoke. Can be passed multiple times.",
    )
    parser.add_argument(
        "--outlook-subject",
        default="common-employee Outlook SMTP smoke",
        help="Subject used for explicit Outlook SMTP smoke.",
    )
    parser.add_argument(
        "--outlook-html-body",
        default="<p>common-employee Outlook SMTP smoke</p>",
        help="HTML body used for explicit Outlook SMTP smoke.",
    )
    parser.add_argument(
        "--teams-message",
        default="common-employee Teams webhook smoke",
        help="Message used for explicit Teams webhook smoke.",
    )
    parser.add_argument(
        "--send-outlook",
        action="store_true",
        help="Actually send the Outlook SMTP smoke message.",
    )
    parser.add_argument(
        "--send-teams",
        action="store_true",
        help="Actually send the Teams webhook smoke message.",
    )
    return parser


def main(argv: list[str] | None = None) -> int:
    argv = list(sys.argv[1:] if argv is None else argv)
    if argv and argv[0] == "manual-delivery-smoke":
        parser = build_smoke_parser()
        args = parser.parse_args(argv[1:])
        service = AutonomousRuntimeService(args.workspace)
        result = service.run_manual_delivery_smoke(
            outlook_recipients=list(args.outlook_to),
            outlook_subject=args.outlook_subject,
            outlook_html_body=args.outlook_html_body,
            teams_message=args.teams_message,
            send_outlook=bool(args.send_outlook),
            send_teams=bool(args.send_teams),
        )
        print(json.dumps(result, ensure_ascii=False, indent=2, sort_keys=True))
        if args.send_outlook and not bool(dict(result.get("outlook", {})).get("sent")):
            return 1
        if args.send_teams and not bool(dict(result.get("teams", {})).get("sent")):
            return 1
        return 0

    parser = build_run_parser()
    args = parser.parse_args(argv)

    payload = json.loads(args.scenario.read_text(encoding="utf-8"))
    service = AutonomousRuntimeService(args.workspace)
    result = service.process_ticket(payload)
    print(json.dumps(result, ensure_ascii=False, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
