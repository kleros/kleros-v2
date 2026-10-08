import React from "react";

import { Address } from "viem";

import { cn } from "utils/cn";

import { responsiveSize } from "styles/responsiveSize";

import JurorLink from "components/JurorLink";

import Coherence from "./Coherence";
import JurorLevel from "./JurorLevel";
import Rank from "./Rank";
import Rewards from "./Rewards";
import Score from "./Score";

interface IDesktopCard {
  rank?: number;
  address: Address;
  coherenceScore: string;
  totalCoherentVotes: string;
  totalResolvedVotes: string;
}

const DesktopCard: React.FC<IDesktopCard> = ({
  rank,
  address,
  coherenceScore,
  totalCoherentVotes,
  totalResolvedVotes,
}) => {
  const renderRank = !!rank;

  return (
    <div
      className={cn(
        "[transition:0.1s] hidden w-full bg-klerosUIComponentsWhiteBackground border border-klerosUIComponentsStroke border-t-0 items-center px-8 py-[15.55px] lg:grid hover:bg-klerosUIComponentsLightGrey/[0.7333]",
        renderRank
          ? "lg:grid-cols-[min-content_minmax(160px,1fr)_minmax(60px,1fr)_minmax(80px,0.8fr)_minmax(180px,1.5fr)_minmax(100px,1fr)]"
          : "lg:grid-cols-[minmax(160px,1fr)_minmax(60px,1fr)_minmax(80px,0.8fr)_minmax(180px,1.5fr)_minmax(100px,1fr)]"
      )}
      style={{ columnGap: responsiveSize(12, 24, 900) }}
    >
      {renderRank && <Rank rank={rank} />}
      <JurorLink address={address} />
      <Score coherenceScore={coherenceScore} />
      <Coherence {...{ totalCoherentVotes, totalResolvedVotes }} />
      <Rewards address={address} />
      <JurorLevel coherenceScore={Number(coherenceScore)} />
    </div>
  );
};

export default DesktopCard;
