/**
 * GestureEngine — 4가지 제스처
 *
 *  ✌️ V사인 (검지+중지)  0.6초 유지 → 줌인 (2x)
 *  ☝️ 검지 1개          0.6초 유지 → 줌아웃 (1x)
 *  🖐→✊ 손 펼침→주먹    전환 순간  → 다음 슬라이드
 *  👍 엄지 올림/옆       0.6초 유지 → 이전 슬라이드
 */
class GestureEngine {
  #hands  = null
  #camera = null
  #videoEl
  #canvasEl
  #ctx

  // 줌
  #zoom    = 1.0
  ZOOM_IN  = 2.0   // V사인 → 고정 2배
  ZOOM_OUT = 1.0   // 검지  → 원래 크기

  // 제스처 dwell
  #holdGesture = null   // 'v-sign' | 'index-only' | 'thumb-up' | null
  #holdStart   = 0
  DWELL_MS       = 600
  THUMB_DWELL_MS = 200

  // 슬라이드 전환 (open→fist 트랜지션)
  #wasOpen           = false
  #lastOpenAt        = 0
  OPEN_WINDOW_MS     = 1000
  #lastNextAt        = 0
  #lastPrevAt        = 0
  NEXT_COOLDOWN_MS   = 1200
  PREV_COOLDOWN_MS   = 600

  // 콜백
  onNextSlide    = null   // () => void
  onPrevSlide    = null   // () => void
  onViewChange   = null   // (zoom) => void
  onGestureStatus = null  // (text) => void

  constructor(videoEl, canvasEl) {
    this.#videoEl  = videoEl
    this.#canvasEl = canvasEl
    this.#ctx      = canvasEl.getContext('2d')
  }

  // ── 초기화 ────────────────────────────────────────

