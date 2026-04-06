# common-employee Jira-backed service

## Goal
- Extend the local operator surface into a Jira-backed single-operator service.

## Scope
- Jira integration design, implementation, verification, and handoff.

## Current Owner
- Lead

## Current Step
- Archive the verified Jira Cloud-backed service delivery artifacts.

## Current State
- Jira Cloud client, Jira-backed runtime path, web search/load/process UI, `.env` support, automated tests, and live tenant smoke are complete.

## Operating State
- checkpoint_ref: 37694e99f1a9c306556d56082067c52f7188de64
- cleanup_status: CLEAN

## Verification
- verdict: APPROVED
- attempts: 1

## Verification Evidence
- `python3 -W default -m unittest common-employee/tests/test_runtime_service.py -v` → 9 tests passed.
- `lsp_diagnostics_directory` on `common-employee` → 0 errors / 0 warnings.
- Live Jira Cloud read/process smoke passed on `ITPT-36400` without external write sync.
- Live Jira Cloud comment smoke passed on `PDEV-404` (`TEST` label) with comment id `759384`.
- Live Jira Cloud transition smoke passed on `ITPT-36246` using same-state transition `대기`.
- Live web UI smoke passed for dashboard Jira search and `/jira/issues/PDEV-404`.
- Architect review approved the Jira Cloud-backed shape.

## Failure Record
- root_cause: none
- rollback_point: 37694e99f1a9c306556d56082067c52f7188de64

## Next Owner
- Lead

## Next Step
- Treat the Jira-backed path as the active single-operator service baseline and only expand to more integrations/auth models as follow-up work.

## Issues
- none
