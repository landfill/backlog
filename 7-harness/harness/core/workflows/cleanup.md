# Cleanup Workflow

## 1. Purpose
이 문서는 실행 루프에서 남는 garbage process와 garbage code를 정리하는 기준을 정의한다.
목표는 다음 시도가 이전 시도의 찌꺼기에 오염되지 않게 하는 것이다.

## 2. Garbage Process
- 종료되지 않은 개발 서버
- 중단된 테스트 실행 프로세스
- 실패한 실행 뒤 남은 백그라운드 프로세스
- 다음 검증에 영향을 줄 수 있는 임시 실행 상태

## 3. Garbage Code
- 실패한 시도에서 남은 임시 코드
- 더 이상 참조되지 않는 실험용 파일
- handoff 전 제거되지 않은 디버그 코드
- 현재 task brief 범위 밖의 잔여 변경

## 4. When to Clean
- handoff 전에 정리한다.
- rollback 전에 정리한다.
- 완료 표시 전에 마지막으로 다시 확인한다.

## 5. Rule
- 다음 시도에 필요 없는 프로세스는 종료한다.
- 현재 작업 범위와 무관한 임시 코드는 남기지 않는다.
- 보존이 필요한 실험 결과는 삭제하지 말고 문서에 남긴다.
- 정리하지 못한 항목은 숨기지 말고 기록한다.
- `APPROVED` handoff에는 cleanup 상태를 함께 남긴다.
- risky cleanup 기준은 `operating-loop.md`의 Checkpoint Rule을 따른다.
- risky cleanup 전에는 먼저 git checkpoint를 만든다.

## 6. Cleanup Status
- `CLEAN`: 다음 단계가 바로 이어받아도 된다.
- `REMAINING_OK`: 남은 항목이 있지만 범위와 영향이 기록되어 있다.
- `BLOCKED`: 남은 항목 때문에 다음 단계 진행이 안전하지 않다.

## 7. Record
- 무엇을 정리했는지
- cleanup 상태
- 남겨 둔 항목이 있으면 그 이유
- 다음 단계에 영향이 있는지
