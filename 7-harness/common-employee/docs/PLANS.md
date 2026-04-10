# 실행 로드맵 (Plans)

## 상태 기준

- 아래 `완료` 표시는 각 phase의 **핵심 산출물 기준**이다.
- 구현 전 필수 설계와 병행/후속 backlog 구분은 `docs/design-docs/design-freeze-matrix.md`를 기준으로 본다.
- 예정 문서와 확장 설계는 별도 backlog로 관리한다.
- 현재 작업 상태는 `docs/status/tracker.md`를 기준으로 본다.

## 현재 요약

- 핵심 설계/행동/연동/보고 문서는 구축 완료
- 저장소 운영 계약 정렬 완료
- 착수 전 품질/보안/신뢰성/V1 범위 문서 보강 완료
- 구현 전 필수 분기/데이터 흐름/설계 잠금 기준 보강 완료
- 자율 운영 런타임 기초 골격 구현 완료
- 로컬 웹 콘솔까지 포함한 runtime 운영 표면 구현 완료
- Jira Cloud-backed single-operator service 구현 및 live smoke 완료
- Confluence live integration 구현 및 live smoke verification 완료
- Microsoft Graph messaging phase는 히스토리로 보존
- 현재 M365 기준선은 Outlook 수동 SMTP 발송 + Teams 웹훅 셀프 알림으로 재정렬 중
- 남은 예정 문서는 후속 backlog로 관리

---

## Phase 구조

팀원 에이전트는 7개 Phase로 나누어 구축한다.
각 Phase는 이전 Phase의 산출물에 의존한다.

## Phase 1: 기반 — ✅ 완료

에이전트의 정체성, 설계 철학, 시스템 구조를 정의한다.

| 산출물 | 상태 |
|---|---|
| `AGENTS.md` | ✅ 완료 |
| `docs/design-docs/core-beliefs.md` | ✅ 완료 |
| `ARCHITECTURE.md` | ✅ 완료 |

## Phase 2: 핵심 행동 정의 — ✅ 완료

에이전트가 "무엇을 하는가"를 정의한다.

| 산출물 | 상태 |
|---|---|
| `docs/agent-behaviors/decision-logging.md` | ✅ 완료 |
| `docs/agent-behaviors/ticket-triage.md` | ✅ 완료 |
| `docs/agent-behaviors/human-in-the-loop.md` | ✅ 완료 |
| `docs/agent-behaviors/solution-lookup.md` | ✅ 완료 |
| `docs/agent-behaviors/auto-resolution.md` | ✅ 완료 |

## Phase 3: 외부 연동 + 제품 스펙 — ✅ 완료

에이전트가 "어떻게 하는가"를 정의한다.

| 산출물 | 상태 |
|---|---|
| `docs/integrations/jira.md` | ✅ 완료 |
| `docs/integrations/confluence.md` | ✅ 완료 |
| `docs/integrations/teams.md` | ✅ 완료 |
| `docs/integrations/outlook.md` | ✅ 완료 |
| `docs/integrations/auth-strategy.md` | ✅ 완료 |
| `docs/product-specs/ticket-lifecycle.md` | ✅ 완료 |

## Phase 4: 지식 체계 — ✅ 완료

에이전트가 "무엇을 알아야 하는가"를 정의한다.

| 산출물 | 상태 |
|---|---|
| `docs/design-docs/knowledge-pipeline.md` | ✅ 완료 |
| `docs/domain-knowledge/runbooks/_template.md` | ✅ 완료 |
| `docs/domain-knowledge/past-solutions/_template.md` | ✅ 완료 |
| `docs/domain-knowledge/escalation-matrix.md` | ✅ 완료 |
| `docs/domain-knowledge/glossary.md` | ✅ 완료 |

## Phase 5: 보고 & 커뮤니케이션 — ✅ 완료

에이전트의 출력물 형식을 정의한다.

| 산출물 | 상태 |
|---|---|
| `docs/agent-behaviors/reporting.md` | ✅ 완료 |
| `docs/agent-behaviors/communication.md` | ✅ 완료 |
| `docs/agent-behaviors/project-management.md` | ✅ 완료 |
| `docs/templates/reports/daily-leader.md` | ✅ 완료 |
| `docs/templates/reports/weekly-leader.md` | ✅ 완료 |
| `docs/templates/reports/stakeholder-update.md` | ✅ 완료 |
| `docs/templates/ticket-response.md` | ✅ 완료 |
| `docs/templates/escalation-notice.md` | ✅ 완료 |
| `docs/templates/project-status.md` | ✅ 완료 |

## Phase 6: 운영 정렬 — ✅ 완료

저장소 공통 operating loop를 앱 문맥에 맞게 연결한다.

