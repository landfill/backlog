# PRD: common-employee Confluence service

## Goal
Extend `common-employee` so the verified Jira-backed single-operator service can also read Confluence knowledge pages and publish/update Confluence report pages using the same Atlassian service-account authentication model.

## Scope
- Confluence Cloud API-token based integration using the existing Atlassian base URL, email, and API token inputs
- Confluence search and page-body read support for operator-guided knowledge lookup
- Confluence page create/update support for runtime-generated reporting artifacts
- Web-console controls for publish mode selection: `manual` or `immediate`
- Manual publish button flow for the default operator mode
- Immediate publish flow that can be enabled later without changing the service contract

## Non-Goals
- Multi-user publish approval workflow
- New auth models beyond the shared Atlassian Basic-auth setup
- Confluence attachment sync or bulk raw-content ingestion
- Teams/Outlook live integration in the same change
- Background daemonization or automatic scheduling in the same change

## Acceptance Criteria
- Service can authenticate to Confluence with the same Atlassian credentials already used for Jira.
- Service can search Confluence pages and load page content needed for runtime knowledge lookup.
- Service can create a new Confluence page under configured space/parent settings.
- Service can update an existing Confluence page when a prior runtime run already published one.
- Web console exposes a publish mode control and keeps the default in explicit/manual mode.
- Web console exposes an explicit publish action for completed runs.
- Immediate publish mode can publish during the successful runtime path without separate code changes.
- Automated tests cover Confluence REST requests, publish mode branching, and web-console controls.
- Local artifacts remain the authoritative audit trail, and sensitive values stay redacted.
