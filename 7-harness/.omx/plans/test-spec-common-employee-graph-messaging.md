# Test Spec: common-employee Graph messaging

## Verification Targets
1. Graph client credentials flow returns a bearer token.
2. User lookup resolves a user principal name to a user id/display name.
3. Outlook send path posts the expected payload to the target mailbox.
4. Teams one-on-one chat creation or lookup uses the correct Graph payload.
5. Teams message send denial is surfaced as an explicit blocked/unsupported result when app permissions do not allow it.
6. Existing Jira/Confluence/web-console behaviors remain green.

## Planned Checks
- fake Graph HTTP server tests
- `python3 -W default -m unittest common-employee/tests/test_runtime_service.py -v`
- diagnostics on changed files in `common-employee`
- live Outlook send smoke to `bkkim@hanatour.com`
- live Teams user lookup and chat-create probe for `bkkim@hanatour.com`
- live Teams message-send probe only if tenant permissions allow it
