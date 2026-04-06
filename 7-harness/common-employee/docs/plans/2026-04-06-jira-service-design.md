# Jira-backed Service Design

## Goal

Turn the local runtime and operator console into a Jira Cloud-backed single-operator service.

## Chosen Approach

- Keep the existing runtime/store/web boundaries.
- Add a dedicated `jira.py` module for Cloud REST calls and ADF/plain-text translation.
- Load credentials from process env or `common-employee/.env`.
- Reuse the existing runtime path for Jira issues instead of creating a second orchestration path.

## Why

- Preserves the authoritative-state model already established by the runtime.
- Keeps the web UI thin and operator-oriented.
- Avoids adding dependencies for configuration or HTTP.
- Matches the app-level security/reliability rules for service-account-based Cloud access.

## Runtime Shape

1. Search or load a Jira issue
2. Flatten Jira payload into runtime ticket context
3. Operator supplies knowledge/actions JSON
4. Process via the existing runtime service
5. Optionally sync comment / transition back to Jira
6. Keep local artifacts and decision logs as the audit trail

## Safety

- Credentials stay out of code/docs/artifacts
- Only low-risk or test-marked issues were used for live smoke writes
- Transition smoke used a same-state transition to minimize impact
