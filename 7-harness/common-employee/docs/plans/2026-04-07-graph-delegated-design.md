# Graph Delegated Design

## Goal

Move Outlook/Teams integration to a delegated Microsoft Graph model that matches the `common-employee` operator persona.

## Chosen Direction

- Treat Graph as an operator-attended subsystem, not an unattended service-account subsystem.
- Keep Jira and Confluence on their current service-account paths.
- Replace app-only Graph assumptions with delegated token acquisition so Outlook/Teams only touch the signed-in operator's accessible resources.

## Why

- The app harness defines a narrow operator persona rather than an all-seeing IT bot.
- Delegated permissions align better with "only the mailboxes, chats, and channels the operator actually participates in."
- The service runs during working hours with operator presence, so MFA is acceptable.

## Risks

- Operator sign-in and MFA UX must be explicit.
- Token persistence and refresh must be handled carefully without widening data scope.
