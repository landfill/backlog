import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SlideBase } from "../components/SlideBase";
import { AnimatedText } from "../components/AnimatedText";
import { COLORS } from "../theme";

export const Slide02_FOMO: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const items = [
    { icon: "😰", text: "ChatGPT / Claude 쓰다가 대화가 길어지면 갑자기 답변이 이상해졌다" },
    { icon: "🤔", text: "아까 말한 내용을 AI가 또 물어봤다, 또는 처음 준 지시를 까먹었다" },
    { icon: "🔁", text: "AI가 같은 실수를 조금씩 다른 방식으로 계속 반복했다" },
  ];

  return (
    <SlideBase sectionNumber="01" sectionTitle="오프닝">
      <AnimatedText delay={0}>
        <div
          style={{
            fontSize: 60,
            fontWeight: 900,
            color: COLORS.text,
            marginBottom: 16,
            lineHeight: 1.2,
          }}
        >
          혹시 이런 경험 있으신가요?
        </div>
      </AnimatedText>

      <AnimatedText delay={10}>
        <div
          style={{
            fontSize: 30,
            color: COLORS.accentSecondary,
            marginBottom: 64,
            fontWeight: 500,
          }}
        >
          손을 들어보세요 ✋
        </div>
      </AnimatedText>

      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        {items.map((item, i) => {
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
                display: "flex",
                alignItems: "center",
                gap: 28,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 16,
                padding: "28px 36px",
                opacity: interpolate(p, [0, 1], [0, 1]),
                transform: `translateX(${interpolate(p, [0, 1], [-40, 0])}px)`,
              }}
            >
              <div style={{ fontSize: 48, flexShrink: 0 }}>{item.icon}</div>
              <div
                style={{
                  fontSize: 28,
                  color: COLORS.text,
                  lineHeight: 1.5,
                  fontWeight: 400,
                }}
              >
                {item.text}
              </div>
            </div>
          );
        })}
      </div>

      <AnimatedText delay={70}>
        <div
          style={{
            marginTop: 48,
            padding: "24px 36px",
            background: "rgba(99,102,241,0.12)",
            border: "1px solid rgba(99,102,241,0.3)",
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div style={{ fontSize: 36 }}>💡</div>
          <div style={{ fontSize: 28, color: COLORS.accentGlow, fontWeight: 500 }}>
            이게 왜 일어나는지 아는 분? → 잠깐, 이유를 말하기 전에 데이터를 먼저 보겠습니다
          </div>
        </div>
      </AnimatedText>
    </SlideBase>
  );
};
