# common-employee Graph delegated

## Goal
- Move Outlook/Teams integration from app-only probing to delegated operator-scoped behavior.

## Scope
- Design, implementation attempt, verification, and blocker handoff for delegated Graph auth.

## Current Owner
- Lead

## Current Step
- Archive the blocked delegated Graph transition artifacts.

## Current State
- Delegated Graph auth was prototyped with device-code and browser auth-code flows, but repeated live browser callback exchanges failed with `AADSTS70008 invalid_grant`. The usable baseline remains the app-only Graph path from Phase 12.

## Operating State
- checkpoint_ref: 37694e99f1a9c306556d56082067c52f7188de64
- cleanup_status: CLEAN

## Verification
- verdict: BLOCKED
- attempts: 1

## Verification Evidence
- Delegated Graph permission set was documented and evaluated against the operator persona.
- `python3 -W default -m unittest common-employee/tests/test_runtime_service.py -v` remained green during the delegated attempt.
- Live browser callback exchanges repeatedly failed with `AADSTS70008 invalid_grant`.
- Redirect mismatch and pending-browser cache recovery bugs were fixed, but the live tenant flow still did not stabilize.

## Failure Record
- root_cause: tenant/browser delegated auth code exchange did not produce a stable usable session
- rollback_point: 37694e99f1a9c306556d56082067c52f7188de64

## Next Owner
- Lead

## Next Step
- Keep the application-based Graph baseline and revisit delegated auth only after a stable tenant-approved redirect/auth flow is available.

## Issues
- none
