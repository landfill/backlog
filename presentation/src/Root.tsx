import React from "react";
import { Composition } from "remotion";
import { Presentation, TOTAL_FRAMES } from "./Presentation";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="AIEducation"
      component={Presentation}
      durationInFrames={TOTAL_FRAMES}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
