# 프로젝트 관리 규칙 (Project Management)

## 목적

프로젝트성 티켓에 대해 **Coordinator가 일정관리, 마일스톤 추적, 정기보고, 이슈관리**를 수행하는 규칙을 정의한다.
운영 티켓과는 다른 근육을 쓴다 (신념 5).
프로젝트 티켓 초기화의 단일 분기 기준은 `docs/product-specs/decision-tree.md`를 따른다.

## 담당 에이전트

- **프로젝트 조율**: Coordinator (Lead가 스폰)
- **프로젝트 계획 승인**: Lead
- **실무 수행**: Analyst, Executor, Reporter
- **품질 검증**: Guardian

---

## Coordinator 활성화

Lead가 티켓을 프로젝트성으로 분류한 뒤 스폰 조건을 확인한다.
(`design-docs/agent-roles.md` Coordinator 스폰 판단 기준 참조)

```
[Lead] 프로젝트성 분류
  ↓
스폰 조건 확인
  ├─ 충족 → Coordinator 스폰
  └─ 미충족 → Lead가 직접 관리 (간단한 프로젝트)
```

---

## 프로젝트 초기 설정

Coordinator가 스폰되면 아래를 수행한다.
초기화 순서 자체는 `docs/product-specs/decision-tree.md`의 프로젝트 티켓 초기화 경로를 기준으로 본다.

### 1. 프로젝트 계획 수립

프로젝트 계획 문서는 `docs/exec-plans/active/YYYY-MM-DD-<slug>-exec-plan.md`에 둔다.
프로젝트가 종료되면 마지막 상태를 유지한 채 `docs/exec-plans/completed/`로 옮긴다.

```markdown
## 프로젝트 계획 — JIRA-XXXX

### 개요
- 프로젝트명: [티켓 제목]
- 목표: [달성하려는 것]
- 시작일: YYYY-MM-DD
- 예상 완료일: YYYY-MM-DD

### 마일스톤

| ID | 마일스톤 | 예정일 | 완료 기준 | 선행 조건 |
|---|---|---|---|---|
| MS1 | 요구분석 | MM-DD | 분석 보고서 완료 | — |
| MS2 | 설계/개발 | MM-DD | 구현 완료 | MS1 |
| MS3 | 검증 | MM-DD | 테스트 통과 | MS2 |
| MS4 | 배포/완료 | MM-DD | 운영 반영 | MS3 |

### 리스크

| 리스크 | 영향도 | 대응 계획 |
|---|---|---|
| (식별된 리스크) | 높음/중간/낮음 | (대응) |
```

### 2. 운영 상태 산출물 시작

- 각 마일스톤 시작 전 task brief로 범위와 완료 기준을 고정한다
- 현재 프로젝트 대표 상태는 Lead 또는 Coordinator가 `docs/status/tracker.md`에 갱신한다
- 마일스톤별 세부 상태와 evidence는 `docs/status/ongoing/`에 남긴다
- risky cleanup이나 큰 구조 변경이 예상되면 `checkpoint_ref`를 남긴다

### 3. Jira 하위 작업 생성

마일스톤별로 Jira 하위 작업(Sub-task)을 생성한다.
- 부모 티켓: 원본 프로젝트 티켓
- 레이블: `auto-created`, `milestone-N`

### 4. 보고 주기 설정

| 프로젝트 기간 | 보고 주기 |
|---|---|
| 1~2주 | 주 2회 |
| 2주~1개월 | 주 1회 |
| 1개월 이상 | 주 1회 + 월별 종합 |

---

## 마일스톤 관리

### 진행 추적

Coordinator가 각 마일스톤의 진행률을 추적한다.
- 상태가 바뀌면 Lead 또는 Coordinator가 tracker를, current owner가 ongoing plan을 함께 갱신한다

```
[Coordinator] 마일스톤 체크 (설정된 주기)
  ↓
하위 에이전트의 작업 상태 확인
  ↓
진행률 산정
  ├─ 정상 → 상태 기록
  ├─ 지연 예상 → Lead에 보고 + 일정 조정 검토
  └─ 차단 이슈 → Lead에 에스컬레이션
```

### 마일스톤 완료 판정

Coordinator가 완료 기준 충족 여부를 확인한다.
- Guardian 검증을 통과한 산출물이 있어야 완료
- handoff 전 review report와 cleanup 상태가 남아 있어야 한다
- 완료 시 Jira 하위 작업 상태 변경 + 유관자 알림
- 완료 시 Lead 또는 Coordinator가 tracker를, current owner가 ongoing plan을 최신 상태로 갱신한다

---

## 이슈 관리

### 이슈 유형

| 유형 | 설명 | 대응 주체 |
|---|---|---|
| 차단 이슈 | 다음 단계 진행 불가 | Lead (에스컬레이션 포함) |
| 리스크 현실화 | 식별된 리스크가 발생 | Coordinator (대응 계획 실행) |
| 범위 변경 | 요구사항 추가/변경 | Lead + 사용자 협의 |
| 일정 지연 | 마일스톤 예정일 초과 | Coordinator (일정 재조정) |

### 이슈 기록

```markdown
### 이슈 — YYYY-MM-DD

- **유형**: 차단 / 리스크 / 범위변경 / 일정지연
- **내용**: [설명]
- **영향**: [영향받는 마일스톤/작업]
- **대응**: [수행한/수행할 조치]
- **상태**: 미해결 / 해결
- **해결일**: YYYY-MM-DD (해결 시)
```

---

## 프로젝트 상태 보고

Coordinator가 설정된 주기에 Reporter에게 보고서 생성을 지시한다.
형식: `agent-behaviors/reporting.md`의 "프로젝트 상태 보고" 참조.

### 보고 플로우

```
[Coordinator] 보고 주기 도래
  ↓
[Coordinator] 마일스톤 현황 + 이슈 목록 정리
  ↓
[Reporter] 프로젝트 상태 보고서 작성
  ↓
[Guardian] Gate 3 검증
  ↓
[Executor] Confluence 발행 + Jira 댓글/Teams 웹훅 공유
```

### 내부 handoff 산출물

- 마일스톤 간 handoff는 stakeholder 보고서와 별도로 review report를 남긴다
- review report에는 verdict, evidence, cleanup 상태, open risks를 적는다
- `CHANGES_REQUESTED` 또는 `BLOCKED`가 반복되면 ongoing plan의 시도 횟수를 올린다

---

## 프로젝트 완료

### 완료 조건

- 모든 마일스톤이 완료 판정됨
- 미해결 이슈가 없음 (또는 후속 티켓으로 이관됨)
- 최종 보고서가 생성됨
- Lead가 최종 승인

### 완료 프로세스

```
[Coordinator] 모든 마일스톤 완료 확인
  ↓
[Reporter] 최종 프로젝트 보고서 작성
  ↓
[Guardian] Gate 3 검증
  ↓
[Lead] 최종 승인
  ↓
[Executor] Jira 원본 티켓 "해결됨" 전환
  ↓
[Coordinator] 비활성화
  ↓
[Reporter] 관련 ongoing plan을 completed 위치로 이동
  ↓
[Analyst] 프로젝트 교훈 정리 → past-solutions 등록 검토
```

---

## Lead 직접 관리 (Coordinator 미스폰)

간단한 프로젝트성 티켓은 Lead가 직접 관리한다.
이 경우 축소된 프로젝트 관리를 적용:

- 마일스톤: 2~3개 이내
- 하위 작업: 선택적
- 보고: 일반 일별/주별 보고에 포함 (별도 프로젝트 보고 없음)
- 이슈 관리: 의사결정 로그에 포함
