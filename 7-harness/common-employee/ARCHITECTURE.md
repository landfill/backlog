# 시스템 아키텍처 (Architecture)

## 개요

팀원 에이전트는 **역할이 분화된 에이전트 팀**이 Jira 티켓 기반 업무를 자율 처리하는 시스템이다.
Lead가 티켓을 분류하고 작업 DAG를 생성하면, 전담 에이전트들이 파이프라인과 병렬 처리를 조합하여 수행한다.
Guardian이 각 단계의 품질 게이트를 운영하고, Reporter가 모든 과정을 기록한다.
외부 시스템(Jira, Confluence, Teams, Outlook)과 연동하며, 모든 판단 과정을 마크다운 로그로 기록한다.
저장소 공통 운영 루프에 따라 task brief, tracker, ongoing plan, review report, checkpoint, cleanup 상태를 함께 관리한다.

---

## 시스템 구성도

```
┌──────────────────────────────────────────────────────────────┐
│                     외부 시스템 (External)                      │
│                                                              │
│   ┌──────┐   ┌───────────┐   ┌───────┐   ┌─────────┐      │
│   │ Jira │   │ Confluence│   │ Teams │   │ Outlook │      │
│   └──┬───┘   └─────┬─────┘   └───┬───┘   └────┬────┘      │
└──────┼──────────────┼─────────────┼────────────┼────────────┘
       │              │             │            │
       ▼              ▼             ▼            ▼
┌──────────────────────────────────────────────────────────────┐
│                  연동 계층 (Integration Layer)                  │
│                                                              │
│   ┌────────────────────────────────────────────────────┐    │
│   │           API Adapters / MCP Connectors              │    │
│   │    (각 외부 시스템별 읽기/쓰기 인터페이스)               │    │
│   └────────────────────────┬───────────────────────────┘    │
└────────────────────────────┼────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────┐
│                   에이전트 팀 (Agent Team)                      │
│                                                              │
│   ┌──────────────────────────────────────────────────┐      │
│   │                 Lead (오케스트레이터)                │      │
│   │       분류 · DAG 생성 · 위임 · 최종 승인              │      │
│   └─────────┬──────────────┬─────────────────────────┘      │
│             │              │                                 │
│             │  조건부       │  상시                            │
│             ▼              ▼                                 │
│   ┌──────────────┐  ┌─────────────────────────────────┐    │
│   │ Coordinator  │  │        실무 에이전트               │    │
│   │ (조율자)      │  │                                   │    │
│   │ 일정/마일스톤  │  │  ┌────────┐ ┌────────┐          │    │
│   │              │  │  │Analyst │ │Executor│          │    │
│   │ 프로젝트성    │  │  │(분석가) │ │(실행자) │          │    │
│   │ 티켓에서만    │  │  └────────┘ └────────┘          │    │
│   │ 활성화       │  │                                   │    │
│   └──────────────┘  │  ┌────────┐ ┌────────┐          │    │
│                      │  │Reporter│ │Guardian│          │    │
│                      │  │(보고관) │ │(검수관) │          │    │
│                      │  └────────┘ └────────┘          │    │
│                      └─────────────────────────────────┘    │
│                                                              │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                지식 & 기록 계층 (Knowledge & Logging)            │
│                                                              │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│   │  Runbooks    │  │   Past       │  │  Decision    │     │
│   │  (매뉴얼)     │  │  Solutions   │  │  Logs        │     │
│   │              │  │  (과거 사례)   │  │ (판단 기록)   │     │
│   └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│   │  Glossary    │  │  Escalation  │  │  Templates   │     │
│   │  (용어 사전)  │  │  Matrix      │  │  (보고 템플릿) │     │
│   └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 데이터 흐름

### 1. 메인 플로우: 티켓 → 팀 처리 → 보고

```
[Jira] 티켓 배정
  │
  ▼
[Lead] 티켓 분류 (운영 / 프로젝트 / 불명확)
  │
  ├─ 불명확 → [Lead] 사용자에게 확인 요청
  ├─ 프로젝트성 → [Lead] Coordinator 스폰
  │
  ▼
[Lead] 작업 DAG 생성
  │
  ├─ 병렬 가능 작업 식별
  ├─ 게이트 위치 결정
  └─ 에이전트별 작업 배정
  │
  ▼
