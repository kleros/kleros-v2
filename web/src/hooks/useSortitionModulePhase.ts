import { REFETCH_INTERVAL } from "consts/index";

import { useReadSortitionModule } from "hooks/contracts/generated";

export const useSortitionModulePhase = () => {
  // eslint-disable-next-line
  // @ts-ignore
  return useReadSortitionModule({ functionName: "phase", query: { refetchInterval: REFETCH_INTERVAL } });
};
