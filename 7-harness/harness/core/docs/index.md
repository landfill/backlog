# Harness Core Index

## 1. Purpose
이 문서는 repository-level harness의 진입점이다.
모든 앱에 공통으로 적용되는 개발 규칙의 읽기 순서를 정의한다.

## 2. Rule Read Order
1. `constitution.md` — 최상위 규칙
2. `core-values.md` — 핵심 가치
3. `governance.md` — 문서 경계와 변경 규칙
4. `repository-architecture.md` — 저장소 구조
5. `repository-security.md` — 공통 보안 기준
6. `repository-reliability.md` — 공통 검증 기준

## 3. Follow-up Read Order
1. `harness/core/workflows/pipeline.md` — 역할 순서와 handoff 순서
2. `harness/core/workflows/operating-loop.md` — 상태 산출물과 운영 계약
3. 이번 작업에 필요한 `harness/core/roles/` 문서
4. 필요한 플랫폼 가이드 (`harness/core/platforms/`)

## 4. Related Paths
- 역할 정의: `harness/core/roles/`
- 워크플로우: `harness/core/workflows/`
- 플랫폼 가이드: `harness/core/platforms/`
- 템플릿: `harness/core/templates/`
- 스키마: `harness/core/schemas/`

## 5. Rule
- 문서가 충돌하면 constitution이 우선한다.
- repository-level 규칙은 모든 앱에 적용된다.
- app-level 규칙은 repository-level보다 느슨할 수 없다.
