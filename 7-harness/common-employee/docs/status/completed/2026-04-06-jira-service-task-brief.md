# common-employee Jira-backed service

## Goal
- Add real Jira Cloud integration to `common-employee` so the runtime can operate on actual Jira issues instead of mock payloads only.

## Primary Output
- Jira-backed fetch/search/sync path integrated into the runtime and operator UI.

## In Scope
- Jira Cloud API-token integration
- Jira issue fetch/search
- Jira-backed processing from the web UI
- Comment/transition sync for approved runs
- tests/docs/status updates

## Out of Scope
- Multi-user console auth/session model
- Confluence/Teams/Outlook live integrations in this pass
- distributed OAuth 3LO app packaging

## Done When
- A configured operator can load a real Jira issue, process it, and sync the result back to Jira.

## Verification Plan
- run automated tests for Jira client + runtime + web UI
- manual smoke with configured Jira credentials
- diagnostics on affected files

## Inputs
- existing runtime + local web console
- app integration/auth docs
- official Atlassian Jira Cloud REST docs

## Expected Output
- Jira-backed service path and updated docs/status artifacts

## Risk Notes
- credentials are environment-dependent; implementation must fail closed when Jira config is missing and may be supplied through process env or `common-employee/.env`.
