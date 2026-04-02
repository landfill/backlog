# 레포/앱 하니스 경계 명확화 완료 보고

## Verdict
- APPROVED

## Reason
- repository-level harness와 app-level harness 사이에서 해석이 갈리던 책임과 디렉터리 규칙을 공통되게 읽히도록 정렬했다.

## Scope
- `AGENTS.md`
- `ARCHITECTURE.md`
- `docs/design-docs/agent-roles.md`
- `docs/agent-behaviors/project-management.md`
- `docs/product-specs/ticket-lifecycle.md`
- `docs/status/README.md`
- `docs/exec-plans/README.md`
- `docs/references/README.md`
- 상태 문서 갱신

## Checked
- tracker 편집 책임이 Lead/Coordinator로 일관되게 읽히는지
- 프로젝트 계획 문서 위치가 `docs/exec-plans/`로 고정됐는지
- `docs/references/`와 `docs/exec-plans/`가 공식 구조로 드러나는지
- Guardian의 Gate 1/2/3 review report 책임이 명시됐는지

## Passed
- tracker 대표 상태 요약의 편집 책임을 Lead 또는 Coordinator로 고정했다
- 프로젝트성 작업의 계획 문서 위치를 `docs/exec-plans/active/`와 `completed/`로 명시했다
- `docs/references/`와 `docs/exec-plans/`의 목적을 진입 문서와 README에 반영했다
- Guardian의 Gate 1/2/3 review report 작성 책임을 lifecycle과 역할 문서에 반영했다

## Evidence
- `rg -n "Lead 또는 Coordinator만 갱신|Lead 또는 Coordinator가 tracker|docs/exec-plans/|docs/references/|Gate 1 review report|Gate 2 review report|Gate 3 review report" common-employee/...`
- `find common-employee/docs/exec-plans common-employee/docs/references -maxdepth 2 -type f | sort`

## Checkpoint
- ref: none

## Cleanup
- status: CLEAN
- cleaned: tracker 편집권, 프로젝트 계획 문서 위치, 보조 디렉터리 공식성, Guardian gate review report 책임의 해석 공백
- remaining: `docs/product-specs/decision-tree.md`, `docs/product-specs/feedback-loop.md`, `docs/design-docs/agent-persona.md`, `docs/design-docs/data-flow.md`

## Open Risks
- `RELIABILITY.md`, `SECURITY.md` 등 주변 문서에는 이번 책임 정렬을 직접 서술하지 않았으므로, 이후 구조 변경이 커지면 한 번 더 용어 정렬이 필요할 수 있다

## Next Owner
- PM

## Next Step
- `docs/product-specs/decision-tree.md`와 `docs/product-specs/feedback-loop.md` 중 다음 backlog 우선순위를 정한다.
