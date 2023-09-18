import { formatEther } from "viem";

export const isLastRound = (appealCost: bigint) => {
  if (Number(formatEther(appealCost)) > Number.MAX_SAFE_INTEGER) {
    return true;
  }
  return false;
};
