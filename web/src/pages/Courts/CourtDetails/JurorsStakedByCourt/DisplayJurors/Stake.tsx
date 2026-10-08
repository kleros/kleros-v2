import React from "react";

import { formatPNK } from "utils/format";

interface IStake {
  effectiveStake: string;
}

const Stake: React.FC<IStake> = ({ effectiveStake }) => {
  return (
    <label className="text-[14px] text-klerosUIComponentsPrimaryText"> {formatPNK(BigInt(effectiveStake))} </label>
  );
};
export default Stake;
