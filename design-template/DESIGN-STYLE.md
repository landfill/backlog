# 네오모피즘 오디오 UI — 디자인 스타일 가이드

> **비주얼 디렉션:** 촉각적 미니멀리즘과 앰비언트 발광 (Tactile Minimalism with Ambient Glow)  
> 코드 템플릿: `templates/NeomorphismSynthApp.jsx`

---

## 1. 개요

오디오/신스 인터페이스용 네오모피즘 디자인 시스템. 플랫 디자인의 미니멀리즘과 스큐어모피즘의 입체감을 결합해, 노브·패드·스위치 등 조작부에 본능적인 상호작용(누르기, 돌리기, 밀기)을 유도한다.

---

## 2. 기획 배경 및 디자인 전략

### 2.1. 왜 네오모피즘인가?

네오모피즘은 **정보 밀도가 낮고 물리적인 '조작감' 자체가 중요한** 오디오 인터페이스(노브, 페이더 등)에 최적화된 디자인 언어입니다. 플랫 디자인의 미니멀리즘과 스큐어모피즘의 입체감을 결합하여 사용자에게 본능적인 상호작용(누르기, 돌리기, 밀기)을 유도합니다.

### 2.2. 네오모피즘의 한계(접근성) 극복 방안

명도 대비가 낮은 네오모피즘의 단점을 보완하기 위해 다음 시각·기능 장치를 도입합니다.

| 방안 | 설명 |
|------|------|
| **인터랙티브 발광 (LED Glow)** | 활성화된 요소나 현재 값을 나타낼 때 강렬한 네온 포인트 컬러(Accent Color)를 사용하여 시인성 확보 |
| **호버(Hover) 및 툴팁 피드백** | 마우스 오버 시 미세한 애니메이션과 함께 정확한 파라미터 수치를 명도 대비가 뚜렷한 툴팁으로 제공 |

---

## 3. 사용자 경험(UX) 설계

### 3.1. 핵심 사용자 시나리오

- **탐색:** 무광 플라스틱 질감의 UI에 은은하게 빛나는 디스플레이 창을 확인한다.
- **건반 연주:** 건반 클릭 시, 물리적 버튼이 안으로 파이는 시각적 피드백과 함께 소리를 듣는다.
- **사운드 스컬프팅:** Filter 노브를 수직 드래그하여 돌린다. 주위에 오렌지색 LED가 차오르며 소리의 질감이 실시간으로 변한다.
- **이펙트 제어:** Reverb 토글 스위치를 누르면 스위치가 함몰되며 점등되고, 소리에 공간감이 더해진다.
- **초기화:** 잘못 조작된 노브를 **더블 클릭**하여 즉시 기본값으로 되돌린다.

### 3.2. UX 인터랙션 패턴

| 패턴 | 설명 |
|------|------|
| **수직 드래그 (Rotary Drag)** | 노브(다이얼) 조작 시 마우스를 위/아래로 드래그하여 값을 조절 |
| **촉각적 상태 전환** | 버튼 클릭 시 외부 그림자(Drop) → 내부 그림자(Inner)로 전환하여 명확한 조작감 제공 |
| **등장 애니메이션** | `entrance` / `itemEntrance`: 그룹은 아래에서 위로 등장, 개별 요소는 평면 아래에서 위로 솟아오르며 그림자 부여 |

---

## 4. 비주얼 디렉션 및 디자인 시스템

### 4.1. 색상 토큰 (Color Tokens)

코드 상 `COLORS` 객체와 매핑된다.

| 토큰명 | HEX / 값 | 용도 |
|--------|----------|------|
| `base` | `#E8EDF4` | 무광 플라스틱 느낌의 쿨 그레이, 앱·패널 배경 |
| `shadowLight` | `rgba(255, 255, 255, 0.5)` | 광원을 받는 하이라이트 (emboss 그림자) |
| `shadowDark` | `rgba(175, 185, 205, 0.18)` | 빛의 반대편 음영 (emboss 그림자) |
| `accent` | `#FF5E3A` | 활성화·녹음·노브 지시선 등 네온 오렌지 |
| `accentLoop` | `#3A82FF` | 루프 재생 등 보조 액센트(블루) |
| `textSub` | `#9AA3B3` | 보조 텍스트, 비활성 라벨 |
| `textMain` | `#111317` | 주 텍스트, 선명한 블랙 (시인성 강화) |

추가 코드 내 사용 색상:

