# common-employee Graph delegated

## Goal
- Rework Outlook and Teams integration around delegated Graph permissions so the operator only touches resources they can actually access.

## Primary Output
- A delegated Graph design/implementation path aligned with the app-level operator persona.

## In Scope
- delegated auth redesign
- operator-attended login/MFA flow
- Outlook/Teams scope restriction through delegated permissions
- status/doc alignment

## Out of Scope
- Jira/Confluence auth changes
- unattended 24/7 Graph automation

## Done When
- The delegated Graph path is documented, tracked, and either implemented or explicitly closed as blocked.

## Verification Plan
- delegated design review
- future delegated Graph tests and live smoke

## Inputs
- current delegated Graph permission set
- current app harness and persona constraints

## Expected Output
- delegated Graph phase artifacts and implementation entry point

## Risk Notes
- MFA/user-attended login changes the runtime operating model and must stay explicit.
