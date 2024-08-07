import { useMemo } from "react";

import { DEFAULT_CHAIN } from "consts/chains";
import { getOneWeekAgoTimestamp } from "utils/date";

import { HomePageBlockQuery } from "src/graphql/graphql";
import { isUndefined } from "src/utils";

import { useBlockByTimestamp } from "../useBlockByTimestamp";
import { useHomePageContext } from "../useHomePageContext";

import { useHomePageBlockQuery } from "./useHomePageBlockQuery";

type Court = HomePageBlockQuery["courts"][number];

const getCourtWithMaxDifference = (initialCourts: Court[], endCourts: Court[]): Court => {
  const diffs = initialCourts.map((court, idx) => {
    return Number(endCourts[idx].numberDisputes) - Number(court.numberDisputes);
  });

  const maxDiffCourtId = diffs.reduce((a, b) => (a > b ? a : b));

  return initialCourts[diffs.indexOf(maxDiffCourtId)];
};

const getCourtWithMaxReward = (courts: Court[]): Court => {
  return courts.reduce((a, b) => (Number(a.feeForJuror) > Number(b.feeForJuror) ? a : b));
};

const getCourtWithMaxChance = (courts: Court[]): Court => {
  return courts.reduce((a, b) => (Number(a.stake) > Number(b.feeForJuror) ? b : a));
};

export interface HomePageExtraStatsType {
  MostActiveCourt: string | null;
  HighestDrawingChance: string | null;
  HighestRewardChance: string | null;
}

export const useHomePageExtraStats = (): HomePageExtraStatsType => {
  const { data } = useHomePageContext();
  const { blockNumber } = useBlockByTimestamp(
    DEFAULT_CHAIN,
    useMemo(() => getOneWeekAgoTimestamp(), [])
  );

  const { data: relData } = useHomePageBlockQuery(blockNumber!);

  const HighestDrawingChance = useMemo(() => {
    return data ? getCourtWithMaxChance(data.courts).name ?? null : null;
  }, [data]);

  const HighestRewardChance = useMemo(() => {
    return data ? getCourtWithMaxReward(data.courts).name ?? null : null;
  }, [data]);

  const MostActiveCourt = useMemo(() => {
    if (isUndefined(relData) || isUndefined(data)) {
      return null;
    }
    return getCourtWithMaxDifference(relData.courts, data.courts).name ?? null;
  }, [relData, data]);

  return { MostActiveCourt, HighestDrawingChance, HighestRewardChance };
};
