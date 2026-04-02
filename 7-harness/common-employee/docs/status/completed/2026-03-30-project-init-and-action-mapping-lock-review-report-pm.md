# 프로젝트 초기화와 액션 매핑 설계 잠금 완료 보고

## Verdict
- APPROVED

## Reason
- 앱 구현 전에 해석 차이를 만들 수 있던 프로젝트 초기화 경로와 액션 전체 매핑을 app-level harness 문서에 단일 기준으로 고정했다.

## Scope
- `docs/product-specs/decision-tree.md`
- `docs/agent-behaviors/auto-resolution.md`
- `docs/agent-behaviors/project-management.md`
- `docs/agent-behaviors/ticket-triage.md`
- 상태 문서 갱신

## Checked
- 프로젝트 티켓 초기화 절차가 `decision-tree.md`만으로도 재구성 가능한지
- 실행 가능한 액션 전체가 위험도/승인 경로 표에 반영됐는지
- 행동 문서들이 `decision-tree.md`를 단일 기준으로 참조하는지

## Passed
- 프로젝트 경로에 `exec-plan`, 마일스톤, 하위 작업, 보고 주기, tracker/ongoing 시작 순서를 추가했다
- 실행 액션 전체를 시스템/액션/위험도/승인 경로/추가 조건 표로 고정했다
- `auto-resolution.md`, `project-management.md`, `ticket-triage.md`가 단일 기준 참조형으로 정렬됐다

## Evidence
- `rg -n "단일 기준|프로젝트 티켓 초기화|액션별 전체 매핑|decision-tree.md의 프로젝트 경로|세부 액션별 위험도|축소된 프로젝트 관리" common-employee/docs -g '*.md'`
- `sed -n '1,280p' common-employee/docs/product-specs/decision-tree.md`
- `sed -n '1,120p' common-employee/docs/agent-behaviors/auto-resolution.md`

## Checkpoint
- ref: none

## Cleanup
- status: CLEAN
- cleaned: 프로젝트 초기화 경로와 액션 전체 매핑의 app-level harness 해석 공백
- remaining: `docs/design-docs/agent-persona.md`, `docs/design-docs/data-flow.md`

## Open Risks
- `data-flow.md`가 아직 없으므로 상세 필드 단위 데이터 이동과 실패 전파는 후속 설계에서 더 구체화할 수 있다

## Next Owner
- PM

## Next Step
- `docs/design-docs/data-flow.md`와 `docs/design-docs/agent-persona.md` 중 다음 우선순위를 정한다.
