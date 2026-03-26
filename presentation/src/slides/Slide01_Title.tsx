import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../theme";

export const Slide01_Title: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleProgress = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 40 });
  const subtitleProgress = spring({ frame: frame - 20, fps, config: { damping: 200 }, durationInFrames: 35 });
  const taglineProgress = spring({ frame: frame - 35, fps, config: { damping: 200 }, durationInFrames: 30 });
  const badgeProgress = spring({ frame: frame - 50, fps, config: { damping: 200 }, durationInFrames: 25 });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(160deg, #0A0E1A 0%, #0F172A 50%, #0A1628 100%)",
        fontFamily: "'Noto Sans KR', sans-serif",
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

      {/* 태그라인 */}
      <div
        style={{
          opacity: interpolate(taglineProgress, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(taglineProgress, [0, 1], [20, 0])}px)`,
          color: COLORS.accentSecondary,
          fontSize: 28,
          fontWeight: 500,
          letterSpacing: "0.15em",
          marginBottom: 32,
          textTransform: "uppercase",
        }}
      >
        비개발자를 위한 AI 실전 교육
      </div>

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
            lineHeight: 1.1,
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
            lineHeight: 1.1,
            background: "linear-gradient(135deg, #6366F1 0%, #22D3EE 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          AI를 제대로 쓰는 사람입니다
        </div>
      </div>

      {/* 서브타이틀 */}
      <div
        style={{
          opacity: interpolate(subtitleProgress, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(subtitleProgress, [0, 1], [30, 0])}px)`,
          color: COLORS.textMuted,
          fontSize: 34,
          fontWeight: 400,
          marginBottom: 60,
        }}
      >
        Cursor + 컨텍스트 엔지니어링 실전 교육
      </div>

      {/* 뱃지들 */}
      <div
        style={{
          opacity: interpolate(badgeProgress, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(badgeProgress, [0, 1], [20, 0])}px)`,
          display: "flex",
          gap: 20,
        }}
      >
        {["⏱ 18분", "🎯 비개발자 대상", "기획 · 마케팅 · 운영"].map((label, i) => (
          <div
            key={i}
            style={{
              background: "rgba(99,102,241,0.12)",
              border: "1px solid rgba(99,102,241,0.3)",
              borderRadius: 100,
              padding: "12px 28px",
              color: COLORS.accentGlow,
              fontSize: 24,
              fontWeight: 500,
            }}
          >
            {label}
          </div>
        ))}
      </div>

      {/* 인용구 */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          color: COLORS.textDim,
          fontSize: 24,
          fontStyle: "italic",
          opacity: interpolate(badgeProgress, [0, 1], [0, 0.7]),
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
