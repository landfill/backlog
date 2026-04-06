# Autonomous Runtime Foundation Design

## Goal

`common-employee`를 문서 중심 운영 정의에서 벗어나,
Lead 중심 런타임이 Jira intake를 받아 상태 전이, gate, handoff, 산출물 동기화를 직접 수행하는 최소 실행 서비스로 전환한다.

## Scope

- Jira intake payload를 시작점으로 한 운영 티켓 런타임
- Lead / Analyst / Executor / Reporter / Guardian 역할 실행 단위
- Gate 1 / 2 / 3 판정과 verdict 계약 강제
- SQLite 상태 저장과 Markdown 산출물 동기화
- retry, repeated root cause, rollback candidate 기록
- mock intake 기반 end-to-end 검증

## Non-Goals

- 대시보드, API 서버, 멀티테넌트 운영 콘솔
- 문서에 없는 새 외부 액션 타입 추가
- self-healing 또는 자율 정책 재작성

## Architecture

### Runtime Service

- 진입점은 mock 또는 실제 Jira payload와 동일한 구조의 intake event다.
- `AutonomousRuntimeService`가 단일 오케스트레이터로 동작한다.
- 역할 분리는 별도 프로세스가 아니라 역할별 실행 함수와 gate 함수로 모델링한다.

### Truth Sources

- 런타임 진실원: `common-employee/runtime/autonomous-runtime.db`
- 사람용 투영 산출물:
  - `common-employee/docs/status/tracker.md`
  - `common-employee/docs/status/ongoing/`
  - `common-employee/docs/status/completed/`
  - `common-employee/docs/generated/decision-logs/`

### State Model

- 핵심 stage:
  - `planned`
  - `gate1`
  - `approval`
  - `gate2`
  - `gate3`
  - `completed`
- terminal state:
  - `completed`
  - `changes_requested`
  - `blocked`
  - `rollback_candidate`

### Policy Enforcement

- Gate 1: 근거, 대안, 리스크, 실행 준비 확인
- Gate 2: 실행 trace와 민감정보 노출 검사
- Gate 3: decision log 생성과 상태 산출물 동기화 검사
- repeated root cause 3회 또는 attempts 5회는 rollback candidate로 승격

## Data Flow

1. intake event 수신
2. Lead 분류 및 계획 고정
3. Analyst 근거 수집 요약
4. Guardian Gate 1 판정
5. Lead 승인 경로 확인
6. Executor 액션 실행
7. Guardian Gate 2 판정
8. Reporter decision log 작성
9. Guardian Gate 3 판정
10. Lead 완료 승인 및 completed artifact 동기화

## Storage Rules

- SQLite에는 ticket key, stage, verdict, attempts, gate 결과 같은 Internal 메타데이터만 저장한다.
- Restricted/Sensitive 원문은 DB와 Markdown 산출물에 저장하지 않는다.
- decision log와 tracker는 redacted evidence만 사용한다.

## Verification

- happy path operational ticket E2E
- Gate 2 민감정보 차단
- repeated root cause rollback candidate
- decision log redaction
- CLI mock intake smoke test
