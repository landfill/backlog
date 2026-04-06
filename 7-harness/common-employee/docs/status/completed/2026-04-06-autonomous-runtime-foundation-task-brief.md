# 자율 운영 런타임 기반 구현 착수

## Goal
- `common-employee`를 Lead 중심 자율 운영 런타임으로 구현한다.

## Primary Output
- Jira intake 기반 상태 전이 런타임 골격
- 역할별 handoff 오케스트레이션 계층
- 상태 산출물 자동 생성/동기화 기반
- Gate 1/2/3 및 보안/신뢰성 최소 강제 경로

## In Scope
- 운영 티켓 intake, 분류, 계획, 탐색, gate, 실행, 보고, 학습
- SQLite 상태 저장과 Markdown artifact sync
- retry, blocked, rollback candidate
- mock CLI end-to-end 시뮬레이션

## Out of Scope
- UI 대시보드
- 새 외부 액션 타입 추가
- 멀티테넌트 권한 모델

## Done When
- 서비스가 티켓 입력을 받아 자체적으로 상태 전이를 수행한다.
- 상태 산출물이 서비스 결과로 생성 또는 갱신된다.
- Guardian gate와 보안/신뢰성 규칙이 런타임에서 강제된다.
- 실패 시 retry, blocked, rollback candidate가 상태에 남는다.

## Verification Plan
- `python3 -m unittest common-employee/tests/test_runtime_service.py -v`
- `PYTHONPATH=common-employee/src python3 -m common_employee_runtime.cli common-employee/examples/operational-ticket.json --workspace common-employee`

## Inputs
- app-level harness 문서 세트
- 사용자 목표: 자율 운영 런타임 기반 구현 착수

## Expected Output
- `common-employee/src/common_employee_runtime/`
- `common-employee/runtime/autonomous-runtime.db`
- `common-employee/docs/status/*`
- `common-employee/docs/generated/decision-logs/*`

## Risk Notes
- runtime DB에는 Restricted/Sensitive 원문을 남기지 않는다.
