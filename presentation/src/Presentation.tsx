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
import { Slide12_CursorTips } from "./slides/Slide12_CursorTips";
import { Slide13_SkillsForAll } from "./slides/Slide13_SkillsForAll";
import { Slide14_Demo } from "./slides/Slide14_Demo";
import { Slide15_Closing } from "./slides/Slide15_Closing";

const FPS = 30;

// 각 슬라이드 표시 시간 (초 → 프레임)
const SLIDE_DURATIONS = [
  10, // 01 타이틀
  10, // 02 FOMO
  10, // 03 BCG 연구
  10, // 04 컨텍스트 윈도우
  9,  // 05 윈도우 구성요소
  10, // 06 모델 비교
  9,  // 07 오버플로우 증상
  9,  // 08 패러다임
  10, // 09 컨텍스트 예시
  9,  // 10 컨텍스트 리셋
  10, // 11 하니스
  10, // 12 Cursor 팁
  10, // 13 비개발자 스킬
  10, // 14 데모
  14, // 15 클로징
].map((s) => s * FPS);

const TRANSITION_FRAMES = 18;

const slides = [
  Slide01_Title,
  Slide02_FOMO,
  Slide04_ContextWindow,
  Slide05_WhatInContext,
  Slide06_ModelComparison,
  Slide07_OverflowSymptoms,
  Slide08_Paradigm,
  Slide09_ContextExample,
  Slide10_ContextReset,
  Slide03_BCGResearch,
  Slide11_Harness,
  Slide12_CursorTips,
  Slide13_SkillsForAll,
  Slide14_Demo,
  Slide15_Closing,
];

// 전환 효과 패턴 (슬라이드 경계마다)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const transitions: any[] = [
  fade(),       // 타이틀→오프닝
  fade(),       // 오프닝→컨텍스트윈도우 (섹션 전환)
  wipe({ direction: "from-left" }),    // 윈도우→구성요소
  slide({ direction: "from-right" }), // 구성요소→모델비교
  wipe({ direction: "from-left" }),   // 모델비교→오버플로우
  fade(),       // 오버플로우→패러다임 (섹션 전환)
  slide({ direction: "from-right" }), // 패러다임→컨텍스트예시
  wipe({ direction: "from-left" }),   // 예시→리셋
  fade(),       // 리셋→하네스소개 (섹션 전환)
  slide({ direction: "from-right" }), // 하네스소개→3요소
  fade(),       // 3요소→Cursor팁 (섹션 전환)
  fade(),       // Cursor팁→비개발자 (섹션 전환)
  slide({ direction: "from-right" }), // 비개발자→데모
  fade(),       // 데모→클로징
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
