import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SlideBase } from "../components/SlideBase";
import { AnimatedText } from "../components/AnimatedText";
import { COLORS } from "../theme";

export const Slide02_FOMO: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const quoteP = spring({ frame: frame - 10, fps, config: { damping: 200 }, durationInFrames: 40 });
  const msgP = spring({ frame: frame - 50, fps, config: { damping: 200 }, durationInFrames: 35 });

  return (
    <SlideBase sectionNumber="01" sectionTitle="오프닝">
      <AnimatedText delay={0}>
        <div
          style={{
            fontSize: 56,
            fontWeight: 900,
            color: COLORS.text,
            marginBottom: 48,
            lineHeight: 1.2,
          }}
        >
          같이 달려봐야{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #6366F1, #22D3EE)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            비로소 보입니다
          </span>
        </div>
      </AnimatedText>

      <div
        style={{
          opacity: interpolate(quoteP, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(quoteP, [0, 1], [30, 0])}px)`,
          padding: "36px 48px",
          background: "rgba(99,102,241,0.08)",
          border: "1px solid rgba(99,102,241,0.25)",
          borderRadius: 20,
          borderLeft: "4px solid #6366F1",
          marginBottom: 48,
        }}
      >
        <div style={{ fontSize: 30, color: COLORS.textMuted, lineHeight: 1.8 }}>
          "AI 시대에 나만 뒤처지는 것 같은 불안, 다들 느끼시죠.
          <br />
          근데 그 불안은 공부가 부족해서가 아닙니다.
          <br />
          밖에서 구경만 하고 있기 때문입니다.
          <br />
          <span style={{ color: COLORS.accentGlow, fontWeight: 600 }}>
            같이 달려봐야 비로소 보이기 시작합니다."
          </span>
        </div>
      </div>

      <div
        style={{
          opacity: interpolate(msgP, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(msgP, [0, 1], [20, 0])}px)`,
          padding: "32px 44px",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 16,
        }}
      >
        <div style={{ fontSize: 32, color: COLORS.text, lineHeight: 1.7, fontWeight: 500 }}>
          AI를 잘 쓴다는 건 질문을 잘 하는 게 아닙니다.
          <br />
          <strong
            style={{
              background: "linear-gradient(135deg, #6366F1, #22D3EE)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              fontSize: 36,
            }}
          >
            내 경험과 판단을 AI가 참고할 수 있는 형태로 전달하는 것
          </strong>
          입니다.
          <br />
          <span style={{ color: COLORS.textMuted, fontSize: 28 }}>
            오늘은 그 전달 방법을 다룹니다.
          </span>
        </div>
      </div>
    </SlideBase>
  );
};
