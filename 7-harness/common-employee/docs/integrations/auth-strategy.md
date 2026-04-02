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
| Teams | Microsoft Graph API (OAuth 2.0) | Bearer Token |
| Outlook | Microsoft Graph API (OAuth 2.0) | Bearer Token |

### Atlassian (Jira + Confluence)

**Cloud 환경:**
- OAuth 2.0 (3LO) 또는 API Token + Basic Auth
- API Token은 서비스 계정에 발급

**Server/Data Center 환경:**
- Personal Access Token 또는 OAuth 1.0a
- 서비스 계정에 필요한 프로젝트/스페이스 권한만 부여

### Microsoft (Teams + Outlook)

- Microsoft Graph API 사용
- Azure AD에 앱 등록 → Client Credentials 또는 Delegated 권한
- 에이전트 전용 서비스 계정으로 인증

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

# Microsoft Graph
MS_TENANT_ID=<Azure AD 테넌트>
MS_CLIENT_ID=<앱 등록 클라이언트 ID>
MS_CLIENT_SECRET=<시크릿 매니저에서 주입>
```

### 시크릿 매니저 옵션

| 옵션 | 용도 |
|---|---|
| AWS Secrets Manager | AWS 환경 |
| Azure Key Vault | Azure 환경 |
| HashiCorp Vault | 멀티클라우드/온프레미스 |
| 환경 변수 (최소) | 초기 개발/PoC 단계 |

> 구현 단계에서 인프라 환경에 맞게 확정한다.

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

### Microsoft Graph 권한

| 권한 | 유형 | 이유 |
|---|---|---|
| Chat.ReadWrite | Application | Teams 메시지 발송/읽기 |
| ChannelMessage.Send | Application | 채널 메시지 발송 |
| Mail.Send | Application | Outlook 메일 발송 |
| Mail.Read | Application | 수신 메일 모니터링 |

**제외 권한:**
- Calendar (일정 접근 불필요)
- Files (파일 접근 불필요)
- User.ReadWrite (사용자 정보 수정 불필요)

---

## 토큰 갱신

| 시스템 | 갱신 방식 | 만료 주기 |
|---|---|---|
| Atlassian API Token | 수동 갱신 (만료 없음, 주기적 교체 권장) | 90일마다 교체 권장 |
| Microsoft OAuth | 자동 갱신 (refresh token) | access token: 1시간, refresh token: 90일 |

### 만료 감지

- API 호출 시 401 응답 → 토큰 갱신 시도
- 갱신 실패 → Lead에 보고 + 관련 작업 일시 중단
- 의사결정 로그에 "인증 만료로 처리 지연" 기록

---

## 보안 감사

### 정기 점검 항목

| 항목 | 주기 | 담당 |
|---|---|---|
| 서비스 계정 권한 검토 | 분기 1회 | 사람 (보안 담당) |
| API 토큰 교체 | 90일마다 | 사람 (인프라 담당) |
| 접근 로그 검토 | 월 1회 | Guardian (자동) + 사람 (검토) |
| 불필요 권한 제거 | 분기 1회 | 사람 (보안 담당) |

### Guardian의 보안 검증 (Gate 2)

- Executor가 외부 시스템에 쓰기 작업을 수행한 후
- Guardian이 "의도된 작업 범위 내인가"를 검증
- 의도하지 않은 리소스 접근 감지 시 → Lead 보고 + 사용자 개입
