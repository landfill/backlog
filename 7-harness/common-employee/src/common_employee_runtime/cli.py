from __future__ import annotations

import argparse
import json
from pathlib import Path

from .service import AutonomousRuntimeService


def build_parser() -> argparse.ArgumentParser:
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


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()

    payload = json.loads(args.scenario.read_text(encoding="utf-8"))
    service = AutonomousRuntimeService(args.workspace)
    result = service.process_ticket(payload)
    print(json.dumps(result, ensure_ascii=False, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
