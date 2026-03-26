/**
 * main.js — 슬라이드 로더 + Reveal.js 초기화 + GestureEngine 연결
 */

const SLIDE_FILES = [
  'slides/01-opening.html',
  'slides/02-context-window.html',
  'slides/03-context-engineering.html',
  'slides/04-harness.html',
  'slides/05-cursor-tips.html',
  'slides/06-non-dev-cases.html',
  'slides/07-demo.html',
  'slides/08-closing.html'
]

// ── 슬라이드 HTML 동적 로드 ────────────────────────
async function loadSlides() {
  const container = document.getElementById('slides-container')
  for (const file of SLIDE_FILES) {
    try {
      const res = await fetch(file)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const html = await res.text()
      container.insertAdjacentHTML('beforeend', html)
    } catch (err) {
      console.error(`슬라이드 로드 실패: ${file}`, err)
      // 해당 슬라이드 스킵 — 나머지는 계속 로드
    }
  }
}

// ── Reveal.js 초기화 ──────────────────────────────
async function initReveal() {
  await Reveal.initialize({
    hash: true,
    controls: true,
    progress: true,
    slideNumber: 'c/t',
    transition: 'slide',
    backgroundTransition: 'fade',
    autoAnimateEasing: 'ease',
    autoAnimateDuration: 0.6,
    center: true,
    width: 1100,
    height: 700,
    margin: 0.04,
  })
  console.log('[Reveal] 초기화 완료, 슬라이드 수:', Reveal.getTotalSlides())
}

// ── GestureEngine 연결 ────────────────────────────
function initGesture() {
  const videoEl = document.getElementById('webcam')
  const canvasEl = document.getElementById('landmark-canvas')
  const statusEl = document.getElementById('gesture-status')
  const gestureUi = document.getElementById('gesture-ui')

  if (!videoEl || !canvasEl) return

  const engine = new GestureEngine(videoEl, canvasEl)

  engine.onNextSlide = () => {
    console.log('[main] Reveal.next() 호출')
    Reveal.next()
  }

  engine.onViewChange = (zoom) => {
    const el = document.querySelector('.reveal')
    if (!el) return
    el.style.zoom = zoom === 1.0 ? '' : zoom
    showZoomIndicator(zoom)
  }

  engine.onGestureStatus = (text) => {
    if (statusEl) statusEl.textContent = text
  }

  engine.init().catch((err) => {
    console.warn('웹캠 또는 MediaPipe 초기화 실패 — 키보드 모드로 전환:', err)
    gestureUi.style.display = 'none'
  })
}

// ── 줌 인디케이터 ─────────────────────────────────
let zoomIndicatorTimer = null

function showZoomIndicator(scale) {
  let indicator = document.getElementById('zoom-indicator')
  if (!indicator) {
    indicator = document.createElement('div')
    indicator.id = 'zoom-indicator'
    document.body.appendChild(indicator)
  }
  indicator.textContent = `${Math.round(scale * 100)}%`
  indicator.classList.remove('active')
  // reflow 강제 후 애니메이션 재시작
  void indicator.offsetWidth
  indicator.classList.add('active')

  clearTimeout(zoomIndicatorTimer)
  zoomIndicatorTimer = setTimeout(() => {
    indicator.classList.remove('active')
  }, 800)
}

// ── 엔트리포인트 ──────────────────────────────────
window.addEventListener('DOMContentLoaded', async () => {
  await loadSlides()
  await initReveal()   // Reveal 완전 초기화 후
  initGesture()        // gesture 연결
})
