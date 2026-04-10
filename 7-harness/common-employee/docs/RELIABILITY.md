# common-employee Reliability

## 목적

이 문서는 `common-employee` 앱이 티켓 처리 중 실패를 숨기지 않고,
작업 상태를 복구 가능하게 유지하기 위한 앱 레벨 신뢰성 기준을 정의한다.

repository-level `harness/core/docs/repository-reliability.md`를
이 앱의 운영 흐름으로 구체화한 문서다.

## 기본 원칙

- 실패는 숨기지 않고 상태 문서에 남긴다.
- 다음 단계는 이전 단계의 산출물만 보고 이어받을 수 있어야 한다.
- 외부 시스템 쓰기는 중복 실행과 모호한 결과를 기본 리스크로 본다.
- 검증 불가능한 자동화는 완료로 보지 않는다.

## 단일 기준 문서

- 처리 순서: `docs/product-specs/ticket-lifecycle.md`
- 품질 판정: `docs/product-specs/quality-criteria.md`
- 상태 산출물 계약: `docs/status/README.md`
- 반복 실패 복구: `harness/core/workflows/rollback-loop.md`
- 체크포인트 / cleanup 규칙: `harness/core/workflows/checkpoints.md`, `harness/core/workflows/cleanup.md`

## V1 신뢰성 목표

| 항목 | 목표 |
|---|---|
| 티켓 수신 후 분류 시작 | 5분 이내 |
| 단순 운영 티켓 처리 목표 | 65분 이내 (사람 개입 없음 기준) |
| Gate 판정 기록 | 각 gate마다 100% |
| task brief + ongoing plan 시작률 | 100% |
| tracker 최신화 누락 | 0건 목표 |
| 추적 불가능한 외부 쓰기 | 0건 |

## 상태 일관성 계약

- 작업 시작 전에 task brief와 ongoing plan을 함께 만든다.
- 단계가 바뀌면 tracker를 바로 갱신한다.
- Gate 1, Gate 2, Gate 3에는 review report를 남긴다.
- 마지막 안전 지점과 cleanup 상태는 ongoing plan 또는 review report에 남긴다.
- 완료 전에는 unresolved item이 남아 있어도 숨기지 않고 next action으로 연결한다.
- 런타임 상태 저장소가 있으면 Markdown 산출물은 그 상태를 다시 만들 수 있는 투영이어야 한다.
- 웹 콘솔이 제출한 intake도 CLI와 동일한 runtime/service 경로를 통과해야 한다.

## 실패 유형

| 유형 | 설명 | 기본 처리 |
|---|---|---|
| Transient Read Failure | 조회 시 일시적 네트워크/서비스 오류 | 제한된 재시도 후 상태 기록 |
| Transient Write Failure | 쓰기 요청 실패가 명확히 확인됨 | 재시도 전 대상 시스템 상태 확인 |
| Ambiguous Write Result | 성공/실패를 확정할 수 없음 | 자동 재시도 금지, 외부 상태 우선 확인 |
| Validation Failure | gate 기준 불충족, 입력 부족, 문서 불일치 | `CHANGES_REQUESTED` |
| Auth / Permission Failure | 인증 만료, 권한 부족, 과권한 의심 | `BLOCKED` |
| Repeated Root Cause | 같은 원인 반복 | rollback loop 진입 |

## 재시도 정책

### 읽기 작업

- 동일 조회는 최대 3회까지 재시도한다.
- 기본 backoff는 짧게 시작해 늘린다.
- 3회 실패 시 `BLOCKED` 또는 후속 시도로 넘기고 evidence를 남긴다.

### 쓰기 작업

- 외부 쓰기는 "중복 실행 시 피해가 없는지"를 먼저 판단한다.
- 성공 여부가 불명확하면 자동 재시도하지 않고 대상 시스템 현재 상태를 확인한다.
- 현재 상태가 이미 목표 상태면 중복 실행 대신 성공으로 기록한다.
- 현재 상태가 불명확하면 사람 확인 또는 Guardian 검토로 넘긴다.

## 외부 쓰기 안전 규칙

- Executor는 쓰기 전에 대상, 의도한 결과, 선행 승인 여부를 기록한다.
- Jira 상태 전환, 댓글 작성, Confluence 페이지 발행, Teams 웹훅 발송은
  모두 실행 결과를 evidence로 남긴다.
- Outlook SMTP는 `초안/발송 준비`와 `운영자 실제 발송`을 별도 단계로 기록한다.
- Outlook 메일이 운영자 액션 대기 상태이면 외부 쓰기 완료로 간주하지 않는다.
- 운영자 수동 발송 결과를 즉시 관측할 수 없으면 `prepared` 상태와 후속 확인 필요성을 evidence에 남긴다.
- 동일 메시지/댓글을 재발송할 때는 기존 발송 여부를 먼저 확인한다.
- 여러 시스템에 걸친 연쇄 쓰기는 부분 성공 가능성을 기본 가정으로 다룬다.
- Confluence 페이지 업데이트는 현재 page id/version을 확인한 뒤에만 수행한다.
- `manual` publish mode를 기본값으로 두고, `immediate`는 명시 설정일 때만 수행한다.

