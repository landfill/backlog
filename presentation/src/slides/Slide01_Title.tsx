import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../theme";

export const Slide01_Title: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleProgress = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 40 });
  const quoteProgress = spring({ frame: frame - 30, fps, config: { damping: 200 }, durationInFrames: 25 });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(160deg, #0A0E1A 0%, #0F172A 50%, #0A1628 100%)",
        fontFamily: "'Paperlogy', sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* 배경 글로우 */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 900,
          height: 900,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 65%)",
          pointerEvents: "none",
        }}
      />

      {/* 메인 타이틀 */}
      <div
        style={{
          opacity: interpolate(titleProgress, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(titleProgress, [0, 1], [50, 0])}px)`,
          textAlign: "center",
          marginBottom: 32,
        }}
      >
        <div
          style={{
            fontSize: 92,
            fontWeight: 900,
            lineHeight: 1.4,
            marginBottom: 16,
            background: "linear-gradient(135deg, #F1F5F9 0%, #CBD5E1 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          컨텍스트를 관리하는 사람이
        </div>
        <div
          style={{
            fontSize: 92,
            fontWeight: 900,
            lineHeight: 1.4,
            background: "linear-gradient(135deg, #6366F1 0%, #22D3EE 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          AI를 제대로 쓰는 사람입니다
        </div>
      </div>

      {/* 인용구 */}
      <div
        style={{
          marginTop: 48,
          color: COLORS.textDim,
          fontSize: 36,
          fontStyle: "italic",
          opacity: interpolate(quoteProgress, [0, 1], [0, 0.7]),
        }}
      >
        "같이 달리다 보면, 비로소 보입니다."
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
