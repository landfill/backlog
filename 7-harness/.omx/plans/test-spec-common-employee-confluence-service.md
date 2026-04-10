# Test Spec: common-employee Confluence service

## Verification Targets
1. Confluence client authenticates with Atlassian Cloud-style Basic auth using the shared email + API token inputs.
2. Confluence search returns page summaries that the UI can render safely.
3. Confluence page fetch returns page body text and metadata usable for operator review.
4. Runtime processing preserves the existing success path when publish mode is `manual`.
5. Runtime processing publishes automatically when publish mode is `immediate`.
6. Explicit publish can create or update a Confluence page for a completed run.
7. Existing Jira-backed runtime/web-console behaviors remain green.
8. Sensitive values stay redacted in local artifacts and generated Confluence body text.

## Planned Checks
- unit/integration tests with a local fake Atlassian HTTP server for Confluence endpoints
- `python3 -W default -m unittest common-employee/tests/test_runtime_service.py -v`
- diagnostics on changed files in `common-employee`
- manual web-console smoke for search/read/manual publish flow when credentials are available
- optional live Confluence smoke for page create/update on a safe draft page when credentials and target space are available
