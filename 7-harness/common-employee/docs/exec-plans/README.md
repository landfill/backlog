# Execution Plans

## 목적

프로젝트성 작업의 일정, 마일스톤, 리스크를 상태 산출물과 분리해 관리한다.

## 구성

- `active/` — 현재 진행 중인 프로젝트 계획 문서
- `completed/` — 종료된 프로젝트 계획 문서

## 규칙

- 프로젝트 계획 문서는 `YYYY-MM-DD-<slug>-exec-plan.md` 형식을 따른다
- 대표 상태는 `docs/status/tracker.md`가 유지하고, 상세 일정과 마일스톤은 `exec-plans/`에 둔다
- 마일스톤별 handoff evidence는 `docs/status/ongoing/`과 review report에 남긴다
- 프로젝트 종료 시 마지막 상태와 open risk를 유지한 채 `completed/`로 옮긴다
