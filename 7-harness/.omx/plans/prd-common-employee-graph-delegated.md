# PRD: common-employee Graph delegated

## Goal
Switch `common-employee` Graph integration from app-only probing to an operator-driven delegated model so Outlook and Teams actions run within the logged-in operator's actual mailbox and conversation scope.

## Scope
- delegated Graph auth design and implementation planning
- operator login/MFA-aware token acquisition path
- Outlook/Teams delegated session handling
- current app-only Graph path demotion or replacement

## Non-Goals
- Jira/Confluence auth changes
- 24/7 unattended Graph automation
- channel/chat policy redesign beyond current operator-scoped behavior

## Acceptance Criteria
- Delegated Graph model is documented as the new target architecture.
- Current status artifacts and next-session brief point to delegated implementation as the next active phase.
