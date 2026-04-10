# Confluence Service Design

## Goal

Add Confluence live integration to the current Jira-backed single-operator service without changing the existing authoritative-state model.

## Chosen Approach

- Keep the current `client -> service -> web` shape and add a dedicated `confluence.py` module.
- Reuse the existing Atlassian credentials (`ATLASSIAN_BASE_URL`, `ATLASSIAN_EMAIL`, `ATLASSIAN_API_TOKEN`) and add only Confluence-specific publish/search settings.
- Add a publish-mode contract to the service: `manual` as the default, `immediate` as an opt-in.
- Keep Confluence publishing tied to the runtime success path so later autonomous operation becomes a configuration change instead of a refactor.

## Why

- Preserves the thin web-console pattern already established by the Jira phase.
- Avoids speculative coordinator layers while still supporting a later switch to automatic publishing.
- Keeps one place responsible for redaction, report-body generation, and external write evidence.
- Matches the app-level security and reliability rules around service-account use, explicit external writes, and recoverable state.

## Runtime Shape

1. Operator searches or opens a Confluence page for knowledge lookup.
2. Operator processes a Jira-backed issue through the existing runtime path.
3. Runtime completes local artifacts and gate reports first.
4. Publish mode decides the next step:
   - `manual`: record publish readiness and wait for an explicit web-console publish action.
   - `immediate`: create or update the Confluence page immediately after the successful runtime cycle.
5. Publish metadata is stored as runtime event evidence while local Markdown artifacts remain the audit baseline.

## Config

- Shared auth:
  - `ATLASSIAN_BASE_URL`
  - `ATLASSIAN_EMAIL`
  - `ATLASSIAN_API_TOKEN`
- Confluence settings:
  - `ATLASSIAN_CONFLUENCE_SPACE`
  - `ATLASSIAN_CONFLUENCE_PARENT_PAGE_ID`
  - `ATLASSIAN_CONFLUENCE_PUBLISH_MODE` with `manual` default
  - optional default search query seed if needed later

## Safety

- Manual publish stays the default mode in the web console.
- Confluence writes happen only after the runtime reaches a successful state.
- Generated Confluence content is built from redacted local artifacts, not raw ticket payload copies.
- Update flow checks for an existing page id/version before overwrite and records the remote page id in runtime evidence.
