import { useEffect, useMemo, useState } from "react";

import { DEFAULT_CHAIN } from "consts/chains";

import { HomePageBlockQuery } from "src/graphql/graphql";
import { isUndefined } from "src/utils";

import { useHomePageContext } from "../useHomePageContext";

import { useHomePageBlockQuery } from "./useHomePageBlockQuery";
import { useBlockNumber } from "wagmi";
import { averageBlockTimeInSeconds } from "consts/averageBlockTimeInSeconds";

type Court = HomePageBlockQuery["courts"][number];

const getCourtWithMaxDifference = (lastWeekCourts: Court[], currentCourts: Court[]): Court => {
  const diffs = lastWeekCourts.map((court, idx) => {
    return Number(currentCourts[idx].numberDisputes) - Number(court.numberDisputes);
  });

  const maxDiffCourtId = diffs.reduce((a, b) => (a > b ? a : b));

  return lastWeekCourts[diffs.indexOf(maxDiffCourtId)];
};

const getCourtWithMaxDrawingChance = (currentCourts: Court[]): Court => {
  return currentCourts.reduce((a, b) => (Number(a.stake) > Number(b.feeForJuror) ? b : a));
};

const getCourtWithMaxRewardChance = (currentCourts: Court[]): Court => {
  return currentCourts.reduce((a, b) => (Number(a.feeForJuror) > Number(b.feeForJuror) ? a : b));
};

export interface HomePageExtraStatsType {
  MostActiveCourt: string | null;
  HighestDrawingChance: string | null;
  HighestRewardChance: string | null;
}

export const useHomePageExtraStats = (): HomePageExtraStatsType => {
  const { data } = useHomePageContext();
  const [oneWeekAgoBlockNumber, setOneWeekAgoBlockNumber] = useState<number>();
  const currentBlockNumber = useBlockNumber({ chainId: DEFAULT_CHAIN });

  useEffect(() => {
    if (currentBlockNumber?.data) {
      const oneWeekInBlocks = Math.floor((7 * 24 * 3600) / averageBlockTimeInSeconds[DEFAULT_CHAIN]);
      setOneWeekAgoBlockNumber(Number(currentBlockNumber.data) - oneWeekInBlocks);
    }
  }, [DEFAULT_CHAIN, currentBlockNumber]);

  const { data: relData } = useHomePageBlockQuery(oneWeekAgoBlockNumber!);

  const MostActiveCourt = useMemo(() => {
    if (isUndefined(relData) || isUndefined(data)) {
      return null;
    }
    return getCourtWithMaxDifference(relData.courts, data.courts).name ?? null;
  }, [relData, data]);

  const HighestDrawingChance = useMemo(() => {
    return data ? getCourtWithMaxDrawingChance(data.courts).name ?? null : null;
  }, [data]);

  const HighestRewardChance = useMemo(() => {
    return data ? getCourtWithMaxRewardChance(data.courts).name ?? null : null;
  }, [data]);

  return { MostActiveCourt, HighestDrawingChance, HighestRewardChance };
};
