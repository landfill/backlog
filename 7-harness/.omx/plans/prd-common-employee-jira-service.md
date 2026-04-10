# PRD: common-employee Jira-backed service

## Goal
Turn `common-employee` from a local-only runtime demo into a Jira-backed service that can fetch real Jira issues, process them through the documented runtime path, and sync approved results back to Jira.

## Scope
- Jira Cloud API-token based integration (Cloud-first)
- Real issue fetch/search
- Browser/UI path to load a Jira issue into the operator flow
- Runtime processing for Jira-backed issues using operator-supplied knowledge/actions
- Jira comment sync and workflow transition sync for approved runs
- Local single-operator deployment only (no multi-user console)

## Non-Goals
- Multi-user auth/session model
- Confluence/Teams/Outlook live integration in the same change
- Marketplace-grade OAuth 3LO distribution

## Acceptance Criteria
- Service can fetch a real Jira issue by key using environment-based credentials.
- Service can search a configured JQL and show candidate issues in the UI.
- Operator can select a Jira issue, enrich knowledge/actions, and run the existing runtime against that real issue.
- On approved completion, the service can add a Jira comment and transition the issue when configured.
- Sensitive data remains redacted in local artifacts and outbound comment body.
- Automated tests cover Jira client requests and Jira-backed runtime sync flow.