[Analyst] 솔루션 탐색 (복수 소스 병렬 가능)
  ├─ runbooks 매칭
  ├─ past-solutions 검색
  ├─ Confluence 위키 검색
  └─ Jira 유사 티켓 이력 검색
  │
  ▼
[Guardian] ─── Gate 1: 분석 품질 ───
  │                                │
  ├─ 통과                          └─ 반려 → Analyst 보완 → 재제출
  ▼
[Lead] 솔루션 확정 + 확신도 평가
  ├─ 높음 → Executor에 실행 지시
  ├─ 중간 → Executor에 실행 지시 + 사후 확인 예약
  └─ 낮음 → 사용자 승인 요청 → 승인 후 Executor에 전달
  │
  ▼
[Executor] 솔루션 실행
  │
  ▼
[Guardian] ─── Gate 2: 실행 결과 + 보안 ───
  │                                       │
  ├─ 통과                                 └─ 반려 → Executor 재처리
  ▼
[Reporter] 의사결정 로그 작성 + 유관자 알림 + 티켓 업데이트
  │
  ▼
[Guardian] ─── Gate 3: 보고 품질 ───
  │                                │
  ├─ 통과                          └─ 반려 → Reporter 보완
  ▼
[Lead] 최종 승인 → 완료
```

### 1-A. 운영 상태 플로우: 기준 고정 → 상태 갱신 → handoff

```
[Lead / Coordinator] task brief 기준 고정
  │
  ▼
[Tracker] 현재 작업 + verdict + next action 기록
  │
  ▼
[각 담당자] ongoing plan 갱신
  │
  ├─ 단계 완료 → [Review Report] evidence + cleanup 상태 기록
  └─ 실패 반복 → attempts 누적 + rollback 후보 `checkpoint_ref` 확인
  │
  ▼
[Lead] 최종 승인 후 tracker 마감 + completed 이동
```

### 2. 보고 플로우: 로그 → 집계 → 보고서

```
[Decision Logs] 일별 로그 축적 (Reporter 작성)
  │
  ▼
[Reporter] 로그 집계 + 보고서 생성
  │
  ├─ 일별 → daily-leader 보고서
  ├─ 주별 → weekly-leader 보고서
  └─ 수시 → stakeholder-update
  │
  ▼
[Guardian] ─── Gate 3: 보고서 품질 검증 ───
  │
  ▼
[Executor] Confluence 페이지 생성/업데이트
  │
  ▼
[Executor] Teams/Outlook 보고서 링크 공유
```

### 3. 지식 정제 플로우: 원본 → 정제 → 활용

```
[원본 자료] 위키, PPT, Word, 과거 티켓
  │
  ├─ API 접근 가능 → Analyst가 자동 수집
  └─ API 불가 → 사용자가 파일 제공
  │
  ▼
[Analyst] raw/에 원본 저장 + intake-log 기록
  │
  ▼
[Analyst] 구조화 (제목, 절차, 조건, 예외 분리)
  │
  ▼
[Guardian] ─── 정제 품질 검증 ───
  │
  ▼
[Reporter] runbooks/ 또는 past-solutions/에 배치 + 문서화
  │
  ▼
[팀 전체] 티켓 처리 시 참조
  │
  ▼
[Analyst] 매뉴얼 정확도 추적 → [Reporter] 업데이트 제안 기록
```

### 4. 에이전트 간 통신 흐름

```
┌──────┐     위임/지시      ┌───────────┐
│      │ ──────────────→   │ Analyst   │
│      │ ──────────────→   │ Executor  │
│ Lead │ ──────────────→   │ Reporter  │
│      │ ←───────────────  │ (결과보고)  │
│      │                   └───────────┘
│      │     조건부 스폰
│      │ ──────────────→   ┌─────────────┐
│      │ ←───────────────  │ Coordinator │
└──────┘   (상태 보고)      └──────┬──────┘
                                  │ 프로젝트 내 조율
                                  ▼
                           ┌───────────┐
                           │ 하위 에이전트│
                           └───────────┘

┌──────────┐   게이트 요청    ┌──────────┐
│ Analyst  │ ─────────────→ │          │
│ Executor │ ─────────────→ │ Guardian │
│ Reporter │ ─────────────→ │          │
│          │ ←────────────  │ 통과/반려  │
└──────────┘                └──────────┘

