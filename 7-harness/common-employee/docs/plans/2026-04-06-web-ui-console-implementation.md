# Web UI Console Implementation Plan

## Goal

기존 runtime foundation을 보존하면서
로컬 웹 콘솔을 추가하고 자동 검증까지 맞춘다.

## Tasks

1. `RuntimeStore`에 recent run / event 조회 표면을 추가한다.
2. stdlib WSGI 기반 웹 콘솔 모듈을 추가한다.
3. dashboard / run detail / artifact viewer를 구현한다.
4. 안전 경로 검사와 generated artifact 노출 제한을 넣는다.
5. 웹 콘솔 스크립트 엔트리포인트를 추가한다.
6. 웹 콘솔 통합 테스트를 추가한다.
7. app docs/status artifacts를 새 표면 기준으로 갱신한다.

## Verification

- `python3 -m unittest common-employee/tests/test_runtime_service.py -v`
- 로컬 웹 서버 smoke run
