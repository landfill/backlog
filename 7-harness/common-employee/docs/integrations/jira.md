# Jira 연동 설계

## 역할

Jira는 에이전트 팀의 **주 입력/출력 채널**이다.
티켓이 배정되면 여기서 업무가 시작되고, 처리 결과가 여기에 기록된다.

## 현재 구현 상태

- 현재 런타임은 **Jira Cloud + API Token Basic auth**를 기준으로 구현되어 있다.
- 구현 경로:
  - `src/common_employee_runtime/jira.py` — Jira Cloud REST client
  - `src/common_employee_runtime/service.py` — Jira-backed runtime processing path
  - `src/common_employee_runtime/web.py` — Jira issue search/load/process UI
- 활성화 조건:
  - `ATLASSIAN_BASE_URL`
  - `ATLASSIAN_EMAIL`
  - `ATLASSIAN_API_TOKEN`
- 선택 설정:
  - `ATLASSIAN_JIRA_POLL_JQL` — 웹 콘솔의 기본 Jira 검색 JQL

현재 구현은 단일 운영자 환경을 기준으로 하며,
멀티유저 인증/세션 모델은 포함하지 않는다.

## 사용 에이전트별 권한

| 에이전트 | 읽기 | 쓰기 | 주요 용도 |
|---|---|---|---|
| Lead | ✅ | ❌ | 티켓 내용 읽기, 분류 판단 |
| Analyst | ✅ | ❌ | 유사 티켓 검색, 이력 조사 |
| Executor | ✅ | ✅ | 상태 변경, 댓글, 필드 업데이트, 티켓 생성 |
| Reporter | ✅ | ✅ (댓글만) | 처리 결과 댓글 작성 |
| Guardian | ✅ | ❌ | 실행 결과 검증용 조회 |
| Coordinator | ✅ | ✅ (하위작업) | 프로젝트 하위 작업 생성/관리 |

---

## 읽기 작업

### 티켓 조회

**트리거**: 티켓 배정 이벤트 수신 시

**조회 필드:**

| 필드 | 용도 | 사용 에이전트 |
|---|---|---|
| key | 티켓 ID | 전체 |
| summary | 제목 → 분류 키워드 추출 | Lead |
| description | 상세 내용 → 분류 + 솔루션 탐색 | Lead, Analyst |
| issuetype | 이슈유형 → 1차 분류 | Lead |
| project | 프로젝트 → 1차 분류 | Lead |
| priority | 우선순위 → 분류 보조 | Lead |
| labels | 레이블 → 분류 보조 | Lead |
| status | 현재 상태 | 전체 |
| assignee | 담당자 | Lead |
| reporter | 보고자 → 개입 요청 대상 | Lead |
| created | 생성일 → SLA 추적 | Coordinator |
| components | 컴포넌트 → 시스템 식별 | Analyst |
| comment | 댓글 이력 → 컨텍스트 파악 | Analyst |
| attachment | 첨부파일 → 추가 정보 | Analyst |
| issuelinks | 연결된 티켓 → 관련 이력 | Analyst |

현재 구현 메모:
- REST 경로: `GET /rest/api/3/issue/{issueIdOrKey}`
- description은 Atlassian Document Format(ADF)일 수 있으므로 plain text로 평탄화해서 런타임에 전달한다.

### 유사 티켓 검색 (Analyst)

**검색 방식**: JQL 기반

```
# 같은 프로젝트의 유사 키워드 티켓
project = {project} AND summary ~ "{keywords}" AND status = Done ORDER BY resolved DESC

# 같은 컴포넌트의 최근 해결 티켓
component = {component} AND status = Done AND resolved >= -90d ORDER BY resolved DESC

# 같은 보고자의 이전 티켓
reporter = {reporter} AND status = Done ORDER BY resolved DESC
```

**검색 제한**: 최대 20건/쿼리, 3개월 이내 우선

현재 구현 메모:
- REST 경로: `GET /rest/api/3/search`
- 웹 콘솔 dashboard에서 JQL 검색 결과를 바로 노출한다.

### 티켓 이벤트 감지

**방식**: 웹훅 또는 주기적 폴링

| 방식 | 장점 | 단점 |
|---|---|---|
| 웹훅 | 실시간 반응 | 설정 복잡, 서버 필요 |
| 폴링 | 설정 단순 | 지연 발생 (폴링 주기만큼) |

**감지 대상 이벤트:**
- 티켓 배정 (assignee 변경)
- 티켓 생성 (특정 프로젝트/필터)
- 댓글 추가 (사용자 응답 감지)
- 상태 변경 (외부에서 변경된 경우)

