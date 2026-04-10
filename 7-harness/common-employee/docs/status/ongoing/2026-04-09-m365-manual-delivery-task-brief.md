# common-employee M365 manual delivery realignment

## Goal
- Align active `common-employee` docs to the new M365 service requirement baseline.

## Primary Output
- Active docs that define Outlook as operator-triggered SMTP send and Teams as one-way webhook self-alerting.

## In Scope
- Outlook docs/specs rewritten for manual recipient entry + manual send action
- Teams docs/specs rewritten for fixed webhook self-alerting only
- removal of mailbox monitoring, Teams response intake, and Graph baseline assumptions from active docs
- tracker and roadmap alignment

## Out of Scope
- runtime/code changes
- historical completed Graph artifacts
- new mailbox monitoring design

## Done When
- Active integration, behavior, security, and status docs no longer require Graph, mailbox monitoring, or bidirectional Teams behavior.

## Verification Plan
- active docs grep for Graph/delegated/DM/mailbox monitoring assumptions
- manual review of tracker and roadmap alignment
