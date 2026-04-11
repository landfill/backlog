# Harness Schemas

## Purpose
이 폴더는 repository-level harness의 최소 계약을 machine-readable 형태로 둔다.

## Current Schemas
- `app-harness-contract.json`: 앱 하니스의 필수 문서, 역할 매핑, tracker/ongoing plan/review report 최소 필드를 정의한다.

## Rule
- prose 문서에서 반복적으로 깨지는 공통 규칙만 이 폴더로 올린다.
- schema가 바뀌면 `harness/scripts/`의 conformance 검사도 함께 갱신한다.
- app-level 예외는 여기서 바로 특수 처리하지 말고, 먼저 공통 규칙으로 올릴 가치가 있는지 검토한다.
