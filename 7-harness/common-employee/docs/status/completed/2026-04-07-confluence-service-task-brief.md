# common-employee Confluence service

## Goal
- Add Confluence live search/read and configurable page publish/update support to the Jira-backed single-operator service.

## Primary Output
- A verified Confluence integration path that reuses shared Atlassian auth and supports both manual and immediate publish modes from the web console.

## In Scope
- Confluence REST client for search, page read, page create, and page update
- Shared Atlassian auth reuse
- Runtime publish-mode handling (`manual` and `immediate`)
- Explicit web-console publish action for completed runs
- Doc/config/status alignment and automated tests

## Out of Scope
- Teams/Outlook live integration
- Background polling or webhook automation
- Attachment sync or bulk raw Confluence ingestion
- Multi-user auth/session behavior

## Done When
- Automated tests cover Confluence client flow, runtime publish modes, and web-console publish controls.
- The service can create or update Confluence pages from successful runtime runs.
- Manual mode remains the default and immediate mode is available as a config/UI option.
- App docs and env example reflect the implemented Confluence behavior.

## Verification Plan
- `python3 -W default -m unittest common-employee/tests/test_runtime_service.py -v`
- diagnostics on changed files in `common-employee`
- optional manual web-console smoke for Confluence search/read/manual publish when credentials are available

## Inputs
- Shared Atlassian credentials
- Existing Jira-backed runtime/service/web code path
- Existing Confluence integration/auth design docs

## Expected Output
- Confluence-enabled runtime code, web-console controls, updated docs, and current status artifacts

## Risk Notes
- Remote page update must use explicit page id/version checks to avoid blind overwrite.
