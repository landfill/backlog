# Pre-Kickoff Checklist

## 목적

이 문서는 `common-employee`의 설계 문서 세트가
실제 프로젝트 착수를 시작할 준비가 되었는지 한 번에 점검하는 체크리스트다.

세부 기준은 각 문서에 분산되어 있으므로,
이 문서는 "준비 완료 판단"의 단일 진입점만 담당한다.

현재 readiness 판단의 공식 근거는 `docs/status/tracker.md`와
가장 최근 완료 review report다.

## 필수 확인 항목

| 항목 | 기준 문서 | 확인 질문 |
|---|---|---|
| 범위 고정 | `docs/product-specs/v1-scope.md` | V1 범위와 비범위가 잠겼는가 |
| 처리 순서 | `docs/product-specs/ticket-lifecycle.md` | end-to-end 단계와 예외 흐름이 정의됐는가 |
| 품질 판정 | `docs/product-specs/quality-criteria.md` | Gate 1/2/3와 완료 판정 기준이 명시됐는가 |
| 보안 기준 | `docs/SECURITY.md` | 보호 대상, 금지 흐름, 차단 조건이 명시됐는가 |
| 신뢰성 기준 | `docs/RELIABILITY.md` | retry, rollback, 상태 복구 기준이 명시됐는가 |
| 데이터 흐름 | `docs/design-docs/data-flow.md` | 상태 산출물, LLM 입력, 외부 공유의 데이터 경계가 잠겼는가 |
| 설계 고정 기준 | `docs/design-docs/design-freeze-matrix.md` | 구현 전 필수 설계와 병행/후속 보완 문서가 구분됐는가 |
| 인증 전략 | `docs/integrations/auth-strategy.md` | 서비스 계정과 SMTP/Webhook 시크릿, least privilege, 감사 기준이 정리됐는가 |
| 상태 산출물 | `docs/status/README.md` | task brief, tracker, ongoing plan, review report 위치가 정해졌는가 |
| 현재 상태 | `docs/status/tracker.md` | 현재 phase, verdict, next action이 최신인가 |
| 남은 공백 | `docs/PLANS.md` | backlog가 의도적 공백으로 기록돼 있는가 |

## Ready 판정 규칙

### READY

- 위 필수 확인 항목이 모두 문서로 존재한다.
- Blocker 문서가 모두 잠겨 있고 `design-freeze-matrix.md` 기준으로 backlog가 `Parallel` 또는 `Deferred`로 설명된다.
- tracker와 review report 기준으로 현재 상태를 재구성할 수 있다.

### NOT_READY

- V1 범위, 품질 기준, 보안 기준, 신뢰성 기준 중 하나라도 없다.
- 데이터 흐름이나 설계 고정 기준이 없어 구현 에이전트가 승인 경로와 저장 위치를 직접 결정해야 한다.
- 상태 산출물 없이 진행하는 예외가 남아 있다.
- tracker나 review report만으로 현재 상태를 복원할 수 없다.

## 현재 권고 판정

- verdict: READY
- notes:
  - `docs/design-docs/data-flow.md`와 `docs/design-docs/design-freeze-matrix.md`를 구현 전 필수 문서로 포함했다.
  - 남은 예정 문서인 `docs/design-docs/agent-persona.md`는 현재 기준에서 Deferred backlog다.