---

## 쓰기 작업

### 댓글 작성 (Executor, Reporter)

**사용 시점:**
- 처리 시작 알림
- 조사 결과 공유
- 처리 완료 보고
- 사용자에게 확인 요청

**형식 규칙:**
- 마크다운 사용 (Jira wiki markup 변환)
- 에이전트 식별자 포함: `[🤖 팀원에이전트]`로 시작
- 간결하게 작성 (핵심 내용 먼저, 상세는 접기/링크)

```markdown
[🤖 팀원에이전트] 처리 완료

**솔루션**: runbook 4.1절 "타임아웃 장애 대응" 절차 적용
**수행 내역**: 커넥션 풀 리셋 → 서비스 헬스체크 정상 확인
**판단 근거**: [의사결정 로그 링크]

확인이 필요하시면 댓글로 알려주세요.
```

현재 구현 메모:
- REST 경로: `POST /rest/api/3/issue/{issueIdOrKey}/comment`
- Jira Cloud v3 댓글 본문은 ADF 문서로 변환해 전송한다.
- 현재 코멘트는 런타임 결과(state/stage/classification/confidence/gates) 요약만 남긴다.

### 상태 변경 (Executor)

**허용 전환:**

| 현재 상태 | → 변경 가능 상태 | 조건 |
|---|---|---|
| 열림/할당됨 | 진행중 | 처리 시작 시 |
| 진행중 | 해결됨 | 처리 완료 + Gate 2 통과 |
| 진행중 | 보류 | 사용자 응답 대기 |
| 보류 | 진행중 | 사용자 응답 수신 |

**금지 전환:**
- 해결됨 → 종료: 사용자 확인 후에만 (에이전트가 직접 종료하지 않음)
- 어떤 상태 → 취소: Lead 승인 + 사용자 동의 필요

현재 구현 메모:
- REST 경로:
  - `GET /rest/api/3/issue/{issueIdOrKey}/transitions`
  - `POST /rest/api/3/issue/{issueIdOrKey}/transitions`
- 구현은 transition 이름/목적 상태 이름을 받아 현재 가능한 transition ID를 조회 후 실행한다.

### 필드 업데이트 (Executor)

**수정 가능 필드:**
- labels (에이전트 처리 태그 추가)
- components (분석 결과 기반 수정)
- priority (분석 결과 우선순위 조정 — Lead 승인 필요)

**수정 금지 필드:**
- reporter (변경 불가)
- assignee (에이전트가 임의로 재배정하지 않음)

### 티켓 생성 (Executor, Coordinator)

**생성 가능 유형:**
- 후속 작업 티켓 (운영 → 개선 후속)
- 프로젝트 하위 작업 (Coordinator)
- 버그 리포트 (처리 중 발견된 추가 이슈)

**필수 포함 정보:**
- 원본 티켓 링크 (issuelinks)
- 생성 근거 (description에 명시)
- 에이전트 생성 태그 (labels: `auto-created`)

---

## 에러 처리

| 에러 | 재시도 | 대응 |
|---|---|---|
| 401 Unauthorized | ❌ | 인증 토큰 만료 → Lead 보고 |
| 403 Forbidden | ❌ | 프로젝트 접근 권한 없음 → Lead 보고 |
| 404 Not Found | ❌ | 티켓 삭제됨/이동됨 → Lead 보고 |
| 429 Rate Limited | ✅ 3회 | Retry-After 준수 |
| 500/503 Server Error | ✅ 3회 | 1분/2분/5분 간격 |

---

## 데이터 매핑

### Jira 필드 → 분류 신호 매핑

이 매핑은 `ticket-triage.md`의 1차 판단에서 사용된다.
실제 Jira 인스턴스의 프로젝트/이슈유형에 맞게 구체화 필요.

```yaml
operational_signals:
  issue_types: ["Bug", "Service Request", "Incident", "Task"]
  projects: []          # 실제 운영 프로젝트 키 기입
  labels: ["ops", "incident", "hotfix", "support"]
  priority: ["Highest", "High"]

project_signals:
  issue_types: ["Story", "Epic", "Feature Request", "Improvement"]
  projects: []          # 실제 개발 프로젝트 키 기입
  labels: ["project", "feature", "enhancement", "migration"]
```

> ⚠️ 위 매핑은 실제 Jira 환경에 맞게 Phase 4 (도메인 지식 정제) 단계에서 구체화한다.
