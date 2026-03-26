import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SlideBase } from "../components/SlideBase";
import { AnimatedText } from "../components/AnimatedText";
import { COLORS } from "../theme";

const INPUT_BG = "rgba(99,102,241,0.12)";
const INPUT_BORDER = "rgba(99,102,241,0.25)";
const INPUT_BLOCK = "rgba(99,102,241,0.08)";
const INPUT_BLOCK_DIM = "rgba(99,102,241,0.05)";
const OUTPUT_BG = "rgba(148,163,184,0.12)";
const OUTPUT_BORDER = "rgba(148,163,184,0.25)";
const OUTPUT_BLOCK = "rgba(148,163,184,0.08)";
const OUTPUT_BLOCK_DIM = "rgba(148,163,184,0.05)";
const DANGER_BG = "rgba(248,113,113,0.08)";
const DANGER_BORDER = "rgba(248,113,113,0.3)";

const MessageBlock: React.FC<{
  text: string;
  type: "user" | "ai";
  size?: "normal" | "small";
}> = ({ text, type, size = "normal" }) => {
  const bg = type === "user"
    ? (size === "small" ? INPUT_BLOCK_DIM : INPUT_BLOCK)
    : (size === "small" ? OUTPUT_BLOCK_DIM : OUTPUT_BLOCK);
  const pad = size === "small" ? "10px 16px" : "14px 20px";
  const fs = size === "small" ? 21 : 24;
  const radius = size === "small" ? 8 : 10;

  return (
    <div style={{ background: bg, borderRadius: radius, padding: pad, fontSize: fs, color: COLORS.text }}>
      {text}
    </div>
  );
};

