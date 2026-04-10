# common-employee M365 manual delivery code alignment

## Goal
- Align the active runtime/web/test code with the documented SMTP + Teams webhook M365 baseline.

## Primary Output
- Runtime code and tests that no longer depend on Graph-based Outlook/Teams behavior.

## In Scope
- service/web/test updates for SMTP manual-send preparation and Teams webhook send
- env example updates for SMTP/webhook settings
- removal or deactivation of active Graph-specific web/runtime paths

## Out of Scope
- mailbox monitoring
- Graph delegated auth
- unrelated Jira/Confluence refactors

## Done When
- Active code paths match the app-level M365 docs and regression tests pass.

## Verification Plan
- failing tests added first for SMTP/webhook baseline
- `python3 -W default -m unittest common-employee/tests/test_runtime_service.py -v`
- diagnostics on changed files
