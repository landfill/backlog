# Next Session Brief

## Current Status
- `common-employee` is now a verified Jira + Confluence + Outlook Cloud-backed single-operator service.
- Teams live delivery is not yet enabled because tenant Graph app roles do not currently include `Chat.Create`.
- Local `.env` loading is supported through `common-employee/.env`.
- Final tracker state is `completed` for Phase 12.

## What Was Verified
- 16 automated tests pass.
- Diagnostics are clean.
- Live Jira Cloud read/process/comment/transition smoke passed.
- Live Confluence page read smoke passed on `page_id=1678770306` (`BK Todo`).
- Live Confluence page create/update smoke passed on test page `3736174653` with version `1 → 2`.
- Live Graph user lookup passed for `bkkim@hanatour.com`.
- Live Outlook send passed for `bkkim@hanatour.com`.
- Live Teams chat/message probe returned `403 Forbidden` with explicit missing role requirement: `Chat.Create` or `Teamwork.Migrate.All`.
- Live web UI smoke passed.

## Safe Restart Commands
```bash
cd /Users/h0977/dev/backlog/7-harness
PYTHONPATH=common-employee/src python3 -m common_employee_runtime.web --workspace common-employee --port 8000
```

## Config Location
- `common-employee/.env`
- template: `common-employee/.env.example`

## If Work Resumes Tomorrow
Read in this order:
1. `common-employee/docs/status/tracker.md`
2. `common-employee/docs/status/completed/2026-04-07-graph-messaging-review-report-lead.md`
3. `common-employee/docs/status/completed/2026-04-07-graph-messaging-ongoing-plan.md`
4. `common-employee/docs/plans/2026-04-07-graph-messaging-design.md`
5. `common-employee/docs/plans/2026-04-07-graph-messaging-implementation.md`

## Recommended Next Follow-ups
- Jira polling/webhook daemonization
- Production deployment hardening for the single-operator service
- Confluence smoke/test page cleanup policy
- Delegated Graph 재시도 전 tenant/browser auth code 안정화 조건 재확인
