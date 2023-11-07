import React from "react";
import DesktopCard from "./DesktopCard";
import MobileCard from "./MobileCard";

interface ICourtCard {
  name: string;
  stake: bigint;
  lockedStake: bigint;
}

const CourtCard: React.FC<ICourtCard> = ({ name, stake, lockedStake }) => {
  const allProps = { name, stake, lockedStake };

  return (
    <>
      <DesktopCard {...allProps} />
      <MobileCard {...allProps} />
    </>
  );
};

export default CourtCard;
