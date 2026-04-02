# Repository Architecture

## 1. Purpose
이 문서는 저장소의 최상위 구조와 폴더별 책임을 정의한다.
세부 구현 규칙은 각 하위 문서에서 다룬다.

## 2. Top-Level Structure
- `harness/`: 저장소 공통 하네스
- `<app>/`: 앱별 작업 공간 (앱 하나당 폴더 하나)
- `AGENTS.md`, `CLAUDE.md`: 에이전트 진입점

## 3. Harness Core
`harness/core/`는 모든 앱이 공유하는 규칙을 둔다.

- `docs/`: 공통 원칙 문서
- `roles/`: 역할 정의
- `workflows/`: pipeline, operating loop, handoff, rollback, checkpoint 흐름
- `platforms/`: Cursor, Claude Code 같은 플랫폼 가이드
- `templates/`: 반복 문서 템플릿
- `schemas/`: 추후 machine-readable schema 자리

`harness/scripts/`는 저장소 공통 검사와 자동화 스크립트를 둔다.
`harness/runtime/`는 cleanup snapshot 같은 runtime artifact를 둔다.

## 4. Application Space
각 앱은 독립적인 폴더 아래에 둔다.

앱 폴더의 권장 구조:
- 진입점 문서 (AGENTS.md 또는 index.md): 앱 개요와 읽기 순서
- 아키텍처 문서: 앱 시스템 구조
- 설계 문서: 설계 철학, 역할, 핵심 결정
- 행동/스펙 문서: 동작 규칙, 기능 명세
- 연동 문서: 외부 시스템 연동 정의
- 도메인 지식: 매뉴얼, 과거 사례, 용어집
- 템플릿: 앱 출력물 형식
- 상태 문서: `docs/status/` 아래 `tracker.md`, `ongoing/`, `completed/`
- 계획 문서: 로드맵, phase 상태, tracker

## 5. Boundary Rule
- repository-level 문서는 공통 규칙만 다룬다.
- app-level 문서는 도메인과 기능 세부사항을 다룬다.
- 코드와 테스트는 앱 폴더 안에 둔다.
- 공통화할 가치가 확인되기 전에는 app-level에 둔다.

## 6. Growth Rule
- 새 앱은 독립 폴더에 동일한 하네스 구조를 따라 시작한다.
- 공통으로 반복되는 규칙만 `harness/core/`로 올린다.
- 구조가 커져도 최상위 폴더 수는 적게 유지한다.
