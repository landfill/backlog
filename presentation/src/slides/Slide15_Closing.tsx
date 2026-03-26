import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../theme";

export const Slide15_Closing: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const lines = [
    { text: "AI가 성과를 평준화하고 있습니다.", delay: 0, size: 52, color: COLORS.text },
    { text: "하지만 차이를 만드는 건 프롬프트가 아니라 컨텍스트,", delay: 20, size: 42, color: COLORS.textMuted },
    { text: "그리고 그 컨텍스트는 나의 지식에서 나옵니다.", delay: 35, size: 42, color: COLORS.textMuted },
  ];

  const takeaways = [
    "AI가 성과를 평준화하지만, 고유한 판단 영역에서는 역효과",
    "차이는 프롬프트 기술이 아닌 내 경험과 판단이 담긴 컨텍스트",
    "AI는 받은 맥락을 증폭한다. 좋은 맥락 → 좋은 결과",
    "컨텍스트 윈도우 = 작업 메모리. 가득 차면 품질 저하",
    "기억은 압축된다. 기록이 있어야 AI에게 전달 가능",
    "새 에이전트는 기억이 없다. 그래서 하니스(파일)가 필요",
  ];

  const bigTakeaway = "스킬 파일은 코드가 아닙니다. 누구든 텍스트로 만들어 쓸 수 있습니다.";

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(160deg, #0A0E1A 0%, #0F172A 50%, #0A1628 100%)",
        fontFamily: "'Noto Sans KR', sans-serif",
      }}
    >
      {/* 배경 글로우 */}
      <div
        style={{
          position: "absolute",
          top: "40%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 65%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          gap: 60,
          padding: "60px 80px",
        }}
      >
        {/* 왼쪽: 클로징 메시지 */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          {lines.map((line, i) => {
            const p = spring({ frame: frame - line.delay, fps, config: { damping: 200 }, durationInFrames: 35 });
            return (
              <div
                key={i}
                style={{
                  fontSize: line.size,
                  fontWeight: i === 0 ? 900 : 500,
                  color: line.color,
                  lineHeight: 1.4,
                  marginBottom: 8,
                  opacity: interpolate(p, [0, 1], [0, 1]),
                  transform: `translateY(${interpolate(p, [0, 1], [30, 0])}px)`,
                }}
              >
                {line.text}
              </div>
            );
          })}

          {(() => {
            const p = spring({ frame: frame - 55, fps, config: { damping: 200 }, durationInFrames: 30 });
            return (
              <div
                style={{
                  marginTop: 40,
                  padding: "24px 32px",
                  background: "rgba(99,102,241,0.10)",
                  border: "2px solid rgba(99,102,241,0.35)",
                  borderRadius: 16,
                  opacity: interpolate(p, [0, 1], [0, 1]),
                  transform: `translateY(${interpolate(p, [0, 1], [20, 0])}px)`,
                }}
              >
                <div style={{ fontSize: 28, color: COLORS.textMuted, marginBottom: 8 }}>기억은 압축됩니다. 기록만이 남습니다.</div>
                <div
                  style={{
                    fontSize: 34,
                    fontWeight: 900,
                    background: "linear-gradient(135deg, #6366F1, #22D3EE)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  컨텍스트를 관리하는 사람이 AI를 제대로 쓰는 사람입니다.
                </div>
              </div>
            );
          })()}

          {(() => {
            const p = spring({ frame: frame - 75, fps, config: { damping: 200 }, durationInFrames: 25 });
            return (
              <div
                style={{
                  marginTop: 28,
                  fontSize: 30,
                  fontStyle: "italic",
                  color: COLORS.textDim,
                  opacity: interpolate(p, [0, 1], [0, 1]),
                }}
              >
                "같이 달리다 보면, 비로소 보입니다."
              </div>
            );
          })()}
        </div>

        {/* 구분선 */}
        <div style={{ width: 1, background: "rgba(255,255,255,0.08)" }} />

        {/* 오른쪽: 7가지 핵심 */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          {(() => {
            const p = spring({ frame: frame - 10, fps, config: { damping: 200 }, durationInFrames: 25 });
            return (
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: COLORS.accentGlow,
                  marginBottom: 24,
                  opacity: interpolate(p, [0, 1], [0, 1]),
                }}
              >
                오늘 배운 것
              </div>
            );
          })()}

          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
            {takeaways.map((item, i) => {
              const p = spring({ frame: frame - 15 - i * 8, fps, config: { damping: 200 }, durationInFrames: 25 });
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: 14,
                    alignItems: "flex-start",
                    opacity: interpolate(p, [0, 1], [0, 1]),
                    transform: `translateX(${interpolate(p, [0, 1], [30, 0])}px)`,
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: "rgba(99,102,241,0.3)",
                      border: "1px solid rgba(99,102,241,0.5)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 16,
                      fontWeight: 700,
                      color: COLORS.accentGlow,
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  >
                    {i + 1}
                  </div>
                  <div style={{ fontSize: 22, color: COLORS.text, lineHeight: 1.5 }}>{item}</div>
                </div>
              );
            })}
          </div>

          {/* 7번: 강조 */}
          {(() => {
            const p = spring({ frame: frame - 65, fps, config: { damping: 200 }, durationInFrames: 30 });
            return (
              <div
                style={{
                  padding: "20px 24px",
                  background: "rgba(251,191,36,0.10)",
                  border: "2px solid rgba(251,191,36,0.4)",
                  borderRadius: 14,
                  opacity: interpolate(p, [0, 1], [0, 1]),
                  transform: `translateY(${interpolate(p, [0, 1], [20, 0])}px)`,
                  display: "flex",
                  gap: 14,
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: COLORS.warning,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                    fontWeight: 900,
                    color: "#000",
                    flexShrink: 0,
                  }}
                >
                  7
                </div>
                <div style={{ fontSize: 24, color: COLORS.warning, fontWeight: 700, lineHeight: 1.5 }}>
                  {bigTakeaway}
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* 하단 라인 */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 3,
          background: "linear-gradient(90deg, transparent, #6366F1, #22D3EE, transparent)",
          opacity: 0.6,
        }}
      />
    </AbsoluteFill>
  );
};