## 체크포인트와 복구

- risky cleanup이나 큰 구조 변경 전에는 `checkpoint_ref`를 남긴다.
- 안정 상태에 도달했으면 마지막 안전 지점을 갱신한다.
- 중단 후 복구는 `tracker.md`, ongoing plan, 마지막 review report 순으로 상태를 복원한다.
- 런타임 DB가 있으면 먼저 DB 상태를 읽고, Markdown 산출물은 동기화 검증에 사용한다.
- 반복 실패 조건이 충족되면 즉시 rollback loop로 전환한다.
- 웹 콘솔 장애 시에도 authoritative state는 DB와 Markdown 산출물에 남아 있어야 하며, UI는 재기동 후 같은 상태를 다시 읽을 수 있어야 한다.

## Gate별 신뢰성 확인 포인트

| Gate | 확인 포인트 |
|---|---|
| Gate 1 | 근거가 충분해 다음 단계가 재탐색 없이 실행 가능해야 한다 |
| Gate 2 | 실행 결과가 추적 가능하고, 실패 시 어디까지 반영됐는지 설명 가능해야 한다 |
| Gate 3 | 로그와 보고만 보고도 상태 복기가 가능해야 한다 |

## 웹 콘솔 확인 포인트

- 폼 제출이 runtime service의 단일 진입점으로 연결돼야 한다.
- 최근 run 목록과 run detail은 DB/current artifacts와 모순되지 않아야 한다.
- artifact viewer는 허용 경로만 열고, 잘못된 경로는 차단 응답을 반환해야 한다.
- Jira issue fetch/search/process도 동일한 runtime service 계약을 재사용해야 한다.
- Jira transition은 실행 직전 조회한 available transition 목록 기준으로만 수행해야 한다.
- Confluence 발행은 runtime 성공 이후에만 실행해야 한다.
- `manual` mode에서는 publish-ready evidence만 남기고, 실제 발행은 명시적 버튼 액션으로 수행해야 한다.
- Confluence update는 page id/version이 주어졌을 때만 update 경로로 들어가야 한다.

## 차단 조건

아래 중 하나라도 발생하면 자동 진행을 멈추고 `BLOCKED`로 둔다.

- task brief, ongoing plan, review report 중 필수 산출물이 없는 상태
- 외부 쓰기 결과를 확인할 수 없는 상태
- 인증 문제 또는 rate limit 때문에 목표 시간 내 진행 가능성이 사라진 상태
- 같은 `root_cause`가 3회 반복된 상태
- 현재 cleanup 상태가 `BLOCKED`인 상태

## 복구 절차

### 외부 시스템 장애

1. 실패 시각과 대상 시스템을 기록한다.
2. read/write 여부를 구분한다.
3. 자동 재시도 가능 여부를 판단한다.
4. 재시도 불가이면 `BLOCKED`로 넘기고 next action을 한 줄로 남긴다.

### 실행 중단

1. 마지막 성공 단계와 마지막 안전 지점을 확인한다.
2. 부분 성공 여부를 확인한다.
3. 필요한 경우 cleanup 상태를 갱신한다.
4. 더 작은 범위로 task brief를 다시 정의한다.

### 문서-상태 불일치

1. tracker와 ongoing plan 중 무엇이 최신이어야 하는지 판단한다.
2. 실제 실행 결과를 기준으로 문서를 정정한다.
3. 왜 어긋났는지 failure record에 남긴다.

## 관측 가능성

- tracker는 현재 owner, verdict, next action의 단일 상태 창구다.
- ongoing plan은 현재 단계와 evidence의 세부 창구다.
- review report는 handoff 판정의 공식 기록이다.
- decision log는 사람에게 설명 가능한 처리 이력의 원천이다.

## 완료 조건

작업은 아래를 만족할 때만 신뢰성 기준상 완료로 본다.

- 필요한 상태 산출물이 모두 존재한다.
- 마지막 verdict가 evidence와 함께 남아 있다.
- unresolved item은 tracker next action 또는 backlog에 연결돼 있다.
- 같은 작업을 다른 사람이 다시 열어도 현재 상태를 재구성할 수 있다.

## 문서 우선순위

충돌 시 우선순위는 아래 순서를 따른다.

1. `harness/core/docs/repository-reliability.md`
2. 이 문서
3. `docs/product-specs/quality-criteria.md`
4. 개별 task brief / ongoing plan / review report
