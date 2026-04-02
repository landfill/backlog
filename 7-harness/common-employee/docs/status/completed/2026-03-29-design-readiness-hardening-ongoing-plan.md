# common-employee 설계 문서 착수 전 보완

## Goal
- 실제 프로젝트 착수 전에 문서 계약을 보강하고 탐색/검증 기준을 정렬한다.

## Scope
- 앱 레벨 `SECURITY.md`, `RELIABILITY.md`, `product-specs/quality-criteria.md`
- `AGENTS.md`, `ARCHITECTURE.md`, `docs/PLANS.md`, 관련 index 정렬
- 현재 작업 상태 문서화

## Current Owner
- PM

## Current Step
- 완료 기록 정리와 후속 backlog 연결

## Current State
- 앱 레벨 품질, 보안, 신뢰성, V1 범위 문서를 추가했고 핵심 참조 문서를 정렬했다.

## Operating State
- checkpoint_ref: none
- cleanup_status: CLEAN

## Verification
- verdict: APPROVED
- attempts: 1

## Verification Evidence
- `harness/core/docs/index.md` 및 rule read order 문서 확인
- `harness/core/workflows/pipeline.md`, `operating-loop.md`, `rollback-loop.md`, `cleanup.md`, `checkpoints.md` 확인
- `common-employee/AGENTS.md`, `ARCHITECTURE.md`, `docs/PLANS.md`, `docs/status/*` 확인
- `docs/product-specs/v1-scope.md` 추가
- `docs/product-specs/quality-criteria.md` 추가
- `docs/SECURITY.md` 추가
- `docs/RELIABILITY.md` 추가
- `docs/pre-kickoff-checklist.md` 추가
- `AGENTS.md`, `ARCHITECTURE.md`, `docs/product-specs/index.md`, `docs/product-specs/ticket-lifecycle.md`, `docs/PLANS.md` 정렬

## Failure Record
- root_cause: none
- rollback_point: none

## Next Owner
- PM

## Next Step
- `docs/product-specs/decision-tree.md` 또는 `docs/product-specs/feedback-loop.md`의 우선순위를 정하고 다음 task brief를 만든다.

## Issues
- 남은 backlog: `docs/product-specs/decision-tree.md`, `docs/product-specs/feedback-loop.md`, `docs/design-docs/agent-persona.md`, `docs/design-docs/data-flow.md`
