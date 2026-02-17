import React from "react";

import DesktopCard from "./StakeEventCard/DesktopCard";
import MobileCard from "./StakeEventCard/MobileCard";

interface IStakeEventCard {
  address: string;
  stake: string;
  timestamp: string;
  transactionHash: string;
  courtName: string;
  courtId: number;
  currentCourtId?: number;
}

const StakeEventCard: React.FC<IStakeEventCard> = ({
  address,
  stake,
  timestamp,
  transactionHash,
  courtName,
  courtId,
  currentCourtId,
}) => {
  const allProps = { address, stake, timestamp, transactionHash, courtName, courtId, currentCourtId };

  return (
    <>
      <MobileCard {...allProps} />
      <DesktopCard {...allProps} />
    </>
  );
};

export default StakeEventCard;
