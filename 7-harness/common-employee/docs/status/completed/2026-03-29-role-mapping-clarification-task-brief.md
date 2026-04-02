# repository-level 역할 매핑 명시

## Goal
- repository-level harness의 추상 역할과 `common-employee` 앱의 구체 역할 매핑을 문서에 명시한다.

## Primary Output
- `PM`, `Lead`를 포함한 공통 역할과 앱 역할의 대응 관계 명시

## In Scope
- `AGENTS.md`, `ARCHITECTURE.md`, `docs/design-docs/agent-roles.md`에 역할 매핑 추가
- 상태 문서 갱신

## Out of Scope
- 역할 체계 자체의 재설계
- Gate 순서 변경
- backlog 우선순위 변경

## Done When
- `PM`과 `Lead`의 관계가 추론이 아니라 문장으로 명시된다.
- repository-level 역할과 app-level 역할의 대응 방식이 최소 한 곳 이상에서 단일 기준으로 선언된다.
- 현재 작업 상태가 `docs/status/`에 기록된다.

## Verification Plan
- 수정 문서들에서 `PM`, `Lead`, `Guardian`의 책임이 상호 모순 없이 읽히는지 확인한다.
- tracker와 completed 기록이 이번 작업 상태를 반영하는지 확인한다.

## Inputs
- `harness/core/roles/pm.md`
- `harness/core/workflows/pipeline.md`
- `common-employee/AGENTS.md`
- `common-employee/ARCHITECTURE.md`
- `common-employee/docs/design-docs/agent-roles.md`

## Expected Output
- 승인 구조와 역할 대응이 명시된 앱 레벨 하니스 문서

## Risk Notes
- 역할 매핑을 과도하게 단순화하면 app-level 역할 세분화 의도가 가려질 수 있다.
