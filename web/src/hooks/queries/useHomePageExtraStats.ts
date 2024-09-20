import { useEffect, useState } from "react";
import { DEFAULT_CHAIN } from "consts/chains";
import { useHomePageBlockQuery } from "./useHomePageBlockQuery";
import { useBlockNumber } from "wagmi";
import { averageBlockTimeInSeconds } from "consts/averageBlockTimeInSeconds";

export const useHomePageExtraStats = (days: number | string) => {
  const [pastBlockNumber, setPastBlockNumber] = useState<number>();
  const currentBlockNumber = useBlockNumber({ chainId: DEFAULT_CHAIN });

  useEffect(() => {
    if (typeof days !== "string" && currentBlockNumber?.data) {
      const timeInBlocks = Math.floor((days * 24 * 3600) / averageBlockTimeInSeconds[DEFAULT_CHAIN]);
      setPastBlockNumber(Number(currentBlockNumber.data) - timeInBlocks);
    }
  }, [DEFAULT_CHAIN, currentBlockNumber, days]);

  const data = useHomePageBlockQuery(pastBlockNumber!, days === "allTime");

  return data;
};
