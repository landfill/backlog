import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SlideBase } from "../components/SlideBase";
import { AnimatedText } from "../components/AnimatedText";
import { COLORS } from "../theme";

export const Slide07_OverflowSymptoms: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const symptoms = [
    { icon: "🚨", text: "초반에 준 지시와 역할을 무시하기 시작한다", danger: false },
    { icon: "🔴", text: "같은 실수를 조금씩 다른 방식으로 반복한다 (에러 루프)", danger: true },
    { icon: "🔄", text: "이미 해결한 문제를 다시 시도한다", danger: false },
    { icon: "🐢", text: "응답 속도가 눈에 띄게 느려진다", danger: false },
    { icon: "🌀", text: "두 프로젝트의 내용이 뒤섞인다 (맥락 오염)", danger: false },
  ];

  return (
    <SlideBase sectionNumber="02" sectionTitle="컨텍스트 윈도우의 정체">
      <AnimatedText delay={0}>
        <div style={{ fontSize: 52, fontWeight: 900, color: COLORS.text, marginBottom: 12 }}>
          컨텍스트가 가득 차면 나타나는 증상들
        </div>
      </AnimatedText>
      <AnimatedText delay={8}>
        <div style={{ fontSize: 30, color: COLORS.textMuted, marginBottom: 48 }}>
          AI가 멍청해진 게 아닙니다. <strong style={{ color: COLORS.warning }}>컨텍스트 윈도우가 오염됐거나 가득 찬 것입니다.</strong>
        </div>
      </AnimatedText>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {symptoms.map((s, i) => {
          const p = spring({
            frame: frame - 20 - i * 12,
            fps,
            config: { damping: 200 },
            durationInFrames: 28,
          });

          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 24,
                padding: s.danger ? "24px 32px" : "20px 32px",
                background: s.danger
                  ? "rgba(248,113,113,0.10)"
                  : "rgba(255,255,255,0.03)",
                border: s.danger
                  ? "2px solid rgba(248,113,113,0.4)"
                  : "1px solid rgba(255,255,255,0.07)",
                borderRadius: 14,
                opacity: interpolate(p, [0, 1], [0, 1]),
                transform: `translateX(${interpolate(p, [0, 1], [-40, 0])}px)`,
              }}
            >
              <div style={{ fontSize: 36, flexShrink: 0 }}>{s.icon}</div>
              <div
                style={{
                  fontSize: s.danger ? 30 : 27,
                  color: s.danger ? COLORS.danger : COLORS.text,
                  fontWeight: s.danger ? 700 : 400,
                  flex: 1,
                }}
              >
                {s.text}
              </div>
              {s.danger && (
                <div
                  style={{
                    background: "rgba(248,113,113,0.2)",
                    border: "1px solid rgba(248,113,113,0.5)",
                    borderRadius: 8,
                    padding: "6px 18px",
                    fontSize: 22,
                    color: COLORS.danger,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  ← 가장 위험한 신호
                </div>
              )}
            </div>
          );
        })}
      </div>
    </SlideBase>
  );
};
