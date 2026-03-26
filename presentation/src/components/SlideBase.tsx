import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, SLIDE } from "../theme";

type Props = {
  children: React.ReactNode;
  sectionNumber?: string;
  sectionTitle?: string;
};

export const SlideBase: React.FC<Props> = ({ children, sectionNumber, sectionTitle }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bgOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        background: COLORS.gradientBg,
        fontFamily: "'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif",
        opacity: bgOpacity,
      }}
    >
      {/* 배경 장식 원들 */}
      <div
        style={{
          position: "absolute",
          top: -200,
          right: -200,
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -150,
          left: -150,
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(34,211,238,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* 섹션 뱃지 */}
      {sectionNumber && (
        <div
          style={{
            position: "absolute",
            top: 40,
            left: SLIDE.padding,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              background: "rgba(99,102,241,0.2)",
              border: "1px solid rgba(99,102,241,0.4)",
              borderRadius: 8,
              padding: "6px 16px",
              color: COLORS.accentGlow,
              fontSize: 22,
              fontWeight: 600,
              letterSpacing: "0.05em",
            }}
          >
            {sectionNumber}
          </div>
          {sectionTitle && (
            <span
              style={{
                color: COLORS.textDim,
                fontSize: 22,
                fontWeight: 400,
              }}
            >
              {sectionTitle}
            </span>
          )}
        </div>
      )}

      {/* 메인 콘텐츠 */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: `${sectionNumber ? 100 : 60}px ${SLIDE.padding}px ${SLIDE.padding}px`,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        {children}
      </div>

      {/* 하단 그라디언트 라인 */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 3,
          background: "linear-gradient(90deg, transparent 0%, #6366F1 30%, #22D3EE 70%, transparent 100%)",
          opacity: 0.6,
        }}
      />
    </AbsoluteFill>
  );
};
