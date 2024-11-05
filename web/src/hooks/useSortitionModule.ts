import { REFETCH_INTERVAL } from "consts/index";

import { useReadSortitionModule } from "hooks/contracts/generated";

export const useSortitionModulePhase = () => {
  // eslint-disable-next-line
  // @ts-ignore
  return useReadSortitionModule({ functionName: "phase", query: { refetchInterval: REFETCH_INTERVAL } });
};

export const useReadSortitionModuleDelayedStakeReadIndex = () => {
  return useReadSortitionModule({
    // eslint-disable-next-line
    // @ts-ignore
    functionName: "delayedStakeReadIndex",
    query: { refetchInterval: REFETCH_INTERVAL },
  });
};

export const useReadSortitionModuleDelayedStakeWriteIndex = () => {
  return useReadSortitionModule({
    // eslint-disable-next-line
    // @ts-ignore
    functionName: "delayedStakeWriteIndex",
    query: { refetchInterval: REFETCH_INTERVAL },
  });
};

export const useReadSortitionModuleLastPhaseChange = () => {
  return useReadSortitionModule({
    // eslint-disable-next-line
    // @ts-ignore
    functionName: "lastPhaseChange",
    query: { refetchInterval: REFETCH_INTERVAL },
  });
};

export const useReadSortitionModuleMaxDrawingTime = () => {
  return useReadSortitionModule({
    // eslint-disable-next-line
    // @ts-ignore
    functionName: "maxDrawingTime",
    query: { refetchInterval: REFETCH_INTERVAL },
  });
};

export const useReadSortitionModuleMinStakingTime = () => {
  return useReadSortitionModule({
    // eslint-disable-next-line
    // @ts-ignore
    functionName: "minStakingTime",
    query: { refetchInterval: REFETCH_INTERVAL },
  });
};
