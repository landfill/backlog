# common-employee Graph messaging

## Goal
- Add Microsoft Graph-based Outlook send and Teams chat primitives to the verified Jira + Confluence single-operator service.

## Primary Output
- A verified Graph integration path that can send Outlook mail, resolve a target user, create/find a Teams 1:1 chat, and explicitly surface Teams message-send permission blockers.

## In Scope
- Graph token acquisition
- target user lookup for `bkkim@hanatour.com`
- Outlook mail send
- Teams one-on-one chat create/find
- capability-gated Teams message send
- web-console manual controls
- tests and doc/status alignment

## Out of Scope
- inbound mail/chat polling
- automated runtime notifications
- Teams channel posts
- delegated-user auth

## Done When
- Outlook live send succeeds to `bkkim@hanatour.com`.
- Teams user lookup and chat-create probe succeed or return a documented blocker.
- Tests cover Graph client and manual web-console flows.
- Docs reflect the implemented capability and the Teams permission constraint.

## Verification Plan
- `python3 -W default -m unittest common-employee/tests/test_runtime_service.py -v`
- diagnostics on changed files in `common-employee`
- live Outlook/Teams Graph smoke using `bkkim@hanatour.com`

## Inputs
- `MS_TENANT_ID`
- `MS_CLIENT_ID`
- `MS_CLIENT_SECRET`
- current Jira + Confluence-enabled runtime baseline

## Expected Output
- Graph client code, web-console controls, updated docs, and current phase status artifacts

## Risk Notes
- Teams message send may be blocked under the current application permission model even if token acquisition succeeds.
