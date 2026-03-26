import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SlideBase } from "../components/SlideBase";
import { AnimatedText } from "../components/AnimatedText";
import { COLORS } from "../theme";

export const Slide11_Harness: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const files = [
    {
      name: "CLAUDE.md",
      location: "프로젝트 루트",
      role: "Claude Code가 매 세션 자동으로 읽는 기억",
      color: COLORS.accentGlow,
      icon: "🤖",
    },
    {
      name: "Cursor Rules",
      location: ".cursorrules",
      role: "Cursor 에이전트에 항상 자동 주입되는 규칙",
      color: COLORS.accentSecondary,
      icon: "⚡",
    },
    {
      name: "SKILL.md",
      location: "어디든",
      role: "특정 업무를 위한 맥락 + 지시 패키지 → @파일로 주입",
      color: COLORS.warning,
      icon: "🎯",
    },
  ];

  return (
    <SlideBase sectionNumber="04" sectionTitle="하니스: 맥락을 파일로 영속화">
      <div style={{ display: "flex", gap: 80, alignItems: "center" }}>
        <div style={{ flex: 1 }}>
          <AnimatedText delay={0}>
            <div style={{ fontSize: 52, fontWeight: 900, color: COLORS.text, marginBottom: 16, lineHeight: 1.2 }}>
              기억은 압축됩니다.
            </div>
          </AnimatedText>
          <AnimatedText delay={10}>
            <div style={{ fontSize: 52, fontWeight: 900, marginBottom: 40, lineHeight: 1.2 }}>
              <span
                style={{
                  background: "linear-gradient(135deg, #6366F1, #22D3EE)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                파일만 남습니다.
              </span>
            </div>
          </AnimatedText>

          <AnimatedText delay={20}>
            <div
              style={{
                fontSize: 26,
                color: COLORS.textMuted,
                lineHeight: 1.8,
                marginBottom: 40,
              }}
            >
              사람은 결론만 기억하고 맥락은 잃어버립니다.
              <br />
              <span style={{ color: COLORS.text }}>"그때 왜 그렇게 결정했어요?"</span> → 기억 안 남
              <br />
              <span style={{ color: COLORS.text }}>"퇴사한 동료 업무 인수"</span> → 지식 전부 증발
              <br />
              <br />
              대화는 휘발되지만,{" "}
              <strong style={{ color: COLORS.accentGlow }}>파일은 남습니다.</strong>
            </div>
          </AnimatedText>
        </div>

        {/* 파일 카드들 */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 24 }}>
          {files.map((file, i) => {
            const p = spring({
              frame: frame - 20 - i * 15,
              fps,
              config: { damping: 200 },
              durationInFrames: 30,
            });

            return (
              <div
                key={i}
                style={{
                  padding: "28px 32px",
                  background: "rgba(255,255,255,0.03)",
                  border: `2px solid ${file.color}40`,
                  borderRadius: 16,
                  opacity: interpolate(p, [0, 1], [0, 1]),
                  transform: `translateX(${interpolate(p, [0, 1], [40, 0])}px)`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 10 }}>
                  <span style={{ fontSize: 36 }}>{file.icon}</span>
                  <code
                    style={{
                      fontSize: 30,
                      fontWeight: 800,
                      color: file.color,
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    {file.name}
                  </code>
                  <span
                    style={{
                      fontSize: 20,
                      color: COLORS.textDim,
                      background: "rgba(255,255,255,0.06)",
                      padding: "4px 12px",
                      borderRadius: 6,
                    }}
                  >
                    {file.location}
                  </span>
                </div>
                <div style={{ fontSize: 24, color: COLORS.textMuted, lineHeight: 1.5 }}>
                  {file.role}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <AnimatedText delay={75}>
        <div
          style={{
            padding: "24px 40px",
            background: "rgba(99,102,241,0.10)",
            border: "1px solid rgba(99,102,241,0.3)",
            borderRadius: 14,
            marginTop: 16,
            fontSize: 26,
            color: COLORS.accentGlow,
            fontWeight: 600,
            textAlign: "center",
            lineHeight: 1.6,
          }}
        >
          스킬 파일을 쓴다는 것 = 새 에이전트의 컨텍스트에 <strong>업무 매뉴얼을 건네는 것</strong>
        </div>
      </AnimatedText>
    </SlideBase>
  );
};
