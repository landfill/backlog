# repository-level 역할 매핑 명시

## Goal
- repository-level 추상 역할과 `common-employee` 앱 역할의 대응을 명시해 승인 구조 해석을 고정한다.

## Scope
- `AGENTS.md`
- `ARCHITECTURE.md`
- `docs/design-docs/agent-roles.md`
- 상태 문서 갱신

## Current Owner
- PM

## Current Step
- 완료 기록 정리와 다음 backlog 연결

## Current State
- `PM`과 `Lead`의 관계를 포함한 repository-level 역할 대응을 앱 문서에 명시했다.

## Operating State
- checkpoint_ref: none
- cleanup_status: CLEAN

## Verification
- verdict: APPROVED
- attempts: 1

## Verification Evidence
- `harness/core/roles/pm.md` 확인
- `harness/core/workflows/pipeline.md` 확인
- `common-employee/AGENTS.md` 확인
- `common-employee/ARCHITECTURE.md` 확인
- `common-employee/docs/design-docs/agent-roles.md` 확인
- `AGENTS.md`에 repository-level 역할 매핑 선언 추가
- `ARCHITECTURE.md`에 app-level 역할 구체화 문장 추가
- `docs/design-docs/agent-roles.md`에 repository-level 대응 표 추가
- 문서 진단 오류 없음

## Failure Record
- root_cause: none
- rollback_point: none

## Next Owner
- PM

## Next Step
- `docs/product-specs/decision-tree.md`와 `docs/product-specs/feedback-loop.md` 중 다음 backlog 우선순위를 정한다.

## Issues
- 남은 backlog: `docs/product-specs/decision-tree.md`, `docs/product-specs/feedback-loop.md`, `docs/design-docs/agent-persona.md`, `docs/design-docs/data-flow.md`
