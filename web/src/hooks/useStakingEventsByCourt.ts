import { useQuery } from "@tanstack/react-query";

import { DEFAULT_CHAIN } from "consts/chains";
import { sortitionModuleAddress } from "hooks/contracts/generated";

import { isUndefined } from "src/utils";
import {
  fetchStakingEventsByCourt,
  type StakingEventsByCourtResponse,
  type StakingEventItem,
} from "src/utils/fetchStakingEventsByCourt";

export type { StakingEventItem };

export const useStakingEventsByCourt = (courtIds: number[], skip: number, take: number, partialAddress?: string) => {
  const atlasUri = import.meta.env.REACT_APP_ATLAS_URI;
  const addressParam = partialAddress ?? "";
  const contractAddress = sortitionModuleAddress[DEFAULT_CHAIN.id];

  // Allow empty courtIds array for "all courts" query
  const isEnabled = !isUndefined(atlasUri) && !isUndefined(contractAddress);

  return useQuery<StakingEventsByCourtResponse>({
    queryKey: ["stakingEventsByCourt", courtIds, skip, take, partialAddress, DEFAULT_CHAIN.id],
    enabled: isEnabled,
    staleTime: 60000,
    queryFn: async () => {
      return await fetchStakingEventsByCourt(
        atlasUri,
        addressParam,
        courtIds.length > 0 ? courtIds : null,
        contractAddress,
        DEFAULT_CHAIN.id,
        skip,
        take
      );
    },
  });
};
