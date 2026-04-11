from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path


SCRIPT_DIR = Path(__file__).resolve().parent
DEFAULT_CONTRACT_PATH = SCRIPT_DIR.parent / "core/schemas/app-harness-contract.json"


def load_contract(contract_path: Path | None = None) -> dict:
    path = contract_path or DEFAULT_CONTRACT_PATH
    return json.loads(path.read_text(encoding="utf-8"))


def discover_apps(workspace: Path, contract: dict) -> list[Path]:
    required_path = Path(contract["app_discovery"]["required_path"])
    apps: list[Path] = []
    for child in sorted(workspace.iterdir()):
        if not child.is_dir():
            continue
        if child.name.startswith(".") or child.name == "harness":
            continue
        if (child / required_path).exists():
            apps.append(child)
    return apps


def parse_keyed_lines(text: str) -> dict[str, list[str]]:
    keyed: dict[str, list[str]] = {}
    for match in re.finditer(r"^- ([a-z_]+):\s*(.+)$", text, flags=re.MULTILINE):
        keyed.setdefault(match.group(1), []).append(match.group(2).strip())
    return keyed


def validate_tracker(app_dir: Path, contract: dict) -> list[str]:
    tracker_path = app_dir / "docs/status/tracker.md"
    text = tracker_path.read_text(encoding="utf-8")
    tracker_contract = contract["tracker"]
    issues: list[str] = []

    for section in tracker_contract["required_sections"]:
        if section not in text:
            issues.append(
                f"{tracker_path}: missing required section `{section}`."
            )

    keyed = parse_keyed_lines(text)
    for field in tracker_contract["required_fields"]:
        values = keyed.get(field, [])
        if not values or any(not value for value in values):
            issues.append(f"{tracker_path}: missing required field `{field}`.")

    verdicts = keyed.get("verdict", [])
    if verdicts:
        verdict = verdicts[0]
        if verdict not in tracker_contract["allowed_verdicts"]:
            issues.append(
                f"{tracker_path}: invalid verdict `{verdict}`; expected one of "
                f"{', '.join(tracker_contract['allowed_verdicts'])}."
            )

    cleanup_statuses = keyed.get("cleanup_status", [])
    if cleanup_statuses:
        cleanup_status = cleanup_statuses[0]
        if cleanup_status not in tracker_contract["allowed_cleanup_statuses"]:
            issues.append(
                f"{tracker_path}: invalid cleanup_status `{cleanup_status}`; expected one of "
                f"{', '.join(tracker_contract['allowed_cleanup_statuses'])}."
            )

    attempts = keyed.get("attempts", [])
    if attempts and not attempts[0].isdigit():
        issues.append(
            f"{tracker_path}: attempts must be a non-negative integer, got `{attempts[0]}`."
        )

    return issues


def validate_app(app_dir: Path, contract: dict) -> list[str]:
    issues: list[str] = []

    for relative_path in contract["required_files"]:
        path = app_dir / relative_path
        if not path.exists():
            issues.append(f"{app_dir}: missing required file `{relative_path}`.")

    agents_path = app_dir / "AGENTS.md"
    if agents_path.exists():
        agents_text = agents_path.read_text(encoding="utf-8")
        missing_roles = [
            item["role"]
            for item in contract["required_role_mapping_patterns"]
            if re.search(item["pattern"], agents_text) is None
        ]
        if missing_roles:
            issues.append(
                f"{agents_path}: missing required repository role mappings for "
                f"{', '.join(missing_roles)}."
            )

    tracker_path = app_dir / "docs/status/tracker.md"
    if tracker_path.exists():
        issues.extend(validate_tracker(app_dir, contract))

    return issues


def validate_workspace(workspace: Path, contract_path: Path | None = None) -> list[str]:
    contract = load_contract(contract_path)
    issues: list[str] = []
    apps = discover_apps(workspace, contract)

    if not apps:
        return ["No app harness directories found under workspace."]

    for app_dir in apps:
        issues.extend(validate_app(app_dir, contract))

    return issues


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Validate repository app harnesses against the core conformance contract."
    )
    parser.add_argument(
        "workspace",
        nargs="?",
        default=".",
        help="Workspace root containing harness/ and app directories.",
    )
    parser.add_argument(
        "--contract",
        default=str(DEFAULT_CONTRACT_PATH),
        help="Path to the JSON contract file.",
    )
    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    workspace = Path(args.workspace).resolve()
    contract_path = Path(args.contract).resolve()
    issues = validate_workspace(workspace, contract_path)

    if issues:
        for issue in issues:
            print(f"ERROR: {issue}")
        return 1

    print("Harness conformance OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
