# Repository Agent Guide

## Purpose
이 문서는 에이전트가 이 저장소에서 작업을 시작할 때 읽는 루트 진입점이다.

## Read Order
1. `harness/core/docs/index.md`
2. `harness/core/docs/index.md`의 `Rule Read Order` 6문서
3. `harness/core/workflows/pipeline.md`
4. `harness/core/workflows/operating-loop.md`
5. 이번 작업에 필요한 `harness/core/roles/` 문서
6. 작업할 앱의 진입점 문서 (AGENTS.md 또는 index.md)
7. 작업할 앱의 plans/tracker 문서

## App Selection
- 사용자가 특정 앱 이름을 명시하면, 에이전트는 이를 현재 작업 대상 앱으로 해석한다.
- 앱 이름이 명시되지 않으면 기본 앱으로 추정하지 않고, 작업 대상 앱을 먼저 확인한다.

## App Dispatch
- 이 경우 repository-level harness를 적용한 뒤, 대상 앱의 `AGENTS.md` 또는 진입점 문서, `docs/PLANS.md`, `docs/status/tracker.md`와 현재 상태 문서를 순서대로 확인한다.
- 하위 앱 하니스는 repository-level harness를 대체하지 않으며, 항상 그 위에 적용한다.

## Working Rule
- repository-level 규칙은 `harness/core/`를 따른다.
- app-level 규칙은 해당 앱의 harness 문서를 따른다.
- 읽기 순서는 건너뛰지 않는다.
- 작업 시작 전 task brief, tracker, ongoing plan의 현재 상태를 확인한다.
- 상태 변경이 있으면 tracker와 ongoing plan을 갱신한다.
- handoff 전에는 cleanup 상태를 확인한다.
- handoff에는 review report와 검증 근거를 남긴다.
- risky cleanup이나 큰 변경 전에는 git checkpoint를 먼저 만들고 `checkpoint_ref`를 남긴다.

## App Entry Example
- `common-employee/AGENTS.md`: 앱 에이전트 팀 정의 예시
- `common-employee/ARCHITECTURE.md`: 앱 시스템 아키텍처 예시
- `common-employee/docs/PLANS.md`: 앱 phase 상태 예시
