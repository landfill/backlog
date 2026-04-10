# Graph Messaging Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add Microsoft Graph-backed Outlook send and Teams chat primitives to `common-employee`, with live smoke targeted at `bkkim@hanatour.com`.

**Architecture:** Introduce a stdlib Graph client and expose manual web-console actions for Outlook send and Teams chat/message operations. Outlook is expected to work under app-only auth; Teams message send is capability-gated and must surface permission blockers explicitly if the tenant does not allow it.

**Tech Stack:** Python stdlib (`urllib`, `json`, `wsgiref`, `unittest`), existing runtime/service/web modules

---

### Task 1: Lock the phase in docs/state

**Files:**
- Modify: `common-employee/docs/status/tracker.md`
- Create: `common-employee/docs/status/ongoing/2026-04-07-graph-messaging-task-brief.md`
- Create: `common-employee/docs/status/ongoing/2026-04-07-graph-messaging-ongoing-plan.md`
- Modify: `common-employee/docs/PLANS.md`

### Task 2: Add failing Graph client tests

**Files:**
- Create: `common-employee/src/common_employee_runtime/graph.py`
- Modify: `common-employee/tests/test_runtime_service.py`

**Step 1:** Write failing tests for token acquisition, user lookup, Outlook send, Teams chat create, and blocked Teams send.

**Step 2:** Run the targeted test and verify RED.

**Step 3:** Add the minimal Graph client implementation.

**Step 4:** Re-run the targeted test and verify GREEN.

### Task 3: Add failing manual web-console tests

**Files:**
- Modify: `common-employee/src/common_employee_runtime/service.py`
- Modify: `common-employee/src/common_employee_runtime/web.py`
- Modify: `common-employee/tests/test_runtime_service.py`

**Step 1:** Write failing tests for manual Outlook send and Teams chat/message actions in the web console.

**Step 2:** Run the targeted tests to verify RED.

**Step 3:** Implement the thinnest service/web path to pass them.

**Step 4:** Re-run the targeted tests to verify GREEN.

### Task 4: Align docs/config

**Files:**
- Modify: `common-employee/.env.example`
- Modify: `common-employee/docs/integrations/teams.md`
- Modify: `common-employee/docs/integrations/outlook.md`
- Modify: `common-employee/docs/integrations/auth-strategy.md`

### Task 5: Regression and live smoke

**Files:**
- Verify only

**Checks:**
- full unittest suite
- diagnostics
- live Outlook send to `bkkim@hanatour.com`
- live Teams user lookup/chat create probe for `bkkim@hanatour.com`
- live Teams message send probe only if permitted
