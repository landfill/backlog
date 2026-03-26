import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SlideBase } from "../components/SlideBase";
import { AnimatedText } from "../components/AnimatedText";
import { COLORS } from "../theme";

export const Slide03_BCGResearch: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const rows = [
    { situation: "첫 출근", without: '"알아서 해봐"', withH: "업무 매뉴얼 + 온보딩 문서 제공" },
    { situation: "업무 중", without: "실수해도 아무도 안 알려줌", withH: "체크리스트가 자동으로 검토" },
    { situation: "시간이 지나면", without: "문서와 현실이 안 맞아짐", withH: "주기적으로 정리·갱신" },
  ];

  return (
    <SlideBase sectionNumber="04" sectionTitle="하네스: AI의 업무 환경 설계">
      <AnimatedText delay={0}>
        <div style={{ fontSize: 52, fontWeight: 900, color: COLORS.text, marginBottom: 12, lineHeight: 1.2 }}>
          하네스(Harness)란 무엇인가
        </div>
      </AnimatedText>
      <AnimatedText delay={8}>
        <div style={{ fontSize: 28, color: COLORS.textMuted, marginBottom: 40 }}>
          AI가 올바른 방향으로 일할 수 있도록 둘러싼 <strong style={{ color: COLORS.accentGlow }}>업무 환경 전체</strong>
        </div>
      </AnimatedText>

      <AnimatedText delay={15}>
        <div
          style={{
            padding: "28px 36px",
            background: "rgba(34,211,238,0.08)",
            border: "1px solid rgba(34,211,238,0.25)",
            borderRadius: 16,
            marginBottom: 36,
            fontSize: 26,
            color: COLORS.text,
            lineHeight: 1.7,
          }}
        >
          <span style={{ fontSize: 28, fontWeight: 700, color: COLORS.accentSecondary }}>💡 OpenAI 사례</span>
          <br />
          2026년 초, OpenAI 팀이 5개월 동안 단 한 줄의 코드도 직접 쓰지 않고
          <br />
          <strong style={{ color: COLORS.accentGlow }}>100만 줄 이상의 소프트웨어</strong>를 AI로 만들었습니다.
          <br />
          비결은 더 좋은 AI 모델이 아니라{" "}
          <strong style={{ color: COLORS.warning }}>AI가 일하는 환경(하네스)을 철저히 설계한 것</strong>이었습니다.
        </div>
      </AnimatedText>

      <AnimatedText delay={30}>
        <div style={{ fontSize: 26, fontWeight: 700, color: COLORS.accentGlow, marginBottom: 16 }}>
          🧑‍💼 AI를 새로 입사한 팀원이라고 생각해보세요
        </div>
      </AnimatedText>

      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {/* 헤더 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.2fr 1.2fr",
            gap: 0,
            background: "rgba(99,102,241,0.15)",
            borderRadius: "12px 12px 0 0",
            padding: "14px 24px",
          }}
        >
          <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.accentGlow }}>상황</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.danger }}>❌ 하네스 없이</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.success }}>✅ 하네스 있으면</div>
        </div>

        {rows.map((row, i) => {
          const p = spring({
            frame: frame - 40 - i * 12,
            fps,
            config: { damping: 200 },
            durationInFrames: 28,
          });

          return (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1.2fr 1.2fr",
                gap: 0,
                padding: "18px 24px",
                background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.04)",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                opacity: interpolate(p, [0, 1], [0, 1]),
                transform: `translateX(${interpolate(p, [0, 1], [-20, 0])}px)`,
              }}
            >
              <div style={{ fontSize: 24, fontWeight: 600, color: COLORS.text }}>{row.situation}</div>
              <div style={{ fontSize: 22, color: COLORS.textDim }}>{row.without}</div>
              <div style={{ fontSize: 22, color: COLORS.success, fontWeight: 500 }}>{row.withH}</div>
            </div>
          );
        })}
      </div>

      <AnimatedText delay={80}>
        <div
          style={{
            marginTop: 24,
            padding: "20px 36px",
            background: "rgba(251,191,36,0.08)",
            border: "1px solid rgba(251,191,36,0.25)",
            borderRadius: 12,
            fontSize: 26,
            color: COLORS.warning,
            fontWeight: 600,
            textAlign: "center",
          }}
        >
          위 표의 오른쪽 열, 그 세 가지가 바로 하네스의 구성 요소입니다
        </div>
      </AnimatedText>
    </SlideBase>
  );
};
