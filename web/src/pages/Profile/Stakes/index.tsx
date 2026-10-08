import React from "react";

import { useReadSortitionModuleGetJurorBalance } from "hooks/contracts/generated";
import { cn } from "utils/cn";

import { useJurorStakeDetailsQuery } from "queries/useJurorStakeDetailsQuery";

import CurrentStakes from "./CurrentStakes";
import StakingHistory from "./StakingHistory";

export const CourtCardsContainer = React.forwardRef<React.ElementRef<"div">, React.ComponentPropsWithoutRef<"div">>(
  function CourtCardsContainer({ className, ...props }, ref) {
    return <div {...props} ref={ref} className={cn("flex flex-col gap-3 z-0 w-full lg:gap-2", className)} />;
  }
);

interface IStakes {
  searchParamAddress: `0x${string}`;
}

const Stakes: React.FC<IStakes> = ({ searchParamAddress }) => {
  const { data: currentStakeData, isLoading: isCurrentStakeLoading } = useJurorStakeDetailsQuery(searchParamAddress);
  const { data: jurorBalance } = useReadSortitionModuleGetJurorBalance({
    args: [searchParamAddress, BigInt(1)],
  });
  const totalAvailableStake = jurorBalance?.[0];
  const lockedStake = jurorBalance?.[1];

  return (
    <div className="flex flex-col mt-[calc(24px_+_(32_-_24)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))] gap-8">
      <CurrentStakes {...{ totalAvailableStake, lockedStake, currentStakeData, isCurrentStakeLoading }} />
      <StakingHistory {...{ searchParamAddress }} />
    </div>
  );
};

export default Stakes;
