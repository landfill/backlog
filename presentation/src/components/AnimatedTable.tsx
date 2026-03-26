import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../theme";

type TableRow = string[];

type Props = {
  headers: string[];
  rows: TableRow[];
  delay?: number;
  highlightRows?: number[]; // 0-indexed
  accentCols?: number[]; // 0-indexed
};

export const AnimatedTable: React.FC<Props> = ({
  headers,
  rows,
  delay = 0,
  highlightRows = [],
  accentCols = [],
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerProgress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 200 },
    durationInFrames: 25,
  });

  return (
    <div
      style={{
        width: "100%",
        borderRadius: 16,
        overflow: "hidden",
        border: `1px solid ${COLORS.border}`,
        opacity: interpolate(headerProgress, [0, 1], [0, 1]),
        transform: `translateY(${interpolate(headerProgress, [0, 1], [20, 0])}px)`,
      }}
    >
      {/* 헤더 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${headers.length}, 1fr)`,
          background: "rgba(99,102,241,0.15)",
          borderBottom: `1px solid ${COLORS.border}`,
        }}
      >
        {headers.map((h, i) => (
          <div
            key={i}
            style={{
              padding: "20px 24px",
              color: COLORS.accentGlow,
              fontSize: 24,
              fontWeight: 700,
              borderRight: i < headers.length - 1 ? `1px solid ${COLORS.border}` : "none",
            }}
          >
            {h}
          </div>
        ))}
      </div>

      {/* 행 */}
      {rows.map((row, rowIdx) => {
        const rowProgress = spring({
          frame: frame - delay - (rowIdx + 1) * 8,
          fps,
          config: { damping: 200 },
          durationInFrames: 25,
        });

        const isHighlighted = highlightRows.includes(rowIdx);

        return (
          <div
            key={rowIdx}
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${headers.length}, 1fr)`,
              background: isHighlighted
                ? "rgba(99,102,241,0.12)"
                : rowIdx % 2 === 0
                ? "rgba(255,255,255,0.02)"
                : "transparent",
              borderBottom:
                rowIdx < rows.length - 1 ? `1px solid rgba(255,255,255,0.05)` : "none",
              opacity: interpolate(rowProgress, [0, 1], [0, 1]),
              transform: `translateX(${interpolate(rowProgress, [0, 1], [-20, 0])}px)`,
            }}
          >
            {row.map((cell, colIdx) => (
              <div
                key={colIdx}
                style={{
                  padding: "18px 24px",
                  color: accentCols.includes(colIdx)
                    ? COLORS.accentGlow
                    : isHighlighted && colIdx > 0
                    ? COLORS.warning
                    : COLORS.text,
                  fontSize: 22,
                  fontWeight: accentCols.includes(colIdx) ? 700 : 400,
                  borderRight:
                    colIdx < headers.length - 1
                      ? `1px solid rgba(255,255,255,0.05)`
                      : "none",
                  lineHeight: 1.5,
                }}
              >
                {cell}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
};
