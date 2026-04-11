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


def parse_markdown_sections(text: str) -> dict[str, str]:
    matches = list(
        re.finditer(r"^##\s+(.+?)\n", text, flags=re.MULTILINE)
    )
    sections: dict[str, str] = {}
    for index, match in enumerate(matches):
        title = match.group(1).strip()
        start = match.end()
        end = matches[index + 1].start() if index + 1 < len(matches) else len(text)
        sections[title] = text[start:end].strip()
    return sections


def section_has_bullet_content(section_body: str) -> bool:
    return any(
        line.startswith("- ") and line[2:].strip()
        for line in section_body.splitlines()
    )


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


def validate_ongoing_plan(path: Path, contract: dict) -> list[str]:
    text = path.read_text(encoding="utf-8")
    sections = parse_markdown_sections(text)
    ongoing_contract = contract["ongoing_plan"]
    issues: list[str] = []

    for section in ongoing_contract["required_sections"]:
        if section not in sections:
            issues.append(f"{path}: ongoing plan missing required section `{section}`.")

    for section in [
        "Goal",
        "Scope",
        "Current Owner",
        "Current Step",
        "Current State",
        "Verification Evidence",
        "Next Owner",
        "Next Step",
        "Issues",
    ]:
        if section in sections and not section_has_bullet_content(sections[section]):
            issues.append(f"{path}: ongoing plan section `{section}` must contain a bullet value.")

    if "Operating State" in sections:
        keyed = parse_keyed_lines(sections["Operating State"])
        checkpoint_refs = keyed.get("checkpoint_ref", [])
        cleanup_statuses = keyed.get("cleanup_status", [])
        if not checkpoint_refs or not checkpoint_refs[0]:
            issues.append(f"{path}: ongoing plan missing `checkpoint_ref`.")
        if not cleanup_statuses or not cleanup_statuses[0]:
            issues.append(f"{path}: ongoing plan missing `cleanup_status`.")
        elif cleanup_statuses[0] not in ongoing_contract["allowed_cleanup_statuses"]:
            issues.append(
                f"{path}: ongoing plan has invalid cleanup status `{cleanup_statuses[0]}`."
            )

    if "Verification" in sections:
        keyed = parse_keyed_lines(sections["Verification"])
        verdicts = keyed.get("verdict", [])
        attempts = keyed.get("attempts", [])
        if not verdicts or not verdicts[0]:
            issues.append(f"{path}: ongoing plan missing `verdict`.")
        elif verdicts[0] not in ongoing_contract["allowed_verdicts"]:
            issues.append(f"{path}: ongoing plan has invalid verdict `{verdicts[0]}`.")
        if not attempts or not attempts[0]:
            issues.append(f"{path}: ongoing plan missing `attempts`.")
        elif not attempts[0].isdigit():
            issues.append(f"{path}: ongoing plan attempts must be a non-negative integer.")

    if "Failure Record" in sections:
        keyed = parse_keyed_lines(sections["Failure Record"])
        root_causes = keyed.get("root_cause", [])
        rollback_points = keyed.get("rollback_point", [])
        if not root_causes or not root_causes[0]:
            issues.append(f"{path}: ongoing plan missing `root_cause`.")
        if not rollback_points or not rollback_points[0]:
            issues.append(f"{path}: ongoing plan missing `rollback_point`.")

    return issues


def validate_review_report(path: Path, contract: dict) -> list[str]:
    text = path.read_text(encoding="utf-8")
    sections = parse_markdown_sections(text)
    review_contract = contract["review_report"]
    issues: list[str] = []

    for section in review_contract["required_sections"]:
        if section not in sections:
            issues.append(f"{path}: review report missing required section `{section}`.")

    for section in [
        "Reason",
        "Scope",
        "Checked",
        "Passed",
        "Evidence",
        "Open Risks",
        "Next Owner",
        "Next Step",
    ]:
        if section in sections and not section_has_bullet_content(sections[section]):
            issues.append(f"{path}: review report section `{section}` must contain a bullet value.")

    if "Verdict" in sections:
        verdict_lines = [
            line[2:].strip()
            for line in sections["Verdict"].splitlines()
            if line.startswith("- ")
        ]
        if not verdict_lines:
            issues.append(f"{path}: review report missing verdict value.")
        elif verdict_lines[0] not in review_contract["allowed_verdicts"]:
            issues.append(f"{path}: review report has invalid verdict `{verdict_lines[0]}`.")

    if "Checkpoint" in sections:
        keyed = parse_keyed_lines(sections["Checkpoint"])
        refs = keyed.get("ref", [])
        if not refs or not refs[0]:
            issues.append(f"{path}: review report missing checkpoint ref.")

    if "Cleanup" in sections:
        keyed = parse_keyed_lines(sections["Cleanup"])
        statuses = keyed.get("status", [])
        cleaned = keyed.get("cleaned", [])
        remaining = keyed.get("remaining", [])
        if not statuses or not statuses[0]:
            issues.append(f"{path}: review report missing cleanup status.")
        elif statuses[0] not in review_contract["allowed_cleanup_statuses"]:
            issues.append(
                f"{path}: review report has invalid cleanup status `{statuses[0]}`."
            )
        if not cleaned or not cleaned[0]:
            issues.append(f"{path}: review report missing cleanup `cleaned` detail.")
        if not remaining or not remaining[0]:
            issues.append(f"{path}: review report missing cleanup `remaining` detail.")

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

    ongoing_glob = contract["ongoing_plan"]["glob"]
    for ongoing_path in sorted(app_dir.glob(ongoing_glob)):
        issues.extend(validate_ongoing_plan(ongoing_path, contract))

    for review_glob in contract["review_report"]["globs"]:
        for review_path in sorted(app_dir.glob(review_glob)):
            issues.extend(validate_review_report(review_path, contract))

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
