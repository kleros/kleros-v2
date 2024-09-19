import { useEffect, useState } from "react";

import { DEFAULT_CHAIN } from "consts/chains";

import { useHomePageBlockQuery } from "./useHomePageBlockQuery";
import { useBlockNumber } from "wagmi";
import { averageBlockTimeInSeconds } from "consts/averageBlockTimeInSeconds";

export const useHomePageExtraStats = () => {
  const [oneWeekAgoBlockNumber, setOneWeekAgoBlockNumber] = useState<number>();
  const currentBlockNumber = useBlockNumber({ chainId: DEFAULT_CHAIN });

  useEffect(() => {
    if (currentBlockNumber?.data) {
      const oneWeekInBlocks = Math.floor((7 * 24 * 3600) / averageBlockTimeInSeconds[DEFAULT_CHAIN]);
      setOneWeekAgoBlockNumber(Number(currentBlockNumber.data) - oneWeekInBlocks);
    }
  }, [DEFAULT_CHAIN, currentBlockNumber]);

  const data = useHomePageBlockQuery(oneWeekAgoBlockNumber!);

  return data;
};
