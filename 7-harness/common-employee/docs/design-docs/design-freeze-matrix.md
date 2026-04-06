# 설계 고정 기준 (Design Freeze Matrix)

## 목적

이 문서는 `common-employee` 앱에서
구현 전에 반드시 잠가야 하는 설계와
구현 중 병행 보완 가능한 설계를 구분한다.

목표는 구현 에이전트가 설계 공백을 직접 메우지 않게 하고,
공백 발견 시 어떤 문서를 먼저 보완해야 하는지 명확히 하는 것이다.

## 고정 레벨

| 레벨 | 의미 | 구현 중 행동 |
|---|---|---|
| Blocker | 구현 전에 고정되어야 하는 계약 | 없거나 모호하면 구현을 멈추고 설계 보완을 요청한다 |
| Parallel | 구현과 함께 정제할 수 있는 보강 문서 | Blocker 계약을 바꾸지 않는 범위에서만 보완한다 |
| Deferred | 현재 V1 착수와 무관한 후속 backlog | 구현 범위를 늘리지 말고 backlog로만 남긴다 |

## 권위 문서 규칙

- `AGENTS.md`와 `ARCHITECTURE.md`는 진입점과 개요를 설명하는 요약 문서다.
- 역할, 단계, 분기, 보안, 데이터 흐름, 상태 산출물 계약처럼 실제 구현을 잠그는 기준은 아래 권위 문서를 우선한다.
- 요약 문서와 권위 문서가 충돌하면 권위 문서를 먼저 고치고, 요약 문서를 뒤따라 정렬한다.

## 영역별 기준

| 영역 | 권위 문서 | 요약/보조 문서 | 레벨 | 구현 규칙 |
|---|---|---|---|---|
| 역할 경계와 gate 책임 | `docs/design-docs/agent-roles.md` | `AGENTS.md`, `ARCHITECTURE.md` | Blocker | 역할 이동, 승인 주체 변경, gate 책임 재배치는 구현 중 결정하지 않는다 |
| end-to-end 단계 순서와 예외 흐름 | `docs/product-specs/ticket-lifecycle.md` | `AGENTS.md`, `ARCHITECTURE.md` | Blocker | 단계 생략, handoff 제거, 예외 흐름 추가는 설계 보완 후에만 가능하다 |
| 분기, 확신도, 승인 경로, 액션 위험도 | `docs/product-specs/decision-tree.md` | `docs/agent-behaviors/auto-resolution.md`, `docs/agent-behaviors/ticket-triage.md`, `docs/agent-behaviors/project-management.md` | Blocker | 새 액션, 새 위험도, 새 승인 경로는 구현 중 임의 추가하지 않는다 |
| 데이터 흐름과 신뢰 경계 | `docs/design-docs/data-flow.md` | `ARCHITECTURE.md`, `docs/SECURITY.md`, `docs/status/README.md` | Blocker | 데이터 저장 위치, 요약/마스킹 규칙, LLM 입력 경계는 구현 중 임의 완화하지 않는다 |
| 런타임 상태 저장 위치와 허용 데이터 | `docs/design-docs/data-flow.md`, `docs/SECURITY.md`, `docs/RELIABILITY.md` | `ARCHITECTURE.md` | Blocker | `runtime/autonomous-runtime.db` 같은 상태 저장소는 허용 데이터와 복구 규칙이 문서화되어야 한다 |
| 품질 gate와 완료 판정 | `docs/product-specs/quality-criteria.md` | `docs/RELIABILITY.md`, `harness/core/templates/` | Blocker | pass/fail 기준이나 required evidence는 구현 편의로 낮추지 않는다 |
| 보안 정책 | `docs/SECURITY.md` | `docs/integrations/auth-strategy.md`, `docs/design-docs/data-flow.md` | Blocker | 시크릿, 민감 원문, 권한 범위는 구현 중 예외를 만들지 않는다 |
| 신뢰성, rollback, cleanup | `docs/RELIABILITY.md` | `harness/core/workflows/*.md`, `docs/status/README.md` | Blocker | 추적 불가 write, 숨겨진 재시도, 상태 문서 생략은 허용하지 않는다 |
| 상태 산출물 위치와 ownership | `docs/status/README.md` | `AGENTS.md`, `docs/status/tracker.md` | Blocker | `task brief`, `ongoing plan`, `review report` 없는 구현 착수는 허용하지 않는다 |
| 시스템 개요와 구성도 | `ARCHITECTURE.md` | `AGENTS.md` | Parallel | 컴포넌트 설명은 구현 중 정밀화할 수 있지만 Blocker 문서와 모순되면 안 된다 |
| 진입점, 읽기 순서, 요약 안내 | `AGENTS.md` | `docs/PLANS.md` | Parallel | 요약과 읽기 순서는 정리 가능하지만 권위 문서보다 앞서 판단 기준을 바꾸지 않는다 |
| 학습/문서 보강 연결 | `docs/product-specs/feedback-loop.md` | `docs/design-docs/knowledge-pipeline.md`, `docs/agent-behaviors/reporting.md` | Parallel | 학습 루프의 세부 자동화나 지표는 보강할 수 있지만 backlog 연결과 Lead 우선순위 책임은 유지한다 |
| 지식 정제 파이프라인 상세 | `docs/design-docs/knowledge-pipeline.md` | `docs/domain-knowledge/*` | Parallel | 운영 중 실제 학습 패턴에 맞게 깊게 보강할 수 있다 |
| 보고/커뮤니케이션 세부 표현 | `docs/agent-behaviors/reporting.md`, `docs/agent-behaviors/communication.md`, `docs/templates/` | `AGENTS.md` | Parallel | 템플릿과 표현은 다듬을 수 있지만 승인 경로와 보안 규칙은 그대로 유지한다 |
| 에이전트 페르소나와 톤 | `docs/design-docs/agent-persona.md` | `docs/agent-behaviors/communication.md` | Deferred | 현재 V1 착수 차단 문서는 아니며 후속 backlog로 관리한다 |

## 구현 에이전트 행동 규칙

### 1. Blocker 공백을 발견한 경우

- 구현으로 메우지 않는다
- `tracker`와 `ongoing plan`에 공백 위치와 이유를 남긴다
- `BLOCKED` 또는 새 설계 task brief로 넘긴다

### 2. Parallel 공백을 발견한 경우

- Blocker 계약을 바꾸지 않는 최소 구현만 진행한다
- 남은 정리 항목은 follow-up이나 backlog로 기록한다

### 3. Deferred 항목이 필요해 보이는 경우

- 현재 범위를 키우지 않는다
- 후속 backlog로만 남긴다

### 4. 새 액션이나 새 외부 경로가 필요한 경우

아래 중 하나라도 필요하면 구현 전에 설계를 먼저 갱신한다.

- `decision-tree.md`에 없는 액션
- `data-flow.md`에 없는 저장/공유 경로
- `SECURITY.md`나 `RELIABILITY.md`가 정의하지 않은 예외 처리

## 현재 V1 착수 기준

구현 시작 전 최소한 아래가 모두 충족되어야 한다.

- 모든 Blocker 문서가 존재한다
- Blocker 문서에 `예정` 상태가 남아 있지 않다
- `pre-kickoff-checklist.md`가 READY 판정을 유지한다
- 남은 예정 문서는 `Parallel` 또는 `Deferred`로 설명 가능하다

## 현재 후속 backlog

- `docs/design-docs/agent-persona.md` — Deferred
