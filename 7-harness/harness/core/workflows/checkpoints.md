# Checkpoints

## 1. Purpose
이 문서는 작업 상태를 작고 명확하게 남기는 공통 기준을 정의한다.
목표는 중단 후에도 다음 사람이 바로 이어서 작업할 수 있게 하는 것이다.

## 2. Where to Record
- 앱 상태 문서는 기본적으로 `docs/status/` 아래에 둔다.
- 앱 전체 진행 상태는 앱의 `docs/status/tracker.md`에 남긴다.
- 현재 진행 중인 작업 상태는 앱의 `docs/status/ongoing/` 문서에 남긴다.
- 완료된 작업 기록은 앱의 `docs/status/completed/` 폴더로 옮겨 남긴다.
- handoff 판정과 마지막 안전 상태는 review report에도 남긴다.

## 3. What to Record
- 현재 작업의 목적
- 현재 단계
- 마지막으로 확인된 상태
- 현재 판정 값
- 시도 횟수
- 마지막 안전 지점의 `checkpoint_ref`
- 현재 cleanup 상태
- 마지막으로 확인한 검증 근거
- 다음 담당자
- 다음에 해야 할 한 가지 일
- 보류나 실패가 있으면 그 이유

## 4. Rule
- 체크포인트는 짧게 쓴다.
- 현재 상태와 다음 행동이 바로 보여야 한다.
- 상태가 바뀌면 최신 내용으로 갱신한다.
- 시도 횟수와 판정 값은 고정 필드로 남긴다.
- git checkpoint를 만들었으면 같은 이름이나 ref를 문서에 남긴다.
- 큰 작업은 더 작은 체크포인트로 나눈다.

## 5. Minimum Structure
1. 작업 이름
2. 현재 단계
3. 현재 상태
4. 현재 판정 값
5. 시도 횟수
6. `checkpoint_ref`
7. cleanup 상태
8. 다음 담당자
9. 다음 단계
10. 이슈

## 6. Use
- 작업 시작 시 tracker와 ongoing plan 문서를 함께 만든다.
- 의미 있는 변경 후 ongoing plan 문서를 갱신한다.
- 단계가 바뀌면 tracker를 갱신한다.
- `CHANGES_REQUESTED` 또는 `BLOCKED`가 나오면 시도 횟수를 올린다.
- risky cleanup이나 큰 변경 전에는 `operating-loop.md`의 기준에 따라 먼저 git checkpoint를 만든다.
- 검증 가능한 안정 상태에 도달하면 마지막 안전 지점을 갱신한다.
- 작업 완료 시 ongoing plan 문서를 `docs/status/completed/` 폴더로 옮기고 마지막 상태를 남긴다.
