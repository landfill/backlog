import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SlideBase } from "../components/SlideBase";
import { AnimatedText } from "../components/AnimatedText";
import { COLORS } from "../theme";

export const Slide11_Harness: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const elements = [
    {
      num: "①",
      title: "업무 매뉴얼",
      subtitle: "맥락을 기록으로 남기기",
      items: [
        { name: "CLAUDE.md / Cursor Rules", desc: "AI가 매 세션 자동으로 읽는 기본 규칙" },
        { name: "SKILL.md", desc: "특정 업무를 위한 맥락 + 지시 → @파일로 주입" },
        { name: "_context/ 폴더", desc: "회의록, 결정 이력, 요구사항 등 참고 자료" },
      ],
      color: COLORS.accentGlow,
      bgColor: "rgba(99,102,241,0.08)",
      borderColor: "rgba(99,102,241,0.3)",
    },
    {
      num: "②",
      title: "가드레일",
      subtitle: "규칙 세우기",
      items: [
        { name: "기획서 작성", desc: "목적→기능 정의→WBS→리스크 순서" },
        { name: "고객 응대", desc: "환불 24시간 이내만. 변경 불가" },
        { name: "보고서 / 콘텐츠", desc: "수치 출처 명시, 브랜드 톤 준수" },
      ],
      color: COLORS.warning,
      bgColor: "rgba(251,191,36,0.06)",
      borderColor: "rgba(251,191,36,0.25)",
    },
    {
      num: "③",
      title: "정기 점검",
      subtitle: "쌓인 것 정리하기",
      items: [
        { name: "바뀐 결정 반영", desc: "주 1회 _context/ 폴더 업데이트" },
        { name: "안 쓰는 규칙 삭제", desc: "더 이상 필요 없는 항목 제거" },
        { name: "스킬 파일 갱신", desc: "현재 업무에 맞게 재작성" },
      ],
      color: COLORS.accentSecondary,
      bgColor: "rgba(34,211,238,0.06)",
      borderColor: "rgba(34,211,238,0.25)",
    },
  ];

  return (
    <SlideBase sectionNumber="04" sectionTitle="하네스: AI의 업무 환경 설계">
      <AnimatedText delay={0}>
        <div style={{ fontSize: 48, fontWeight: 900, color: COLORS.text, marginBottom: 36 }}>
          하네스의 세 가지 요소
        </div>
      </AnimatedText>

      <div style={{ display: "flex", gap: 24 }}>
        {elements.map((el, i) => {
          const cardP = spring({
            frame: frame - 10 - i * 18,
            fps,
            config: { damping: 200 },
            durationInFrames: 30,
          });

          return (
            <div
              key={i}
              style={{
                flex: 1,
                background: el.bgColor,
                border: `1px solid ${el.borderColor}`,
                borderRadius: 18,
                padding: "24px 22px",
                opacity: interpolate(cardP, [0, 1], [0, 1]),
                transform: `translateY(${interpolate(cardP, [0, 1], [40, 0])}px)`,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <span style={{ fontSize: 36, fontWeight: 900, color: el.color }}>{el.num}</span>
                <span style={{ fontSize: 30, fontWeight: 800, color: COLORS.text }}>{el.title}</span>
              </div>
              <div style={{ fontSize: 22, color: COLORS.textDim, marginBottom: 20 }}>
                {el.subtitle}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
                {el.items.map((item, j) => {
                  const itemP = spring({
                    frame: frame - 25 - i * 18 - j * 10,
                    fps,
                    config: { damping: 200 },
                    durationInFrames: 25,
                  });

                  return (
                    <div
                      key={j}
                      style={{
                        padding: "14px 16px",
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        borderRadius: 10,
                        opacity: interpolate(itemP, [0, 1], [0, 1]),
                      }}
                    >
                      <div style={{ fontSize: 20, fontWeight: 700, color: el.color, marginBottom: 4 }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: 18, color: COLORS.textMuted, lineHeight: 1.5 }}>
                        {item.desc}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <AnimatedText delay={85}>
        <div
          style={{
            marginTop: 20,
            padding: "18px 32px",
            background: "rgba(99,102,241,0.10)",
            border: "1px solid rgba(99,102,241,0.3)",
            borderRadius: 12,
            fontSize: 24,
            color: COLORS.accentGlow,
            fontWeight: 600,
            textAlign: "center",
          }}
        >
          💡 규칙이 명확할수록 AI는 그 안에서 더 자유롭고 정확하게 일합니다
        </div>
      </AnimatedText>
    </SlideBase>
  );
};
