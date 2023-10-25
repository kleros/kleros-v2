import React from "react";
import DesktopCard from "./DesktopCard";
import MobileCard from "./MobileCard";

interface IJurorCard {
  rank: number;
  address: `0x${string}`;
  coherenceScore: number;
  totalCoherent: number;
  totalResolvedDisputes: number;
}

const JurorCard: React.FC<IJurorCard> = ({ rank, address, coherenceScore, totalCoherent, totalResolvedDisputes }) => {
  const allProps = { rank, address, coherenceScore, totalCoherent, totalResolvedDisputes };

  return (
    <>
      <MobileCard {...allProps} />
      <DesktopCard {...allProps} />
    </>
  );
};

export default JurorCard;