※ 하위 에이전트 간 직접 위임 금지 — 반드시 Lead 또는 Coordinator를 경유
```

---

## 운영 기준 연결

이 문서는 시스템 구성과 계층 책임을 설명한다.
실제 처리 단계와 판정 기준은 아래 문서를 단일 기준으로 사용한다.

이 앱에서는 repository-level 역할을 아래처럼 구체화한다.

- `PM` → `Lead`
- `Coder` → `Analyst`, `Executor`, `Reporter`
- `Security Reviewer`, `Tester` → `Guardian`

따라서 repository common pipeline의 시작/종료 승인 책임은
이 앱 문맥에서 `Lead` 판정으로 해석한다.

- 처리 순서 / 예외 흐름: `docs/product-specs/ticket-lifecycle.md`
- V1 범위 / 비범위: `docs/product-specs/v1-scope.md`
- 품질 판정: `docs/product-specs/quality-criteria.md`
- 보안 기준: `docs/SECURITY.md`
- 신뢰성 기준: `docs/RELIABILITY.md`
- 현재 상태 산출물: `docs/status/README.md`

---

## 계층 상세

### 1. 연동 계층 (Integration Layer)

각 외부 시스템과의 인터페이스를 추상화한다.
Executor가 쓰기 작업을, Analyst가 읽기 작업을 주로 사용한다.
상세 설계는 `docs/integrations/` 참조.

| 시스템 | 읽기 (주로 Analyst) | 쓰기 (주로 Executor) | 주요 용도 |
|---|---|---|---|
| Jira | 티켓 조회, 검색, 이력 | 상태 변경, 댓글, 필드 업데이트 | 업무 입력/출력의 주 채널 |
| Confluence | 위키 페이지 검색/읽기 | 보고서 생성/업데이트 | 지식 소스 + 보고 대상 |
| Teams | 메시지 수신 | 메시지/알림 발송 | 실시간 커뮤니케이션 |
| Outlook | 메일 수신 | 메일 발송 | 공식 알림/에스컬레이션 |

### 2. 에이전트 팀 (Agent Team)

단일 에이전트 코어가 아닌, 역할별 에이전트로 분화된 팀 구조.
각 에이전트의 상세 역할은 `docs/design-docs/agent-roles.md` 참조.

**Lead (오케스트레이터)**
- 티켓 분류, 작업 DAG 생성, 에이전트 위임, 최종 승인
- 사람 개입 판단의 유일한 주체
- Coordinator 스폰 결정

**Coordinator (조율자) — 조건부**
- 프로젝트성 티켓에서만 Lead가 활성화
- 일정/마일스톤 관리, 하위 에이전트 조율

**Analyst (분석가)**
- 자료 조사 + 정리 통합 수행
- 복수 소스 병렬 조사 가능
- 솔루션 후보 목록 + 근거 제출

**Executor (실행자)**
- 확정된 솔루션의 실제 수행
- 외부 시스템 쓰기 작업 담당
- Gate 1 통과 + Lead 승인 후에만 실행

**Reporter (보고관)**
- 의사결정 로그, 보고서, 템플릿 관리
- 모든 문서 산출물의 작성 주체

**Guardian (검수관)**
- 3단계 품질 게이트 운영 (분석/실행/보고)
- 보안 검증 (Gate 2에서 수행)
- 검증만 수행, 직접 수정하지 않음

**작업 DAG 실행 모델:**
- Lead가 티켓마다 작업 의존성 그래프(DAG)를 생성
- 독립된 작업은 병렬 실행, 의존 작업은 순차 실행
- Gate는 반드시 순차 통과 (병렬 불가)
- 상세: `docs/design-docs/agent-roles.md` DAG 설계 섹션 참조

### 3. 지식 & 기록 계층 (Knowledge & Logging)

모든 데이터는 마크다운 파일로 저장되며, Git으로 버전 관리된다.
Analyst가 읽기, Reporter가 쓰기를 주로 담당한다.

**접근 권한:**

| 자원 | 읽기 | 쓰기 |
|---|---|---|
| runbooks/ | 전체 에이전트 | Reporter (Analyst 제안 기반) |
| past-solutions/ | 전체 에이전트 | Reporter (Analyst 제안 기반) |
| references/ | 전체 에이전트 | Analyst / Reporter |
| decision-logs/ | 전체 에이전트 | Reporter |
| status/tracker.md | 전체 에이전트 | Lead / Coordinator |
| status/ongoing/ | 전체 에이전트 | 현재 담당자 |
| status/completed/ | 전체 에이전트 | Lead / Coordinator / Reporter |
| exec-plans/ | 전체 에이전트 | Coordinator / Lead |
| templates/ | 전체 에이전트 | Reporter |
| escalation-matrix.md | 전체 에이전트 | Lead 승인 후 Reporter |
| glossary.md | 전체 에이전트 | Reporter |

**운영 상태 산출물:**
- task brief: 작업 범위, 완료 기준, 검증 계획의 기준점
- tracker: 앱의 현재 작업과 다음 행동을 보여 주는 단일 상태 문서. Lead 또는 Coordinator만 갱신한다
- ongoing plan: 현재 작업의 세부 상태, evidence, 실패 원인을 남기는 문서
- review report: 단계 간 handoff 판정과 cleanup 상태를 남기는 짧은 보고서

**디렉토리 구조:**

```
docs/domain-knowledge/
├── raw/                          # 원본 자료 + 수집 로그
│   └── _intake-log.md
├── runbooks/                     # 정제된 운영 매뉴얼
│   ├── by-ticket-type/           # 티켓 유형별
│   └── by-system/                # 시스템별
├── past-solutions/               # 과거 해결 사례
├── escalation-matrix.md          # 에스컬레이션 경로
└── glossary.md                   # 도메인 용어 사전

