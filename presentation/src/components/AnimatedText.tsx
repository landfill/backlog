import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

type Props = {
  children: React.ReactNode;
  delay?: number; // frames
  style?: React.CSSProperties;
  direction?: "up" | "left" | "fade";
};

export const AnimatedText: React.FC<Props> = ({
  children,
  delay = 0,
  style,
  direction = "up",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 200 },
    durationInFrames: 30,
  });

  const opacity = interpolate(progress, [0, 1], [0, 1]);

  let transform = "";
  if (direction === "up") {
    const y = interpolate(progress, [0, 1], [30, 0]);
    transform = `translateY(${y}px)`;
  } else if (direction === "left") {
    const x = interpolate(progress, [0, 1], [-40, 0]);
    transform = `translateX(${x}px)`;
  }

  return (
    <div
      style={{
        opacity,
        transform,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
