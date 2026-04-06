# common-employee web UI delivery

## Goal
- Deliver a verified `common-employee` web UI on top of the current runtime foundation.

## Scope
- Planning/approval, implementation, verification, and handoff for the local web console.

## Current Owner
- Lead

## Current Step
- Finalize the web console delivery and archive the implementation artifacts.

## Current State
- The stdlib web console now submits runtime payloads, renders recent runs, shows run detail, and serves generated artifacts through safe local paths.

## Operating State
- checkpoint_ref: 37694e99f1a9c306556d56082067c52f7188de64
- cleanup_status: CLEAN

## Verification
- verdict: APPROVED
- attempts: 1

## Verification Evidence
- `python3 -m unittest common-employee/tests/test_runtime_service.py -v`
- `PYTHONPATH=common-employee/src python3 -m common_employee_runtime.web --help`
- Manual smoke: GET `/`, POST `/runs` -> `/runs/OPS-401`, GET artifact viewer
- `.omx/plans/prd-common-employee-web-ui.md`
- `.omx/plans/test-spec-common-employee-web-ui.md`

## Failure Record
- root_cause: none
- rollback_point: 37694e99f1a9c306556d56082067c52f7188de64

## Next Owner
- Lead

## Next Step
- Wire the same UI surface to a real Jira adapter when credentials and environment contracts are ready.

## Issues
- none
