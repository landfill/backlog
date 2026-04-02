# 학습 / 개선 루프 (Feedback Loop)

## 목적

이 문서는 티켓 처리 후 생성된 근거와 결과를
runbook, past-solution, 용어집, backlog 개선으로 연결하는 기준을 정의한다.

V1에서 학습 루프의 목적은 "판단을 더 잘하는 모델"이 아니라
"다음 처리에서 같은 해석 공백을 줄이는 문서 체계"를 유지하는 것이다.

## 기준 연결

- 처리 순서: `docs/product-specs/ticket-lifecycle.md`
- 의사결정 로그: `docs/agent-behaviors/decision-logging.md`
- 보고 규칙: `docs/agent-behaviors/reporting.md`
- 지식 정제: `docs/design-docs/knowledge-pipeline.md`
- 품질 판정: `docs/product-specs/quality-criteria.md`

## 루프의 단위

- 운영 티켓 1건 완료
- 프로젝트 마일스톤 1건 완료
- 주간 보고 1회 집계

## 출력 종류

- 변경 없음
- past-solution 신규 추가 또는 갱신
- runbook 신규 추가 제안 또는 갱신 제안
- glossary 갱신 제안
- 설계/정책 backlog 추가

## 역할 책임

| 역할 | 책임 |
|---|---|
| Analyst | 새 패턴, 재사용 가능성, 매뉴얼 갭 감지 |
| Reporter | decision log와 주간 보고를 바탕으로 문서 보강 제안 기록 |
| Guardian | 반복 반려, 보안/품질 패턴 감지 |
| Lead | 제안 우선순위 판단, backlog 승격 판단 |

## 전체 루프

```text
티켓 또는 마일스톤 완료
  ↓
[Analyst / Guardian / Reporter] 학습 신호 감지
  ↓
[1] 신호 유형 분류
  ├─ 단건 성공 사례
  ├─ 반복 패턴
  ├─ 매뉴얼 갭
  ├─ 용어/정책 모호성
  └─ 반복 반려 / 반복 에스컬레이션
  ↓
[2] 출력 유형 결정
  ├─ past-solution 갱신
  ├─ runbook 제안
  ├─ glossary 제안
  ├─ backlog 추가
  └─ 변경 없음
  ↓
[3] 기록
  ├─ decision log 학습 포인트
  ├─ ongoing plan / review report open risk
  └─ 주간 보고의 개선 항목
  ↓
[4] 반영
  ├─ Reporter가 문서 초안 또는 제안 생성
  └─ Lead가 우선순위와 즉시 반영 여부를 결정
```

## 1. 신호 유형 분류

### 단건 성공 사례

아래 조건이면 `past-solution` 후보로 본다.

- 특정 증상과 해결 방법이 한 처리 단위 안에서 닫혔다
- 실행 근거와 결과가 decision log에 남아 있다
- 다음에 유사 상황이 오면 재사용 가치가 있다

### 반복 패턴

아래 조건이면 `runbook` 후보로 본다.

- 같은 또는 매우 유사한 처리 패턴이 2회 이상 반복됐다
- 단계 순서와 예외 조건을 절차로 일반화할 수 있다
- 단일 담당자 경험이 아니라 팀 공통 기준으로 올릴 가치가 있다

### 매뉴얼 갭

아래 조건이면 runbook 보강 후보로 본다.

- 솔루션 후보를 찾지 못해 사람 개입으로 넘어갔다
- 기존 runbook이 현재 문제를 커버하지 못했다
- past-solution만 있고 공식 절차는 없다

### 용어/정책 모호성

아래 조건이면 glossary 또는 설계 문서 보강 후보로 본다.

- 같은 용어를 문서나 역할별로 다르게 해석했다
- 사람 개입 요청 사유가 용어 모호성 때문이었다
- Guardian 반려 사유가 정의 불일치였다

### 반복 반려 / 반복 에스컬레이션

아래 조건이면 backlog 후보로 본다.

- 같은 root cause로 Gate 반려가 반복된다
- 같은 사유의 에스컬레이션이 반복된다
- 현재 runbook/past-solution 수준이 아니라 설계나 정책 변경이 필요하다

## 2. 출력 유형 결정 규칙

### `past-solution`으로 반영

아래 조건을 만족하면 Reporter가 사례 문서를 추가하거나 갱신한다.

- 단건 해결 사례다
- 원인과 해결 순서가 충분히 남아 있다
- 아직 일반 절차로 승격할 만큼 반복되진 않았다

### `runbook`으로 승격 또는 보강

아래 조건이면 Reporter가 runbook 추가 제안을 남긴다.

- 유사 사례가 2건 이상이다
- 적용 조건과 비적용 조건을 설명할 수 있다
- 절차로 재사용 가능하다

### `glossary` 보강

아래 조건이면 Reporter가 glossary 항목 추가/수정을 제안한다.

- 역할, 상태, 용어가 문서마다 다르게 읽힌다
- 사용자나 유관자와의 커뮤니케이션에서 오해가 발생했다

### backlog 추가

아래 조건이면 Lead가 backlog 문서 작업으로 승격한다.

- 설계 문서 자체의 분기 기준이 부족하다
- 보안/신뢰성/권한 구조 재설계가 필요하다
- 팀 공통 규칙까지 영향을 준다

### 변경 없음

아래면 기록만 남기고 문서 변경은 생략한다.

- 기존 runbook과 past-solution으로 충분히 설명된다
- 새로운 패턴이나 갭이 없다

## 3. 기록 위치

### 처리 직후

- decision log의 `학습 포인트`
- ongoing plan의 `Issues`
- review report의 `Open Risks`

### 주간 집계

- `weekly` 보고서의 `새로운 패턴 / 매뉴얼 갭`
- `반복 에스컬레이션 분석`

## 4. 즉시 반영 vs backlog 반영

### 즉시 반영

아래면 같은 사이클 안에서 문서 보강을 바로 제안할 수 있다.

- 단일 사례를 `past-solution`으로 정리하는 작업
- glossary의 단순 정의 추가
- 이미 존재하는 runbook의 명백한 누락 보완 제안

### backlog 반영

아래면 별도 task brief를 연다.

- 새로운 runbook 체계 추가
- 정책/역할/분기 기준 재설계
- 지표 체계나 보고 구조 변경

## 5. 우선순위 규칙

Lead는 아래 순서로 우선순위를 둔다.

1. 보안/권한/데이터 보호와 연결된 갭
2. 자동 진행을 막는 반복 차단 요인
3. 반복되는 사람 개입 사유
4. 재사용 가치가 높은 성공 사례
5. 표현/톤 수준의 비핵심 개선

## V1에서 반드시 닫는 루프

V1 구현은 아래 루프까지만 닫으면 된다.

- 완료 처리 → decision log 학습 포인트 기록
- 새 사례 발견 → past-solution 추가 제안
- 반복 패턴 발견 → runbook 추가 또는 보강 제안
- 용어 모호성 발견 → glossary 보강 제안
- 반복 반려/에스컬레이션 발견 → backlog 추가

아래는 V1 이후로 미룬다.

- 자동 점수화 기반 우선순위 엔진
- 자율적인 문서 승격/배포
- 통계 기반 자기 최적화

## 구현 경계

구현 단계에서 바꿔도 되는 것:
- 신호 감지 자동화 방식
- 보고서 집계 쿼리 세부 구현
- 제안 문서 생성 템플릿의 표현

구현 단계에서 바꾸면 안 되는 것:
- 학습 신호의 분류 종류
- `past-solution` / `runbook` / `glossary` / backlog로 가는 기본 규칙
- Lead가 우선순위를 정한다는 책임 구조
