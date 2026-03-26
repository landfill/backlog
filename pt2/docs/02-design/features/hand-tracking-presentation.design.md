# Design: hand-tracking-presentation

> Plan 참조: `docs/01-plan/features/hand-tracking-presentation.plan.md`
> 작성일: 2026-03-24

---

## 1. 전체 시스템 구성

### 1.1 실행 방법

```
로컬 서버 필요 (fetch()로 슬라이드 동적 로드)

Windows: start.bat → python -m http.server 8080 → 브라우저 자동 오픈
Mac/Linux: start.sh → python3 -m http.server 8080

접속: http://localhost:8080
```

> ⚠️ `file://` 프로토콜은 fetch() CORS 오류 발생. 로컬 서버 필수.

### 1.2 최종 파일 구조

```
presentation/
├── index.html                    # 진입점 + Reveal.js 컨테이너
├── start.bat                     # Windows 실행 스크립트
├── start.sh                      # Mac/Linux 실행 스크립트
├── css/
│   ├── theme.css                 # 브랜드 컬러, 타이포그래피
│   └── animations.css            # 커스텀 슬라이드/프래그먼트 애니메이션
├── js/
│   ├── gesture-engine.js         # MediaPipe 연동 + 제스처 판별
│   └── main.js                   # Reveal.js 초기화 + 슬라이드 로더 + 연결
└── slides/
    ├── 01-opening.html
    ├── 02-context-window.html
    ├── 03-context-engineering.html
    ├── 04-harness.html
    ├── 05-cursor-tips.html
    ├── 06-non-dev-cases.html
    ├── 07-demo.html
    └── 08-closing.html
```

---

## 2. 컴포넌트 상세 설계

### 2.1 index.html

```html
<!DOCTYPE html>
<html>
<head>
  <!-- Reveal.js CDN -->
  <!-- theme.css, animations.css -->
</head>
<body>
  <!-- 웹캠 + 오버레이 (우하단 고정) -->
  <div id="gesture-ui">
    <video id="webcam" autoplay playsinline></video>
    <canvas id="landmark-canvas"></canvas>
    <div id="gesture-status">✋ 제스처 대기</div>
  </div>

  <!-- Reveal.js 컨테이너 -->
  <div class="reveal">
    <div class="slides" id="slides-container">
      <!-- JS가 동적으로 슬라이드 삽입 -->
    </div>
  </div>

  <!-- Scripts -->
  <script src="js/gesture-engine.js"></script>
  <script src="js/main.js"></script>
</body>
</html>
```

**gesture-ui 포지션:**
```css
#gesture-ui {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 160px;
  height: 120px;
  z-index: 1000;
  border-radius: 8px;
  overflow: hidden;
  opacity: 0.85;
}
```

---

### 2.2 js/gesture-engine.js — 클래스 설계

```javascript
class GestureEngine {
  // ── 상태 ──────────────────────────────────────────
  #hands              // MediaPipe Hands 인스턴스
  #camera             // MediaPipe Camera 인스턴스
  #videoEl            // <video> 엘리먼트
  #canvasEl           // <canvas> 엘리먼트
  #ctx                // canvas 2D context

  // 스와이프 추적
  #swipeHistory = []  // [{x: float, t: timestamp}] 최대 15개
  #lastGestureAt = 0  // 마지막 제스처 시각 (쿨다운용)
  COOLDOWN_MS = 800

  // 핀치 줌 추적
  #prevCenterDist = null  // 이전 프레임 양손 중심 거리
  #currentZoom = 1.0
  MIN_ZOOM = 0.5
  MAX_ZOOM = 3.0
  ZOOM_SENSITIVITY = 0.008  // dist 변화 → scale 변화율

  // ── 공개 콜백 ─────────────────────────────────────
  onNextSlide = null   // () => void
  onPrevSlide = null   // () => void
  onZoomChange = null  // (scale: number) => void
  onGestureStatus = null  // (text: string) => void

  // ── 공개 메서드 ───────────────────────────────────
  constructor(videoEl, canvasEl)
  async init()          // MediaPipe 초기화 + 웹캠 시작
  destroy()             // 리소스 정리

  // ── 내부 메서드 ───────────────────────────────────
  #onResults(results)           // 매 프레임 콜백
  #detectSwipe(wristLandmark, handedness)  // 'next'|'prev'|null
  #detectPinch(landmarks)       // 엄지-검지 픽셀 거리 반환
  #processBothHandsPinch(results)  // 양손 핀치 줌 처리
  #drawLandmarks(results)       // canvas에 손 랜드마크 시각화
  #isCooldownActive()           // boolean
  #resetCooldown()
}
```

