import React from "react";

import { Address } from "viem";

import { ILevelCriteria } from "utils/userLevelCalculation";

import StakingRewards from "../StakingRewards";

import Coherence from "./Coherence";
import JurorRewards from "./JurorRewards";
import PixelArt from "./PixelArt";

interface IBottomContent {
  userLevelData: ILevelCriteria;
  totalCoherentVotes: number;
  totalResolvedVotes: number;
  searchParamAddress: Address;
}

const BottomContent: React.FC<IBottomContent> = ({
  userLevelData,
  totalCoherentVotes,
  totalResolvedVotes,
  searchParamAddress,
}) => {
  return (
    <div className="flex flex-col flex-wrap justify-between items-center gap-8 w-full h-auto lg:flex-row lg:items-start">
      <div className="flex gap-12 flex-col lg:flex-row">
        <PixelArt level={userLevelData.level} width="189px" height="189px" />
        <Coherence isMiniGuide={false} {...{ userLevelData, totalCoherentVotes, totalResolvedVotes }} />
        <JurorRewards {...{ searchParamAddress }} />
      </div>
      <StakingRewards />
    </div>
  );
};
export default BottomContent;
