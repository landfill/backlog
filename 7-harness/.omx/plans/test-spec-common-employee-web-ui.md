# Test Spec: common-employee Web UI Console

## Verification Targets
1. Existing runtime happy path still passes.
2. Existing gate-2 sensitive-material blocking still passes.
3. Web dashboard renders with payload submission UI.
4. Web POST submission triggers a runtime run and redirects to the run detail page.
5. Run detail page shows gate results and artifact links for the processed ticket.
6. Artifact viewer renders allowed generated files and blocks traversal/out-of-scope paths.
7. Affected files have no remaining diagnostics issues where tooling supports checks.

## Planned Checks
- `python3 -m unittest common-employee/tests/test_runtime_service.py -v`
- Web UI integration test using a local ephemeral server and stdlib HTTP client
- Manual smoke run: start web server, open dashboard, submit example payload, inspect run/artifact pages
- Diagnostics on changed Python files / package directory

## Pass Criteria
- All unittest cases pass.
- Web test proves submit -> redirect -> detail -> artifact flow.
- Manual smoke confirms the browser flow works end-to-end.
- No unresolved diagnostics remain in affected files.
