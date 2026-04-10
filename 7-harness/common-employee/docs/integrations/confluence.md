# Confluence 연동 설계

## 역할

Confluence는 **지식 소스(읽기) + 보고 대상(쓰기)** 이중 역할을 한다.
Analyst가 솔루션 탐색 시 위키를 검색하고, Reporter/Executor가 보고서를 페이지로 생성 또는 갱신한다.

## 현재 구현 상태

- 현재 런타임은 **Atlassian Cloud + API Token Basic auth**를 기준으로 Confluence 읽기/쓰기 경로를 구현한다.
- 구현 경로:
  - `src/common_employee_runtime/confluence.py` — Confluence REST client
  - `src/common_employee_runtime/service.py` — publish mode 및 page create/update flow
  - `src/common_employee_runtime/web.py` — Confluence search/read/manual publish UI
- 활성화 조건:
  - `ATLASSIAN_BASE_URL`
  - `ATLASSIAN_EMAIL`
  - `ATLASSIAN_API_TOKEN`
  - `ATLASSIAN_CONFLUENCE_SPACE`
- 선택 설정:
  - `ATLASSIAN_CONFLUENCE_PARENT_PAGE_ID`
  - `ATLASSIAN_CONFLUENCE_PUBLISH_MODE=manual|immediate`

현재 구현은 단일 운영자 환경을 기준으로 하며,
기본 publish mode는 `manual`이다.
즉시 발행은 웹 콘솔 또는 설정에서 `immediate`로 전환했을 때만 활성화된다.
Confluence는 Jira와 같은 `ATLASSIAN_API_TOKEN`을 재사용한다.

## 사용 에이전트별 권한

| 에이전트 | 읽기 | 쓰기 | 주요 용도 |
|---|---|---|---|
| Analyst | ✅ | ❌ | 위키 검색, 매뉴얼 참조, 지식 수집 |
| Executor | ❌ | ✅ | 보고서 페이지 생성/업데이트 |
| Reporter | ✅ | ✅ (초안) | 보고서 초안 작성, 기존 페이지 참조 |
| Guardian | ✅ | ❌ | 보고서 내용 검증 |
| Coordinator | ✅ | ❌ | 프로젝트 문서 참조 |

---

## 읽기 작업

### 위키 검색 (Analyst)

**검색 전략:**

1. **제목 기반 검색**: 키워드 + space 제한

```yaml
space_id: "ATLASSIAN_CONFLUENCE_SPACE"
title_contains: "{keyword}"
limit: 10
```

현재 구현 메모:
- REST 경로: `GET /wiki/api/v2/pages`
- query: `title`, `space-id`, `limit`
- 웹 콘솔 dashboard에서 page title 검색 결과를 바로 노출한다.

2. **검색 결과 처리**
- 최대 10건/쿼리
- 결과에서 page id, 제목, 상태를 추출
- 관련도가 높은 페이지는 본문을 추가 조회

### 페이지 본문 조회 (Analyst)

**조회 대상**: 검색 결과에서 관련도 높은 페이지

**추출 항목:**
- 본문 storage value
- page id / status / version

현재 구현 메모:
- REST 경로: `GET /wiki/api/v2/pages/{pageId}`
- query: `body-format=storage`

---

## 쓰기 작업

### 보고서 페이지 생성 (Executor, Reporter 초안)

**생성 플로우:**

```
[Reporter] 보고서 초안 작성
  ↓
[Guardian] Gate 3: 보고서 품질 검증
  ↓
[Executor] Confluence 페이지 생성 또는 업데이트
```

**페이지 구조 규칙:**

| 항목 | 규칙 |
|---|---|
| 스페이스 | `ATLASSIAN_CONFLUENCE_SPACE` |
| 부모 페이지 | `ATLASSIAN_CONFLUENCE_PARENT_PAGE_ID`가 있으면 그 하위에 생성 |
| 제목 형식 | 기본값: `{ticket_key} runtime report`, 웹 콘솔에서 override 가능 |
| 본문 형식 | Confluence storage body |
| 생성 소스 | 로컬 decision log 기반 redacted body |

### Publish mode

| 모드 | 동작 |
|---|---|
| `manual` | runtime 성공 후 발행 준비 상태만 남기고, 웹 콘솔의 `Publish to Confluence` 버튼으로 실제 발행 |
| `immediate` | runtime 성공 직후 서비스가 페이지를 즉시 생성/업데이트 |

현재 구현 메모:
- 기본값은 `manual`
- `manual`은 초기 운영 안전 모드
- `immediate`는 자율 운영 전환 시 설정만으로 활성화할 수 있게 같은 서비스 계약을 유지한다

### 페이지 업데이트 (Executor)

**업데이트 대상**: 기존 프로젝트 상태 보고서, 누적 문서

**안전 규칙:**
- 업데이트 전 현재 버전 번호 확인
- 충돌 발생 시 업데이트 중단 + Lead 보고
- 기존 내용 삭제 금지
- 수정 이력에 에이전트 식별자 포함

현재 구현 메모:
- REST 경로: `PUT /wiki/api/v2/pages/{pageId}`
- 요청에는 `version.number + 1`을 포함한다
- 웹 콘솔 수동 발행 시 `page_id`, `version_number`를 같이 넣어 update 대상으로 지정할 수 있다

---

## 지식 정제 연동

### 원본 자료 수집 (Analyst)

Phase 4에서 활성화. Confluence에서 매뉴얼성 자료를 추출하여 `raw/`에 저장한다.

현재 phase에서는 **live search/read와 report publish**까지만 구현하고,
bulk raw-content ingestion은 후속 범위로 남긴다.

---

## 에러 처리

| 에러 | 재시도 | 대응 |
|---|---|---|
| 401 Unauthorized | ❌ | 인증 토큰 만료 → Lead 보고 |
| 403 Forbidden | ❌ | 스페이스 접근 권한 없음 → Lead 보고 |
| 404 Not Found | ❌ | 페이지 삭제됨 → 검색 결과에서 제외 |
| 409 Conflict | ❌ | 버전 충돌 → 최신 버전 재조회 후 재시도 1회 |
| 429 Rate Limited | ✅ 3회 | Retry-After 준수 |
| 500/503 Server Error | ✅ 3회 | 1분/2분/5분 간격 |
