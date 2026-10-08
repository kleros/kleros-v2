import React from "react";

import { useCountdownContext } from "hooks/useClassicAppealContext";

import { StyledSkeleton } from "components/StyledSkeleton";

import StageOne from "./StageOne";
import StageTwo from "./StageTwo";

interface IOptions {
  setAmount: (val: string) => void;
}

const Options: React.FC<IOptions> = ({ setAmount }) => {
  const { loserSideCountdown, isLoading } = useCountdownContext();

  return (
    <div className="m-[24px_0]">
      {!isLoading ? (
        (loserSideCountdown ?? 0) > 0 ? (
          <StageOne setAmount={setAmount} />
        ) : (
          <StageTwo setAmount={setAmount} />
        )
      ) : (
        <StyledSkeleton />
      )}
    </div>
  );
};

export default Options;
