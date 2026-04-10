# PRD: common-employee M365 manual delivery code alignment

## Goal
Align the existing `common-employee` runtime implementation with the active app-level M365 design baseline so Outlook uses operator-triggered SMTP delivery and Teams uses one-way webhook self-alerting.

## Scope
- Remove Graph-based Outlook/Teams runtime paths from the active service flow
- Replace web-console Graph controls with SMTP draft/send-prep and Teams webhook controls
- Update environment examples and runtime wiring to the SMTP + webhook configuration model
- Update tests to verify the new code paths and remove Graph-specific expectations
- Preserve Jira and Confluence behavior

## Non-Goals
- Mailbox monitoring or inbound mail processing
- Teams DM, Teams reply intake, or Graph delegated auth
- Multi-user auth or approval workflows
- Refactoring unrelated runtime behavior

## Acceptance Criteria
- Active runtime code no longer requires Graph credentials for Outlook/Teams behavior.
- Service exposes an SMTP-oriented Outlook preparation/send path consistent with operator-triggered delivery.
- Service exposes a Teams webhook send path for operator self-alerting only.
- Web console no longer renders Graph messaging forms or Graph auth messaging.
- `.env.example` documents SMTP and Teams webhook settings instead of Graph settings.
- Graph-specific tests are removed or replaced with SMTP/webhook tests.
- Existing Jira/Confluence runtime and web-console tests remain green.
