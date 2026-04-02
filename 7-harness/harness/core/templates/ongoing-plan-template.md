# Ongoing Plan Template

## Purpose
현재 진행 중인 한 작업의 상태를 남기는 템플릿이다.

## Template
```md
# <Work Title>

## Goal
- 

## Scope
- 

## Current Owner
- 

## Current Step
- 

## Current State
- 

## Operating State
- checkpoint_ref:
- cleanup_status:

## Verification
- verdict:
- attempts:

## Verification Evidence
- none

## Failure Record
- root_cause:
- rollback_point:

## Next Owner
- 

## Next Step
- 

## Issues
- none
```

## Rule
- 한 문서는 한 작업만 다룬다.
- 다음 단계는 한 가지 행동으로 적는다.
- 판정 값과 시도 횟수를 계속 갱신한다.
- 마지막 안전 지점과 검증 근거를 함께 갱신한다.
- 같은 `root_cause`가 반복될 때 시도 횟수를 누적한다.
- 작업이 끝나면 앱의 `docs/status/completed/` 폴더로 옮긴다.
