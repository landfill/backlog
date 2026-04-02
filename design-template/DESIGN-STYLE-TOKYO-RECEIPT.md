# Tokyo Receipt — 디자인 스타일 가이드

여행 비용 분할/영수증 UI 템플릿의 비주얼·인터랙션 스타일을 정리한 문서입니다. 동일한 톤을 유지하면서 재사용할 때 참고하세요.

---

## 1. 컨셉 & 톤

| 항목 | 설명 |
|------|------|
| **컨셉** | 모바일 영수증 + 여행 로그 + 터미널(CLI) 조합 |
| **분위기** | 레트로 레시트지, 타자기/픽셀 폰트, 잉크 선 스타일 |
| **프레임** | 375×812 모바일 디바이스 목업(노치 포함), 화면은 크림지 배경의 “영수증” 영역 |

---

## 2. 컬러 팔레트

| 용도 | 값 | CSS/클래스 | 비고 |
|------|-----|------------|------|
| **영수증 배경** | `#F4F4F0` | `.receipt-bg` | 크림/오프화이트 |
| **본문 텍스트** | `#111111` | `.receipt-text` | 거의 검정 |
| **강조(액센트)** | `#FF4500` | `.receipt-accent`, `.border-accent` | Orange Red, 제외/경고 등 |
| **입력창 배경** | `#111111` | — | 하단 고정 CLI 바 |
| **입력창 텍스트** | `#F4F4F0` | — | 크림색 |
| **보조선/비활성** | `gray-300`, `gray-500`, `gray-600` | Tailwind | 점선, 플레이스홀더 등 |
| **디바이스 프레임** | `black`, `gray-800` | — | 외곽·테두리 |

---

## 3. 타이포그래피

### 폰트 (Google Fonts)

- **VT323** → `.font-pixel`  
  - 용도: 큰 타이틀(예: "Tokyo"), 금액 등 픽셀/레트로 느낌
- **Space Mono** → `.font-mono-data`  
  - 용도: 본문, 데이터, 입력창(기본 폰트)
- **Oswald (500)** → `.font-condensed`  
  - 용도: 라벨, 테이블 헤더, 항목명 등 (대문자 + `letter-spacing: 0.05em`)

### 크기·스타일 관례

- 타이틀: `text-6xl` + `tracking-widest` + `uppercase` (픽셀 폰트)
- 소제목/헤더: `text-[10px]` ~ `text-xs` + `uppercase` + `tracking-widest`
- 본문: `text-sm`, 보조 정보: `text-[9px]` ~ `text-[10px]`
- 금액 강조: `font-pixel` + `text-2xl` 등

---

## 4. 레이아웃

- **최상위**: `min-h-screen`, 중앙 정렬, 패딩 `p-4`
- **디바이스 프레임**: `375×812`, `rounded-[48px]`, 상단 노치 `w-32 h-7 rounded-b-3xl`
- **내부 화면**: `rounded-[36px]`, 스크롤 영역 + 하단 고정 입력창
- **스크롤 영역**: `.no-scrollbar`로 스크롤바 숨김, `pb-32`로 하단 입력창에 가려지지 않게 여백
- **헤더**: `sticky top-0 z-30` + `.receipt-bg`로 스크롤 시 배경 유지
- **하단 입력**: `absolute bottom-0` + `z-20` + 상단 방향 그림자로 “떠 있는” CLI 바

---

## 5. 컴포넌트 & 패턴

### 5.1 FadeIn (스크롤 트리거)

- **역할**: 뷰포트 진입 시 `opacity` + `translate-y`로 등장
- **옵션**: `delay`(ms), `className`
- **동작**: `IntersectionObserver`(threshold 0.1, rootMargin 하단 -20px)로 진입 감지 → `delay` 후 `isVisible` 트리거
- **애니메이션**: `duration-700 ease-out`, `opacity-0 translate-y-6` → `opacity-100 translate-y-0`
- **렌더**: `children`이 함수면 `children(isVisible)` 호출(바코드 등 지연 애니용)

### 5.2 DynamicBarcode

- **역할**: SVG 바코드가 “스크램블” 후 최종 패턴으로 수렴
- **트리거**: 부모에서 전달한 `isVisible === true`일 때만 스크램블 시작
- **타이밍**: 약 1.2s, 30fps 간격으로 랜덤 막대 → `finalBars`로 고정
- **스타일**: 검정 막대, `preserveAspectRatio="none"`으로 가로 폭에 맞춤

### 5.3 SpinningGlobe

- **역할**: 잉크 선 스타일의 회전 지구본 아이콘
- **스타일**: `stroke` only, `strokeDasharray="1.5 1.5"`, `strokeLinecap="round"`
- **애니메이션**: `.globe-spin` → `rotateY` 4s linear infinite
- **크기**: `w-8 h-8`, `opacity-80`

### 5.4 FlightLine

- **역할**: 점선 위를 비행기 아이콘이 지나가는 “경로” 시각화
- **구성**: 배경 점선(`border-dashed border-gray-300`) + 검정 점선이 그려지는 라인 + 비행기 SVG
- **애니메이션**: `drawLine`(width 0→110%) + `flyPlane`(left 0→110%), 2.5s `cubic-bezier(0.4, 0, 0.2, 1)`
- **트리거**: `FadeIn`의 `isVisible`과 연동

---

## 6. 애니메이션 요약

| 이름 | 용도 | duration | easing |
|------|------|----------|--------|
| FadeIn | 등장 | 700ms | ease-out |
| drawLine | 비행 라인 그리기 | 2.5s | cubic-bezier(0.4,0,0.2,1) |
| flyPlane | 비행기 이동 | 2.5s | 동일 |
| spinY | 지구본 Y축 회전 | 4s | linear infinite |
| DynamicBarcode | 스크램블 | 1200ms | — |

- 등장 순서: 헤더(100) → FlightLine(300) → 바코드(500) → 메타(600) → 테이블 헤더(700) → 리스트 항목(800 + index×150). 푸터는 100/300/500/700 등으로 더 짧게.

---

## 7. 인터랙션

- **항목 탭**: `toggleExclude` — 제외 시 취소선 + "*EXCLUDED*" 뱃지 + `opacity-40 grayscale`
- **제외 뱃지**: `receipt-accent` 테두리, `-rotate-12`, 가운데 빨간 가로선
- **하단 입력**: CLI 스타일 프롬프트(`_>`) + Enter 제출 시 리스트 하단으로 스무스 스크롤
- **버튼**: `active:bg-[#FF4500] active:text-white`로 액센트 피드백

---

## 8. 재사용 시 체크리스트

1. **폰트**: `Space Mono`, `VT323`, `Oswald` import 유지하거나 동일 역할의 폰트로 치환
2. **색상**: `.receipt-bg`, `.receipt-text`, `.receipt-accent`를 프로젝트 테마 변수로 빼도 됨
3. **FadeIn delay**: 섹션별로 100~800+ 단계로 두어 “위에서 아래로” 읽히는 순서 유지
4. **모바일 프레임**: 데모용이면 375×812 유지, 실제 앱이면 프레임 제거하고 내부만 사용
5. **바코드/비행선**: 브랜드에 맞게 아이콘·컬러만 바꿔도 톤 유지 가능

---

## 9. 파일 참조

- **코드 템플릿**: `templates/TokyoReceiptApp.jsx`
- 이 문서는 해당 템플릿의 디자인·애니메이션·컴포넌트 규칙을 요약한 것입니다.
