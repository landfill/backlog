# 티켓 라이프사이클 (Ticket Lifecycle)

## 목적

Jira 티켓이 배정되는 순간부터 완료되기까지의 **전체 생애주기**를 정의한다.
Phase 2 (행동 정의)와 Phase 3 (외부 연동)을 하나의 end-to-end 흐름으로 통합한다.

---

## 전체 라이프사이클 개요

```
[수신] → [분류] → [계획] → [탐색] → [검증1] → [실행] → [검증2] → [보고] → [검증3] → [승인] → [학습]
```

## 기준 연결

- 이 문서는 처리 **단계 순서**와 **예외 흐름**의 단일 기준이다.
- Gate 1/2/3의 pass/fail 기준은 `docs/product-specs/quality-criteria.md`를 따른다.
- Gate 2의 보안 판정은 `docs/SECURITY.md`를 따른다.
- retry, rollback, 상태 복구 기준은 `docs/RELIABILITY.md`를 따른다.
- 티켓 → 액션 분기 기준은 `docs/product-specs/decision-tree.md`를 따른다.
- 데이터 이동, 저장 위치, 외부 공유 최소화 기준은 `docs/design-docs/data-flow.md`를 따른다.
- 완료 후 학습/문서 보강 기준은 `docs/product-specs/feedback-loop.md`를 따른다.

| 단계 | 주 담당 | 보조 | 산출물 |
|---|---|---|---|
| 수신 | Lead | — | 티켓 접수 확인 + tracker 시작 |
| 분류 | Lead | Analyst (보조 정보) | 분류 결과 + 확신도 + tracker 갱신 |
| 계획 | Lead / Coordinator | — | 작업 DAG + task brief + ongoing plan 시작 |
| 탐색 | Analyst | — | 솔루션 후보 목록 + ongoing plan 갱신 |
| 검증1 | Guardian | — | Gate 1 판정 + review report |
| 실행 | Executor | — | 실행 결과 기록 + ongoing plan 갱신 |
| 검증2 | Guardian | — | Gate 2 판정 (+ 보안) + review report |
| 보고 | Reporter | — | 의사결정 로그 + 알림 |
| 검증3 | Guardian | — | Gate 3 판정 + review report |
| 승인 | Lead | — | 최종 승인 기록 + tracker 마감 |
| 학습 | Analyst + Reporter | — | 패턴 기록 + 매뉴얼 제안 + completed 이동 준비 |

---

## 운영 상태 산출물

- task brief: 작업 범위, 완료 기준, 검증 계획을 고정한다. 형식은 `harness/core/templates/task-brief-template.md`를 따른다.
- tracker: `docs/status/tracker.md`에서 현재 작업, verdict, 다음 행동을 본다. 이 문서는 Lead 또는 Coordinator만 갱신한다.
- ongoing plan: `docs/status/ongoing/`에 현재 단계, evidence, 실패 원인을 남긴다.
- review report: Gate 1, Gate 2, Gate 3 handoff 때 verdict, evidence, cleanup 상태를 남긴다.

---

## 단계별 상세

### 1. 수신

**트리거**: Jira 웹훅 또는 폴링으로 티켓 배정 감지

**Lead 행동:**
- 티켓 메타 정보 조회 (`docs/integrations/jira.md` 참조)
- 수신 확인 로그 기록 (시각, 티켓 ID)
- 5분 내 분류 시작

**운영 상태:**
- 현재 작업으로 선정된 티켓이면 tracker의 current work를 연다

**Jira 반영:**
- 티켓 상태: 할당됨 → (변경 없음, 분류 후 변경)

**소요 시간 목표**: < 1분

---

### 2. 분류

**상세**: `docs/agent-behaviors/ticket-triage.md` 참조

**Lead 행동:**
- 3단계 분류 (Jira 필드 → 내용 분석 → 복합 상황)
- 확신도 부여
- 불명확 시 사용자 개입 요청

**분기:**
- 운영 → 3. 계획 (단순 DAG)
- 프로젝트 → Coordinator 스폰 → 3. 계획 (복합 DAG)
- 불명확 → 사용자 개입 대기 → 응답 후 분기

**Jira 반영:**
- 티켓 댓글: 분류 결과 안내 (선택적, 프로젝트성일 때)
- 레이블 추가: `agent-classified`

**소요 시간 목표**: < 5분 (자동 분류 시)

---

### 3. 계획

**Lead 행동 (운영):**
- 단순 파이프라인 DAG 생성
- Analyst에 탐색 지시

**Coordinator 행동 (프로젝트):**
- 일정/마일스톤 수립
- 병렬 가능 작업 식별
- 복합 DAG 생성
- 하위 에이전트에 작업 배분

