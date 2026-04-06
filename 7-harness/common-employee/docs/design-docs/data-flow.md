# 데이터 흐름 설계 (Data Flow)

## 목적

이 문서는 `common-employee` 앱의 상세 데이터 흐름과 신뢰 경계를 정의한다.
`ARCHITECTURE.md`가 시스템 구조의 개요를 설명한다면,
이 문서는 구현 전에 고정해야 하는 데이터 이동, 저장 위치, 요약/마스킹 규칙을 잠그는 기준이다.

구현 에이전트는 이 문서를 기준으로
"어떤 정보를 어디에 남길 수 있는가"와
"어떤 정보는 요약만 남겨야 하는가"를 판단한다.

## 단일 기준 연결

- 처리 단계 순서: `docs/product-specs/ticket-lifecycle.md`
- 분기와 승인 경로: `docs/product-specs/decision-tree.md`
- 보호 대상과 금지 흐름: `docs/SECURITY.md`
- 실패, 복구, 재시도: `docs/RELIABILITY.md`
- 상태 산출물 위치와 형식: `docs/status/README.md`
- 구현 전 고정 여부: `docs/design-docs/design-freeze-matrix.md`

## 데이터 단위

| 데이터 단위 | 예시 | 기본 등급 | 기본 처리 |
|---|---|---|---|
| 티켓 메타데이터 | 티켓 ID, 상태, 담당자, 우선순위, 링크 | Internal | `tracker`, `task brief`, `ongoing plan`에 요약 기록 가능 |
| 업무 본문 요약 | 문제 한 줄 설명, 영향 범위 요약 | Internal 또는 Sensitive | 필요한 최소 요약만 상태 문서와 로그에 기록 |
| 원문 본문 / 메일 / 채팅 / 첨부 | Jira 본문 원문, Teams 대화, Outlook 메일, 첨부파일 | Sensitive | 기본 장기 저장 금지, 예외 시 `docs/domain-knowledge/raw/`와 intake 이유 필요 |
| 자격 증명 / 세션 정보 | API 키, OAuth 토큰, 비밀번호, 세션 쿠키 | Restricted | 문서/로그/LLM 입력 금지 |
| 탐색 근거 | runbook 경로, 과거 사례 ID, Confluence 링크 | Internal | `ongoing plan`, `review report`, `decision log`에 참조 근거로 기록 |
| 실행 의도 | 대상 시스템, 액션, 위험도, 승인 흔적 | Internal | 실행 전에 `task brief` 또는 `ongoing plan`에 남긴다 |
| 실행 결과 | 상태 변경 결과, 생성된 링크, 변경 ID, 실패 원인 | Internal | `ongoing plan`, `review report`, `tracker` 요약에 기록 |
| 외부 공유 메시지 | Jira 댓글, Teams 알림, Outlook 메일 요약 | Internal 또는 Public | 필요한 최소 결과만 공유하고 원문 복제보다 링크를 우선 |

데이터 등급의 의미와 차단 조건은 `docs/SECURITY.md`를 단일 기준으로 따른다.

## 신뢰 경계

데이터 이동은 아래 경계를 넘을 때마다 최소화와 검증을 수행한다.

- 외부 시스템 → 에이전트 실행 환경
- 로컬 브라우저 → 웹 콘솔 엔드포인트
- 에이전트 실행 환경 → `runtime/autonomous-runtime.db`
- `runtime/autonomous-runtime.db` → 상태 산출물 Markdown
- `runtime/autonomous-runtime.db` / 상태 산출물 → 로컬 웹 콘솔 읽기 화면
- 에이전트 실행 환경 → 상태 산출물 (`tracker`, `task brief`, `ongoing plan`, `review report`)
- 상태 산출물 → `decision log`와 보고서
- 내부 상태 문서 → Jira / Teams / Outlook / Confluence 같은 외부 공유 채널
- 사람 승인 전 → 사람 승인 후 실행

## 단계별 흐름

### 1. 수신과 분류

출발점:
- Jira 티켓 배정 이벤트

허용 출력:
- `tracker.md`의 현재 작업 요약
- `task brief`의 목표와 범위 초안
- `ongoing plan`의 현재 상태

금지:
- 티켓 원문 전체를 `tracker.md`에 복사
- 민감 본문을 분류 편의만으로 장기 저장

### 2. 탐색과 근거 정리

입력 소스:
- `runbooks/`
- `past-solutions/`
- Confluence
- Jira 유사 티켓 이력

허용 출력:
- `ongoing plan`의 evidence
- Gate 1 요청용 요약
- `decision log`의 판단 근거 요약

조건부 허용:
- 원문 보존이 꼭 필요하면 `docs/domain-knowledge/raw/`에 저장하되 intake 이유와 출처를 남긴다

금지:
- 메일/채팅/첨부 원문을 그대로 `decision log`나 보고서에 복사

### 3. 계획과 승인 경로 고정

Lead 또는 Coordinator는 아래를 실행 전에 고정한다.

- 현재 작업 범위
- 확신도
- 사람 개입 필요 여부
- 액션 위험도
- 외부 쓰기 대상과 순서

허용 출력:
- `task brief`
- `ongoing plan`
- 필요 시 승인 흔적이 포함된 `review report`

금지:
- 승인 경로가 정해지지 않은 상태에서 외부 쓰기 구현을 시작

### 4. 실행과 반영 확인

Executor는 승인된 액션만 수행한다.

