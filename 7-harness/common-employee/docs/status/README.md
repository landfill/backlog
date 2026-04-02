# 상태 산출물 (Status Artifacts)

## 목적

`common-employee` 앱이 repository-level operating loop를 실제 작업 상태 문서로 사용할 위치를 정의한다.

## 구성

- `tracker.md` — 현재 작업, verdict, 다음 행동을 보여 주는 단일 상태 문서. Lead 또는 Coordinator만 갱신한다
- `ongoing/` — 진행 중 작업별 task brief, ongoing plan, review report를 둔다
- `completed/` — 완료된 작업 기록을 옮겨 둔다

## 형식 기준

- task brief 형식: `harness/core/templates/task-brief-template.md`
- tracker 형식: `harness/core/templates/tracker-template.md`
- ongoing plan 형식: `harness/core/templates/ongoing-plan-template.md`
- review report 형식: `harness/core/templates/review-report-template.md`

## 규칙

- 작업 시작 시 task brief와 ongoing plan을 함께 만든다
- `tracker.md`의 대표 상태 요약은 Lead 또는 Coordinator가 관리한다
- current owner는 세부 evidence와 실패 원인을 ongoing plan에 남긴다
- handoff에는 review report를 남기고 cleanup 상태를 기록한다
- 완료된 작업은 마지막 evidence와 남은 이슈를 포함해 `completed/`로 옮긴다
