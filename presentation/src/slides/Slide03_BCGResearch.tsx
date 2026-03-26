import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SlideBase } from "../components/SlideBase";
import { AnimatedText } from "../components/AnimatedText";
import { COLORS } from "../theme";

export const Slide03_BCGResearch: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const stats = [
    { value: "25%", label: "작업 속도 향상", color: COLORS.success },
    { value: "40%+", label: "결과물 품질 향상", color: COLORS.accentGlow },
    { value: "23%↓", label: "고유 판단 업무 성과\n(AI 사용 그룹)", color: COLORS.danger },
  ];

  return (
    <SlideBase sectionNumber="01" sectionTitle="오프닝">
      <AnimatedText delay={0}>
        <div style={{ fontSize: 34, color: COLORS.textMuted, marginBottom: 8, fontWeight: 500 }}>
          Harvard · Wharton · MIT 공동 연구 | BCG 컨설턴트 758명 대상 (2023)
        </div>
      </AnimatedText>

      <AnimatedText delay={8}>
        <div
          style={{
            fontSize: 58,
            fontWeight: 900,
            color: COLORS.text,
            marginBottom: 56,
            lineHeight: 1.2,
          }}
        >
          AI가 성과를 평준화하고 있습니다
          <span style={{ color: COLORS.accentGlow }}>.</span>
        </div>
      </AnimatedText>

      {/* 스탯 카드 */}
      <div style={{ display: "flex", gap: 32, marginBottom: 56 }}>
        {stats.map((stat, i) => {
          const p = spring({
            frame: frame - 20 - i * 12,
            fps,
            config: { damping: 200 },
            durationInFrames: 35,
          });

          return (
            <div
              key={i}
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.04)",
                border: `1px solid ${stat.color}40`,
                borderRadius: 20,
                padding: "40px 32px",
                textAlign: "center",
                opacity: interpolate(p, [0, 1], [0, 1]),
                transform: `translateY(${interpolate(p, [0, 1], [30, 0])}px)`,
              }}
            >
              <div
                style={{
                  fontSize: 80,
                  fontWeight: 900,
                  color: stat.color,
                  lineHeight: 1,
                  marginBottom: 16,
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontSize: 26,
                  color: COLORS.textMuted,
                  lineHeight: 1.5,
                  whiteSpace: "pre-line",
                }}
              >
                {stat.label}
              </div>
            </div>
          );
        })}
      </div>

      <AnimatedText delay={60}>
        <div
          style={{
            background: "linear-gradient(135deg, rgba(248,113,113,0.12), rgba(251,191,36,0.08))",
            border: "1px solid rgba(248,113,113,0.3)",
            borderRadius: 16,
            padding: "28px 40px",
          }}
        >
          <div
            style={{
              fontSize: 28,
              color: COLORS.warning,
              fontWeight: 700,
              marginBottom: 10,
            }}
          >
            ⚠️ 반전
          </div>
          <div style={{ fontSize: 27, color: COLORS.text, lineHeight: 1.6 }}>
            고유한 판단이 필요한 업무에서 AI 사용 그룹이 <strong style={{ color: COLORS.danger }}>23% 낮은 성과</strong>를 냈습니다.
            <br />
            <span style={{ color: COLORS.textMuted, fontSize: 24 }}>
              전문성의 가치는 사라지지 않았습니다. 다만, AI가 참고할 수 있는 형태로 <strong style={{ color: COLORS.accentGlow }}>전달해야</strong> 의미가 있습니다.
            </span>
          </div>
        </div>
      </AnimatedText>
    </SlideBase>
  );
};