반드시 남길 것:
- 대상 시스템
- 실제 액션
- 결과 또는 실패
- 높음 위험도 액션의 현재 상태 보존 흔적

결과가 불명확하면:
- 자동 재시도하지 않는다
- 현재 외부 상태를 먼저 확인한다
- 설명 불가 상태면 `BLOCKED`로 전환한다

### 4-A. 로컬 웹 콘솔

웹 콘솔은 새로운 업무 로직을 추가하지 않고
기존 runtime service와 상태 산출물을 브라우저로 노출하는 얇은 표면이다.

허용 입력:
- mock/manual intake JSON
- Jira issue key
- Jira search JQL
- operator-supplied knowledge/actions JSON

허용 출력:
- 최근 run 목록
- 개별 run의 gate 결과와 event 요약
- `docs/status/*`, `docs/generated/decision-logs/*` 안의 generated artifact
- Jira search 결과 요약
- Jira issue 본문 요약

금지:
- `runtime/autonomous-runtime.db` 원시 테이블 직접 노출
- 워크스페이스 밖 파일 경로 열람
- 민감 원문을 redaction 없이 브라우저에 렌더링

### 4-B. Jira-backed processing

웹 콘솔 또는 런타임이 Jira issue를 직접 다룰 때는 아래 흐름을 따른다.

1. Jira issue 메타데이터 조회
2. description(ADF 가능)을 plain text로 평탄화
3. operator가 knowledge/actions를 보완
4. 기존 runtime service 경로로 처리
5. 승인된 결과만 Jira comment / transition으로 동기화

추가 금지:
- Jira 원문을 장기 보관용 local artifact에 그대로 복제
- transition 가능 여부 확인 없이 상태 변경 시도
- 허용되지 않은 프로젝트/티켓에 서비스 계정으로 쓰기

### 5. 보고와 외부 공유

Reporter는 실행 결과를 사람과 시스템이 다시 읽을 수 있는 형태로 바꾼다.

허용 출력:
- `decision log`
- Jira 댓글
- Teams 알림
- Outlook 메일
- 프로젝트성인 경우 Confluence 보고서

규칙:
- 외부 공유는 결과와 필요한 근거만 남긴다
- 민감 원문 대신 요약과 링크를 우선한다
- 상태 산출물과 외부 공유 내용이 어긋나면 공유를 중단하고 상태부터 정정한다

### 6. 학습과 지식 정제

완료 후 학습 단계에서는 아래 흐름을 따른다.

- 새 패턴 감지 → `feedback-loop.md` 기준으로 보강 후보 등록
- 반복된 해결책 → `past-solutions/` 반영 후보로 연결
- 운영 매뉴얼 갭 → `runbooks/` 업데이트 제안
- 원문 참고 자료가 필요할 때만 `raw/`와 intake 기록 사용

## 상태 산출물별 허용 정보

| 산출물 | 남기는 정보 | 남기면 안 되는 정보 |
|---|---|---|
| `tracker.md` | 현재 owner, 현재 작업 제목, verdict, next action 같은 대표 상태 | 민감 원문, 상세 실행 로그 |
| `task brief` | 목표, 범위, 완료 기준, 검증 계획, 리스크 요약 | 자격 증명, 장문의 원문 복사 |
| `ongoing plan` | 현재 evidence, 실패 원인, 마지막 안전 지점, 다음 단계 | 불필요한 원문 전체 복제 |
| `review report` | verdict, checked, evidence, cleanup 상태, open risk | 민감 본문 원문, 설명 없는 verdict |
| `decision log` | 판단 근거, 참조 경로, 마스킹된 발췌, 판단 주체 | 비밀값, 원문 전체, 불필요한 개인정보 |
| `runtime/autonomous-runtime.db` | ticket key, stage, verdict, attempts, redacted evidence reference | Restricted/Sensitive 원문, 자격 증명, 원문 첨부 |
| 로컬 웹 콘솔 화면 | redacted run summary, gate 결과, generated artifact 내용 | DB 원시 dump, 워크스페이스 밖 파일, 비밀값 |

## LLM 입력 경계

허용:
- 티켓 메타데이터
- 문제 요약
- 마스킹된 발췌
- runbook과 past-solution의 필요한 일부
- 상태 산출물에 이미 남겨진 요약 정보

조건부 허용:
- 분류나 답변 생성을 위해 꼭 필요한 민감 본문 일부
- 직접 식별자와 불필요한 문맥을 제거한 뒤 최소 범위만 사용

금지:
- API 키, 토큰, 비밀번호, 세션 값
- 불필요한 메일/채팅 원문 전체
- 정제되지 않은 첨부파일 전체를 그대로 입력하는 행위

데이터 등급이 불명확하면 보수적으로 해석하고 자동 진행을 멈춘다.

## 구현 전 고정 규칙

아래 중 하나라도 해당하면 구현 중 임의 판단으로 메우지 않는다.

- 어떤 데이터가 어떤 등급인지 분류할 수 없다
- 어느 상태 산출물에 남겨야 하는지 결정되지 않았다
- 새 외부 시스템 액션이나 새 위험도 경로가 필요하다
- 외부 공유에 원문 복제가 필요한데 최소화 기준이 없다
- LLM 입력에 민감 데이터를 어느 수준까지 넣을지 불명확하다

이 경우 구현 에이전트는 `docs/design-docs/design-freeze-matrix.md` 기준으로
설계 보완을 먼저 요청해야 한다.
