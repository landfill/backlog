import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SlideBase } from "../components/SlideBase";
import { AnimatedText } from "../components/AnimatedText";
import { AnimatedTable } from "../components/AnimatedTable";
import { COLORS } from "../theme";

export const Slide10_ContextReset: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <SlideBase sectionNumber="03" sectionTitle="프롬프트 → 컨텍스트 엔지니어링으로">
      <AnimatedText delay={0}>
        <div style={{ fontSize: 52, fontWeight: 900, color: COLORS.text, marginBottom: 48 }}>
          컨텍스트가 가득 찰 때 3가지 선택
        </div>
      </AnimatedText>

      <AnimatedTable
        delay={15}
        headers={["방법", "행동", "결과"]}
        rows={[
          ["Clear", "새 대화창 열기", "깨끗하게 리셋. 하지만 이전 맥락 전부 소멸"],
          ["Compact", "Claude Code /compact", "대화를 요약 압축. 핵심 맥락은 유지"],
          ["새 에이전트", "Cursor 새 Agent 창", "깨끗하지만 역시 이전 기억 없음"],
        ]}
        accentCols={[0]}
      />

      <AnimatedText delay={70}>
        <div
          style={{
            marginTop: 40,
            padding: "28px 40px",
            background: "rgba(248,113,113,0.08)",
            border: "1px solid rgba(248,113,113,0.3)",
            borderRadius: 14,
          }}
        >
          <div
            style={{
              fontSize: 30,
              color: COLORS.danger,
              fontWeight: 700,
              marginBottom: 12,
            }}
          >
            ❗ 핵심 문제
          </div>
          <div style={{ fontSize: 27, color: COLORS.text, lineHeight: 1.7 }}>
            어떤 방식이든 새로 시작한 AI는 기억이 없습니다.
            <br />
            <span style={{ color: COLORS.warning }}>
              바이브코딩 세션에서 2시간 쌓아온 결정, 실패한 시도, 설계 이유가 전부 날아갑니다.
            </span>
          </div>
        </div>
      </AnimatedText>
    </SlideBase>
  );
};
