import React, { useRef, useState, useCallback, useEffect } from "react";
import { Player, PlayerRef } from "@remotion/player";

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

const SLIDE_DURATIONS_SEC = [
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
];

const SLIDE_DURATIONS = SLIDE_DURATIONS_SEC.map((s) => s * FPS);

const SLIDES = [
  { component: Slide01_Title,           label: "타이틀" },
  { component: Slide02_FOMO,            label: "오프닝" },
  { component: Slide04_ContextWindow,   label: "컨텍스트 윈도우" },
  { component: Slide05_WhatInContext,   label: "윈도우 구성" },
  { component: Slide06_ModelComparison, label: "모델 비교" },
  { component: Slide07_OverflowSymptoms,label: "오버플로우 증상" },
  { component: Slide08_Paradigm,        label: "패러다임 전환" },
  { component: Slide09_ContextExample,  label: "컨텍스트 예시" },
  { component: Slide10_ContextReset,    label: "컨텍스트 리셋" },
  { component: Slide03_BCGResearch,     label: "하네스 소개" },
  { component: Slide11_Harness,         label: "하네스 3요소" },
  { component: Slide12_CursorTips,      label: "Cursor 팁" },
  { component: Slide13_SkillsForAll,    label: "비개발자 스킬" },
  { component: Slide14_Demo,            label: "데모" },
  { component: Slide15_Closing,         label: "클로징" },
];

const NUM_SLIDES = SLIDES.length;

export const PlayerApp: React.FC = () => {
  const playerRef = useRef<PlayerRef>(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const [ended, setEnded] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  // 슬라이드 전환
  const goToSlide = useCallback((index: number) => {
    if (index < 0 || index >= NUM_SLIDES) return;
    setFadeOut(true);
    setTimeout(() => {
      setSlideIndex(index);
      setEnded(false);
      setFadeOut(false);
    }, 220);
  }, []);

  const goNext = useCallback(() => {
    if (slideIndex < NUM_SLIDES - 1) goToSlide(slideIndex + 1);
  }, [slideIndex, goToSlide]);

  const goPrev = useCallback(() => {
    if (slideIndex > 0) goToSlide(slideIndex - 1);
  }, [slideIndex, goToSlide]);

  // 새 슬라이드로 전환 시 자동 재생
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    player.seekTo(0);
    player.play();
  }, [slideIndex]);

  // 슬라이드 끝 감지
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    const onEnded = () => setEnded(true);
    player.addEventListener("ended", onEnded);
    return () => player.removeEventListener("ended", onEnded);
  }, [slideIndex]);

  // 키보드 네비게이션
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "Enter") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "Escape") {
        // 첫 슬라이드로 리셋
        goToSlide(0);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goNext, goPrev, goToSlide]);

  const CurrentSlide = SLIDES[slideIndex].component;
  const isLast = slideIndex === NUM_SLIDES - 1;

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: isLast ? "default" : "pointer",
        userSelect: "none",
      }}
      onClick={isLast ? undefined : goNext}
    >
      {/* 슬라이드 영역 */}
      <div
        style={{
          width: "100%",
          height: "100%",
          opacity: fadeOut ? 0 : 1,
          transition: "opacity 0.22s ease",
          position: "relative",
        }}
      >
        <Player
          ref={playerRef}
          key={slideIndex}
          component={CurrentSlide}
          durationInFrames={SLIDE_DURATIONS[slideIndex]}
          compositionWidth={1920}
          compositionHeight={1080}
          fps={FPS}
          style={{ width: "100%", height: "100%" }}
          controls={false}
          loop={false}
          acknowledgeRemotionLicense
        />
      </div>

      {/* 슬라이드 끝났을 때 클릭 유도 오버레이 */}
      {ended && !isLast && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            paddingBottom: 80,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "rgba(99,102,241,0.15)",
              border: "1px solid rgba(99,102,241,0.35)",
              borderRadius: 100,
              padding: "12px 28px",
              color: "rgba(255,255,255,0.7)",
              fontSize: 16,
              fontFamily: "'Noto Sans KR', sans-serif",
              animation: "pulse 1.5s ease infinite",
            }}
          >
            <span>클릭하거나</span>
            <kbd style={{
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 4,
              padding: "2px 8px",
              fontSize: 13,
            }}>→</kbd>
            <span>키를 눌러 다음 슬라이드로</span>
          </div>
        </div>
      )}

      {/* 하단 슬라이드 인디케이터 */}
      <div
        style={{
          position: "fixed",
          bottom: 20,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 6,
          pointerEvents: "none",
          zIndex: 100,
        }}
      >
        {SLIDES.map((_, i) => (
          <div
            key={i}
            style={{
              width: i === slideIndex ? 28 : 8,
              height: 8,
              borderRadius: 4,
              background:
                i === slideIndex
                  ? "#6366F1"
                  : i < slideIndex
                  ? "rgba(99,102,241,0.45)"
                  : "rgba(255,255,255,0.18)",
              transition: "all 0.3s ease",
            }}
          />
        ))}
      </div>

      {/* 슬라이드 번호 */}
      <div
        style={{
          position: "fixed",
          top: 18,
          right: 22,
          color: "rgba(255,255,255,0.35)",
          fontSize: 13,
          fontFamily: "'Noto Sans KR', sans-serif",
          pointerEvents: "none",
          zIndex: 100,
        }}
      >
        {slideIndex + 1} / {NUM_SLIDES}
      </div>

      {/* 이전 버튼 (왼쪽 화살표) */}
      {slideIndex > 0 && (
        <button
          onClick={(e) => { e.stopPropagation(); goPrev(); }}
          style={{
            position: "fixed",
            left: 16,
            top: "50%",
            transform: "translateY(-50%)",
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: "50%",
            width: 44,
            height: 44,
            color: "rgba(255,255,255,0.5)",
            fontSize: 20,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.18)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
        >
          ‹
        </button>
      )}

      {/* 다음 버튼 (오른쪽 화살표) */}
      {!isLast && (
        <button
          onClick={(e) => { e.stopPropagation(); goNext(); }}
          style={{
            position: "fixed",
            right: 16,
            top: "50%",
            transform: "translateY(-50%)",
            background: "rgba(99,102,241,0.2)",
            border: "1px solid rgba(99,102,241,0.35)",
            borderRadius: "50%",
            width: 44,
            height: 44,
            color: "rgba(255,255,255,0.7)",
            fontSize: 20,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(99,102,241,0.4)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(99,102,241,0.2)")}
        >
          ›
        </button>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.02); }
        }
      `}</style>
    </div>
  );
};
