import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SlideBase } from "../components/SlideBase";
import { AnimatedText } from "../components/AnimatedText";
import { COLORS } from "../theme";

export const Slide05_WhatInContext: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const always = [
    { icon: "⚙️", label: "시스템 프롬프트", desc: "도구가 AI에게 주는 초기 지시" },
    { icon: "💬", label: "내 질문 (전체 누적)", desc: "이번 대화의 모든 입력" },
    { icon: "🤖", label: "AI 답변 (전체 누적)", desc: "AI가 생성한 모든 응답" },
  ];

  const additional = [
    { icon: "📎", label: "첨부 파일", desc: "올린 문서, PDF, 엑셀" },
    { icon: "🖼️", label: "캡처 이미지", desc: "붙여넣은 스크린샷" },
    { icon: "🔧", label: "MCP 툴 결과", desc: "외부 도구 호출 및 응답값" },
  ];

  const Item: React.FC<{ icon: string; label: string; desc: string; delay: number }> = ({
    icon, label, desc, delay,
  }) => {
    const p = spring({ frame: frame - delay, fps, config: { damping: 200 }, durationInFrames: 25 });
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
          padding: "18px 24px",
          background: "rgba(255,255,255,0.03)",
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.07)",
          opacity: interpolate(p, [0, 1], [0, 1]),
          transform: `translateX(${interpolate(p, [0, 1], [-30, 0])}px)`,
        }}
      >
        <div style={{ fontSize: 36 }}>{icon}</div>
        <div>
          <div style={{ fontSize: 26, fontWeight: 700, color: COLORS.text }}>{label}</div>
          <div style={{ fontSize: 22, color: COLORS.textMuted }}>{desc}</div>
        </div>
      </div>
    );
  };

  return (
    <SlideBase sectionNumber="02" sectionTitle="컨텍스트 윈도우의 정체">
      <AnimatedText delay={0}>
        <div style={{ fontSize: 52, fontWeight: 900, color: COLORS.text, marginBottom: 40 }}>
          컨텍스트 윈도우 안에 들어가는 것들
        </div>
      </AnimatedText>

      <div style={{ display: "flex", gap: 48 }}>
        {/* 왼쪽: 항상 들어가는 것 */}
        <div style={{ flex: 1 }}>
          <AnimatedText delay={8}>
            <div
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: COLORS.accentGlow,
                marginBottom: 20,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              항상 들어가는 것
            </div>
          </AnimatedText>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {always.map((item, i) => (
              <Item key={i} {...item} delay={15 + i * 10} />
            ))}
          </div>
        </div>

        {/* 구분선 */}
        <div
          style={{
            width: 1,
            background: "rgba(255,255,255,0.08)",
            flexShrink: 0,
          }}
        />

        {/* 오른쪽: 추가될 수 있는 것 */}
        <div style={{ flex: 1 }}>
          <AnimatedText delay={20}>
            <div
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: COLORS.accentSecondary,
                marginBottom: 20,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              추가될 수 있는 것
            </div>
          </AnimatedText>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {additional.map((item, i) => (
              <Item key={i} {...item} delay={30 + i * 10} />
            ))}
          </div>
        </div>
      </div>

      <AnimatedText delay={75}>
        <div
          style={{
            marginTop: 40,
            padding: "24px 36px",
            background: "rgba(251,191,36,0.08)",
            border: "1px solid rgba(251,191,36,0.3)",
            borderRadius: 12,
            fontSize: 28,
            color: COLORS.warning,
            fontWeight: 600,
          }}
        >
          ⚠️ 핵심: 모든 항목이 같은 공간을 공유합니다. 파일이 크면 대화 가능한 공간이 줄어듭니다.
        </div>
      </AnimatedText>
    </SlideBase>
  );
};
