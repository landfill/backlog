# common-employee M365 manual delivery smoke

## Goal
- Resume the manual-delivery implementation by adding a smoke surface and durable evidence for standalone Outlook SMTP and Teams webhook checks.

## Scope
- CLI readiness output
- explicit standalone smoke execution support
- durable smoke evidence persistence
- regression coverage and status alignment

## Current Owner
- Lead

## Current Step
- close the smoke-surface implementation and prepare the live operator smoke handoff

## Current State
- completed

## Operating State
- checkpoint_ref: 7009f7e
- cleanup_status: CLEAN

## Verification
- verdict: APPROVED
- attempts: 1

## Verification Evidence
- repository-level harness strengthening is complete and implementation restart is approved
- `common-employee/.env` currently lacks populated `SMTP_*` and `TEAMS_PROGRESS_WEBHOOK_URL`, so live smoke needs a readiness-first implementation path
- current runtime already exposes SMTP and Teams send methods plus manual web controls
- `common_employee_runtime.cli manual-delivery-smoke --workspace <workspace>` now reports readiness and writes a durable smoke artifact
- standalone smoke execution can persist evidence without a Jira ticket key
- `python3 -m unittest common-employee/tests/test_runtime_service.py -v` passed with 25 tests

## Failure Record
- root_cause: none
- rollback_point: 7009f7e

## Next Owner
- Lead

## Next Step
- populate operator SMTP / Teams webhook secrets and run the real manual-delivery smoke

## Issues
- live production-value smoke is still blocked until SMTP and Teams webhook secrets are configured