export const Slide_ContextGrowth: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sp = (delay: number) =>
    spring({ frame: frame - delay, fps, config: { damping: 200 }, durationInFrames: 30 });

  const turn1 = sp(15);
  const turn2 = sp(60);
  const turn3 = sp(105);
  const badgesP = sp(150);

  const columnStyle = (p: number): React.CSSProperties => ({
    flex: 1,
    opacity: interpolate(p, [0, 1], [0, 1]),
    transform: `translateY(${interpolate(p, [0, 1], [40, 0])}px)`,
  });

  const models = [
    { label: "Cursor Sonnet ~200K", active: true },
    { label: "Claude Opus 1M", active: false },
    { label: "GPT-4o 128K", active: false },
    { label: "Gemini 2.5 Pro 1M", active: false },
  ];

  return (
    <SlideBase sectionNumber="02" sectionTitle="컨텍스트 윈도우의 정체">
      <AnimatedText delay={0}>
        <div style={{ fontSize: 52, fontWeight: 900, color: COLORS.text, marginBottom: 20 }}>
          대화할수록 컨텍스트가 쌓입니다
        </div>
      </AnimatedText>

      {/* Diagram */}
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "flex-start",
          gap: 20,
          marginTop: 20,
          height: 560,
          paddingBottom: 48,
        }}
      >
        {/* 0 tokens label */}
        <div style={{ position: "absolute", top: -8, left: 0, fontSize: 20, color: COLORS.textDim }}>
          0 tokens ─ ─ ─ ─ ─
        </div>

        {/* ── Turn 1 ── */}
        <div style={columnStyle(turn1)}>
          <div style={{ textAlign: "center", fontSize: 28, fontWeight: 700, color: COLORS.text, marginBottom: 14 }}>
            Turn 1
          </div>
          <div style={{ background: INPUT_BG, border: `1px solid ${INPUT_BORDER}`, borderRadius: 16, padding: 18, marginBottom: 10 }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: COLORS.accentGlow, marginBottom: 10, letterSpacing: "0.06em" }}>INPUT</div>
            <MessageBlock text="User message" type="user" />
          </div>
          <div style={{ background: OUTPUT_BG, border: `1px solid ${OUTPUT_BORDER}`, borderRadius: 16, padding: 18 }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: COLORS.textDim, marginBottom: 10, letterSpacing: "0.06em" }}>OUTPUT</div>
            <MessageBlock text="Text response" type="ai" />
          </div>
        </div>

        {/* Arrow 1→2 */}
        <div
          style={{
            alignSelf: "center",
            fontSize: 36,
            color: COLORS.textDim,
            paddingTop: 36,
            opacity: interpolate(turn2, [0, 1], [0, 1]),
          }}
        >
          ▸
        </div>

        {/* ── Turn 2 ── */}
        <div style={columnStyle(turn2)}>
          <div style={{ textAlign: "center", fontSize: 28, fontWeight: 700, color: COLORS.text, marginBottom: 14 }}>
            Turn 2
          </div>
          <div style={{ background: INPUT_BG, border: `1px solid ${INPUT_BORDER}`, borderRadius: 16, padding: 18, marginBottom: 10 }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: COLORS.accentGlow, marginBottom: 10, letterSpacing: "0.06em" }}>INPUT</div>
            <div style={{ display: "flex", flexDirection: "column" as const, gap: 6 }}>
              <MessageBlock text="User message" type="user" size="small" />
              <MessageBlock text="Text response" type="ai" size="small" />
              <MessageBlock text="User message" type="user" size="small" />
            </div>
          </div>
          <div style={{ background: OUTPUT_BG, border: `1px solid ${OUTPUT_BORDER}`, borderRadius: 16, padding: 18 }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: COLORS.textDim, marginBottom: 10, letterSpacing: "0.06em" }}>OUTPUT</div>
            <MessageBlock text="Text response" type="ai" />
          </div>
        </div>

        {/* Arrow 2→3 */}
        <div
          style={{
            alignSelf: "center",
            fontSize: 36,
            color: COLORS.textDim,
            paddingTop: 36,
            opacity: interpolate(turn3, [0, 1], [0, 1]),
          }}
        >
          ▸
        </div>

        {/* ── Turn 3 ── */}
        <div style={columnStyle(turn3)}>
          <div style={{ textAlign: "center", fontSize: 28, fontWeight: 700, color: COLORS.text, marginBottom: 14 }}>
            Turn 3
          </div>
          <div style={{ background: INPUT_BG, border: `1px solid ${INPUT_BORDER}`, borderRadius: 16, padding: 18, marginBottom: 10 }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: COLORS.accentGlow, marginBottom: 10, letterSpacing: "0.06em" }}>INPUT</div>
            <div style={{ display: "flex", flexDirection: "column" as const, gap: 5 }}>
              <MessageBlock text="User message" type="user" size="small" />
              <MessageBlock text="Text response" type="ai" size="small" />
              <MessageBlock text="User message" type="user" size="small" />
              <MessageBlock text="Text response" type="ai" size="small" />
              <MessageBlock text="User message" type="user" size="small" />
            </div>
          </div>
          <div style={{ background: DANGER_BG, border: `1px solid ${DANGER_BORDER}`, borderRadius: 16, padding: 18 }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: COLORS.danger, marginBottom: 10, letterSpacing: "0.06em" }}>OUTPUT</div>
            <div style={{ background: OUTPUT_BLOCK, borderRadius: 10, padding: "14px 20px", fontSize: 24, color: COLORS.text, opacity: 0.65 }}>
              Text response
            </div>
          </div>
        </div>

        {/* Context window limit line */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}>
          <div
            style={{
              borderTop: `3px dashed ${COLORS.danger}`,
              paddingTop: 10,
              display: "flex",
              justifyContent: "space-between",
              fontSize: 22,
            }}
          >
            <span style={{ color: COLORS.danger, fontWeight: 700 }}>Context window</span>
            <span style={{ color: COLORS.danger }}>~200K tokens</span>
          </div>
        </div>
      </div>

      {/* Model badges */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 16,
          marginTop: 12,
          opacity: interpolate(badgesP, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(badgesP, [0, 1], [15, 0])}px)`,
        }}
      >
        {models.map((m, i) => (
          <span
            key={i}
            style={{
              padding: "8px 22px",
              borderRadius: 24,
              fontSize: 22,
              fontWeight: m.active ? 700 : 400,
              background: m.active ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${m.active ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.08)"}`,
              color: m.active ? COLORS.accentGlow : COLORS.textDim,
            }}
          >
            {m.label}
          </span>
        ))}
      </div>
    </SlideBase>
  );
};
