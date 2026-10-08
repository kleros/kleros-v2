import React from "react";

import { formatUnits } from "viem";

import NumberDisplay from "components/NumberDisplay";

interface IStake {
  stake: bigint;
}

const Stake: React.FC<IStake> = ({ stake }) => {
  const formattedStake = formatUnits(stake, 18);

  return (
    <label className="flex font-semibold text-klerosUIComponentsPrimaryText text-[16px] items-center gap-1">
      <NumberDisplay value={formattedStake} unit="PNK" />
    </label>
  );
};
export default Stake;
