import React from "react";

import { Address } from "viem";

import JurorLink from "components/JurorLink";

import HeaderCoherence from "../Header/Coherence";
import HeaderRewards from "../Header/Rewards";
import HeaderScore from "../Header/Score";

import Coherence from "./Coherence";
import JurorLevel from "./JurorLevel";
import Rank from "./Rank";
import Rewards from "./Rewards";
import Score from "./Score";

interface IMobileCard {
  rank?: number;
  address: Address;
  totalCoherentVotes: string;
  totalResolvedVotes: string;
  coherenceScore: string;
}

const MobileCard: React.FC<IMobileCard> = ({
  rank,
  address,
  totalCoherentVotes,
  totalResolvedVotes,
  coherenceScore,
}) => {
  return (
    <div className="[transition:0.1s] flex justify-between flex-wrap w-full bg-klerosUIComponentsWhiteBackground p-[8px_16px_12px] border border-solid border-klerosUIComponentsStroke border-t-0 items-center gap-2 lg:hidden [&:hover]:[background-color:color-mix(in_srgb,_var(--klerosUIComponentsLightGrey)_73.33333333333333%,_transparent)]">
      <div className="w-full flex flex-row justify-between items-center">
        <div className="flex flex-row items-center gap-2">
          {rank ? <Rank {...{ rank }} /> : null}
          <JurorLink {...{ address }} />
        </div>
        <JurorLevel coherenceScore={Number(coherenceScore)} />
      </div>
      <div className="w-full flex flex-col justify-between gap-1">
        <div className="flex w-full flex-row items-center gap-2">
          <HeaderScore />
          <Score {...{ coherenceScore }} />
        </div>
        <div className="flex w-full flex-row items-center gap-2">
          <HeaderCoherence />
          <Coherence {...{ totalCoherentVotes, totalResolvedVotes }} />
        </div>
        <div className="flex w-full flex-row items-center gap-2">
          <HeaderRewards />
          <Rewards {...{ address }} />
        </div>
      </div>
    </div>
  );
};
export default MobileCard;
