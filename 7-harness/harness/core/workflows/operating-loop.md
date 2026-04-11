# Operating Loop

## 1. Purpose
이 문서는 repository-level harness의 공통 운영 계약을 정의한다.
목표는 작업 시작, handoff, 복구, 완료가 같은 산출물과 같은 판정 기준으로 반복되게 하는 것이다.

## 2. Required Artifacts
- task brief: 범위, 완료 기준, 검증 계획을 고정한다.
- tracker: 앱 전체의 현재 상태와 다음 행동을 남긴다.
- ongoing plan: 현재 작업의 최신 상태를 남긴다.
- review report: 단계 간 handoff 판정과 남은 위험을 남긴다.

## 3. Default Loop
1. Prepare
2. Execute
3. Handoff
4. Recover
5. Complete

## 4. Prepare
- 작업 시작 전 task brief를 만들거나 기존 문서를 현재 범위에 맞게 갱신한다.
- tracker와 ongoing plan에 현재 작업과 현재 담당자를 기록한다.
- 검증 계획이 없으면 구현이나 정리를 시작하지 않는다.
- risky cleanup이나 큰 변경이 예상되면 먼저 git checkpoint를 만들고 `checkpoint_ref`를 남긴다.

## 5. Execute
- 각 담당자는 task brief 범위 안에서만 작업한다.
- 의미 있는 상태 변경이 생기면 ongoing plan을 바로 갱신한다.
- self-check나 검토 결과가 생기면 `verification_evidence`에 남긴다.
- 다음 단계가 바뀌면 tracker도 함께 갱신한다.

## 6. Handoff
- handoff 전에는 cleanup 상태를 먼저 확인한다.
- handoff에는 review report를 남긴다.
- review report에는 최소한 verdict, checked, evidence, cleanup 상태, open risks, next owner, next step이 있어야 한다.
- 다음 단계는 한 가지 행동으로 적는다.
- `APPROVED`는 다음 담당자가 바로 이어받을 수 있는 상태를 뜻한다.

## 7. Recover
- `CHANGES_REQUESTED` 또는 `BLOCKED`가 나오면 tracker와 ongoing plan의 시도 횟수를 올린다.
- 같은 `root_cause`가 3회 반복되거나 시도 횟수가 5에 도달하면 범위를 줄이거나 rollback loop로 들어간다.
- risky cleanup이나 큰 변경 이전의 `checkpoint_ref`가 있으면 복구 후보로 사용한다.
- 복구 후에는 다음 시도를 더 작은 단위의 한 가지 행동으로 다시 정의한다.

## 8. Complete
- 마지막 PM 판정이 `APPROVED`일 때만 완료로 표시한다.
- tracker에는 최종 상태와 다음 액션 없음 상태를 남긴다.
- ongoing plan에는 마지막 verdict, evidence, 남은 이슈를 정리한 뒤 completed 위치로 옮긴다.
- 정리하지 못한 항목이 있으면 숨기지 말고 마지막 review report와 ongoing plan에 남긴다.

## 9. Operating Contract
- 최신 task brief, tracker, ongoing plan 없이 작업을 넘기지 않는다.
- `APPROVED`에는 검증 근거와 cleanup 상태가 함께 있어야 한다.
- `SKIPPED`는 현재 단계가 task brief 범위에 적용되지 않을 때만 사용한다.
- `SKIPPED`에는 왜 생략했는지와 다음 담당자, 다음 단계를 남긴다.
- 안전성이나 검증 기준을 낮추기 위해 `SKIPPED`를 쓰지 않는다.
- `BLOCKED`에는 막는 외부 의존성이나 문서 갭을 적는다.
- 시도 횟수와 판정 값은 고정 필드로 계속 유지한다.

## 10. Cleanup Status
- `CLEAN`: 다음 단계가 바로 이어받아도 된다.
- `REMAINING_OK`: 남은 항목이 있지만 범위와 영향이 기록되어 있다.
- `BLOCKED`: 남은 항목 때문에 다음 단계 진행이 안전하지 않다.

## 11. Checkpoint Rule
- risky cleanup 전에는 checkpoint를 먼저 만든다.
- 큰 구조 변경 전에는 최근 안전 지점을 남긴다.
- 검증 가능한 안정 상태에 도달했으면 현재 안전 지점을 갱신한다.
- checkpoint를 만들었으면 tracker, ongoing plan, review report 중 최소 한 곳에는 `checkpoint_ref`를 남긴다.
- risky cleanup은 프로세스 종료, 디버그/임시 코드 제거, 실험 결과 정리처럼 원복 필요 가능성이 있는 정리를 뜻한다.
- 큰 변경은 여러 파일이나 계약을 함께 바꾸거나, 원복 비용이 높은 구조 변경을 뜻한다.

## 12. Template Contract
- task brief는 범위, 완료 기준, 검증 계획을 포함해야 한다.
- tracker는 현재 verdict, attempts, checkpoint 상태, cleanup 상태를 보여야 한다.
- ongoing plan은 현재 단계, evidence, 실패 원인, 다음 행동을 보여야 한다.
- review report는 handoff 판정, 검증 근거, cleanup 결과, open risks, next owner, next step을 보여야 한다.

## 13. Active Artifact Linkage
- 활성 작업은 하나의 `{slug}`로 연결한다.
- `tracker.md`의 `Current Work.path`는 `docs/status/ongoing/{slug}-task-brief.md`를 가리킨다.
- 같은 활성 작업의 ongoing plan은 `docs/status/ongoing/{slug}-ongoing-plan.md` 형식을 따른다.
- 같은 활성 작업의 review report는 `docs/status/ongoing/{slug}-review-report-<role>.md` 형식을 따른다.
- repository-level 자동 검사는 활성 작업에 한해 위 파일명 연결 규칙을 검증한다.
