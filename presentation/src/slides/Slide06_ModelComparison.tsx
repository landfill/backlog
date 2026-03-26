import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SlideBase } from "../components/SlideBase";
import { AnimatedText } from "../components/AnimatedText";
import { AnimatedTable } from "../components/AnimatedTable";
import { COLORS } from "../theme";

export const Slide06_ModelComparison: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <SlideBase sectionNumber="02" sectionTitle="컨텍스트 윈도우의 정체">
      <AnimatedText delay={0}>
        <div style={{ fontSize: 52, fontWeight: 900, color: COLORS.text, marginBottom: 48 }}>
          모델별 컨텍스트 윈도우 크기 비교
        </div>
      </AnimatedText>

      <AnimatedTable
        delay={15}
        headers={["도구 / 모델", "토큰", "한글 기준", "A4 환산"]}
        rows={[
          ["ChatGPT 무료 (GPT-3.5)", "16K", "약 8천 자", "약 25페이지"],
          ["ChatGPT Plus (GPT-4o)", "128K", "약 6.4만 자", "약 190페이지"],
          ["Claude Pro (Sonnet 4.5)", "200K", "약 10만 자", "약 300페이지"],
          ["GPT-5", "400K", "약 20만 자", "약 600페이지"],
          ["Gemini 2.5 Pro", "1,000K (1M)", "약 50만 자", "약 1,500페이지"],
        ]}
        highlightRows={[2]}
      />

      <AnimatedText delay={80}>
        <div style={{ display: "flex", gap: 28, marginTop: 32 }}>
          <div
            style={{
              flex: 1,
              padding: "20px 28px",
              background: "rgba(34,211,238,0.08)",
              border: "1px solid rgba(34,211,238,0.25)",
              borderRadius: 12,
              fontSize: 24,
              color: COLORS.accentSecondary,
            }}
          >
            💡 1 토큰 ≈ 한글 0.5자 / A4 1페이지 ≈ 약 700 토큰
          </div>
          <div
            style={{
              flex: 1,
              padding: "20px 28px",
              background: "rgba(251,191,36,0.08)",
              border: "1px solid rgba(251,191,36,0.25)",
              borderRadius: 12,
              fontSize: 24,
              color: COLORS.warning,
            }}
          >
            ⚠️ 크기가 크다고 능사가 아닙니다. 핵심은 <strong>무엇을 어떻게 넣느냐</strong>입니다
          </div>
        </div>
      </AnimatedText>
    </SlideBase>
  );
};
