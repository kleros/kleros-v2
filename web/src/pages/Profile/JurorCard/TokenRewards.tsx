import React from "react";

import GradientTokenIcons from "components/GradientTokenIcons";
import NumberDisplay from "components/NumberDisplay";
import { StyledSkeleton } from "components/StyledSkeleton";

interface ITokenRewards {
  token: "ETH" | "PNK";
  amount: string | undefined;
  value: string | undefined;
}

const TokenRewards: React.FC<ITokenRewards> = ({ token, amount, value }) => {
  return (
    <div className="flex justify-center items-center gap-2">
      {token && <GradientTokenIcons icon={token} />}
      <h1 className="m-0">
        {amount ? <NumberDisplay value={amount} unit={token} place="left" /> : <StyledSkeleton width={76} />}
      </h1>
      <label>
        {value ? <NumberDisplay value={value} place="right" unit="$" isCurrency /> : <StyledSkeleton width={32} />}
      </label>
    </div>
  );
};

export default TokenRewards;
