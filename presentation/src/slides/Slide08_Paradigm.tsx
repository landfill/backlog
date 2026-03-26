import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SlideBase } from "../components/SlideBase";
import { AnimatedText } from "../components/AnimatedText";
import { COLORS } from "../theme";

export const Slide08_Paradigm: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const stages = [
    {
      era: "과거",
      name: "프롬프트 엔지니어링",
      question: "어떻게 질문할까?",
      analogy: "질문을 잘 던지기",
      eraColor: COLORS.textDim,
      bgColor: "rgba(100,116,139,0.08)",
      borderColor: "rgba(100,116,139,0.25)",
      nameColor: COLORS.textMuted,
      borderWidth: 1,
    },
    {
      era: "지금",
      name: "컨텍스트 엔지니어링",
      question: "무엇을 어떻게 채워넣을까?",
      analogy: "참고자료를 전달하기",
      eraColor: COLORS.accentGlow,
      bgColor: "rgba(99,102,241,0.10)",
      borderColor: "rgba(99,102,241,0.4)",
      nameColor: undefined,
      borderWidth: 2,
    },
    {
      era: "다음",
      name: "하네스 엔지니어링",
      question: "어떤 환경을 만들까?",
      analogy: "업무 공간 자체를 세팅",
      eraColor: COLORS.accentSecondary,
      bgColor: "rgba(34,211,238,0.10)",
      borderColor: "rgba(34,211,238,0.4)",
      nameColor: undefined,
      borderWidth: 2,
    },
  ];

  const arrow1P = spring({ frame: frame - 35, fps, config: { damping: 200 }, durationInFrames: 25 });
  const arrow2P = spring({ frame: frame - 50, fps, config: { damping: 200 }, durationInFrames: 25 });
  const arrows = [arrow1P, arrow2P];

  return (
    <SlideBase sectionNumber="03" sectionTitle="프롬프트 → 컨텍스트 엔지니어링으로">
      <AnimatedText delay={0}>
        <div style={{ fontSize: 52, fontWeight: 900, color: COLORS.text, marginBottom: 56 }}>
          패러다임 전환
        </div>
      </AnimatedText>

      <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 48 }}>
        {stages.map((s, i) => {
          const stageP = spring({
            frame: frame - 12 - i * 18,
            fps,
            config: { damping: 200 },
            durationInFrames: 30,
          });

          return (
            <React.Fragment key={i}>
              <div
                style={{
                  flex: 1,
                  padding: "32px 28px",
                  background: s.bgColor,
                  border: `${s.borderWidth}px solid ${s.borderColor}`,
                  borderRadius: 20,
                  textAlign: "center",
                  opacity: interpolate(stageP, [0, 1], [0, 1]),
                  transform: `translateY(${interpolate(stageP, [0, 1], [30, 0])}px)`,
                }}
              >
                <div style={{ fontSize: 22, color: s.eraColor, marginBottom: 12, fontWeight: 600, letterSpacing: "0.05em" }}>
                  {s.era}
                </div>
                <div
                  style={{
                    fontSize: 32,
                    fontWeight: 900,
                    marginBottom: 10,
                    lineHeight: 1.2,
                    ...(s.nameColor
                      ? { color: s.nameColor }
                      : {
                          background: i === 1
                            ? "linear-gradient(135deg, #6366F1, #22D3EE)"
                            : "linear-gradient(135deg, #22D3EE, #34D399)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          backgroundClip: "text",
                        }),
                  }}
                >
                  {s.name}
                </div>
                <div style={{ fontSize: 24, color: i === 0 ? COLORS.textDim : COLORS.text, fontWeight: i === 0 ? 400 : 600 }}>
                  {s.question}
                </div>
                <div style={{ fontSize: 20, color: COLORS.textDim, marginTop: 8 }}>
                  {s.analogy}
                </div>
              </div>

              {i < stages.length - 1 && (
                <div
                  style={{
                    opacity: interpolate(arrows[i], [0, 1], [0, 1]),
                    transform: `scale(${interpolate(arrows[i], [0, 1], [0.5, 1])})`,
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      fontSize: 48,
                      background: "linear-gradient(135deg, #6366F1, #22D3EE)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    →
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      <AnimatedText delay={70}>
        <div
          style={{
            padding: "28px 40px",
            background: "rgba(99,102,241,0.08)",
            border: "1px solid rgba(99,102,241,0.25)",
            borderRadius: 16,
            fontSize: 28,
            color: COLORS.text,
            lineHeight: 1.7,
            textAlign: "center",
          }}
        >
          2026년 업계의 결론:
          <br />
          <span style={{ color: COLORS.accentGlow, fontWeight: 700 }}>
            어떤 AI 모델을 쓰느냐보다, 그 AI가 일하는 환경을 어떻게 만드느냐가 결과를 결정합니다.
          </span>
        </div>
      </AnimatedText>
    </SlideBase>
  );
};
