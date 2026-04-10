# Graph Messaging Design

## Goal

Add Microsoft Graph communication primitives to the verified Jira + Confluence single-operator service.

## Chosen Approach

- Add a dedicated `graph.py` module for client-credentials token acquisition, user lookup, Outlook send, and Teams chat operations.
- Keep Outlook and Teams as manual web-console actions in this phase instead of wiring them into automatic runtime completion.
- Treat Teams message send as capability-gated: if the current app permission model blocks it, surface that result explicitly while keeping Outlook live integration complete.

## Why

- Outlook mail send is supported cleanly by application permissions and matches the current service-account model.
- Teams one-on-one chat setup can still be useful even if message send is restricted by app-only Graph permissions.
- This keeps the phase small and honest: deliver what the auth model supports, and record the exact blocker when it does not.

## External API Notes

- Client credentials token: `POST https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token`
- User lookup: `GET https://graph.microsoft.com/v1.0/users/{userPrincipalName}`
- Outlook send: `POST /v1.0/users/{user-id-or-upn}/sendMail`
- Teams chat create: `POST /v1.0/chats`
- Teams message send: `POST /v1.0/chats/{chat-id}/messages`

## Permission Constraint

- Official Graph docs allow `Mail.Send` with application permissions.
- Official Graph docs allow `Chat.Create` with application permissions.
- Official Graph docs show chat message send as delegated-first and application support only via `Teamwork.Migrate.All`.
- Therefore this phase must treat Teams message send as probe-and-report instead of assuming success.

## Runtime Shape

1. Operator opens the web console.
2. Operator enters a target user principal name, defaulting to `bkkim@hanatour.com` for live smoke.
3. Service resolves the Graph user.
4. Operator can:
   - send an Outlook message
   - create/find a Teams one-on-one chat
   - attempt a Teams message send
5. The service records the result, including any explicit permission blocker.
