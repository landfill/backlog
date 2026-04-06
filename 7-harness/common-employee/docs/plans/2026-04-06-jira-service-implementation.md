# Jira-backed Service Implementation Plan

## Goal

Implement and verify Jira Cloud integration for the single-operator service.

## Tasks

1. Add Jira Cloud REST client and ADF conversion helpers
2. Add Jira-backed processing path to the runtime service
3. Extend the web console with Jira search/load/process routes
4. Add workspace `.env` loading without new dependencies
5. Add fake-Jira automated tests
6. Run live tenant smoke for read/process/comment/transition
7. Align app docs and status artifacts

## Verification

- `python3 -W default -m unittest common-employee/tests/test_runtime_service.py -v`
- diagnostics on `common-employee`
- live tenant read/process smoke
- live tenant comment smoke
- live tenant transition smoke
- live web UI read smoke
