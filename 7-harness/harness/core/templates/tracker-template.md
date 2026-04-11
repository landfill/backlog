# Tracker Template

## Purpose
앱 전체 진행 상태를 한눈에 남기는 템플릿이다.

## Template
```md
# Tracker

## Current Phase
- phase:
- status:

## Current Step
- owner:
- state:

## Current Work
- title:
- path:

## Verification
- verdict:
- attempts:
- evidence:

## Operating State
- checkpoint_ref:
- cleanup_status:

## Next Owner
- owner:

## Next Action
- next:

## Issues
- none
```

## Rule
- 현재 상태만 남긴다.
- 상세 작업 내용은 ongoing plan 문서에 둔다.
- 단계가 바뀌면 바로 갱신한다.
- 판정 값과 시도 횟수는 비워 두지 않는다.
- 마지막 안전 지점과 cleanup 상태가 바뀌면 함께 갱신한다.
- `Current Work.path`는 `docs/status/ongoing/{slug}-task-brief.md`를 가리켜야 한다.
