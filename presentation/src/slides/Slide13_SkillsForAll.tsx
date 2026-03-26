import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SlideBase } from "../components/SlideBase";
import { AnimatedText } from "../components/AnimatedText";
import { COLORS } from "../theme";

export const Slide13_SkillsForAll: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cases = [
    { role: "운영팀", desc: "엔지니어에게 묻지 않고 코드베이스를 직접 분석해 고객 CS 처리", icon: "🛠️" },
    { role: "콘텐츠팀", desc: "1년치 콘텐츠 성과 데이터 대규모 분석 — 채팅 앱으로 불가능했던 작업", icon: "📊" },
    { role: "마케터", desc: "신기능 릴리즈 카피 자동 생성 — 최근 코드 변경사항 기반으로", icon: "✍️" },
    { role: "기획팀", desc: "경비 지출 자동 분류 트래커 구축", icon: "📋" },
  ];

  const tasks = ["기획서 초안", "WBS 작성", "태깅 정의서", "테스트 시나리오", "회의록 정리", "뉴스레터 작성", "문서 요약", "브레인스톰"];

  return (
    <SlideBase sectionNumber="06" sectionTitle="스킬은 개발자만의 것이 아닙니다">
      <div style={{ display: "flex", gap: 60 }}>
        <div style={{ flex: 1.4 }}>
          <AnimatedText delay={0}>
            <div style={{ fontSize: 44, fontWeight: 900, color: COLORS.text, marginBottom: 8 }}>
              해외 사례 — Every.to
            </div>
          </AnimatedText>
          <AnimatedText delay={8}>
            <div style={{ fontSize: 24, color: COLORS.textMuted, marginBottom: 32 }}>
              미국 AI 전문 미디어 · 400명 이상 Claude Code Camp 실제 사례
            </div>
          </AnimatedText>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {cases.map((c, i) => {
              const p = spring({ frame: frame - 20 - i * 12, fps, config: { damping: 200 }, durationInFrames: 28 });
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: 20,
                    padding: "20px 24px",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 12,
                    opacity: interpolate(p, [0, 1], [0, 1]),
                    transform: `translateX(${interpolate(p, [0, 1], [-30, 0])}px)`,
                    alignItems: "center",
                  }}
                >
                  <div style={{ fontSize: 36 }}>{c.icon}</div>
                  <div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: COLORS.accentGlow, marginBottom: 4 }}>{c.role}</div>
                    <div style={{ fontSize: 22, color: COLORS.textMuted, lineHeight: 1.5 }}>{c.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 오른쪽: 비개발 업무들 */}
        <div style={{ flex: 1 }}>
          <AnimatedText delay={10}>
            <div style={{ fontSize: 36, fontWeight: 800, color: COLORS.text, marginBottom: 28 }}>
              Cursor로 할 수 있는 비개발 업무
            </div>
          </AnimatedText>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 14,
            }}
          >
            {tasks.map((task, i) => {
              const p = spring({ frame: frame - 30 - i * 8, fps, config: { damping: 200 }, durationInFrames: 25 });
              return (
                <div
                  key={i}
                  style={{
                    padding: "16px 20px",
                    background: "rgba(34,211,238,0.07)",
                    border: "1px solid rgba(34,211,238,0.2)",
                    borderRadius: 10,
                    fontSize: 24,
                    color: COLORS.text,
                    fontWeight: 500,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    opacity: interpolate(p, [0, 1], [0, 1]),
                    transform: `scale(${interpolate(p, [0, 1], [0.8, 1])})`,
                  }}
                >
                  <span style={{ color: COLORS.success }}>✅</span> {task}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </SlideBase>
  );
};
