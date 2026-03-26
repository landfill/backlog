import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SlideBase } from "../components/SlideBase";
import { AnimatedText } from "../components/AnimatedText";
import { COLORS } from "../theme";

export const Slide04_ContextWindow: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const rows = [
    {
      icon: "📚",
      title: "학습 데이터",
      subtitle: "장기 기억",
      desc: "AI가 읽어온 도서관 전체",
      badge: "변경 불가",
      badgeColor: COLORS.textDim,
      borderColor: "rgba(100,116,139,0.3)",
    },
    {
      icon: "🖥️",
      title: "컨텍스트 윈도우",
      subtitle: "작업 메모리",
      desc: "지금 책상 위에 펼쳐진 서류들",
      badge: "우리가 관리",
      badgeColor: COLORS.accentGlow,
      borderColor: "rgba(99,102,241,0.4)",
    },
  ];

  return (
    <SlideBase sectionNumber="02" sectionTitle="컨텍스트 윈도우의 정체">
      <AnimatedText delay={0}>
        <div
          style={{
            fontSize: 62,
            fontWeight: 900,
            color: COLORS.text,
            marginBottom: 56,
            lineHeight: 1.2,
          }}
        >
          AI에게는 기억이{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #6366F1, #22D3EE)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            두 종류
          </span>
          가 있습니다
        </div>
      </AnimatedText>

      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        {rows.map((row, i) => {
          const p = spring({
            frame: frame - 15 - i * 20,
            fps,
            config: { damping: 200 },
            durationInFrames: 35,
          });

          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 40,
                background: "rgba(255,255,255,0.03)",
                border: `2px solid ${row.borderColor}`,
                borderRadius: 20,
                padding: "36px 48px",
                opacity: interpolate(p, [0, 1], [0, 1]),
                transform: `translateX(${interpolate(p, [0, 1], [-50, 0])}px)`,
              }}
            >
              <div style={{ fontSize: 64, flexShrink: 0 }}>{row.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 8 }}>
                  <span style={{ fontSize: 36, fontWeight: 800, color: COLORS.text }}>
                    {row.title}
                  </span>
                  <span
                    style={{
                      background: "rgba(99,102,241,0.15)",
                      border: "1px solid rgba(99,102,241,0.3)",
                      borderRadius: 8,
                      padding: "4px 14px",
                      fontSize: 22,
                      color: COLORS.accentGlow,
                      fontWeight: 600,
                    }}
                  >
                    {row.subtitle}
                  </span>
                </div>
                <div style={{ fontSize: 28, color: COLORS.textMuted }}>💬 "{row.desc}"</div>
              </div>
              <div
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: `1px solid ${row.borderColor}`,
                  borderRadius: 12,
                  padding: "14px 28px",
                  fontSize: 24,
                  color: row.badgeColor,
                  fontWeight: 700,
                  flexShrink: 0,
                  textAlign: "center",
                }}
              >
                {row.badge}
              </div>
            </div>
          );
        })}
      </div>

      <AnimatedText delay={60}>
        <div
          style={{
            marginTop: 48,
            padding: "28px 40px",
            background: "rgba(99,102,241,0.10)",
            border: "1px solid rgba(99,102,241,0.3)",
            borderRadius: 14,
            fontSize: 30,
            color: COLORS.accentGlow,
            fontWeight: 700,
            textAlign: "center",
          }}
        >
          📌 핵심: 컨텍스트 윈도우의 크기는 정해져 있고, 우리가 직접 관리해야 합니다
        </div>
      </AnimatedText>
    </SlideBase>
  );
};
