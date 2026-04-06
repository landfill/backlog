# Web UI Console Design

## Goal

`common-employee`의 CLI-only runtime foundation 위에
로컬 브라우저에서 사용할 수 있는 얇은 운영 콘솔을 추가한다.

## Chosen Approach

- Python stdlib만 사용한다.
- 새 업무 로직은 만들지 않고 `AutonomousRuntimeService`를 그대로 호출한다.
- 웹 콘솔은 세 가지 화면만 제공한다.
  1. intake payload 제출
  2. 최근 run 목록
  3. run 상세 + generated artifact 보기

## Why This Approach

- 현재 runtime/service/store/test 구조를 그대로 재사용할 수 있다.
- 새 프레임워크 없이도 브라우저 UX와 검증 가능성을 빠르게 확보할 수 있다.
- app-level security/reliability 문서가 요구하는
  redaction, artifact projection, authoritative state 원칙을 그대로 유지하기 쉽다.

## Surface

### Dashboard

- textarea에 mock/manual intake JSON을 붙여 넣고 실행한다.
- 최근 run 20개를 보여 준다.

### Run Detail

- state, stage, classification, confidence, attempts를 보여 준다.
- gate 결과와 recorded events를 보여 준다.
- 생성된 status / decision-log artifact 링크를 보여 준다.

### Artifact Viewer

- `docs/status/*`
- `docs/generated/decision-logs/*`

위 두 경로의 generated artifact만 읽기 전용으로 연다.

## Security Rules

- 워크스페이스 밖 경로는 열지 않는다.
- DB 원시 dump는 노출하지 않는다.
- 브라우저에 렌더링되는 내용도 기존 redaction 규칙을 그대로 따른다.

## Verification

- unittest로 submit → redirect → detail → artifact 흐름을 검증한다.
- 로컬 서버 기동 후 수동 smoke로 브라우저 흐름을 확인한다.