#### 스와이프 감지 상세

```
입력: wristLandmark (normalized x: 0~1), handedness ('Left'|'Right')

1. swipeHistory에 {x: wristLandmark.x, t: Date.now()} 추가
2. 15개 초과 시 오래된 것 제거
3. history가 10개 미만이면 return null
4. deltaX = history[last].x - history[0].x
5. deltaT = history[last].t - history[0].t
6. velocity = Math.abs(deltaX) / deltaT  (normalized)

7. if Math.abs(deltaX) > 0.15 AND velocity > 0.0004:
   - deltaX < 0 (오른→왼): return 'next'
   - deltaX > 0 (왼→오른): return 'prev'
8. return null
```

> Note: MediaPipe에서 Left/Right는 미러링 기준. 실제 화면 방향과 반전될 수 있으므로
> 테스트 후 방향 보정 필요 (MIRROR_SWAP 플래그).

#### 핀치 줌 처리 상세

```
매 프레임 #onResults에서 호출:

1. results.multiHandLandmarks.length < 2 → prevCenterDist = null, return
2. hand0, hand1 = 두 손의 landmarks
3. pinch0 = dist(hand0[4], hand0[8])  // 엄지끝, 검지끝
4. pinch1 = dist(hand1[4], hand1[8])
5. if pinch0 > 50 OR pinch1 > 50 → prevCenterDist = null, return (핀치 아님)

6. center0 = midpoint(hand0[4], hand0[8])
7. center1 = midpoint(hand1[4], hand1[8])
8. currentCenterDist = dist(center0, center1)

9. if prevCenterDist !== null:
   delta = currentCenterDist - prevCenterDist
   newZoom = clamp(currentZoom + delta * ZOOM_SENSITIVITY, MIN_ZOOM, MAX_ZOOM)
   if newZoom !== currentZoom:
     currentZoom = newZoom
     onZoomChange?.(currentZoom)

10. prevCenterDist = currentCenterDist
```

---

### 2.3 js/main.js — 초기화 흐름

```javascript
// 1. 슬라이드 HTML 동적 로드
async function loadSlides() {
  const files = [
    'slides/01-opening.html',
    'slides/02-context-window.html',
    // ...8개
  ]
  const container = document.getElementById('slides-container')
  for (const file of files) {
    const res = await fetch(file)
    const html = await res.text()
    container.insertAdjacentHTML('beforeend', html)
  }
}

// 2. Reveal.js 초기화
function initReveal() {
  Reveal.initialize({
    hash: true,
    controls: true,
    progress: true,
    transition: 'slide',
    backgroundTransition: 'fade',
    autoAnimateEasing: 'ease',
    autoAnimateDuration: 0.6,
  })
}

// 3. GestureEngine 연결
function initGesture() {
  const engine = new GestureEngine(
    document.getElementById('webcam'),
    document.getElementById('landmark-canvas')
  )
  engine.onNextSlide = () => Reveal.next()
  engine.onPrevSlide = () => Reveal.prev()
  engine.onZoomChange = (scale) => {
    document.querySelector('.reveal').style.transform =
      `scale(${scale}) translate(-50%, -50%)`
  }
  engine.onGestureStatus = (text) => {
    document.getElementById('gesture-status').textContent = text
  }
  engine.init().catch(() => {
    // 웹캠 없거나 권한 거부 → 조용히 키보드 모드로
    document.getElementById('gesture-ui').style.display = 'none'
  })
}

// 엔트리포인트
window.addEventListener('DOMContentLoaded', async () => {
  await loadSlides()
  initReveal()
  initGesture()
})
```

---

### 2.4 css/theme.css — 테마 설계

