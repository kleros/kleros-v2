import { formatEther } from "viem";
import { isUndefined } from "utils/index";

export const isLastRound = (appealCost?: bigint) => {
  if (!isUndefined(appealCost) && Number(formatEther(appealCost)) > Number.MAX_SAFE_INTEGER) {
    return true;
  }
  return false;
};
