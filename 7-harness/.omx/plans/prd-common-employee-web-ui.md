# PRD: common-employee Web UI Console

## Goal
Deliver a local web console for `common-employee` that lets an operator submit a mock/manual intake payload, inspect recent runtime runs, review gate outcomes, and open generated artifacts without leaving the browser.

## Why
The current runtime foundation is CLI-only. A browser surface makes the documented runtime workflow inspectable and operable while preserving the existing security/reliability contracts.

## Users
- Lead / Coordinator: submit and inspect intake runs
- Guardian / Reporter: review gate outcomes and generated artifacts
- Demo / local development users: validate end-to-end runtime behavior

## User Stories
- US-001: As an operator, I want to submit a mock/manual payload from the browser so I can run the autonomous workflow without the CLI.
- US-002: As a reviewer, I want to see recent runs and terminal state summaries so I can understand system status quickly.
- US-003: As a reviewer, I want to inspect one run's gate results, events, and generated artifacts so I can verify the runtime outcome.
- US-004: As a maintainer, I want the web UI to preserve current redaction and artifact rules so the browser surface does not weaken security.

## In Scope
- Stdlib-only Python web server/UI
- HTML dashboard page with payload form
- Run submission endpoint
- Recent run list
- Run detail page with gate/event summary
- Safe artifact viewer for generated Markdown artifacts
- Automated tests for runtime + web flow
- App docs/status artifact updates for the new surface

## Out of Scope
- Real Jira/Confluence/Teams/Outlook live adapters
- Authentication/authorization beyond local developer usage
- Rich SPA frontend or live-refresh dashboard
- Editing existing completed artifacts from the browser

## Acceptance Criteria
- Starting the web server locally exposes a dashboard in the browser.
- A user can submit a valid payload JSON and trigger `AutonomousRuntimeService.process_ticket`.
- The dashboard lists recent runs with ticket key, state, stage, attempts, and updated time.
- A run detail page shows classification, confidence, gate results, and recorded events.
- Generated artifacts can be opened from the browser only through safe in-workspace paths.
- Sensitive data is still redacted in rendered artifacts/results.
- Existing CLI/runtime tests stay green and new web UI tests pass.
