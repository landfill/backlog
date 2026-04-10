# common-employee M365 manual delivery realignment

## Scope
- Rewrite active `common-employee` docs to the manual SMTP + Teams webhook baseline.

## Current Status
- completed for docs

## Evidence
- active docs patched to remove Graph baseline assumptions
- Outlook docs now define operator-triggered SMTP send only
- Teams docs now define fixed webhook self-alerting only
- Outlook write ownership/evidence boundary is aligned across reliability/lifecycle/spec docs
- ambiguous classification timeout no longer falls back to best-guess routing in active behavior docs

## Risks
- Historical Graph artifacts remain searchable and may still appear in grep results.

## Next Step
- align code/config surfaces to the documented SMTP + webhook model
