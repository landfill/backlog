# Test Spec: common-employee Graph delegated

## Verification Targets
1. Delegated Graph sign-in flow can acquire and refresh operator-scoped access.
2. Outlook read/send runs within the signed-in operator mailbox scope.
3. Teams chat/channel reads and sends stay within the signed-in operator participation scope.
4. Existing Jira/Confluence flows remain green.

## Planned Checks
- fake delegated auth tests
- full unittest regression
- diagnostics
- live delegated Graph smoke during operator-attended session
