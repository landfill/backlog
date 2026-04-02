# Pipeline Workflow

## 1. Purpose
이 문서는 저장소 공통 작업 흐름의 기본 순서를 정의한다.
세부 역할 규칙은 roles 문서에서, 운영 계약은 `operating-loop.md`에서 따로 다룬다.

## 2. Default Order
기본 흐름은 아래 순서를 따른다.

1. PM
2. Coder
3. Security Reviewer
4. Tester
5. PM

각 단계는 시작 전에 현재 task brief, tracker, ongoing plan을 확인한다.

## 3. Handoff Rule
- 앞 단계가 끝나기 전에는 다음 단계로 넘어가지 않는다.
- 각 단계는 자기 역할의 기준으로만 판단한다.
- 각 단계는 짧은 handoff 보고서와 판정 값을 남긴다.
- 각 단계는 handoff 전에 cleanup 상태를 확인한다.
- 각 단계는 handoff 전에 ongoing plan을 최신 상태로 갱신한다.
- 각 단계는 handoff 보고서에 검증 근거와 남은 위험을 함께 남긴다.
- risky cleanup이나 큰 변경 전에는 `operating-loop.md`의 기준에 따라 git checkpoint를 먼저 만들고 `checkpoint_ref`를 남긴다.
- 판정 값은 `APPROVED`, `CHANGES_REQUESTED`, `BLOCKED`, `SKIPPED`만 사용한다.
- 다음 단계는 `APPROVED` 또는 `SKIPPED`일 때만 진행한다.
- `SKIPPED`는 현재 단계가 task brief 범위에 적용되지 않을 때만 사용한다.
- `SKIPPED`는 docs-only 정렬이나 무동작 메타데이터 수정처럼 안전성이나 검증 기준을 낮추지 않는 경우에만 허용한다.
- Security Reviewer는 코드, 설정, 권한, 데이터 흐름 변경이 없을 때만 `SKIPPED` 가능하다.
- Tester는 동작 변경이 없고 검증 대상이 문서 정렬뿐일 때만 `SKIPPED` 가능하다.
- `CHANGES_REQUESTED` 또는 `BLOCKED`가 나오면 현재 작업의 시도 횟수를 기록하고 갱신한다.
- 같은 `root_cause`가 3회 반복되거나 시도 횟수가 5에 도달하면 `rollback-loop.md`를 따른다.

## 4. Output Rule
- PM은 범위, 완료 기준, 검증 계획을 남긴다.
- Coder는 구현 결과와 짧은 셀프 체크 결과를 남긴다.
- Security Reviewer는 보안 판단 결과를 남긴다.
- Tester는 검증 결과와 판정 값을 남긴다.
- 각 단계의 handoff는 review report 형식을 따른다.

## 5. Completion Rule
- 마지막 PM 검토까지 끝나야 한 사이클이 완료된다.
- 마지막 PM 판정이 `APPROVED`일 때만 완료로 표시한다.
- 보류나 축소가 필요하면 다음 사이클로 넘긴다.
- 완료 전에는 cleanup 상태와 마지막 안전 지점을 다시 확인한다.
