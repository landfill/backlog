import importlib.util
import tempfile
import unittest
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[2]
SCRIPT_PATH = REPO_ROOT / "harness/scripts/check_harness_conformance.py"


def load_checker_module():
    spec = importlib.util.spec_from_file_location("check_harness_conformance", SCRIPT_PATH)
    assert spec is not None
    assert spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def write_file(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")


def make_minimal_app(workspace: Path, *, app_name: str = "sample-app") -> Path:
    app_dir = workspace / app_name
    write_file(
        app_dir / "AGENTS.md",
        "\n".join(
            [
                "# Sample App",
                "",
                "## 저장소 공통 역할 매핑",
                "- repository-level `PM` 책임은 app-level `Lead`가 수행한다.",
                "- repository-level `Coder` 책임은 app-level `Executor`가 수행한다.",
                "- repository-level `Security Reviewer` 책임은 app-level `Guardian`이 수행한다.",
                "- repository-level `Tester` 책임은 app-level `Guardian`이 수행한다.",
            ]
        ),
    )
    write_file(app_dir / "ARCHITECTURE.md", "# Architecture\n")
    write_file(app_dir / "docs/PLANS.md", "# Plans\n")
    write_file(app_dir / "docs/SECURITY.md", "# Security\n")
    write_file(app_dir / "docs/RELIABILITY.md", "# Reliability\n")
    write_file(app_dir / "docs/status/README.md", "# Status\n")
    write_file(app_dir / "docs/status/ongoing/README.md", "# Ongoing\n")
    write_file(app_dir / "docs/status/completed/README.md", "# Completed\n")
    write_file(
        app_dir / "docs/status/ongoing/sample-ongoing-plan.md",
        "\n".join(
            [
                "# Sample Ongoing Plan",
                "",
                "## Goal",
                "- keep the sample app aligned",
                "",
                "## Scope",
                "- validate shared harness artifacts",
                "",
                "## Current Owner",
                "- Lead",
                "",
                "## Current Step",
                "- verify conformance",
                "",
                "## Current State",
                "- active",
                "",
                "## Operating State",
                "- checkpoint_ref: none",
                "- cleanup_status: CLEAN",
                "",
                "## Verification",
                "- verdict: APPROVED",
                "- attempts: 1",
                "",
                "## Verification Evidence",
                "- sample evidence",
                "",
                "## Failure Record",
                "- root_cause: none",
                "- rollback_point: none",
                "",
                "## Next Owner",
                "- Lead",
                "",
                "## Next Step",
                "- keep monitoring",
                "",
                "## Issues",
                "- none",
            ]
        ),
    )
    write_file(
        app_dir / "docs/status/ongoing/sample-review-report-lead.md",
        "\n".join(
            [
                "# Sample Review",
                "",
                "## Verdict",
                "- APPROVED",
                "",
                "## Reason",
                "- sample reason",
                "",
                "## Scope",
                "- validate sample output",
                "",
                "## Checked",
                "- sample check",
                "",
                "## Passed",
                "- yes",
                "",
                "## Evidence",
                "- sample evidence",
                "",
                "## Checkpoint",
                "- ref: none",
                "",
                "## Cleanup",
                "- status: CLEAN",
                "- cleaned: sample cleanup",
                "- remaining: none",
                "",
                "## Open Risks",
                "- none",
                "",
                "## Next Owner",
                "- Lead",
                "",
                "## Next Step",
                "- close the loop",
            ]
        ),
    )
    write_file(
        app_dir / "docs/status/tracker.md",
        "\n".join(
            [
                "# Tracker",
                "",
                "## Current Phase",
                "- phase: phase-1",
                "- status: active",
                "",
                "## Current Step",
                "- owner: Lead",
                "- state: validating app harness",
                "",
                "## Current Work",
                "- title: conformance",
                "- path: docs/status/ongoing/sample-task-brief.md",
                "",
                "## Verification",
                "- verdict: APPROVED",
                "- attempts: 1",
                "- evidence: sample evidence",
                "",
                "## Operating State",
                "- checkpoint_ref: none",
                "- cleanup_status: CLEAN",
                "",
                "## Next Owner",
                "- owner: Lead",
                "",
                "## Next Action",
                "- next: keep monitoring",
                "",
                "## Issues",
                "- none",
            ]
        ),
    )
    return app_dir


class HarnessConformanceTests(unittest.TestCase):
    def test_ci_workflow_runs_conformance_and_runtime_tests(self) -> None:
        workflow_path = REPO_ROOT / ".github/workflows/harness-conformance.yml"

        self.assertTrue(workflow_path.exists())
        workflow_text = workflow_path.read_text(encoding="utf-8")
        self.assertIn("python3 harness/scripts/check_harness_conformance.py .", workflow_text)
        self.assertIn(
            "python3 -m unittest harness/tests/test_harness_conformance.py -v",
            workflow_text,
        )
        self.assertIn(
            "python3 -m unittest common-employee/tests/test_runtime_service.py -v",
            workflow_text,
        )

    def test_current_workspace_conforms_for_common_employee(self) -> None:
        module = load_checker_module()

        issues = module.validate_workspace(REPO_ROOT)

        self.assertEqual(issues, [])

    def test_missing_repository_role_mapping_is_reported(self) -> None:
        module = load_checker_module()

        with tempfile.TemporaryDirectory() as tempdir:
            workspace = Path(tempdir)
            app_dir = make_minimal_app(workspace)
            write_file(
                app_dir / "AGENTS.md",
                "# Sample App\n\n## 저장소 공통 역할 매핑\n- repository-level `PM` 책임은 app-level `Lead`가 수행한다.\n",
            )

            issues = module.validate_workspace(workspace)

            self.assertTrue(
                any("required repository role mappings" in issue for issue in issues),
                issues,
            )

    def test_invalid_tracker_verdict_is_reported(self) -> None:
        module = load_checker_module()

        with tempfile.TemporaryDirectory() as tempdir:
            workspace = Path(tempdir)
            app_dir = make_minimal_app(workspace)
            write_file(
                app_dir / "docs/status/tracker.md",
                (app_dir / "docs/status/tracker.md")
                .read_text(encoding="utf-8")
                .replace("APPROVED", "MAYBE"),
            )

            issues = module.validate_workspace(workspace)

            self.assertTrue(
                any("invalid verdict" in issue for issue in issues),
                issues,
            )

    def test_invalid_ongoing_plan_attempts_is_reported(self) -> None:
        module = load_checker_module()

        with tempfile.TemporaryDirectory() as tempdir:
            workspace = Path(tempdir)
            app_dir = make_minimal_app(workspace)
            write_file(
                app_dir / "docs/status/ongoing/sample-ongoing-plan.md",
                (app_dir / "docs/status/ongoing/sample-ongoing-plan.md")
                .read_text(encoding="utf-8")
                .replace("- attempts: 1", "- attempts: many"),
            )

            issues = module.validate_workspace(workspace)

            self.assertTrue(
                any("ongoing plan" in issue and "attempts" in issue for issue in issues),
                issues,
            )

    def test_invalid_review_report_cleanup_status_is_reported(self) -> None:
        module = load_checker_module()

        with tempfile.TemporaryDirectory() as tempdir:
            workspace = Path(tempdir)
            app_dir = make_minimal_app(workspace)
            write_file(
                app_dir / "docs/status/ongoing/sample-review-report-lead.md",
                (app_dir / "docs/status/ongoing/sample-review-report-lead.md")
                .read_text(encoding="utf-8")
                .replace("- status: CLEAN", "- status: MAYBE"),
            )

            issues = module.validate_workspace(workspace)

            self.assertTrue(
                any("review report" in issue and "cleanup status" in issue for issue in issues),
                issues,
            )


if __name__ == "__main__":
    unittest.main()
