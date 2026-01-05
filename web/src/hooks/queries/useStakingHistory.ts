import { useQuery } from "@tanstack/react-query";

import { fetchStakingHistory, type StakingHistoryResponse } from "src/utils/fetchStakingHistory";

export const useStakingHistory = (take: number, lastCursorId?: number) => {
  return useQuery<StakingHistoryResponse>({
    queryKey: ["stakingHistoryQuery", take, lastCursorId],
    staleTime: 60000,
    queryFn: async () => {
      return await fetchStakingHistory(import.meta.env.REACT_APP_ATLAS_URI, take, lastCursorId);
    },
  });
};
