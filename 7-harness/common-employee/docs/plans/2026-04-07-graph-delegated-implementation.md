# Graph Delegated Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rework `common-employee` Graph integration around delegated operator login instead of app-only client credentials.

**Architecture:** Introduce an operator-scoped delegated auth layer for Outlook/Teams, keep Jira/Confluence unchanged, and update the web console plus service wrappers to use operator-scoped Graph sessions.

**Tech Stack:** Python stdlib, existing runtime/web modules, delegated Graph auth flow to be chosen in the next implementation pass

---

### Task 1: Lock the delegated Graph phase in docs/state

**Files:**
- Modify: `common-employee/docs/status/tracker.md`
- Create: `common-employee/docs/status/ongoing/2026-04-07-graph-delegated-task-brief.md`
- Create: `common-employee/docs/status/ongoing/2026-04-07-graph-delegated-ongoing-plan.md`
- Modify: `common-employee/docs/PLANS.md`

### Task 2: Choose delegated auth UX and token persistence model

**Files:**
- Modify: `common-employee/docs/plans/2026-04-07-graph-delegated-design.md`

### Task 3: Implement delegated Graph auth and migrate Outlook/Teams paths

**Files:**
- Modify: `common-employee/src/common_employee_runtime/graph.py`
- Modify: `common-employee/src/common_employee_runtime/service.py`
- Modify: `common-employee/src/common_employee_runtime/web.py`
- Modify: `common-employee/tests/test_runtime_service.py`

### Task 4: Re-verify and archive

**Files:**
- Verify only