```css
/* 컬러 팔레트 */
:root {
  --bg:        #0d1117;   /* 배경: GitHub dark */
  --surface:   #161b22;   /* 카드 배경 */
  --border:    #30363d;   /* 테두리 */
  --text:      #e6edf3;   /* 주요 텍스트 */
  --muted:     #8b949e;   /* 보조 텍스트 */
  --accent:    #58a6ff;   /* 강조: 파란색 */
  --highlight: #f78166;   /* 강조2: 코랄 */
  --success:   #3fb950;   /* 성공: 초록 */
  --warning:   #d29922;   /* 경고: 노란색 */
}

/* 전체 배경 */
.reveal { background: var(--bg); color: var(--text); }

/* 제목 계층 */
.reveal h1 { font-size: 2.2em; color: var(--accent); font-weight: 700; }
.reveal h2 { font-size: 1.5em; color: var(--text); font-weight: 600; }
.reveal h3 { font-size: 1.1em; color: var(--muted); font-weight: 500; }

/* 섹션 번호 배지 */
.slide-badge {
  display: inline-block;
  background: var(--accent);
  color: #0d1117;
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 0.7em;
  font-weight: 700;
  margin-bottom: 12px;
}

/* 핵심 인용구 */
.reveal blockquote {
  background: var(--surface);
  border-left: 4px solid var(--accent);
  padding: 16px 20px;
  border-radius: 0 8px 8px 0;
  font-style: normal;
}

/* 데이터 테이블 */
.reveal table {
  border-collapse: collapse;
  width: 100%;
}
.reveal table th {
  background: var(--surface);
  color: var(--accent);
  padding: 10px 16px;
}
.reveal table td { padding: 9px 16px; border-bottom: 1px solid var(--border); }
.reveal table tr:nth-child(even) td { background: rgba(255,255,255,0.03); }

/* 하이라이트 텍스트 */
.highlight { color: var(--highlight); font-weight: 700; }
.accent    { color: var(--accent);    font-weight: 700; }
```

---

### 2.5 css/animations.css — 애니메이션 설계

```css
/* 슬라이드 인 — 오른쪽에서 */
@keyframes slideInRight {
  from { transform: translateX(60px); opacity: 0; }
  to   { transform: translateX(0);    opacity: 1; }
}

/* 프래그먼트: 아래에서 올라옴 */
.reveal .fragment.slide-up {
  transition: transform 0.5s ease, opacity 0.5s ease;
}
.reveal .fragment.slide-up.visible {
  transform: translateY(0); opacity: 1;
}
.reveal .fragment.slide-up:not(.visible) {
  transform: translateY(20px); opacity: 0;
}

/* 숫자 카운트업 효과 (JS 연동) */
.count-up { transition: color 0.3s ease; }
.count-up.active { color: var(--highlight); }

/* 제스처 피드백 애니메이션 */
@keyframes gestureFlash {
  0%   { background: transparent; }
  30%  { background: rgba(88, 166, 255, 0.15); }
  100% { background: transparent; }
}
.reveal.gesture-next { animation: gestureFlash 0.6s ease; }
.reveal.gesture-prev { animation: gestureFlash 0.6s ease; }
```

---

## 3. 슬라이드 콘텐츠 설계 (AI교육시나리오.md 기반)

### 슬라이드 공통 구조

```html
<!-- 각 slides/*.html 파일 구조 -->
<section data-auto-animate>
  <div class="slide-badge">SECTION 01</div>
  <h1>슬라이드 제목</h1>
  <h3>부제목</h3>
  <!-- 콘텐츠 영역 -->
</section>

<!-- 서브슬라이드 (같은 섹션의 세부 내용) -->
<section data-auto-animate>
  <!-- 추가 콘텐츠 -->
</section>
```

### 01-opening.html

| 슬라이드 | 내용 |
|---------|------|
| 01-a | 타이틀: "컨텍스트를 관리하는 사람이 AI를 제대로 쓰는 사람입니다" + 18분 소개 |
| 01-b | FOMO 질문 3가지 (fragment 순차 등장) |
| 01-c | BCG 연구 표 (25% 속도↑, 40% 품질↑, 하위퍼포머 효과) + **반전 강조** |

### 02-context-window.html

| 슬라이드 | 내용 |
|---------|------|
| 02-a | 기억 두 종류 비교표 (학습데이터 vs 컨텍스트윈도우) |
| 02-b | 윈도우 구성요소 목록 (항상 들어가는 것 / 추가될 수 있는 것) |
| 02-c | 모델별 크기 비교표 (ChatGPT~Gemini) — Claude Pro 행 강조 |
| 02-d | 가득 찰 때 증상 목록 (fragment) |

### 03-context-engineering.html

| 슬라이드 | 내용 |
|---------|------|
| 03-a | 패러다임 전환: "프롬프트 엔지니어링 → 컨텍스트 엔지니어링" |
| 03-b | 환불정책 Before/After 비교 (2열 레이아웃) |
| 03-c | 인용: "AI는 받은 맥락을 증폭하는 도구" |
| 03-d | 컨텍스트 가득 찰 때 3가지 선택 표 |

### 04-harness.html

| 슬라이드 | 내용 |
|---------|------|
| 04-a | 기억의 한계: "기억나는 것 vs 기억 안 나는 것" 표 |
| 04-b | 파일이 기억한다: CLAUDE.md / Cursor Rules / SKILL.md 역할 표 |
| 04-c | 인용: "스킬 파일을 쓴다는 것 = 업무 매뉴얼을 건네는 것" |

