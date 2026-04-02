# Harness Runtime

## Purpose
이 폴더는 cleanup snapshot 같은 runtime artifact를 둔다.

## Contents
- cleanup snapshot: 자율 정리 전 백업
- checkpoint 메타데이터: git ref 기반 checkpoint 정보

## Rule
- runtime artifact는 git에 커밋하지 않는다.
- 필요 시 `.gitignore`에 등록한다.
