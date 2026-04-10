# Confluence Service Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add Confluence search/read plus configurable manual or immediate page publishing to the Jira-backed single-operator service.

**Architecture:** Introduce a dedicated Confluence REST client, thread publish-mode decisions through the runtime service, and extend the web console with Confluence search/read/manual publish controls. Keep local runtime artifacts authoritative and treat Confluence as a derived external surface.

**Tech Stack:** Python stdlib (`urllib`, `json`, `wsgiref`, `unittest`), existing runtime store/service/web modules

---

### Task 1: Lock the new phase in docs/state

**Files:**
- Modify: `common-employee/docs/status/tracker.md`
- Create: `common-employee/docs/status/ongoing/2026-04-07-confluence-service-task-brief.md`
- Create: `common-employee/docs/status/ongoing/2026-04-07-confluence-service-ongoing-plan.md`
- Modify: `common-employee/docs/PLANS.md`

**Step 1: Write the phase/task docs**

Capture scope, done criteria, verification, and current owner for Confluence live integration.

**Step 2: Run a quick readback**

Run: `sed -n '1,220p' common-employee/docs/status/tracker.md`
Expected: tracker shows `phase-11-confluence-service` in progress.

### Task 2: Add failing Confluence client tests

**Files:**
- Modify: `common-employee/tests/test_runtime_service.py`
- Create: `common-employee/src/common_employee_runtime/confluence.py`

**Step 1: Write failing tests for config, search, fetch, create, and update**

Cover shared auth loading, Confluence REST paths, and versioned update behavior.

**Step 2: Run the targeted tests to verify RED**

Run: `python3 -W default -m unittest common-employee.tests.test_runtime_service.RuntimeServiceTests.test_confluence_config_and_client_flow -v`
Expected: FAIL because `confluence.py` support does not exist yet.

**Step 3: Write minimal implementation**

Add the Confluence config/client module with the smallest REST surface needed by the tests.

**Step 4: Re-run targeted tests**

Run the same command and expect PASS.

### Task 3: Add failing runtime publish-flow tests

**Files:**
- Modify: `common-employee/tests/test_runtime_service.py`
- Modify: `common-employee/src/common_employee_runtime/service.py`

**Step 1: Write failing tests for `manual` vs `immediate` publish mode**

Cover:
- successful run with manual mode does not publish automatically
- successful run with immediate mode publishes
- explicit publish for a completed run creates or updates a page

**Step 2: Run the targeted tests to verify RED**

Run: `python3 -W default -m unittest common-employee.tests.test_runtime_service.RuntimeServiceTests.test_runtime_confluence_publish_modes -v`
Expected: FAIL because the runtime service lacks Confluence publish behavior.

**Step 3: Write minimal runtime implementation**

Thread publish settings into the service, generate a redacted Confluence body from local artifacts, and record publish evidence/events.

**Step 4: Re-run targeted tests**

Run the same command and expect PASS.

### Task 4: Add failing web-console tests

**Files:**
- Modify: `common-employee/tests/test_runtime_service.py`
- Modify: `common-employee/src/common_employee_runtime/web.py`

**Step 1: Write failing tests for Confluence search/read/manual publish UI**

Cover dashboard controls, Confluence page view route, and explicit publish POST route.

**Step 2: Run the targeted tests to verify RED**

Run: `python3 -W default -m unittest common-employee.tests.test_runtime_service.RuntimeServiceTests.test_web_console_confluence_controls -v`
Expected: FAIL because the routes/forms do not exist yet.

**Step 3: Write minimal UI implementation**

Add the new routes and form controls while keeping the web app thin.

**Step 4: Re-run targeted tests**

Run the same command and expect PASS.

### Task 5: Align docs/config samples

**Files:**
- Modify: `common-employee/docs/integrations/confluence.md`
- Modify: `common-employee/docs/integrations/auth-strategy.md`
- Modify: `common-employee/docs/SECURITY.md`
- Modify: `common-employee/docs/RELIABILITY.md`
- Modify: `common-employee/.env.example`

**Step 1: Update docs to match the implemented runtime shape**

Document shared auth, publish modes, and manual-default behavior.

**Step 2: Read back changed docs**

Run: `rg -n "Confluence|PUBLISH_MODE|manual|immediate" common-employee/docs common-employee/.env.example`
Expected: updated docs and env example mention the implemented settings and behavior.

### Task 6: Run regression verification

**Files:**
- Verify only

**Step 1: Run the full unittest suite**

Run: `python3 -W default -m unittest common-employee/tests/test_runtime_service.py -v`
Expected: PASS

**Step 2: Run diagnostics**

Run: diagnostics on `common-employee`
Expected: 0 errors / 0 warnings

**Step 3: Record handoff evidence**

Update ongoing/review artifacts with verification results and open risks.
