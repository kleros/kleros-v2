import { useEffect, useState } from "react";

import { UseQueryResult } from "@tanstack/react-query";
import { useBlockNumber } from "wagmi";

import { averageBlockTimeInSeconds } from "consts/averageBlockTimeInSeconds";
import { DEFAULT_CHAIN } from "consts/chains";

import { useHomePageBlockQuery, HomePageBlockStats } from "./useHomePageBlockQuery";

type ReturnType = UseQueryResult<HomePageBlockStats, Error>;

export const useHomePageExtraStats = (days: number | string): ReturnType => {
  const [pastBlockNumber, setPastBlockNumber] = useState<number>();
  const currentBlockNumber = useBlockNumber({ chainId: DEFAULT_CHAIN });

  useEffect(() => {
    if (typeof days !== "string" && currentBlockNumber?.data) {
      const timeInBlocks = Math.floor((days * 24 * 3600) / averageBlockTimeInSeconds[DEFAULT_CHAIN]);
      setPastBlockNumber(Number(currentBlockNumber.data) - timeInBlocks);
    }
  }, [currentBlockNumber, days]);

  const data = useHomePageBlockQuery(pastBlockNumber, days === "allTime");

  return data;
};
