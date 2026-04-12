# common-employee M365 manual delivery smoke

## Goal
- Add a safe smoke surface that checks SMTP/Teams webhook readiness and records durable evidence for standalone manual-delivery smoke actions.

## Primary Output
- A CLI-driven smoke flow for `common-employee` manual delivery that can report readiness, run explicit smoke sends, and persist standalone evidence.

## In Scope
- CLI subcommand or equivalent operator surface for readiness and explicit smoke execution
- durable local evidence for standalone Outlook/Teams smoke actions
- regression tests for readiness, send execution, and evidence persistence
- tracker/ongoing alignment for the smoke follow-up slice

## Out of Scope
- changing the active SMTP/Teams delivery model
- inbox monitoring or bidirectional Teams behavior
- automatic live sends without explicit operator intent
- archive governance or unrelated Jira/Confluence changes

## Done When
- Operators can verify SMTP/Teams webhook readiness from the runtime CLI.
- Standalone smoke sends can persist durable local evidence without requiring a Jira ticket key.
- Regression tests cover readiness and standalone smoke evidence behavior.

## Verification Plan
- add failing tests first for readiness reporting and standalone smoke evidence
- `python3 -m unittest common-employee/tests/test_runtime_service.py -v`
- `python3 harness/scripts/check_harness_conformance.py .`

## Inputs
- `common-employee/.env` and `.env.example`
- current SMTP/Teams runtime/service/web behavior

## Expected Output
- CLI smoke support, durable evidence for standalone smoke, updated status artifacts

## Risk Notes
- Live external sends remain gated on actual `SMTP_*` and `TEAMS_PROGRESS_WEBHOOK_URL` configuration.
