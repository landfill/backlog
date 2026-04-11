# common-employee M365 manual delivery realignment

## Goal
- Rewrite active `common-employee` docs to the manual SMTP + Teams webhook baseline.

## Scope
- Rewrite active `common-employee` docs to the manual SMTP + Teams webhook baseline.

## Current Owner
- Lead

## Current Step
- close the docs-only realignment slice and hand off code alignment

## Current State
- completed for docs

## Operating State
- checkpoint_ref: 37694e99f1a9c306556d56082067c52f7188de64
- cleanup_status: CLEAN

## Verification
- verdict: APPROVED
- attempts: 1

## Verification Evidence
- active docs patched to remove Graph baseline assumptions
- Outlook docs now define operator-triggered SMTP send only
- Teams docs now define fixed webhook self-alerting only
- Outlook write ownership/evidence boundary is aligned across reliability/lifecycle/spec docs
- ambiguous classification timeout no longer falls back to best-guess routing in active behavior docs

## Failure Record
- root_cause: none
- rollback_point: none

## Next Owner
- Lead

## Next Step
- align code/config surfaces to the documented SMTP + webhook model

## Issues
- Historical Graph artifacts remain searchable and may still appear in grep results.
