import React from "react";
import { TransitionSeries, linearTiming, springTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";

import { Slide01_Title } from "./slides/Slide01_Title";
import { Slide02_FOMO } from "./slides/Slide02_FOMO";
import { Slide03_BCGResearch } from "./slides/Slide03_BCGResearch";
import { Slide04_ContextWindow } from "./slides/Slide04_ContextWindow";
import { Slide05_WhatInContext } from "./slides/Slide05_WhatInContext";
import { Slide06_ModelComparison } from "./slides/Slide06_ModelComparison";
import { Slide07_OverflowSymptoms } from "./slides/Slide07_OverflowSymptoms";
import { Slide08_Paradigm } from "./slides/Slide08_Paradigm";
import { Slide09_ContextExample } from "./slides/Slide09_ContextExample";
import { Slide10_ContextReset } from "./slides/Slide10_ContextReset";
import { Slide11_Harness } from "./slides/Slide11_Harness";
import { Slide_ContextGrowth } from "./slides/Slide_ContextGrowth";
import { Slide12_CursorTips } from "./slides/Slide12_CursorTips";
import { Slide13_SkillsForAll } from "./slides/Slide13_SkillsForAll";
import { Slide14_Demo } from "./slides/Slide14_Demo";
import { Slide15_Closing } from "./slides/Slide15_Closing";

const FPS = 30;

// 각 슬라이드 표시 시간 (초 → 프레임)
const SLIDE_DURATIONS = [
  10, // 01 타이틀
  10, // 02 오프닝 (FOMO)
  10, // 03 컨텍스트 윈도우 — Section 02
  9,  // 04 윈도우 구성요소
  10, // 05 컨텍스트 성장 시각화
  10, // 06 모델 비교
  9,  // 07 오버플로우 증상
  9,  // 08 패러다임 전환 — Section 03
  10, // 09 컨텍스트 예시
  10, // 10 Cursor 실무 — Section 04
  9,  // 11 가득 찰 때 대처
  10, // 12 해외 사례 — Section 05
  10, // 13 데모 — Section 06
  10, // 14 하네스 소개 — Section 07
  10, // 15 하네스 3요소
  14, // 16 클로징 — Section 08
].map((s) => s * FPS);

const TRANSITION_FRAMES = 18;

const slides = [
  Slide01_Title,
  Slide02_FOMO,
  Slide04_ContextWindow,
  Slide05_WhatInContext,
  Slide_ContextGrowth,
  Slide06_ModelComparison,
  Slide07_OverflowSymptoms,
  Slide08_Paradigm,
  Slide09_ContextExample,
  Slide12_CursorTips,
  Slide10_ContextReset,
  Slide13_SkillsForAll,
  Slide14_Demo,
  Slide03_BCGResearch,
  Slide11_Harness,
  Slide15_Closing,
];

// 전환 효과 패턴 (슬라이드 경계마다)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const transitions: any[] = [
  fade(),       // 타이틀→오프닝
  fade(),       // 오프닝→컨텍스트윈도우 (섹션 전환 01→02)
  wipe({ direction: "from-left" }),    // 윈도우→구성요소
  wipe({ direction: "from-left" }),   // 구성요소→컨텍스트성장
  slide({ direction: "from-right" }), // 컨텍스트성장→모델비교
  wipe({ direction: "from-left" }),   // 모델비교→오버플로우
  fade(),       // 오버플로우→패러다임 (섹션 전환 02→03)
  slide({ direction: "from-right" }), // 패러다임→컨텍스트예시
  fade(),       // 컨텍스트예시→Cursor실무 (섹션 전환 03→04)
  wipe({ direction: "from-left" }),   // Cursor실무→가득찰때
  fade(),       // 가득찰때→해외사례 (섹션 전환 04→05)
  slide({ direction: "from-right" }), // 해외사례→데모 (05→06)
  fade(),       // 데모→하네스소개 (섹션 전환 06→07)
  slide({ direction: "from-right" }), // 하네스소개→3요소
  fade(),       // 하네스→클로징 (07→08)
];

export const Presentation: React.FC = () => {
  return (
    <TransitionSeries>
      {slides.map((SlideComponent, i) => (
        <React.Fragment key={i}>
          <TransitionSeries.Sequence durationInFrames={SLIDE_DURATIONS[i]}>
            <SlideComponent />
          </TransitionSeries.Sequence>
          {i < slides.length - 1 && (
            <TransitionSeries.Transition
              presentation={transitions[i]}
              timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
            />
          )}
        </React.Fragment>
      ))}
    </TransitionSeries>
  );
};

// 총 길이 계산 (참고용)
export const TOTAL_FRAMES =
  SLIDE_DURATIONS.reduce((sum, d) => sum + d, 0) -
  TRANSITION_FRAMES * (slides.length - 1);
