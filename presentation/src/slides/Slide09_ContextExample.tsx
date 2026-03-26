import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SlideBase } from "../components/SlideBase";
import { AnimatedText } from "../components/AnimatedText";
import { COLORS } from "../theme";

export const Slide09_ContextExample: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const leftP = spring({ frame: frame - 15, fps, config: { damping: 200 }, durationInFrames: 30 });
  const rightP = spring({ frame: frame - 30, fps, config: { damping: 200 }, durationInFrames: 30 });
  const tipP = spring({ frame: frame - 55, fps, config: { damping: 200 }, durationInFrames: 30 });

  return (
    <SlideBase sectionNumber="03" sectionTitle="프롬프트 → 컨텍스트 엔지니어링으로">
      <AnimatedText delay={0}>
        <div style={{ fontSize: 48, fontWeight: 900, color: COLORS.text, marginBottom: 40 }}>
          전달 방식이 결과를 바꿉니다
        </div>
      </AnimatedText>

      <div style={{ display: "flex", gap: 32, marginBottom: 32 }}>
        {/* 왼쪽: 프롬프트만 */}
        <div
          style={{
            flex: 1,
            opacity: interpolate(leftP, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(leftP, [0, 1], [30, 0])}px)`,
          }}
        >
          <div
            style={{
              padding: "16px 24px",
              background: "rgba(100,116,139,0.15)",
              borderRadius: "12px 12px 0 0",
              fontSize: 24,
              color: COLORS.textDim,
              fontWeight: 700,
            }}
          >
            ❌ 프롬프트만
          </div>
          <div
            style={{
              padding: "28px 28px",
              background: "rgba(100,116,139,0.06)",
              border: "1px solid rgba(100,116,139,0.2)",
              borderRadius: "0 0 12px 12px",
              borderTop: "none",
              minHeight: 200,
            }}
          >
            <div
              style={{
                fontSize: 32,
                color: COLORS.text,
                fontWeight: 600,
                marginBottom: 20,
                fontFamily: "monospace",
                background: "rgba(0,0,0,0.3)",
                padding: "12px 16px",
                borderRadius: 8,
              }}
            >
              "환불 정책 만들어줘"
            </div>
            <div style={{ fontSize: 24, color: COLORS.textMuted, lineHeight: 1.6 }}>
              → 어디서든 쓸 수 있는 일반 템플릿
              <br />→ 우리 상황과 무관한 교과서 답변
            </div>
          </div>
        </div>

        {/* 오른쪽: 컨텍스트 포함 */}
        <div
          style={{
            flex: 1,
            opacity: interpolate(rightP, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(rightP, [0, 1], [30, 0])}px)`,
          }}
        >
          <div
            style={{
              padding: "16px 24px",
              background: "rgba(99,102,241,0.2)",
              borderRadius: "12px 12px 0 0",
              fontSize: 24,
              color: COLORS.accentGlow,
              fontWeight: 700,
            }}
          >
            ✅ 컨텍스트 포함
          </div>
          <div
            style={{
              padding: "28px 28px",
              background: "rgba(99,102,241,0.05)",
              border: "1px solid rgba(99,102,241,0.25)",
              borderRadius: "0 0 12px 12px",
              borderTop: "none",
              minHeight: 200,
            }}
          >
            <div
              style={{
                fontSize: 22,
                color: COLORS.text,
                lineHeight: 1.7,
                marginBottom: 20,
                background: "rgba(0,0,0,0.3)",
                padding: "12px 16px",
                borderRadius: 8,
              }}
            >
              "월 9,900원 구독형인데, 가입-환불 반복 악용이 30%야.
              지난번에 7일 이내 전액 환불로 바꿨더니 1일 사용 후 환불 패턴이 늘었어.
              그래서 결제 직후 24시간 이내만 허용하는 방향으로 판단했어."
            </div>
            <div style={{ fontSize: 24, color: COLORS.success, lineHeight: 1.6, fontWeight: 600 }}>
              → 우리 상황에 맞는 정책안
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          opacity: interpolate(tipP, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(tipP, [0, 1], [20, 0])}px)`,
          padding: "24px 36px",
          background: "rgba(34,211,238,0.08)",
          border: "1px solid rgba(34,211,238,0.25)",
          borderRadius: 14,
          fontSize: 26,
          color: COLORS.accentSecondary,
          lineHeight: 1.6,
        }}
      >
        💡 <strong>확인 방법:</strong> AI에게 줄 정보를 인쇄해서 옆 동료에게 건네보세요.
        그 동료가 요청한 일을 못 하면, <strong>AI도 못 합니다.</strong>
      </div>
    </SlideBase>
  );
};
