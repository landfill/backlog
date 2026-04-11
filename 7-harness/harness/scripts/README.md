# Harness Scripts

## Purpose
이 폴더는 저장소 공통 검사와 자동화 스크립트를 둔다.

## Planned Scripts
- cleanup 검사: garbage process, debug code, 임시 파일 탐지
- cleanup 실행: 안전한 범위의 자동 정리
- git checkpoint: 작업 지점 저장
- git restore: checkpoint로 복원
- artifact 검사: tracker, ongoing plan, review report 필수 필드 확인
- harness conformance 검사: 앱 하니스 필수 문서, 역할 매핑, tracker 필드 검증

## Current Scripts
- `check_harness_conformance.py`: repository-level 계약(`harness/core/schemas/app-harness-contract.json`)에 따라 앱 하니스의 최소 적합성을 검사한다.

## CI Usage
- `.github/workflows/harness-conformance.yml`은 conformance 검사기와 대표 앱 런타임 테스트를 pull request와 `main` push에서 함께 실행한다.

## Rule
- 스크립트는 문서의 규칙을 자동화한 것이다.
- 파괴적 동작 전에는 반드시 snapshot을 남긴다.
- 자동 검사는 운영 루프의 필수 필드를 먼저 본다.
- 앱별 스크립트는 앱 폴더에 둔다.
