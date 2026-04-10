# common-employee Graph messaging

## Goal
- Extend the verified Jira + Confluence-backed service with Microsoft Graph messaging primitives.

## Scope
- Design, implementation, verification, and handoff for Outlook send and Teams chat/message capability probing.

## Current Owner
- Lead

## Current Step
- Archive the verified Graph messaging phase artifacts.

## Current State
- Graph client, manual Outlook/Teams web controls, token refresh, and explicit Teams blocker handling are implemented and verified. Outlook live send succeeds; Teams remains permission-blocked with explicit evidence.

## Operating State
- checkpoint_ref: 37694e99f1a9c306556d56082067c52f7188de64
- cleanup_status: CLEAN

## Verification
- verdict: APPROVED
- attempts: 1

## Verification Evidence
- Official Microsoft docs reviewed for token acquisition, chat creation, chat message send, and mail send permission constraints.
- `python3 -W default -m unittest common-employee/tests/test_runtime_service.py -v` → 16 tests passed.
- Diagnostics on `common-employee` returned 0 errors / 0 warnings.
- Live Graph user lookup succeeded for `bkkim@hanatour.com`.
- Live Outlook send succeeded to `bkkim@hanatour.com` with sender/recipient modeled separately.
- Live Teams chat/message probe returned `403 Forbidden`; Graph response required `Chat.Create` or `Teamwork.Migrate.All`.

## Failure Record
- root_cause: tenant Graph app roles do not currently include Teams chat creation permission
- rollback_point: 37694e99f1a9c306556d56082067c52f7188de64

## Next Owner
- Lead

## Next Step
- Treat Outlook live integration as verified and revisit Teams delivery after the tenant app gains the required chat roles.

## Issues
- one ResourceWarning remains in the legacy blocked-artifact web test because the raised `HTTPError` object is not explicitly closed in that path
