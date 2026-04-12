# 인증 전략 (Auth Strategy)

## 목적

에이전트 팀이 외부 시스템에 접근하기 위한 인증/인가 방식을 정의한다.
모든 인증 정보는 코드/문서에 직접 포함하지 않는다.

---

## 인증 방식 개요

| 시스템 | 인증 방식 | 토큰 유형 |
|---|---|---|
| Jira | OAuth 2.0 또는 API Token | Bearer Token / Basic Auth |
| Confluence | OAuth 2.0 또는 API Token | Bearer Token / Basic Auth |
| Teams | Incoming Webhook | Webhook Secret URL |
| Outlook | SMTP Submission | SMTP Credential |

### Atlassian (Jira + Confluence)

**Cloud 환경:**
- OAuth 2.0 (3LO) 또는 API Token + Basic Auth
- API Token은 서비스 계정에 발급
- 현재 `common-employee`의 Jira 실구현은 **서비스 계정 + API Token + Basic Auth**를 사용한다

**Server/Data Center 환경:**
- Personal Access Token 또는 OAuth 1.0a
- 서비스 계정에 필요한 프로젝트/스페이스 권한만 부여

### Microsoft (Teams + Outlook)

- Teams는 고정 Incoming Webhook으로만 사용한다
- Teams는 진행 상황에 대한 셀프 알림만 보내며, DM/응답 수신/채널 탐색은 현재 범위에서 제외한다
- Outlook은 운영자가 UI에서 수신자를 직접 지정하고 발송 버튼을 눌렀을 때만 SMTP로 메일을 보낸다
- 메일 수신 모니터링, 메일함 읽기, Graph 기반 Outlook/Teams 자동화는 현재 범위에서 제외한다

---

## 인증 정보 저장

### 원칙

1. 인증 정보는 **환경 변수** 또는 **시크릿 매니저**에만 저장한다
2. 코드, 문서, 로그에 토큰/비밀번호를 절대 기록하지 않는다
3. 의사결정 로그에는 "인증 성공/실패" 사실만 기록한다

### 환경 변수 구조

```bash
# Atlassian
ATLASSIAN_BASE_URL=https://company.atlassian.net
ATLASSIAN_EMAIL=agent@company.com
ATLASSIAN_API_TOKEN=<시크릿 매니저에서 주입>
ATLASSIAN_JIRA_POLL_JQL=assignee = currentUser() AND statusCategory != Done ORDER BY updated DESC
ATLASSIAN_CONFLUENCE_BASE_URL=https://company-wiki.atlassian.net
ATLASSIAN_CONFLUENCE_SPACE=<Confluence space id>
ATLASSIAN_CONFLUENCE_PARENT_PAGE_ID=<Confluence parent page id, optional>
ATLASSIAN_CONFLUENCE_PUBLISH_MODE=manual

# Outlook SMTP
SMTP_HOST=<SMTP 서버 호스트>
SMTP_PORT=<SMTP 포트>
SMTP_USERNAME=<SMTP 계정>
SMTP_PASSWORD=<시크릿 매니저에서 주입>
SMTP_FROM_ADDRESS=<기본 발신 주소>
SMTP_FROM_NAME=<기본 발신 이름, optional>
SMTP_USE_STARTTLS=<true|false>

# Teams Webhook
TEAMS_PROGRESS_WEBHOOK_URL=<진행 알림용 Teams Incoming Webhook URL>
```

### `.env` 파일 사용

로컬 단일 운영자 환경에서는 `common-employee/.env` 파일로도 같은 값을 관리할 수 있다.

- 예시 파일: `common-employee/.env.example`
- 실제 비밀값 파일: `common-employee/.env` (git ignore)
- 우선순위:
  1. 프로세스 환경 변수
  2. workspace `.env`

즉, 배포/CI에서는 환경 변수 주입을 우선하고,
로컬 개발/검증에서는 `.env`를 사용할 수 있다.

### 시크릿 매니저 옵션

| 옵션 | 용도 |
|---|---|
| AWS Secrets Manager | AWS 환경 |
| Azure Key Vault | Azure 환경 |
| HashiCorp Vault | 멀티클라우드/온프레미스 |
| 환경 변수 (최소) | 초기 개발/PoC 단계 |

