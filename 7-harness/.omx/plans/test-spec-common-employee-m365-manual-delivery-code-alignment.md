# Test Spec: common-employee M365 manual delivery code alignment

## Verification Targets
1. SMTP config can load from workspace/environment inputs.
2. Outlook runtime path records draft/send-preparation behavior without requiring Graph credentials.
3. Teams runtime path sends webhook payloads without reply-intake behavior.
4. Web console renders SMTP/webhook controls and removes Graph controls.
5. Existing Jira and Confluence runtime flows continue to pass.
6. Sensitive values remain redacted in generated artifacts and status docs.

## Planned Checks
- update tests in `common-employee/tests/test_runtime_service.py` first, watch them fail, then implement
- `python3 -W default -m unittest common-employee/tests/test_runtime_service.py -v`
- diagnostics on changed files in `common-employee`
