# Context Snapshot

## task statement
- Replace the existing Graph-based `common-employee` runtime/web/test surfaces with the current design baseline: operator-triggered SMTP send and one-way Teams webhook self-alerting.

## desired outcome
- Runtime code, web console, and tests align with the active app-level docs and no longer depend on Graph-based Outlook/Teams flows.

## known facts/evidence
- Active docs now define Outlook as operator-triggered SMTP send and Teams as fixed webhook self-alerting.
- Existing code still contains Graph clients and web-console routes for `/graph/mail` and `/graph/teams-message`.
- Existing tests still require `common_employee_runtime.graph` and Graph fake-server behavior.
- Confluence/Jira paths remain in scope and should continue working.

## constraints
- No new dependencies.
- Preserve existing Jira/Confluence behavior.
- Follow blocker docs as the implementation authority.
- Update tests first and watch them fail before implementing replacement code.

## unknowns/open questions
- Exact minimal replacement API shape for SMTP preparation/send and Teams webhook send.
- Whether to keep `graph.py` temporarily as dead code or remove it in this pass.
- Which web-console UX is simplest while matching operator-triggered send semantics.

## likely codebase touchpoints
- `common-employee/src/common_employee_runtime/service.py`
- `common-employee/src/common_employee_runtime/web.py`
- `common-employee/src/common_employee_runtime/models.py`
- `common-employee/tests/test_runtime_service.py`
- `common-employee/.env.example`
- active app docs under `common-employee/docs/integrations/`, `docs/agent-behaviors/`, `docs/product-specs/`, `docs/status/`
