import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SlideBase } from "../components/SlideBase";
import { AnimatedText } from "../components/AnimatedText";
import { COLORS } from "../theme";

export const Slide12_CursorTips: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const commands = [
    {
      cmd: "@Cursor Rules",
      desc: "매 대화에 자동 주입되는 상시 규칙. 프로젝트 규칙, 내 업무 방식을 여기에 정의",
      color: COLORS.accentGlow,
    },
    {
      cmd: "@Past Chats",
      desc: "이전 대화 참조. 맥락을 이어가고 싶을 때 과거 결정사항 불러오기",
      color: COLORS.accentSecondary,
    },
    {
      cmd: "@파일 / @폴더",
      desc: "내가 원하는 것만 골라서 주입. 불필요한 것은 넣지 않아야 컨텍스트 절약",
      color: COLORS.warning,
    },
  ];

  const signals = [
    { num: "1", text: "Cursor 하단 컨텍스트 바 토큰 사용량이 절반을 넘었을 때", danger: false },
    { num: "2", text: "주제가 바뀔 때 — 기능 A 완료 후 기능 B 시작", danger: false },
    { num: "3", text: "AI가 같은 실수를 반복할 때 → 컨텍스트 오염 신호. 더 대화해도 나아지지 않습니다", danger: true },
  ];

  return (
    <SlideBase sectionNumber="05" sectionTitle="Cursor 실무 팁">
      <AnimatedText delay={0}>
        <div style={{ fontSize: 48, fontWeight: 900, color: COLORS.text, marginBottom: 36 }}>
          비개발자도 바로 쓸 수 있는 컨텍스트 관리
        </div>
      </AnimatedText>

      <div style={{ display: "flex", gap: 48 }}>
        {/* 왼쪽: 컨텍스트 채우기 */}
        <div style={{ flex: 1 }}>
          <AnimatedText delay={8}>
            <div style={{ fontSize: 26, fontWeight: 700, color: COLORS.accentGlow, marginBottom: 20, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              컨텍스트 채우는 방법
            </div>
          </AnimatedText>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {commands.map((item, i) => {
              const p = spring({ frame: frame - 15 - i * 12, fps, config: { damping: 200 }, durationInFrames: 28 });
              return (
                <div
                  key={i}
                  style={{
                    padding: "20px 24px",
                    background: "rgba(255,255,255,0.03)",
                    border: `1px solid ${item.color}40`,
                    borderRadius: 12,
                    opacity: interpolate(p, [0, 1], [0, 1]),
                    transform: `translateX(${interpolate(p, [0, 1], [-30, 0])}px)`,
                  }}
                >
                  <code style={{ fontSize: 28, fontWeight: 800, color: item.color, display: "block", marginBottom: 8, fontFamily: "'Paperlogy', monospace" }}>
                    {item.cmd}
                  </code>
                  <div style={{ fontSize: 22, color: COLORS.textMuted, lineHeight: 1.5 }}>{item.desc}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 구분선 */}
        <div style={{ width: 1, background: "rgba(255,255,255,0.08)", flexShrink: 0 }} />

        {/* 오른쪽: 새 에이전트 신호 */}
        <div style={{ flex: 1 }}>
          <AnimatedText delay={12}>
            <div style={{ fontSize: 26, fontWeight: 700, color: COLORS.warning, marginBottom: 20, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              언제 새 에이전트를 열어야 하나
            </div>
          </AnimatedText>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {signals.map((s, i) => {
              const p = spring({ frame: frame - 20 - i * 12, fps, config: { damping: 200 }, durationInFrames: 28 });
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: 18,
                    padding: "20px 24px",
                    background: s.danger ? "rgba(248,113,113,0.08)" : "rgba(255,255,255,0.03)",
                    border: s.danger ? "1px solid rgba(248,113,113,0.3)" : "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 12,
                    opacity: interpolate(p, [0, 1], [0, 1]),
                    transform: `translateX(${interpolate(p, [0, 1], [30, 0])}px)`,
                    alignItems: "flex-start",
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: s.danger ? COLORS.danger : COLORS.warning,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 20,
                      fontWeight: 900,
                      color: "#fff",
                      flexShrink: 0,
                    }}
                  >
                    {s.num}
                  </div>
                  <div style={{ fontSize: 22, color: s.danger ? COLORS.danger : COLORS.text, lineHeight: 1.5, fontWeight: s.danger ? 600 : 400 }}>
                    {s.text}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 하단: 폴더 구조 팁 */}
      <AnimatedText delay={55}>
        <div
          style={{
            marginTop: 28,
            padding: "20px 28px",
            background: "rgba(34,211,238,0.06)",
            border: "1px solid rgba(34,211,238,0.2)",
            borderRadius: 12,
            display: "flex",
            gap: 32,
            alignItems: "center",
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: COLORS.accentSecondary, marginBottom: 8 }}>
              📁 비개발자를 위한 폴더 구조 팁
            </div>
            <div style={{ fontSize: 22, color: COLORS.textMuted, lineHeight: 1.6 }}>
              <code style={{ color: COLORS.accentGlow, fontFamily: "'Paperlogy', monospace" }}>_context/</code> 폴더를 만들고 회의록·요구사항·결정 로그를 쌓으면
              <br />
              새 에이전트에 <code style={{ color: COLORS.warning, fontFamily: "'Paperlogy', monospace" }}>@_context</code> 하나로 모든 배경을 즉시 주입
            </div>
          </div>
          <div
            style={{
              flexShrink: 0,
              padding: "14px 20px",
              background: "rgba(0,0,0,0.3)",
              borderRadius: 10,
              fontFamily: "'Paperlogy', monospace",
              fontSize: 18,
              color: COLORS.textMuted,
              lineHeight: 1.8,
              whiteSpace: "pre",
            }}
          >
{`_context/
├─ meeting_notes.md
├─ requirements.md
└─ decision_log.md`}
          </div>
        </div>
      </AnimatedText>
    </SlideBase>
  );
};
