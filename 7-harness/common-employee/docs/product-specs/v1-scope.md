# V1 Scope

## 목적

이 문서는 `common-employee`의 첫 착수 범위를 고정한다.
설계 문서가 넓게 퍼지는 것을 막고,
무엇을 먼저 구현하고 무엇은 후속으로 미루는지 분명히 한다.

## V1 목표

Jira 기반 티켓 처리에서
"분류 → 탐색 → gate 검증 → 실행 → 보고 → 학습"의 기본 사이클을
문서와 상태 산출물 중심으로 안정적으로 운영할 수 있게 만든다.

## V1 핵심 결과

- 운영 티켓의 end-to-end 처리 플로우가 문서 기준으로 완결된다
- 프로젝트 티켓은 Coordinator 기반 마일스톤 추적과 상태 보고까지 지원한다
- 모든 처리에는 task brief, tracker, ongoing plan, review report가 남는다
- 의사결정 로그와 유관자 보고가 gate 기준과 함께 연결된다
- 보안, 신뢰성, 품질 기준이 app-level로 명시된다
- 구현 전 필수 설계와 후속 backlog가 문서 기준으로 구분된다

## In Scope

### 1. 티켓 intake와 분류

- Jira 배정 감지
- 운영 / 프로젝트 / 불명확 분류
- 확신도 평가와 사람 개입 조건 기록

### 2. 운영 티켓 기본 처리

- runbook, past-solutions, Confluence, Jira 이력 기반 탐색
- Gate 1 분석 품질 검증
- 승인된 범위의 외부 시스템 실행
- Gate 2 실행 결과 + 보안 검증
- 의사결정 로그와 유관자 공유
- Gate 3 보고 품질 검증

### 3. 프로젝트 티켓 기본 조율

- Coordinator 스폰 기준
- 마일스톤 계획과 진행 추적
- 프로젝트 상태 보고 생성 규칙
- 마일스톤 단위 handoff와 review report

### 4. 공통 운영 계약

- task brief / tracker / ongoing plan / review report
- checkpoint / cleanup / rollback loop
- app-level `SECURITY`, `RELIABILITY`, `quality-criteria`
- `decision-tree.md` 기반 액션 분기 기준
- `feedback-loop.md` 기반 학습/개선 연결 기준

### 5. 지식 체계 활용

- runbook 템플릿
- past-solutions 템플릿
- glossary, escalation matrix
- raw intake 기록 규칙

### 6. 구현 전 설계 잠금

- `docs/design-docs/data-flow.md`
- `docs/design-docs/design-freeze-matrix.md`
- 구현 전에 잠가야 하는 설계와 병행/후속 보완 문서의 구분

## Out of Scope

- 확신도 낮음 상태의 완전 자율 실행
- 다중 조직 / 다중 테넌트 권한 모델
- 대시보드 UI 또는 운영 콘솔 구현
- 첨부파일 대량 처리, OCR, 비정형 문서 자동 추출
- Teams/Outlook/Jira 외의 추가 채널 확장
- self-healing 또는 자기 수정형 에이전트 구조

## V1 성공 기준

| 항목 | 기준 |
|---|---|
| 운영 티켓 기본 플로우 | 문서 기준으로 end-to-end 설명과 검증이 가능 |
| 상태 산출물 | 모든 처리에 생성 규칙이 적용됨 |
| 품질 판정 | Gate 1/2/3 pass/fail 기준이 문서화됨 |
| 보안 기준 | 보호 대상, 권한, 금지 흐름이 app-level로 명시됨 |
| 신뢰성 기준 | retry, recovery, rollback, 상태 복구 기준이 명시됨 |
| 보고 체계 | decision log와 stakeholder 보고가 연결됨 |

## 착수 차단 조건

아래가 남아 있으면 V1 착수를 시작하지 않는다.

- 범위와 비범위가 문서로 고정되지 않았다
- gate 기준이 검수자마다 다르게 해석된다
- app-level 보안 / 신뢰성 기준이 없다
- 데이터 흐름과 신뢰 경계가 문서로 고정되지 않았다
- 구현 전 필수 설계와 병행/후속 보완 문서의 구분이 없다
- tracker와 ongoing plan 없이 진행하는 예외가 남아 있다

## 후속 범위

다음 항목은 V1 이후로 미룬다.
아래는 기준 문서의 존재를 미루는 뜻이 아니라,
이미 잠긴 기준 위에 자동화나 정량화를 추가하는 후속 범위다.

- `decision-tree.md` 세부 액션 분기 자동화
- `feedback-loop.md`의 정량 학습 루프 상세
- 에이전트 페르소나 / 톤 규칙