**운영 상태:**
- task brief로 이번 작업의 범위와 완료 기준을 고정한다
- Lead 또는 Coordinator가 tracker에 현재 owner, current work, next action을 기록한다
- `docs/status/ongoing/`에 작업별 ongoing plan을 만든다
- 프로젝트성 작업의 일정/마일스톤 계획은 `docs/exec-plans/active/`에 따로 둔다
- risky cleanup이나 큰 구조 변경이 예상되면 `checkpoint_ref`를 남긴다

**Jira 반영:**
- 티켓 상태: → 진행중
- 프로젝트성: 하위 작업 생성 (Coordinator)

**소요 시간 목표**: < 5분 (운영), < 30분 (프로젝트)

---

### 4. 탐색

**상세**: `docs/agent-behaviors/solution-lookup.md` 참조

**Analyst 행동:**
- 4단계 소스 탐색 (runbooks → past-solutions → Confluence → Jira 이력)
- 병렬 탐색 (Lead/Coordinator가 DAG에 배치한 경우)
- 솔루션 후보 목록 + 근거 정리

**외부 시스템 사용:**
- Confluence 검색 (`docs/integrations/confluence.md`)
- Jira 유사 티켓 검색 (`docs/integrations/jira.md`)

**산출물**: 구조화된 솔루션 탐색 결과 → Guardian에 Gate 1 요청

**소요 시간 목표**: < 15분 (운영), < 1시간 (프로젝트 초기 조사)

---

### 5. 검증1 (Gate 1: 분석 품질)

**Guardian 행동:**
- 소스 충분성, 근거 명시성, 대안 제시, 리스크 명시, 최신성 검증
- 통과 → Lead에 전달
- 반려 → Analyst에 보완 지시 + 반려 사유

**운영 상태:**
- Guardian이 Gate 1 review report를 작성하고, 결과는 review report와 ongoing plan에 함께 남긴다

**반려 시**: Analyst 보완 → Guardian 재검증 (최대 2회, 2회 반려 시 Lead 에스컬레이션)

**소요 시간 목표**: < 5분

---

### 6. 실행

**상세**: `docs/agent-behaviors/auto-resolution.md` 참조

**선행 조건 확인 (Executor):**
1. Gate 1 통과
2. Lead 실행 승인
3. 확신도 낮음이면 사용자 승인
4. Reporter 사전 로그 작성 완료

**Executor 행동:**
- 위험도별 실행 규칙 적용
- 액션 순차 실행 + 각 액션 결과 기록
- 에러 시 즉시 중단 + Lead 보고
- Outlook 메일은 필요한 경우 발송 준비까지만 수행하고, 실제 SMTP 발송은 운영자 UI 액션으로 넘긴다

**운영 상태:**
- 각 액션 결과를 ongoing plan의 evidence에 갱신한다
- `CHANGES_REQUESTED` 또는 `BLOCKED`가 누적되면 attempts를 올린다

**외부 시스템 사용:**
- Jira 상태 변경/댓글 (`docs/integrations/jira.md`)
- Confluence 문서 수정 (`docs/integrations/confluence.md`)
- Teams 웹훅 셀프 알림 (`docs/integrations/teams.md`)

**소요 시간 목표**: < 10분 (운영), 가변 (프로젝트)

---

### 7. 검증2 (Gate 2: 실행 결과 + 보안)

**Guardian 행동:**
- 완료성, 정확성, 부작용 없음, 보안 준수, 기록 완전성 검증
- 보안 체크: 민감 정보 노출, 권한 범위 이탈, 의도치 않은 변경
- 통과 → Reporter에 전달
- 반려 (품질) → Executor 재처리
- 반려 (보안) → 즉시 Lead 보고 + 사용자 개입

**운영 상태:**
- Guardian이 Gate 2 review report를 작성하고, 결과와 cleanup 상태를 review report에 남긴다

**소요 시간 목표**: < 5분

---

### 8. 보고

**Reporter 행동:**
- 의사결정 로그 작성 (`docs/agent-behaviors/decision-logging.md` 스키마)
- Jira 댓글/Teams/Confluence/Outlook에 실릴 보고 내용과 evidence를 준비
- 필요한 경우 Outlook 수동 발송 준비 evidence를 남기고 운영자에게 전달

**Executor 행동:**
- Jira 댓글 publish
- Teams 웹훅으로 운영자 셀프 알림 발송 (`docs/integrations/teams.md`)
- Confluence 보고서 publish/update (프로젝트성인 경우)

**운영자 행동:**
- 필요한 경우 Outlook SMTP 최종 발송

**운영 상태:**
- Reporter는 의사결정 로그와 보고 산출물 본문을 갱신한다
- Executor는 publish/send 결과 evidence를 남긴다
- tracker 변경이 필요하면 Lead 또는 Coordinator가 verdict, evidence, next action을 최신 상태로 갱신한다

**산출물**: 의사결정 로그 파일 + 보고 초안/발송 evidence + 티켓 댓글

**소요 시간 목표**: < 10분

