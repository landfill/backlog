import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../theme";

export const Slide15_Closing: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const closingLines = [
    "AI는 이제 누구나 쓸 수 있는 도구입니다.",
    "하지만 차이를 만드는 건 프롬프트가 아니라 컨텍스트입니다.",
    "트렌드는 이미 한 발 더 — 하네스로 나아가고 있습니다.",
  ];

  const takeaways = [
    "차이를 만드는 건 프롬프트 기술이 아니라, 내 경험과 판단이 담긴 맥락(컨텍스트)이다.",
    "AI는 받은 맥락을 증폭하는 도구다. 좋은 맥락 → 좋은 결과, 잘못된 맥락 → 그럴듯한 오답.",
    "컨텍스트 윈도우 = AI의 작업 메모리. 가득 차면 AI 품질이 저하된다.",
    "기억은 압축된다. 결론만 남고 맥락은 사라진다. 기록이 있어야 AI에게 전달할 수 있다.",
    "스킬 파일은 코드가 아닙니다. 누구든 텍스트로 만들어 쓸 수 있습니다.",
    "트렌드는 컨텍스트를 넘어 하네스(AI 업무 환경 설계)로 향하고 있다.",
  ];

  const bigTakeaway = "오늘 배운 컨텍스트 관리가 하네스의 출발점이다. 이미 첫 걸음을 뗐다.";

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(160deg, #0A0E1A 0%, #0F172A 50%, #0A1628 100%)",
        fontFamily: "'Paperlogy', sans-serif",
      }}
    >
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
          gap: 56,
          padding: "56px 80px",
        }}
      >
        {/* 왼쪽: 클로징 메시지 */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          {closingLines.map((line, i) => {
            const p = spring({ frame: frame - i * 15, fps, config: { damping: 200 }, durationInFrames: 35 });
            return (
              <div
                key={i}
                style={{
                  fontSize: i === 0 ? 44 : 36,
                  fontWeight: i === 0 ? 900 : 500,
                  color: i === 0 ? COLORS.text : COLORS.textMuted,
                  lineHeight: 1.4,
                  marginBottom: 8,
                  opacity: interpolate(p, [0, 1], [0, 1]),
                  transform: `translateY(${interpolate(p, [0, 1], [30, 0])}px)`,
                }}
              >
                {line}
              </div>
            );
          })}

          {(() => {
            const p = spring({ frame: frame - 50, fps, config: { damping: 200 }, durationInFrames: 30 });
            return (
              <div
                style={{
                  marginTop: 36,
                  padding: "24px 32px",
                  background: "rgba(99,102,241,0.10)",
                  border: "2px solid rgba(99,102,241,0.35)",
                  borderRadius: 16,
                  opacity: interpolate(p, [0, 1], [0, 1]),
                  transform: `translateY(${interpolate(p, [0, 1], [20, 0])}px)`,
                }}
              >
                <div style={{ fontSize: 26, color: COLORS.textMuted, marginBottom: 8 }}>
                  기억은 압축됩니다. 기록만이 남습니다.
                </div>
                <div style={{ fontSize: 24, color: COLORS.textMuted, marginBottom: 12 }}>
                  내 경험과 판단을 파일로 남기세요. AI에게 건네세요.
                </div>
                <div
                  style={{
                    fontSize: 32,
                    fontWeight: 900,
                    background: "linear-gradient(135deg, #6366F1, #22D3EE)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  오늘 배운 것이
                  <br />
                  그 여정의 출발점입니다.
                </div>
              </div>
            );
          })()}

          {(() => {
            const p = spring({ frame: frame - 70, fps, config: { damping: 200 }, durationInFrames: 25 });
            return (
              <div
                style={{
                  marginTop: 24,
                  fontSize: 28,
                  fontWeight: 400,
                  color: COLORS.textDim,
                  opacity: interpolate(p, [0, 1], [0, 1]),
                }}
              >
                "같이 달리다 보면, 비로소 보입니다."
              </div>
            );
          })()}
        </div>

        <div style={{ width: 1, background: "rgba(255,255,255,0.08)" }} />

        {/* 오른쪽: 7가지 배운 것 */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          {(() => {
            const p = spring({ frame: frame - 10, fps, config: { damping: 200 }, durationInFrames: 25 });
            return (
              <div
                style={{
                  fontSize: 26,
                  fontWeight: 700,
                  color: COLORS.accentGlow,
                  marginBottom: 20,
                  opacity: interpolate(p, [0, 1], [0, 1]),
                }}
              >
                📌 오늘 배운 것 7가지
              </div>
            );
          })()}

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
            {takeaways.map((item, i) => {
              const p = spring({ frame: frame - 15 - i * 7, fps, config: { damping: 200 }, durationInFrames: 25 });
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: 12,
                    alignItems: "flex-start",
                    opacity: interpolate(p, [0, 1], [0, 1]),
                    transform: `translateX(${interpolate(p, [0, 1], [30, 0])}px)`,
                  }}
                >
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: "50%",
                      background: "rgba(99,102,241,0.3)",
                      border: "1px solid rgba(99,102,241,0.5)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 14,
                      fontWeight: 700,
                      color: COLORS.accentGlow,
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  >
                    {i + 1}
                  </div>
                  <div style={{ fontSize: 20, color: COLORS.text, lineHeight: 1.5 }}>{item}</div>
                </div>
              );
            })}
          </div>

          {(() => {
            const p = spring({ frame: frame - 60, fps, config: { damping: 200 }, durationInFrames: 30 });
            return (
              <div
                style={{
                  padding: "18px 22px",
                  background: "rgba(251,191,36,0.10)",
                  border: "2px solid rgba(251,191,36,0.4)",
                  borderRadius: 14,
                  opacity: interpolate(p, [0, 1], [0, 1]),
                  transform: `translateY(${interpolate(p, [0, 1], [20, 0])}px)`,
                  display: "flex",
                  gap: 12,
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    background: COLORS.warning,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 16,
                    fontWeight: 900,
                    color: "#000",
                    flexShrink: 0,
                  }}
                >
                  7
                </div>
                <div style={{ fontSize: 22, color: COLORS.warning, fontWeight: 700, lineHeight: 1.5 }}>
                  {bigTakeaway}
                </div>
              </div>
            );
          })()}
        </div>
      </div>

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
