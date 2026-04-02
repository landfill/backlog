# common-employee 설계 문서 착수 전 보완

## Goal
- 실제 프로젝트 착수 전에 필요한 설계 계약을 보강해 문서 완성도를 높인다.

## Primary Output
- `common-employee` 앱의 보안, 신뢰성, 품질 기준과 문서 탐색/정합성 보강

## In Scope
- 앱 레벨 `SECURITY.md`, `RELIABILITY.md`, `product-specs/quality-criteria.md` 작성
- 설계 문서의 단일 기준과 탐색 경로 정리
- 상태 산출물과 backlog 상태 갱신

## Out of Scope
- 코드 구현
- 외부 시스템 연동 실제 개발
- 미정 기술의 세부 구현 가이드 작성

## Done When
- 앱 레벨 보안/신뢰성/품질 기준 문서가 존재하고 상호 참조된다.
- `AGENTS.md`, `ARCHITECTURE.md`, `PLANS.md`, index 문서의 참조가 실제 문서 상태와 맞는다.
- 현재 작업 상태가 `docs/status/`에 기록된다.

## Verification Plan
- 새 문서와 기존 문서의 용어, 역할, gate 명칭, 상태 산출물 명칭이 일치하는지 점검한다.
- 탐색 경로에 존재하지 않는 문서가 남지 않았는지 확인한다.
- backlog/완료 상태가 실제 파일 상태와 맞는지 확인한다.

## Inputs
- `harness/core/docs/`
- `harness/core/workflows/`
- `common-employee/AGENTS.md`
- `common-employee/ARCHITECTURE.md`
- `common-employee/docs/PLANS.md`

## Expected Output
- 착수 전 기준 문서 세트가 하나의 일관된 구조로 정렬된다.

## Risk Notes
- 앱 레벨 설계를 너무 구현 지향적으로 고정하면 추후 변경 비용이 커질 수 있다.