  async init() {
    if (typeof Hands === 'undefined') throw new Error('MediaPipe Hands not loaded')

    this.#hands = new Hands({
      locateFile: (f) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}`
    })
    this.#hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7
    })
    this.#hands.onResults((r) => this.#onResults(r))

    const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } })
    this.#videoEl.srcObject = stream
    this.#videoEl.addEventListener('loadedmetadata', () => {
      this.#canvasEl.width  = this.#videoEl.videoWidth  || 320
      this.#canvasEl.height = this.#videoEl.videoHeight || 240
    })

    if (typeof Camera !== 'undefined') {
      this.#camera = new Camera(this.#videoEl, {
        onFrame: async () => { await this.#hands.send({ image: this.#videoEl }) },
        width: 320, height: 240
      })
      await this.#camera.start()
    } else {
      const loop = async () => {
        if (this.#videoEl.readyState >= 2) await this.#hands.send({ image: this.#videoEl })
        requestAnimationFrame(loop)
      }
      await this.#videoEl.play()
      loop()
    }
  }

  destroy() {
    this.#camera?.stop()
    this.#videoEl.srcObject?.getTracks().forEach(t => t.stop())
    this.#hands?.close()
  }

  // ── 프레임 처리 ───────────────────────────────────

  #onResults(results) {
    this.#ctx.clearRect(0, 0, this.#canvasEl.width, this.#canvasEl.height)

    if (!results.multiHandLandmarks?.length) {
      this.#wasOpen    = false
      this.#holdGesture = null
      this.#updateStatus('✋ 제스처 대기')
      return
    }

    const lm     = results.multiHandLandmarks[0]
    const isV     = this.#isVSign(lm)
    const isIdx   = this.#isIndexOnly(lm)
    const isThumb = this.#isThumbUp(lm)
    const isOpen  = this.#isOpenPalm(lm)
    const isFist  = this.#isFist(lm)

    this.#drawLandmarks(results)

    // ── 1. 슬라이드 전환: 손 펼침 → 주먹 ─────────────
    if (isOpen) {
      this.#lastOpenAt = Date.now()  // 열린 손 시각 기록 (중간 프레임 무관)
    }

    const recentlyOpen = (Date.now() - this.#lastOpenAt) < this.OPEN_WINDOW_MS

    if (isFist && recentlyOpen && !this.#isNextCooldown()) {
      console.log('[Gesture] ✊ 클릭 → 다음 슬라이드')
      this.#lastNextAt  = Date.now()
      this.#lastOpenAt  = 0
      this.#holdGesture = null
      this.#updateStatus('✊ 다음 슬라이드')
      this.#flashReveal('gesture-next')
      this.onNextSlide?.()
    }

    // ── 2. 엄지 → 이전 슬라이드 (dwell) ──────────────
    // ── 3. 줌 제스처 dwell ────────────────────────────
    const now     = Date.now()
    const gesture = (isThumb && !isFist) ? 'thumb-up' : isV ? 'v-sign' : isIdx ? 'index-only' : null

    if (gesture) {
      if (gesture !== this.#holdGesture) {
        this.#holdGesture = gesture
        this.#holdStart   = now
        const hint = isThumb ? '👍 엄지 → 이전 슬라이드'
                   : isV     ? '✌️ V사인 → 줌인'
                   :           '☝️ 검지 → 줌아웃'
        this.#updateStatus(`${hint} (유지 중...)`)
      } else if (now - this.#holdStart >= (isThumb ? this.THUMB_DWELL_MS : this.DWELL_MS)) {
        if (isThumb) {
          if (!this.#isPrevCooldown()) {
            console.log('[Gesture] 👍 엄지 → 이전 슬라이드')
            this.#lastPrevAt = Date.now()
            this.#updateStatus('👍 이전 슬라이드')
            this.#flashReveal('gesture-prev')
            this.onPrevSlide?.()
          }
          this.#holdStart = now + 99999
        } else {
          const newZoom = isV ? this.ZOOM_IN : this.ZOOM_OUT
          if (newZoom !== this.#zoom) {
            this.#zoom = newZoom
            console.log(`[Gesture] 줌 → ${this.#zoom}x`)
            this.#updateStatus(isV ? '🔍 줌 2x' : '🔍 원래 크기')
            this.onViewChange?.(this.#zoom)
          }
          this.#holdStart = now + 99999
        }
      }
    } else {
      this.#holdGesture = null
      if (!isFist) this.#updateStatus('👋 손 감지됨')
    }
  }

  // ── 제스처 판별 ───────────────────────────────────

  /** V사인: 검지 + 중지 펴고, 약지 + 새끼 닫음 */
  #isVSign(lm) {
    return lm[8].y  < lm[6].y   // 검지 tip > pip
        && lm[12].y < lm[10].y  // 중지 tip > pip
        && lm[16].y > lm[14].y  // 약지 닫힘
        && lm[20].y > lm[18].y  // 새끼 닫힘
  }

  /** 검지만: 검지만 펴고 나머지 닫음 */
  #isIndexOnly(lm) {
    return lm[8].y  < lm[6].y   // 검지 펴짐
        && lm[12].y > lm[10].y  // 중지 닫힘
        && lm[16].y > lm[14].y  // 약지 닫힘
        && lm[20].y > lm[18].y  // 새끼 닫힘
  }

  /** 손바닥 펼침: 검지~새끼 4개 이상 펴짐 */
  #isOpenPalm(lm) {
    const tips = [8, 12, 16, 20]
    const pips = [6, 10, 14, 18]
    return tips.filter((t, i) => lm[t].y < lm[pips[i]].y).length >= 4
  }

  /** 주먹: 검지~새끼 모두 닫힘 */
  #isFist(lm) {
    const tips = [8, 12, 16, 20]
    const pips = [6, 10, 14, 18]
    return tips.every((t, i) => lm[t].y > lm[pips[i]].y)
  }

  /**
   * 엄지 올림/옆: 엄지만 펴고(tip이 IP보다 멀리) 나머지 4개 닫힘
   * - 세로(thumbs-up): thumb tip이 IP보다 위 (y 작음)
   * - 가로(옆으로):    thumb tip이 IP보다 x축으로 멀리
   * 두 경우 모두 인정
   */
  #isThumbUp(lm) {
    const fingersClosed =
         lm[8].y  > lm[6].y    // 검지 닫힘
      && lm[12].y > lm[10].y   // 중지 닫힘
      && lm[16].y > lm[14].y   // 약지 닫힘
      && lm[20].y > lm[18].y   // 새끼 닫힘

    if (!fingersClosed) return false

    const thumbTip = lm[4]
    const thumbIP  = lm[3]
    const wrist    = lm[0]

    const thumbUp   = thumbTip.y < thumbIP.y - 0.04
    const thumbSide = Math.abs(thumbTip.x - thumbIP.x) > 0.06
                   && Math.abs(thumbTip.x - wrist.x)   > Math.abs(thumbIP.x - wrist.x)

    return thumbUp || thumbSide
  }

  // ── 유틸 ─────────────────────────────────────────

  #isNextCooldown()   { return Date.now() - this.#lastNextAt < this.NEXT_COOLDOWN_MS }
  #isPrevCooldown()   { return Date.now() - this.#lastPrevAt < this.PREV_COOLDOWN_MS }
  #updateStatus(text) { this.onGestureStatus?.(text) }

  #flashReveal(cls) {
    const el = document.querySelector('.reveal')
    if (!el) return
    el.classList.add(cls)
    setTimeout(() => el.classList.remove(cls), 600)
  }

  #drawLandmarks(results) {
    if (typeof drawConnectors === 'undefined') return
    for (const lm of results.multiHandLandmarks) {
      if (typeof HAND_CONNECTIONS !== 'undefined') {
        drawConnectors(this.#ctx, lm, HAND_CONNECTIONS,
          { color: 'rgba(63,185,80,0.6)', lineWidth: 1 })
      }
      drawLandmarks(this.#ctx, lm, { color: '#3fb950', lineWidth: 1, radius: 2 })
    }
  }
}
