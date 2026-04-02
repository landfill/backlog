# 프로젝트 초기화와 액션 매핑 설계 잠금

## Goal
- 앱 구현 전에 프로젝트 티켓 초기화 경로와 실행 액션 위험도/승인 경로를 단일 기준으로 고정한다.

## Primary Output
- `docs/product-specs/decision-tree.md` 정교화

## In Scope
- 프로젝트 티켓 초기화 절차를 의사결정 트리에 반영
- 실행 가능한 액션 전체의 위험도/승인 경로를 단일 기준으로 반영
- `auto-resolution.md`, `project-management.md`와의 연결 정리
- 상태 문서 갱신

## Out of Scope
- 새 외부 시스템 추가
- 코드 구현
- persona/data-flow 문서 작성

## Done When
- 프로젝트 티켓 구현자가 초기화 절차를 새로 조합하지 않아도 된다.
- 액션 위험도/승인 경로를 `decision-tree.md` 한 곳에서 확인할 수 있다.
- 관련 행동 문서가 이 기준을 참조하도록 읽힌다.

## Verification Plan
- `decision-tree.md`, `auto-resolution.md`, `project-management.md`, `ticket-triage.md`의 서술을 교차 확인한다.
- `rg`로 프로젝트 초기화/액션 매핑 관련 문구가 일관되게 읽히는지 점검한다.

## Inputs
- 현재 잔여 모호성 2건
- `docs/product-specs/decision-tree.md`
- `docs/agent-behaviors/auto-resolution.md`
- `docs/agent-behaviors/project-management.md`

## Expected Output
- 구현 전 해석 공백이 줄어든 앱 하니스 문서 세트

## Risk Notes
- 중복 설명이 커지지 않도록 단일 기준과 참조 문장을 구분한다.
