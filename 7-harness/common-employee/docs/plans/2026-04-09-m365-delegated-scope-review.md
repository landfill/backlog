# M365 Delegated Scope Review

## Goal

Re-evaluate the blocked delegated Graph attempt and separate:
- what the `common-employee` workflow can realistically do with delegated permissions,
- what is only conditionally viable,
- and what remains a poor fit for delegated execution.

## Basis

- blocked delegated history: `docs/status/completed/2026-04-07-graph-delegated-review-report-lead.md`
- communication workflow: `docs/agent-behaviors/communication.md`
- human-in-the-loop workflow: `docs/agent-behaviors/human-in-the-loop.md`
- lifecycle flow: `docs/product-specs/ticket-lifecycle.md`
- integrations: `docs/integrations/teams.md`, `docs/integrations/outlook.md`

## Conclusion

The blocker history does **not** prove that all M365 scope is unsuitable for delegated permissions.
It proves that the **current delegated auth path** was unstable in the tenant/browser environment.

The M365 feature surface splits into three groups.

## 1. Delegated-friendly scope

These align well with the app persona and with operator-attended working-hours use.

| Scope area | Why delegated fits |
|---|---|
| Outlook send from the operator mailbox | Clearly "act as the signed-in operator" behavior |
| Outlook read from the operator mailbox | Limited to the operator's own mailbox scope |
| Teams 1:1 chat read for chats the operator participates in | Matches the persona boundary |
| Teams 1:1 chat message send as the operator | Natural delegated use case |
| Teams channel list/basic metadata for teams the operator belongs to | Operator-scoped visibility |
| Teams channel message read/write in channels the operator can access | Operator-scoped collaboration workflow |
| Human-in-the-loop message send/receive during staffed hours | Explicitly operator-attended and time-bounded |

## 2. Delegated-possible but conditional

These are feasible under delegated permissions, but only if the auth/session UX is made reliable.

| Scope area | Condition |
|---|---|
| Polling the operator mailbox during business hours | Requires stable delegated token refresh without fragile re-login loops |
| Monitoring Teams replies during staffed hours | Requires reliable delegated session persistence and reconnect behavior |
| Reminder/timeout actions while the operator is present | Still operator-attended, but sensitive to token/session expiry |
| New 1:1 chat creation | Requires the delegated chat create path to be stable in the real tenant |

## 3. Poor fit for delegated

These are either outside the persona boundary or awkward for the current working model.

| Scope area | Why delegated is a poor fit |
|---|---|
| 24/7 unattended Outlook/Teams automation | MFA and operator presence assumptions break down |
| Organization-wide mail/chat read | Exceeds the narrow common-service-planning persona |
| Acting on mailboxes or chats the operator does not personally participate in | Violates the "use only operator-accessible resources" principle |
| Shared cross-team background bot behavior | More naturally a service-account or app/RSC design problem |

## Practical implication

If the team wants the agent to stay narrow and human-supervised, delegated permissions remain a **valid target architecture** for:
- Outlook send/read in the operator mailbox
- Teams read/write in the operator's own chats/channels

What failed was the **current delegated login path**, not the entire delegated scope.

## Recommended next decision

1. Keep the current app-only baseline for production use.
2. Treat delegated support as a separate operator-mode track.
3. Revisit delegated implementation only after the tenant-approved sign-in path is stabilized.
