# common-employee M365 manual delivery code alignment

## Scope
- Replace active Graph-based Outlook/Teams implementation paths with SMTP + Teams webhook behavior.

## Current Status
- completed

## Evidence
- app-level design gate approved for code resumption
- PRD/test spec created for this implementation slice
- runtime/web/test Graph paths were replaced with SMTP + Teams webhook behavior
- `python3 -W default -m unittest common-employee/tests/test_runtime_service.py -v` passed with 20 tests
- diagnostics on `common-employee` returned 0 errors / 0 warnings
- architect verification approved the implementation baseline
- existing Confluence client and credentials fetched `https://wiki-hanatour.atlassian.net/wiki/x/DAC53w` and rendered Markdown to `/tmp/common-employee-confluence-DAC53w.md`
- Confluence config now supports `ATLASSIAN_CONFLUENCE_BASE_URL` so Jira와 Wiki 도메인이 달라도 실제 서비스로 동작한다

## Risks
- historical `graph.py` remains in the repo as dead-code residue and may confuse future readers if not clearly treated as legacy
- standalone dashboard smoke sends only create durable evidence when a `ticket_key` is supplied

## Next Step
- branch/commit the implementation changes, and later decide whether to archive or remove legacy `graph.py`
