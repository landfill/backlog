# 레포/앱 하니스 경계 명확화

## Goal
- repository-level harness와 app-level harness 사이의 구조 해석 공백을 줄이는 문서 정렬을 완료한다.

## Primary Output
- `common-employee` 문서 세트의 경계/책임/디렉터리 규칙 정렬

## In Scope
- tracker 편집 책임 고정
- 프로젝트 계획 문서 위치 고정
- `exec-plans/`, `references/`의 공식 목적 명시
- Guardian의 gate review report 책임 명시
- 상태 문서 갱신

## Out of Scope
- 신규 기능 설계 추가
- backlog 문서(`decision-tree.md`, `feedback-loop.md`) 작성
- 외부 연동 동작 변경

## Done When
- 관련 문서가 같은 책임 분리를 가리킨다.
- `exec-plans/`와 `references/`의 용도가 진입 문서와 보조 문서에 모두 드러난다.
- gate review report와 tracker 갱신 책임이 모순 없이 읽힌다.

## Verification Plan
- 관련 문서에서 `tracker`, `exec-plans`, `references`, `review report` 서술을 교차 확인한다.
- 실제 디렉터리와 문서 설명이 맞는지 `rg`로 점검한다.

## Inputs
- 기존 리뷰에서 확인한 구조 모호점
- repository/app harness 운영 규칙 문서

## Expected Output
- app-level harness 구조를 바로 따라갈 수 있는 정렬된 문서 세트

## Risk Notes
- none
