# common-employee web UI delivery

## Goal
- Extend `common-employee` from the current autonomous runtime foundation to a runnable web UI workflow.

## Primary Output
- A web-accessible operator console for manual/mock ticket intake, run tracking, and artifact inspection on top of the existing runtime.

## In Scope
- Preserve the current Python runtime and security/reliability contracts.
- Add a browser UI and HTTP surface for mock/manual intake.
- Add verification for runtime + web UI behavior.
- Update app docs/status artifacts to describe the new surface.

## Out of Scope
- Real Jira/Confluence/Teams/Outlook live integration unless already covered by documented contracts.
- Storing secrets or sensitive raw ticket bodies in new runtime/UI state.
- Rewriting existing gate/role/data-flow contracts.

## Done When
- A local user can start the app, submit a mock/manual ticket from the browser, inspect recent runs, and open generated artifacts.
- Tests and app verification prove the runtime and web UI work together.

## Verification Plan
- Run automated tests for runtime and web UI routes/flows.
- Start the local app and exercise browser flow against a sample ticket payload.
- Confirm affected files have no remaining diagnostics errors.

## Inputs
- Existing `common_employee_runtime` Python package and app-level harness docs.
- User request to deliver `common-employee` including web UI.

## Expected Output
- Updated runtime package with web server/UI support.
- Updated tests and app docs/status artifacts.

## Risk Notes
- Existing docs explicitly excluded UI in the prior foundation scope, so this task re-locks the UI scope with new design and test-spec artifacts.