### 05-cursor-tips.html

| 슬라이드 | 내용 |
|---------|------|
| 05-a | 컨텍스트 채우는 방법: @참조 3가지 표 |
| 05-b | 새 에이전트 열어야 하는 신호 3가지 (강조: 신호3 오염 경고) |
| 05-c | _context/ 폴더 구조 코드블록 |

### 06-non-dev-cases.html

| 슬라이드 | 내용 |
|---------|------|
| 06-a | Every.to 사례 표 (운영/콘텐츠/마케터/기획) |
| 06-b | 비개발 업무 목록 (✅ 8개 — fragment 순차) |

### 07-demo.html

| 슬라이드 | 내용 |
|---------|------|
| 07-a | 데모 소개: "코드가 아닌 텍스트. 누구든 만들 수 있습니다." |
| 07-b | SKILL.md 구조 예시 (코드블록) |
| 07-c | 데모 시나리오 순서 표 |

### 08-closing.html

| 슬라이드 | 내용 |
|---------|------|
| 08-a | 클로징 인용문 (큰 타이포로 표시) |
| 08-b | 7가지 핵심 표 (번호 배지 + 내용) |

---

## 4. 제스처 상태 머신

```
┌─────────────────────────────────────────┐
│              GestureEngine              │
│                                         │
│  idle ──→ tracking ──→ [COOLDOWN]       │
│            │                │           │
│            ├─ swipe_next ───┘           │
│            ├─ swipe_prev ───┘           │
│            └─ pinch_zoom (no cooldown)  │
└─────────────────────────────────────────┘

상태 전환:
- idle → tracking: 손이 1개 이상 감지될 때
- tracking → [COOLDOWN]: 스와이프 제스처 확정
- [COOLDOWN] → tracking: 800ms 후 자동 복귀
- pinch_zoom: 쿨다운 없이 매 프레임 연속 처리
```

---

## 5. 웹캠 오버레이 UI 설계

```
┌──────────────────┐
│  [webcam video]  │  ← 160×120, 미러링, opacity 0.85
│  [canvas overlay]│  ← 손 랜드마크 점 (초록색 #3fb950)
├──────────────────┤
│  ✋ 제스처 대기   │  ← 상태 텍스트 (gesture-status div)
└──────────────────┘

gesture-status 상태별 텍스트:
- 웹캠 없음/오류:  (hidden)
- 손 없음:        "✋ 제스처 대기"
- 손 감지:        "👋 손 감지됨"
- 스와이프 감지:  "→ 다음 슬라이드" / "← 이전 슬라이드"
- 핀치 감지:      "🔍 줌 조절 중"
```

---

## 6. CDN 의존성

```html
<!-- Reveal.js 4.x -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@4/dist/reveal.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@4/dist/theme/black.css">
<script src="https://cdn.jsdelivr.net/npm/reveal.js@4/dist/reveal.js"></script>

<!-- MediaPipe Hands -->
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js"></script>
```

> 오프라인 사용 시: CDN URL을 로컬 복사본 경로로 교체. `vendor/` 폴더에 저장 가능.

---

## 7. 오류 처리 설계

| 시나리오 | 처리 방법 |
|---------|----------|
| 웹캠 권한 거부 | gesture-ui 숨김, 키보드/마우스 모드로 자동 전환 |
| MediaPipe CDN 로드 실패 | console.warn, 제스처 없이 슬라이드만 작동 |
| 슬라이드 fetch 실패 | console.error + 해당 슬라이드 스킵 |
| 손 인식 신뢰도 낮음 (< 0.7) | 해당 프레임 무시 |
| 쿨다운 중 제스처 감지 | 무시 (연속 트리거 방지) |

---

## 8. 구현 순서

| 단계 | 파일 | 작업 |
|------|------|------|
| 1 | `index.html` + `css/theme.css` | 기본 레이아웃 + 테마 |
| 2 | `slides/*.html` (8개) | 슬라이드 콘텐츠 |
| 3 | `js/main.js` | 슬라이드 로더 + Reveal.js 초기화 |
| 4 | `css/animations.css` | 프래그먼트 애니메이션 |
| 5 | `js/gesture-engine.js` | 웹캠 + 스와이프 감지 |
| 6 | `js/gesture-engine.js` | 핀치 줌 추가 |
| 7 | `start.bat` / `start.sh` | 실행 스크립트 |
| 8 | 통합 테스트 | 쿨다운/민감도 튜닝 |

---

*Generated by /pdca design — 2026-03-24*
