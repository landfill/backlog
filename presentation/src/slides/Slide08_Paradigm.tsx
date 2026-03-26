import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SlideBase } from "../components/SlideBase";
import { AnimatedText } from "../components/AnimatedText";
import { COLORS } from "../theme";

export const Slide08_Paradigm: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const arrowP = spring({ frame: frame - 40, fps, config: { damping: 200 }, durationInFrames: 30 });

  return (
    <SlideBase sectionNumber="03" sectionTitle="프롬프트 → 컨텍스트 엔지니어링으로">
      <AnimatedText delay={0}>
        <div style={{ fontSize: 52, fontWeight: 900, color: COLORS.text, marginBottom: 64 }}>
          패러다임 전환
        </div>
      </AnimatedText>

      <div style={{ display: "flex", alignItems: "center", gap: 40, marginBottom: 64 }}>
        {/* 왼쪽: 과거 */}
        <AnimatedText delay={15} style={{ flex: 1 }}>
          <div
            style={{
              padding: "44px 40px",
              background: "rgba(100,116,139,0.08)",
              border: "1px solid rgba(100,116,139,0.25)",
              borderRadius: 20,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 28, color: COLORS.textDim, marginBottom: 16, fontWeight: 600, letterSpacing: "0.05em" }}>
              과거
            </div>
            <div style={{ fontSize: 40, fontWeight: 900, color: COLORS.textMuted, marginBottom: 12 }}>
              프롬프트 엔지니어링
            </div>
            <div style={{ fontSize: 28, color: COLORS.textDim }}>
              어떻게 질문할까?
            </div>
          </div>
        </AnimatedText>

        {/* 화살표 */}
        <div
          style={{
            opacity: interpolate(arrowP, [0, 1], [0, 1]),
            transform: `scale(${interpolate(arrowP, [0, 1], [0.5, 1])})`,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              fontSize: 64,
              background: "linear-gradient(135deg, #6366F1, #22D3EE)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            →
          </div>
        </div>

        {/* 오른쪽: 지금 */}
        <AnimatedText delay={30} style={{ flex: 1 }}>
          <div
            style={{
              padding: "44px 40px",
              background: "rgba(99,102,241,0.10)",
              border: "2px solid rgba(99,102,241,0.4)",
              borderRadius: 20,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 28, color: COLORS.accentGlow, marginBottom: 16, fontWeight: 600, letterSpacing: "0.05em" }}>
              지금
            </div>
            <div
              style={{
                fontSize: 40,
                fontWeight: 900,
                background: "linear-gradient(135deg, #6366F1, #22D3EE)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                marginBottom: 12,
              }}
            >
              컨텍스트 엔지니어링
            </div>
            <div style={{ fontSize: 28, color: COLORS.text, fontWeight: 600 }}>
              무엇을 어떻게 채워넣을까?
            </div>
          </div>
        </AnimatedText>
      </div>

      <AnimatedText delay={70}>
        <div
          style={{
            padding: "32px 44px",
            background: "rgba(99,102,241,0.08)",
            border: "1px solid rgba(99,102,241,0.25)",
            borderRadius: 16,
            fontSize: 30,
            color: COLORS.text,
            lineHeight: 1.7,
            textAlign: "center",
          }}
        >
          <span style={{ color: COLORS.accentGlow, fontWeight: 700 }}>AI는 받은 맥락을 증폭하는 도구입니다.</span>
          <br />
          좋은 맥락을 넣으면 좋은 결과가 나오고, 잘못된 맥락을 넣으면{" "}
          <span style={{ color: COLORS.danger }}>틀린 결과를 그럴듯하게 포장</span>합니다.
        </div>
      </AnimatedText>
    </SlideBase>
  );
};
