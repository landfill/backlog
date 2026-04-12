# Tracker

## Current Phase
- phase: phase-15-m365-manual-delivery-smoke
- status: completed

## Current Step
- owner: Lead
- state: manual-delivery smoke surface 구현이 완료됐고, 이제 실제 SMTP/Teams 운영값 smoke는 운영 환경 시크릿이 준비되면 실행할 수 있다.

## Current Work
- title: common-employee M365 manual delivery smoke
- path: docs/status/ongoing/2026-04-12-m365-manual-delivery-smoke-task-brief.md

## Verification
- verdict: APPROVED
- attempts: 1
- evidence: `common_employee_runtime.cli manual-delivery-smoke --workspace <workspace>`가 readiness와 durable evidence를 지원하고, `python3 -m unittest common-employee/tests/test_runtime_service.py -v` 25 tests OK, `py_compile` OK.

## Operating State
- checkpoint_ref: 7009f7e
- cleanup_status: CLEAN

## Next Owner
- owner: Lead

## Next Action
- next: 운영 환경에 `SMTP_*`와 `TEAMS_PROGRESS_WEBHOOK_URL`을 채운 뒤 `common_employee_runtime.cli manual-delivery-smoke --workspace common-employee --send-outlook --outlook-to <recipient> --send-teams`로 실제 smoke를 실행한다.

## Issues
- current `common-employee/.env`에는 live SMTP/Teams smoke에 필요한 운영값이 아직 없다