> 구현 단계에서 인프라 환경에 맞게 확정한다.
> 현재 Jira Cloud 실구현은 위 Atlassian 값 3개가 있어야 활성화된다.
> 현재 Confluence 실구현은 `ATLASSIAN_EMAIL`, `ATLASSIAN_API_TOKEN`, `ATLASSIAN_CONFLUENCE_SPACE`와, `ATLASSIAN_CONFLUENCE_BASE_URL` 또는 `ATLASSIAN_BASE_URL` 중 하나가 있어야 활성화된다.
> 현재 기준선은 Outlook SMTP 수동 발송과 Teams 웹훅 셀프 알림이다.
> Outlook 발송에는 SMTP 자격 증명이 필요하고, Teams 진행 알림에는 `TEAMS_PROGRESS_WEBHOOK_URL`이 필요하다.
> 메일 수신 모니터링, Teams 양방향 응답 수집, Graph 기반 권한 모델은 현재 baseline에 포함되지 않는다.
> 값은 환경 변수 또는 `common-employee/.env` 중 하나로 제공할 수 있다.

### 운영 smoke 확인

- readiness 확인:
  - `python3 -m common_employee_runtime.cli manual-delivery-smoke --workspace common-employee`
- 실제 smoke 발송:
  - `python3 -m common_employee_runtime.cli manual-delivery-smoke --workspace common-employee --send-outlook --outlook-to <recipient> --send-teams`
- 위 명령은 standalone smoke artifact를 `docs/generated/manual-delivery-smokes/` 아래에 남긴다.

---

## 권한 범위 (Least Privilege)

### Jira 서비스 계정 권한

| 권한 | 범위 | 이유 |
|---|---|---|
| Browse Projects | 지정된 프로젝트만 | 전체 프로젝트 접근 불필요 |
| Create Issues | 지정된 프로젝트만 | 후속 티켓/하위 작업 생성 |
| Edit Issues | 지정된 프로젝트만 | 상태 변경, 필드 업데이트 |
| Add Comments | 지정된 프로젝트만 | 처리 결과 기록 |
| Transition Issues | 지정된 프로젝트만 | 상태 전환 |

**제외 권한:**
- Delete Issues
- Administer Projects
- Manage Sprints

### Confluence 서비스 계정 권한

| 권한 | 범위 | 이유 |
|---|---|---|
| View | 지정된 스페이스 (지식 + 보고서) | 위키 검색, 참조 |
| Add | 보고서 스페이스만 | 보고서 페이지 생성 |
| Edit | 보고서 스페이스만 | 보고서 업데이트 |
| Add Comments | 지정된 스페이스 | 업데이트 코멘트 |

**제외 권한:**
- Delete
- Space Administration
- 지식 소스 스페이스 쓰기 (읽기만)

### Outlook SMTP / Teams Webhook 권한

| 연동 | 자격 증명 / 권한 | 범위 | 이유 |
|---|---|---|---|
| Outlook SMTP | SMTP 발송 계정 | 발송만, 메일 읽기 없음 | 운영자 UI에서 직접 지정한 수신자에게 메일 발송 |
| Teams Webhook | Incoming Webhook URL | 고정 채널 1곳 또는 허용된 소수 채널 | 진행 상황 셀프 알림 |

**제외 권한:**
- Microsoft Graph application / delegated mail 권한
- 메일함 읽기 권한
- Teams DM / 채널 탐색 / 응답 수집 권한
- Calendar, Files, User.ReadWrite 같은 비관련 권한

---

## 토큰 갱신

| 시스템 | 갱신 방식 | 만료 주기 |
|---|---|---|
| Atlassian API Token | 수동 갱신 (만료 없음, 주기적 교체 권장) | 90일마다 교체 권장 |
| Outlook SMTP / Teams Webhook | 장기 자격 증명 또는 시크릿 교체 | 운영 정책 기준 |

### 만료 감지

- 인증 실패 또는 시크릿 오류 발생 시 → Lead에 보고 + 관련 작업 일시 중단
- SMTP 로그인 실패나 웹훅 401/403/404는 자동 권한 상승 없이 설정 오류로 다룬다
- 의사결정 로그에 "인증/시크릿 오류로 처리 지연" 기록

---

## 보안 감사

### 정기 점검 항목

| 항목 | 주기 | 담당 |
|---|---|---|
| 서비스 계정/SMTP/Webhook 시크릿 검토 | 분기 1회 | 사람 (보안 담당) |
| API 토큰 교체 | 90일마다 | 사람 (인프라 담당) |
| 접근 로그 검토 | 월 1회 | Guardian (자동) + 사람 (검토) |
| 불필요 권한 제거 | 분기 1회 | 사람 (보안 담당) |

### Guardian의 보안 검증 (Gate 2)

- Executor가 외부 시스템에 쓰기 작업을 수행한 후
- Guardian이 "의도된 작업 범위 내인가"를 검증
- 의도하지 않은 리소스 접근 감지 시 → Lead 보고 + 사용자 개입
