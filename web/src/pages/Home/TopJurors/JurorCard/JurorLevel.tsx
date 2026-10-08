import React from "react";

import { getUserLevelData } from "utils/userLevelCalculation";

import PixelArt from "pages/Profile/JurorCard/BottomContent/PixelArt";

interface IJurorLevel {
  coherenceScore: number;
}

const JurorLevel: React.FC<IJurorLevel> = ({ coherenceScore }) => {
  const userLevelData = getUserLevelData(coherenceScore);
  const level = userLevelData.level;

  return (
    <div className="flex items-center gap-2 lg:gap-4 lg:justify-end">
      <label className={'text-[12px]! [&::before]:[content:"Lv._"] lg:text-[16px]! lg:[&::before]:[content:"Level_"]'}>
        {level}
      </label>
      <PixelArt width="32px" height="32px" level={level} />
    </div>
  );
};
export default JurorLevel;