docs/references/
└── README.md                     # 참조용 자료 보관 규칙

docs/generated/decision-logs/
├── 2026/
│   └── MM/
│       └── YYYY-MM-DD-TICKET-ID.md
└── _summary/
    ├── weekly-YYYY-WNN.md        # 주별 요약 (Reporter 생성)
    └── monthly-YYYY-MM.md        # 월별 요약 (Reporter 생성)

docs/status/
├── tracker.md                    # 현재 작업과 다음 행동
├── ongoing/
│   └── README.md
└── completed/
    └── README.md

docs/exec-plans/
├── active/                       # 프로젝트성 작업의 현재 실행 계획
└── completed/                    # 종료된 프로젝트 계획 기록
```

---

## V1 구현 계약

이 섹션은 특정 프레임워크 이름보다
착수 시점에 고정해야 하는 구현 계약을 정의한다.

| 영역 | V1 계약 | 비고 |
|---|---|---|
| 오케스트레이션 | Lead 중심 DAG + role-specific worker 구조 | Gate는 항상 순차 통과 |
| 상태 저장 | 마크다운 + Git | task brief, tracker, ongoing plan, review report, decision log |
| 외부 연동 경계 | MCP connector layer | 읽기/쓰기 책임 분리 유지 |
| 에이전트 간 통신 | 구조화된 마크다운 메시지 | `docs/design-docs/agent-roles.md` 기준 |
| 정기 트리거 | 이벤트 기반 intake + 스케줄 기반 보고 | 티켓 수신과 정기 보고 분리 |
| 모델 정책 | 역할별 모델 선택 가능, 상태 산출물 형식은 공통 | 비용 최적화보다 추적 가능성 우선 |

구체 프레임워크 선택은 위 계약을 깨지 않는 범위에서 결정한다.

---

## 비기능 요구사항

### 신뢰성
- 외부 시스템 장애 시 재시도 로직
- 처리 중 에이전트 중단 시 미완료 로그가 남아야 함
- 에이전트 간 통신 실패 시 Lead에 자동 보고
- 상세: `docs/RELIABILITY.md`

### 보안
- 외부 시스템 인증 정보는 환경 변수 또는 시크릿 매니저로 관리
- 에이전트가 접근할 수 있는 Jira 프로젝트/Confluence 스페이스를 제한
- Guardian이 Gate 2에서 보안 정책 위반을 검증
- 상세: `docs/SECURITY.md`

### 관측 가능성
- 의사결정 로그 자체가 관측 수단
- tracker와 ongoing plan이 현재 단계, 판정, 다음 행동의 관측 수단
- 에이전트별 실행 상태 모니터링 (처리 중/대기 중/에러)
- DAG 실행 현황 추적 (어떤 단계, 어떤 에이전트가 처리 중인지)
- 보고서 생성 성공/실패 추적
- Guardian 반려율 추적 (품질 트렌드)
