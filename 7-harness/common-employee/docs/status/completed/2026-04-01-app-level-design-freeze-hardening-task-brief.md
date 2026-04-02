# 앱 레벨 구현 전 설계 잠금 보강

## Goal
- 구현 전에 필요한 데이터 흐름과 설계 고정 기준을 app-level harness 문서에 추가해 구현 에이전트가 Blocker 공백을 직접 메우지 않게 한다.

## Primary Output
- `docs/design-docs/data-flow.md`
- `docs/design-docs/design-freeze-matrix.md`

## In Scope
- 데이터 흐름과 신뢰 경계 설계 문서 추가
- 구현 전 필수 / 병행 보완 / 후속 backlog 구분 문서 추가
- `AGENTS.md`, `docs/PLANS.md`, `docs/pre-kickoff-checklist.md`, `docs/product-specs/v1-scope.md`, `docs/design-docs/index.md` 연결 정리
- `docs/product-specs/ticket-lifecycle.md`, `docs/product-specs/quality-criteria.md`, `docs/product-specs/decision-tree.md`의 기준 연결 보강
- 상태 문서 갱신

## Out of Scope
- repository-level schema 또는 공통 템플릿 변경
- `docs/design-docs/agent-persona.md` 작성
- 코드 구현
- 외부 연동 동작 변경

## Done When
- 구현 전에 잠가야 하는 데이터 흐름과 설계 고정 기준이 문서로 존재한다.
- 구현 에이전트가 Blocker / Parallel / Deferred를 구분할 수 있다.
- readiness 문서와 backlog 문서가 같은 구분을 가리킨다.
- 상태 산출물이 이번 설계 보완 작업을 완료 상태로 남긴다.

## Verification Plan
- 관련 문서에서 `data-flow.md`, `design-freeze-matrix.md`, `Blocker`, `Deferred` 연결을 교차 확인한다.
- `docs/PLANS.md`와 `docs/pre-kickoff-checklist.md`가 같은 readiness 해석을 가리키는지 확인한다.
- `docs/product-specs/v1-scope.md`에서 `data-flow.md`가 후속 범위가 아닌 착수 기준으로 읽히는지 확인한다.

## Inputs
- 앱 레벨 하니스 설계 평가 결과
- 기존 `common-employee` 설계 문서 세트

## Expected Output
- 구현 착수 전에 필요한 설계 공백이 잠긴 app-level harness 문서 세트

## Risk Notes
- `AGENTS.md`와 `ARCHITECTURE.md`가 다시 권위 문서처럼 비대해지지 않도록 요약 문서 역할을 유지한다.