---

### 9. 검증3 (Gate 3: 보고 품질)

**Guardian 행동:**
- 로그 스키마 준수, 보고서 템플릿 부합, 수신자 관점 명확성 검증
- 통과 → Lead에 최종 승인 요청
- 반려 → Reporter 보완

**운영 상태:**
- Guardian이 Gate 3 review report를 작성하고, 결과는 review report와 ongoing plan에 남긴다

**소요 시간 목표**: < 5분

---

### 10. 승인

**Lead 행동:**
- 전체 처리 흐름 검토
- 최종 승인 기록
- 확신도 중간이었던 경우 사후 확인 예약

**운영 상태:**
- tracker를 최종 상태로 마감한다

**Jira 반영:**
- 티켓 상태: → 해결됨

**소요 시간 목표**: < 5분

---

### 11. 학습

**처리 완료 후 수행하는 피드백 루프.**

상세 학습/보강 규칙은 `docs/product-specs/feedback-loop.md`를 기준으로 본다.

**Analyst 행동:**
- 새로운 패턴 감지 여부 판단
- 기존 매뉴얼의 정확도 피드백

**Reporter 행동:**
- 새 패턴 → runbook 추가 제안 문서화
- 매뉴얼 갭 → 업데이트 필요 목록에 추가
- 과거 사례 재사용 시 해당 사례 신뢰도 업데이트

**운영 상태:**
- 완료된 ongoing plan은 `docs/status/completed/`로 이동한다

---

## 전체 소요 시간 목표

### 운영 티켓 (단순)

| 단계 | 목표 | 누적 |
|---|---|---|
| 수신 → 분류 | 5분 | 5분 |
| 계획 | 5분 | 10분 |
| 탐색 | 15분 | 25분 |
| Gate 1 | 5분 | 30분 |
| 실행 | 10분 | 40분 |
| Gate 2 | 5분 | 45분 |
| 보고 | 10분 | 55분 |
| Gate 3 + 승인 | 10분 | **65분** |

**운영 티켓 목표: 1시간 이내 완료** (사용자 개입 없는 경우)

### 프로젝트 티켓

단계별 시간이 아닌 마일스톤 단위로 추적한다.
Coordinator가 마일스톤별 일정을 관리.

---

## 상태 전이 다이어그램

```
                    ┌──────────────────┐
                    │     배정됨        │
                    └────────┬─────────┘
                             │ Lead: 분류 시작
                             ▼
                    ┌──────────────────┐
           ┌───────│     분류중        │───────┐
           │       └────────┬─────────┘       │
           │ 불명확          │ 확정             │ 사용자 개입 대기
           ▼                ▼                  ▼
  ┌──────────────┐ ┌──────────────┐  ┌──────────────┐
  │  개입 대기    │ │   진행중     │  │    보류      │
  └──────┬───────┘ └──────┬───────┘  └──────┬───────┘
         │ 응답 수신       │                  │ 응답 수신
         └────────────────┤                  │
                          │◄─────────────────┘
                          │
              ┌───────────┼───────────┐
              │           │           │
              ▼           ▼           ▼
     ┌──────────┐ ┌──────────┐ ┌──────────────┐
     │ Gate 반려 │ │  처리중   │ │ 에스컬레이션  │
     │ (재처리)  │ │          │ │              │
     └─────┬────┘ └─────┬────┘ └──────────────┘
           │             │
           └─────────────┤
                         ▼
                ┌──────────────────┐
                │     해결됨        │
                └────────┬─────────┘
                         │ 사용자 확인
                         ▼
                ┌──────────────────┐
                │      종료        │
                └──────────────────┘
```

---

## 예외 흐름

### 처리 중 티켓 변경

외부에서 티켓이 수정된 경우 (사용자가 설명 변경, 우선순위 변경 등):

1. 변경 이벤트 감지 (웹훅/폴링)
2. Lead가 영향도 판단
3. 경미한 변경 → 현재 파이프라인 유지
4. 중대한 변경 (요구사항 변경 등) → 파이프라인 재시작 또는 사용자 확인

### 처리 중 에이전트 장애

1. 미완료 로그가 남아있음 (원칙 3: 처리보다 기록이 먼저)
2. 재시작 시 미완료 로그에서 마지막 완료 단계 확인
3. 해당 단계부터 재개

### 반복 실패 / rollback

1. 같은 `root_cause`가 반복되면 attempts 누적
2. review report와 ongoing plan에서 마지막 실패 이유 확인
3. `checkpoint_ref`가 있으면 복구 후보로 검토
4. 범위를 줄여 더 작은 task brief로 다시 시작

### SLA 초과 위험

1. 각 단계의 소요 시간을 추적
2. 누적 시간이 SLA의 70%에 도달하면 Lead에 알림
3. Lead가 판단: 가속 처리 / 에스컬레이션 / 사용자 알림
