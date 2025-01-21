import React from "react";

import DesktopCard from "./DesktopCard";
import MobileCard from "./MobileCard";

interface IJurorCard {
  rank: number;
  address: `0x${string}`;
  coherenceScore: string;
  totalCoherentVotes: string;
  totalResolvedVotes: string;
  totalResolvedDisputes: string;
}

const JurorCard: React.FC<IJurorCard> = ({
  rank,
  address,
  coherenceScore,
  totalCoherentVotes,
  totalResolvedVotes,
  totalResolvedDisputes,
}) => {
  const allProps = { rank, address, coherenceScore, totalCoherentVotes, totalResolvedVotes, totalResolvedDisputes };

  return (
    <>
      <MobileCard {...allProps} />
      <DesktopCard {...allProps} />
    </>
  );
};

export default JurorCard;
