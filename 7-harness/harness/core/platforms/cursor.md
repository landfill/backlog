# Cursor Platform Guide

## 1. Purpose
이 문서는 Cursor Agent Mode가 이 저장소에서 어떤 문서를 먼저 읽고 작업을 시작해야 하는지 정의한다.
플랫폼 사용법 전체가 아니라 repository-level 진입 규칙만 다룬다.

## 2. Entry Point
- 먼저 루트 `AGENTS.md`를 읽는다.
- 그 다음 `harness/core/docs/index.md`를 읽는다.
- 작업할 앱이 정해지면 해당 앱의 진입점 문서로 내려간다.

## 3. Default Reading Order
1. `AGENTS.md`
2. `harness/core/docs/index.md`
3. `harness/core/docs/index.md`의 `Rule Read Order` 6문서
4. `harness/core/workflows/pipeline.md`
5. `harness/core/workflows/operating-loop.md`
6. 이번 작업에 필요한 `harness/core/roles/` 문서
7. 작업할 앱의 진입점 문서

## 4. Working Rule
- 공통 규칙은 repository-level 문서를 따른다.
- 도메인 규칙은 app-level 문서를 따른다.
- 문서와 구현이 어긋나면 먼저 문서 기준을 확인한다.
- 작업 시작 전 task brief, tracker, ongoing plan을 확인한다.
- 상태 변경이 있으면 tracker와 ongoing plan에 반영한다.
- handoff 전에는 review report, cleanup 상태, 검증 근거를 남긴다.

## 5. Cursor-Specific
- `.cursor/rules/` 파일이 있으면 해당 규칙도 함께 참조한다.
- Plan Mode에서 설계를 먼저 확인하고, Agent Mode에서 구현한다.
- risky cleanup이나 큰 변경 전에는 먼저 git checkpoint를 만들고 `checkpoint_ref`를 남긴다.
- 파일 수정 시 ReadLints로 린터 에러를 확인한다.