- **Flat(눌림) 배경:** `#E4E9F1`
- **비주얼라이저 배경:** `rgba(175, 185, 205, 0.12)`
- **라벨/툴팁 그레이:** `#5A6270`
- **링 트랙 비활성:** `rgba(208, 214, 224, 0.25)`

### 4.2. 물리적 위계 (Z-Axis Elevation)

모든 요소는 **좌측 상단(135°)에서 내려오는 단일 광원**을 기준으로 한다.

| 레벨 | 명칭 | 렌더링 방식 (CSS 힌트) | 적용 대상 |
|------|------|------------------------|-----------|
| **Level 0** | 베이스 캔버스 | `background: base` | 앱 전체 배경 |
| **Level 1** | 모듈 패널 | 넓고 부드러운 돌출형 그림자 (Soft Emboss) | 메인 카드, 오실레이터·필터 그룹 배경 |
| **Level 2** | 조작부 (상호작역) | 좁고 뚜렷한 돌출형 그림자 (Hard Emboss) | 조작 전 버튼, 노브, 패드 |
| **Level -1** | 디스플레이/트랙 | 깊은 내부 그림자 (Deep Deboss) | LCD 창, 슬라이더 레일 |
| **Flat** | 활성/눌림 상태 | 그림자 제거 + 약간 어두운 배경 | 눌린 버튼, 켜진 스위치 |
| **Level 3** | 액센트 발광 | Flat + Accent 색상 Glow | 노브 LED, 선택된 웨이브, 루프 인디케이터 |

### 4.3. 스타일 객체 (NEO_STYLES) — 코드 매핑

| 스타일 | 용도 |
|--------|------|
| `level0` | 배경 + 텍스트 컬러 |
| `level1` | 메인 패널: `20px 20px 60px` shadow, `borderRadius: 32px` |
| `level2` | 작은 emboss: `3px 3px 8px` shadow |
| `flat` | 눌림/활성: shadow 제거, `#E4E9F1` 배경 |
| `entrance(isLoaded, delay)` | 그룹 등장: opacity, translateY(12px), ease-out 트랜지션 |
| `itemEntrance(isLoaded, delay)` | 개별 요소 등장: translateY(8px) + boxShadow 전환 |

---

## 5. 핵심 컴포넌트 명세

| 컴포넌트 | 상태 전환 | 피드백 |
|----------|-----------|--------|
| **Piano Key / MIDI Pad** | Level 2 (평상시) → Flat (누름) | 클릭 시 함몰 + 중앙에 `textMain`/`textSub` 발광 점 |
| **Control Knob (Ring)** | Ring: Level 2 위에 미세한 비활성 트랙 + 활성 arc | 수직 드래그로 값 변경, 호버 시 툴팁, 더블클릭 시 기본값 |
| **Wave Selector** | 버튼: Level 2 → Flat(선택 시) | 선택 시 `accent` + textShadow glow |
| **Loop Slot** | Level 2 → Flat(recording/looping) | 녹음 중 `accent` 점, 재생 중 `accentLoop` 점 |
| **Geometry Visualizer** | Level -1 느낌의 깊은 영역 | 오디오 스펙트럼에 따른 동심원 + 블랙 점선/펄스 |

---

## 6. 타이포그래피

- **라벨:** `10px` / `font-semibold` / `tracking-[0.2em]` / `uppercase` / `#5A6270`
- **값/숫자:** `9px`~`11px` / `font-mono` 또는 `font-bold` / `textMain` 또는 `textSub`
- **상태/프리셋:** `9px`~`11px` / `tracking-[0.2em]`~`[0.4em]` / 그레이 계열

---

## 7. 프론트엔드 데이터 모델 (State)

템플릿 앱에서 사용하는 신스 상태 구조:

```javascript
const synthState = {
  oscillator: { type: 'triangle', detune: 0 },
  envelope: { attack: 0.01, decay: 0.2, sustain: 0.2, release: 1.5 },
  filter: { cutoff: 1200, resonance: 4 },
  effects: { delay: 0.3 },
  global: { masterVolume: 0.8, currentPreset: 'MULTILOOP PRO' }
};
```

---

## 8. 참고 — 템플릿 파일

- **코드:** `templates/NeomorphismSynthApp.jsx`
- **구성:** Design Tokens → AudioEngine (Web Audio API) → GeometryVisualizer, ControlKnobRing, WaveSelector, MidiPad → App (Loops, Pads, State)

이 문서는 위 템플릿의 디자인 스타일을 재사용할 때 기준으로 삼기 위한 것이다.
