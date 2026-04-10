# Test Spec: common-employee Jira-backed service

## Verification Targets
1. Jira client authenticates with Cloud-style Basic auth using email + API token.
2. Jira issue fetch parses real REST payload shape into runtime ticket context.
3. Jira search endpoint results can be rendered in the UI.
4. Jira-backed processing can post a comment and perform a transition after a successful runtime run.
5. Existing local runtime/web-console tests remain green.
6. Sensitive values remain redacted from local artifacts and synced comment text.

## Planned Checks
- unit/integration tests with a local fake Jira HTTP server
- `python3 -m unittest common-employee/tests/test_runtime_service.py -v`
- manual smoke for Jira-backed web flow (when credentials are available)
- diagnostics on changed files
