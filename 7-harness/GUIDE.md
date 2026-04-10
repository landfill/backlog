# Harness Guide

이 문서는 저장소 하니스 구조, 사용 방법, 신규 앱 시작 절차를 설명한다.

---

## 전체 계층도

```
7-harness/ (저장소 루트)
│
├── AGENTS.md              ← 에이전트 진입 포인터 (read order 명시)
├── CLAUDE.md              ← Claude Code용 진입 포인터 (→ AGENTS.md로 위임)
│
├── harness/               ← 저장소 레벨 공통 하니스
│   └── core/
│       ├── docs/          ← 6대 공통 원칙 문서
│       │   ├── index.md          (read order 정의)
│       │   ├── constitution.md   (최상위 규칙)
│       │   ├── core-values.md
│       │   ├── governance.md     (문서 경계)
│       │   ├── repository-architecture.md
│       │   ├── repository-security.md
│       │   └── repository-reliability.md
│       ├── workflows/     ← 운영 흐름 (pipeline / operating-loop / rollback / checkpoint)
│       ├── roles/         ← 추상 역할 정의 (PM / Coder / Security Reviewer / Tester)
│       ├── platforms/     ← Claude Code, Cursor 플랫폼 가이드
│       └── templates/     ← task-brief / review-report / tracker 공통 템플릿
│
└── <app>/                 ← 앱 레벨 (하니스 위에 올린 구체 구현)
    ├── AGENTS.md          ← 앱 진입점 (저장소 하니스를 도메인으로 구체화)
    ├── ARCHITECTURE.md
    ├── docs/              ← 앱 전용 설계/행동/연동/상태 문서
    └── src/               ← 구현 코드
```

---

## 핵심 설계 원칙

2-레이어 적층 구조다.

| 레이어 | 위치 | 역할 |
|---|---|---|
| Repository harness | `harness/core/` | 모든 앱에 공통으로 적용되는 규칙 (추상 역할, 워크플로우, 보안/신뢰성 기준) |
| App harness | `<app>/docs/` | 도메인 특화 구체화 (에이전트 구성, 연동, 지식체계) |

**규칙:** app-level은 repository-level보다 느슨할 수 없다. app은 공통 계약 위에서만 구체화한다.

---

## 하니스 사용 방법 (에이전트 read order)

건너뛰지 않는다.

```
1. harness/core/docs/index.md
2. index.md의 6대 원칙 문서
   (constitution → core-values → governance → repository-architecture → repository-security → repository-reliability)
3. harness/core/workflows/pipeline.md
4. harness/core/workflows/operating-loop.md
5. 이번 역할에 해당하는 harness/core/roles/ 문서
6. 대상 앱의 AGENTS.md → docs/PLANS.md → docs/status/tracker.md
```

---

## 필수 산출물 4종

이 산출물이 없으면 작업 시작 및 handoff가 불가능하다.

| 산출물 | 역할 |
|---|---|
| `task brief` | 범위·완료기준·검증계획 고정 |
| `tracker` | 앱 전체 현재 상태 + 다음 행동 |
| `ongoing plan` | 현재 작업의 최신 상태 |
| `review report` | 단계 간 handoff 판정 + 근거 |

판정 값은 `APPROVED / CHANGES_REQUESTED / BLOCKED / SKIPPED` 4가지만 사용한다.

---

## 앱 단독 운영 가능 여부

**불가능하다.** app harness는 repository harness의 추상 계약을 전제로 작성된다.

- 앱의 역할 정의("Lead가 PM 역할을 한다")는 저장소 harness의 추상 역할을 알아야 해석된다.
- rollback loop, checkpoint rule은 `harness/core/workflows/`에만 정의된다.
- 일부 Blocker 문서(`quality-criteria.md`, `RELIABILITY.md`)가 `harness/core/templates/`를 직접 참조한다.

저장소 harness 없이는 작업 흐름의 절반이 미정의 상태가 된다.

---

## 신규 앱 시작 절차

`common-employee`가 full cycle을 완주한 reference 앱이다. 동일한 순서를 따른다.

### Phase 1 — 앱 폴더 및 진입점

```
<app>/
├── AGENTS.md           ← 역할 매핑 + 미션 + 제약 정의
└── ARCHITECTURE.md     ← 시스템 구조도
```

저장소 harness의 추상 역할(PM / Coder / Security Reviewer / Tester)을 도메인 에이전트로 구체화한다.

### Phase 2 — Blocker 설계 문서 (구현 착수 전 필수)

아래가 모두 존재하고 `예정` 상태가 없어야 구현을 시작할 수 있다.

```
docs/design-docs/
├── agent-roles.md          ← 역할 경계와 gate 책임
├── data-flow.md            ← 신뢰 경계, 데이터 흐름
└── design-freeze-matrix.md ← Blocker / Parallel / Deferred 구분

docs/product-specs/
├── v1-scope.md             ← V1 범위·비범위
├── ticket-lifecycle.md     ← end-to-end 단계 순서
├── decision-tree.md        ← 분기/확신도/승인 경로
└── quality-criteria.md     ← Gate pass/fail 기준

docs/
├── SECURITY.md             ← 보안 정책
├── RELIABILITY.md          ← rollback/cleanup 기준
└── pre-kickoff-checklist.md ← 착수 준비 최종 점검
```

### Phase 3 — 상태 산출물 구조

```
docs/status/
├── tracker.md
├── ongoing/README.md
└── completed/README.md
```

이 구조가 없으면 operating-loop 계약을 이행할 수 없다.

### Phase 4 — 첫 task brief 작성 후 PM 역할로 착수

`pre-kickoff-checklist.md`가 READY 판정이 된 뒤에만 Coder 단계로 진행한다.

---

## design-freeze-matrix 고정 레벨

신규 앱의 `design-freeze-matrix.md`를 작성할 때 아래 레벨을 기준으로 구분한다.

| 레벨 | 의미 | 구현 중 행동 |
|---|---|---|
| Blocker | 구현 전에 고정되어야 하는 계약 | 없거나 모호하면 구현을 멈추고 설계 보완을 요청한다 |
| Parallel | 구현과 함께 정제할 수 있는 보강 문서 | Blocker 계약을 바꾸지 않는 범위에서만 보완한다 |
| Deferred | 현재 V1 착수와 무관한 후속 backlog | 범위를 늘리지 말고 backlog로만 남긴다 |

---

## 관련 문서

- 공통 규칙 진입점: `harness/core/docs/index.md`
- 최상위 규칙: `harness/core/docs/constitution.md`
- 작업 흐름: `harness/core/workflows/pipeline.md`, `operating-loop.md`
- reference 앱: `common-employee/AGENTS.md`, `common-employee/docs/PLANS.md`
