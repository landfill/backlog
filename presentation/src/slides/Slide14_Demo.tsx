import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SlideBase } from "../components/SlideBase";
import { AnimatedText } from "../components/AnimatedText";
import { COLORS } from "../theme";

export const Slide14_Demo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const steps = [
    {
      num: "①",
      title: "스킬 파일 열어서 구조 확인",
      time: "30초",
      detail: "Cursor에서 SKILL.md 파일 직접 오픈 — 코드가 아닙니다. 그냥 텍스트입니다.",
      color: COLORS.accentGlow,
    },
    {
      num: "②",
      title: "재미 데모 — 욕 → 비즈니스 변환기",
      time: "1분",
      detail: "입력 → 출력 결과를 보여준 뒤 스킬 파일 안의 텍스트가 역할을 잡아준 것으로 연결",
      color: COLORS.warning,
    },
    {
      num: "③",
      title: "실용 데모 — 기획서 / WBS 생성",
      time: "1분",
      detail: "@스킬파일 참조 → 짧은 한 줄 명령 → 목적·기능·WBS·리스크까지 자동 생성 확인",
      color: COLORS.accentSecondary,
    },
  ];

  return (
    <SlideBase sectionNumber="07" sectionTitle="데모">
      <AnimatedText delay={0}>
        <div style={{ fontSize: 52, fontWeight: 900, color: COLORS.text, marginBottom: 16 }}>
          코드가 아닌 텍스트
        </div>
      </AnimatedText>
      <AnimatedText delay={8}>
        <div
          style={{
            fontSize: 36,
            fontWeight: 700,
            marginBottom: 56,
          }}
        >
          <span
            style={{
              background: "linear-gradient(135deg, #6366F1, #22D3EE)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            누구든 만들 수 있습니다
          </span>
        </div>
      </AnimatedText>

      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        {steps.map((step, i) => {
          const p = spring({ frame: frame - 20 - i * 18, fps, config: { damping: 200 }, durationInFrames: 30 });
          return (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 32,
                padding: "28px 36px",
                background: "rgba(255,255,255,0.03)",
                border: `1px solid ${step.color}40`,
                borderRadius: 16,
                alignItems: "center",
                opacity: interpolate(p, [0, 1], [0, 1]),
                transform: `translateX(${interpolate(p, [0, 1], [-40, 0])}px)`,
              }}
            >
              <div style={{ fontSize: 52, fontWeight: 900, color: step.color, flexShrink: 0, width: 60, textAlign: "center" }}>
                {step.num}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 8 }}>
                  <span style={{ fontSize: 30, fontWeight: 800, color: COLORS.text }}>{step.title}</span>
                  <span
                    style={{
                      background: `${step.color}20`,
                      border: `1px solid ${step.color}40`,
                      borderRadius: 100,
                      padding: "4px 16px",
                      fontSize: 22,
                      color: step.color,
                      fontWeight: 600,
                    }}
                  >
                    {step.time}
                  </span>
                </div>
                <div style={{ fontSize: 24, color: COLORS.textMuted, lineHeight: 1.6 }}>{step.detail}</div>
              </div>
            </div>
          );
        })}
      </div>

      <AnimatedText delay={80}>
        <div
          style={{
            marginTop: 32,
            padding: "20px 36px",
            background: "rgba(99,102,241,0.08)",
            border: "1px solid rgba(99,102,241,0.25)",
            borderRadius: 12,
            fontSize: 26,
            color: COLORS.accentGlow,
            fontWeight: 600,
            textAlign: "center",
          }}
        >
          💬 "이걸 처음부터 직접 만들려면 얼마나 걸렸을까요?"
        </div>
      </AnimatedText>
    </SlideBase>
  );
};
