# PRD: common-employee Graph messaging

## Goal
Extend `common-employee` with Microsoft Graph-based Outlook and Teams communication primitives so the single-operator service can send official email notifications and, where tenant permissions allow, establish Teams 1:1 chat delivery paths.

## Scope
- Microsoft Graph client-credentials token acquisition
- User lookup by principal name
- Outlook mail send to a specified work account
- Teams one-on-one chat creation or lookup for a specified work account
- Web-console manual send controls for Outlook and Teams smoke operations
- Live smoke using `bkkim@hanatour.com` as the target account when tests require a real user

## Non-Goals
- Teams/Outlook inbound polling or response processing
- Broad runtime auto-send orchestration in the same phase
- Group/channel posting flows
- Delegated-user auth flows

## Acceptance Criteria
- Service can acquire a Graph access token from tenant/client/client-secret settings.
- Service can resolve `bkkim@hanatour.com` to a Graph user object.
- Service can send a live Outlook message to `bkkim@hanatour.com`.
- Service can create or find a one-on-one Teams chat with `bkkim@hanatour.com`.
- If Teams chat message send is disallowed under the current app permission model, the service records and surfaces that blocker explicitly instead of failing silently.
- Automated tests cover Graph token, user lookup, Outlook send, Teams chat creation, and blocked Teams send behavior.