| 산출물 | 상태 |
|---|---|
| `AGENTS.md` | ✅ 정렬 완료 |
| `ARCHITECTURE.md` | ✅ 정렬 완료 |
| `docs/product-specs/ticket-lifecycle.md` | ✅ 정렬 완료 |
| `docs/agent-behaviors/project-management.md` | ✅ 정렬 완료 |
| `docs/agent-behaviors/reporting.md` | ✅ 정렬 완료 |
| `docs/status/README.md` | ✅ 추가 완료 |
| `docs/status/tracker.md` | ✅ 추가 완료 |
| `docs/status/ongoing/README.md` | ✅ 추가 완료 |
| `docs/status/completed/README.md` | ✅ 추가 완료 |

## Phase 7: 착수 전 보강 — ✅ 완료

실제 프로젝트 착수 전에 필요한 범위, 품질, 보안, 신뢰성, 데이터 흐름, 설계 잠금 기준을 잠근다.

| 산출물 | 상태 |
|---|---|
| `AGENTS.md` | ✅ 정렬 완료 |
| `ARCHITECTURE.md` | ✅ 정렬 완료 |
| `docs/product-specs/v1-scope.md` | ✅ 추가 완료 |
| `docs/product-specs/quality-criteria.md` | ✅ 추가 완료 |
| `docs/product-specs/decision-tree.md` | ✅ 추가 완료 |
| `docs/product-specs/feedback-loop.md` | ✅ 추가 완료 |
| `docs/product-specs/index.md` | ✅ 정렬 완료 |
| `docs/SECURITY.md` | ✅ 추가 완료 |
| `docs/RELIABILITY.md` | ✅ 추가 완료 |
| `docs/design-docs/data-flow.md` | ✅ 추가 완료 |
| `docs/design-docs/design-freeze-matrix.md` | ✅ 추가 완료 |
| `docs/pre-kickoff-checklist.md` | ✅ 추가 완료 |
| `docs/PLANS.md` | ✅ 갱신 완료 |

## Phase 8: 자율 운영 런타임 기반 — ✅ 완료

문서 계약을 실제 서비스 상태 전이와 gate 정책으로 옮기는 최소 실행 런타임을 구축한다.

| 산출물 | 상태 |
|---|---|
| `src/common_employee_runtime/service.py` | ✅ 추가 완료 |
| `src/common_employee_runtime/store.py` | ✅ 추가 완료 |
| `src/common_employee_runtime/cli.py` | ✅ 추가 완료 |
| `tests/test_runtime_service.py` | ✅ 추가 완료 |
| `runtime/.gitignore` | ✅ 추가 완료 |
| `docs/plans/2026-04-06-autonomous-runtime-design.md` | ✅ 추가 완료 |
| `docs/plans/2026-04-06-autonomous-runtime-implementation.md` | ✅ 추가 완료 |

## Phase 9: 로컬 웹 UI 운영 콘솔 — ✅ 완료

문서와 런타임 상태를 그대로 재사용하는 로컬 브라우저 운영 콘솔을 추가한다.

| 산출물 | 상태 |
|---|---|
| `src/common_employee_runtime/web.py` | ✅ 추가 완료 |
| `pyproject.toml` (`common-employee-web` entrypoint) | ✅ 갱신 완료 |
| `tests/test_runtime_service.py` | ✅ 웹 콘솔 검증 추가 완료 |
| `docs/plans/2026-04-06-web-ui-console-design.md` | ✅ 추가 완료 |
| `docs/plans/2026-04-06-web-ui-console-implementation.md` | ✅ 추가 완료 |
| `docs/product-specs/v1-scope.md` | ✅ 범위 갱신 완료 |
| `docs/design-docs/data-flow.md` | ✅ 웹 콘솔 경계 반영 완료 |
| `docs/SECURITY.md` | ✅ 웹 콘솔 노출 제한 반영 완료 |
| `docs/RELIABILITY.md` | ✅ 웹 콘솔 복구 기준 반영 완료 |

## Phase 10: Jira Cloud-backed service — ✅ 완료

로컬 콘솔을 실제 Jira Cloud issue를 다루는 단일 운영자 서비스로 확장한다.

| 산출물 | 상태 |
|---|---|
| `src/common_employee_runtime/jira.py` | ✅ 추가 완료 |
| `src/common_employee_runtime/service.py` | ✅ Jira-backed 처리 경로 추가 완료 |
| `src/common_employee_runtime/web.py` | ✅ Jira search/load/process UI 추가 완료 |
| `tests/test_runtime_service.py` | ✅ fake Jira 서버 기반 검증 추가 완료 |
| `.omx/plans/prd-common-employee-jira-service.md` | ✅ 추가 완료 |
| `.omx/plans/test-spec-common-employee-jira-service.md` | ✅ 추가 완료 |
| `docs/plans/2026-04-06-jira-service-design.md` | ✅ 추가 완료 |
| `docs/plans/2026-04-06-jira-service-implementation.md` | ✅ 추가 완료 |
| `docs/integrations/jira.md` | ✅ 현재 구현 상태 반영 완료 |
| `docs/integrations/auth-strategy.md` | ✅ Cloud auth 환경 변수 반영 완료 |

## Phase 11: Confluence live integration — ✅ 완료

Jira-backed 단일 운영자 서비스를 Confluence 검색/본문 조회 및 보고서 페이지 발행/업데이트까지 확장한다.

| 산출물 | 상태 |
|---|---|
| `src/common_employee_runtime/confluence.py` | ✅ 추가 완료 |
| `src/common_employee_runtime/service.py` | ✅ publish mode / Confluence flow 추가 완료 |
| `src/common_employee_runtime/web.py` | ✅ Confluence search/read/publish UI 추가 완료 |
| `tests/test_runtime_service.py` | ✅ Confluence 검증 추가 완료 |
| `.omx/plans/prd-common-employee-confluence-service.md` | ✅ 추가 완료 |
| `.omx/plans/test-spec-common-employee-confluence-service.md` | ✅ 추가 완료 |
| `docs/plans/2026-04-07-confluence-service-design.md` | ✅ 추가 완료 |
| `docs/plans/2026-04-07-confluence-service-implementation.md` | ✅ 추가 완료 |
| `docs/integrations/confluence.md` | ✅ 현재 구현 상태 반영 완료 |
| `docs/integrations/auth-strategy.md` | ✅ Confluence env 설정 반영 완료 |
| live Confluence smoke | ✅ page read + page create/update 완료 |

## Phase 12: Graph messaging — ✅ 완료 (히스토리)

Jira + Confluence-backed 단일 운영자 서비스를 Microsoft Graph 기반 Outlook/Teams 수동 발송 표면까지 확장했던 히스토리 phase다.

| 산출물 | 상태 |
|---|---|
| `src/common_employee_runtime/service.py` | ✅ Graph manual send flow 추가 완료 |
| `src/common_employee_runtime/web.py` | ✅ Outlook/Teams manual controls 추가 완료 |
| `tests/test_runtime_service.py` | ✅ Graph 검증 추가 완료 |
| `.omx/plans/prd-common-employee-graph-messaging.md` | ✅ 추가 완료 |
| `.omx/plans/test-spec-common-employee-graph-messaging.md` | ✅ 추가 완료 |
| `docs/plans/2026-04-07-graph-messaging-design.md` | ✅ 추가 완료 |
| `docs/plans/2026-04-07-graph-messaging-implementation.md` | ✅ 추가 완료 |
| `docs/integrations/teams.md` | ✅ 현재 구현/권한 blocker 반영 완료 |
| `docs/integrations/outlook.md` | ✅ 현재 구현/live smoke 반영 완료 |
| live Graph smoke | ✅ user lookup + Outlook send 완료 / Teams 403 blocker 확인 |

## Phase 13: Delegated Graph transition — ⛔ 보류 (히스토리)

Outlook/Teams Graph 연동을 operator-scoped delegated 모델로 재정렬하려 했던 히스토리 phase다. 현재 기준선에서는 Graph 자체를 활성 아키텍처로 채택하지 않는다.

| 산출물 | 상태 |
|---|---|
| `.omx/plans/prd-common-employee-graph-delegated.md` | ✅ 추가 완료 |
| `.omx/plans/test-spec-common-employee-graph-delegated.md` | ✅ 추가 완료 |
| `docs/plans/2026-04-07-graph-delegated-design.md` | ✅ 추가 완료 |
| `docs/plans/2026-04-07-graph-delegated-implementation.md` | ✅ 추가 완료 |
| `docs/status/completed/2026-04-07-graph-delegated-review-report-lead.md` | ✅ blocker 기록 완료 |

## Phase 14: M365 manual delivery realignment — ✅ 완료

Outlook과 Teams 연동을 현재 서비스 요건에 맞게 단순화한다.

| 산출물 | 상태 |
|---|---|
| `docs/integrations/auth-strategy.md` | ✅ 수동 SMTP + Teams 웹훅 기준으로 재정렬 완료 |
| `docs/integrations/outlook.md` | ✅ 메일 수동 발송 전용 기준으로 재정렬 완료 |
| `docs/integrations/teams.md` | ✅ 웹훅 셀프 알림 기준으로 재정렬 완료 |
| `docs/agent-behaviors/*` 관련 문서 | ✅ Graph/DM/메일 모니터링 가정 제거 + 분류 타임아웃 정책 정렬 완료 |
| `docs/status/tracker.md` | ✅ 현재 기준선/다음 단계 반영 완료 |
| code/config delivery surfaces | ✅ 문서 기준선에 맞춘 구현 정렬 완료 |

---

## 후속 Backlog

| 경로 | 상태 | 구분 | 비고 |
|---|---|---|---|
| `docs/design-docs/agent-persona.md` | 📋 예정 | Deferred | 에이전트 톤/페르소나 |
