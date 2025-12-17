import { useQuery } from "@tanstack/react-query";
import { request } from "graphql-request";
import { useChainId } from "wagmi";

import { sortitionModuleAddress } from "hooks/contracts/generated";

import { isUndefined } from "src/utils";

export type StakingEventItem = {
  id: string;
  blockHash: string;
  transactionHash: string;
  blockTimestamp: string;
  network: {
    chainId: number;
  };
  args: {
    _address: string;
    _courtID: string;
    _amount: string;
  };
};

type StakingEventsResponse = {
  userStakingEvents: {
    items: Array<{ item: StakingEventItem }>;
    count: number;
  };
};

const atlasUri = import.meta.env.REACT_APP_ATLAS_URI;

export const useStakingEventsByCourt = (courtIds: number[], skip: number, take: number, partialAddress?: string) => {
  const chainId = useChainId();
  const addressParam = partialAddress ?? "";
  const contractAddress = sortitionModuleAddress[chainId as keyof typeof sortitionModuleAddress];

  // Allow empty courtIds array for "all courts" query
  const isEnabled = !isUndefined(atlasUri) && !isUndefined(contractAddress);

  const query = `
    query GetStakingEvents(
      $partialAddress: String!
      $courtIDs: [Int!]
      $contract: ContractInput!
      $pagination: PaginationArgs
    ) {
      userStakingEvents(
        partialAddress: $partialAddress
        courtIDs: $courtIDs
        contract: $contract
        pagination: $pagination
      ) {
        items {
          item {
            id
            blockHash
            transactionHash
            blockTimestamp
            network {
              chainId
            }
            args {
              _address
              _courtID
              _amount
            }
          }
        }
        count
      }
    }
  `;

  const variables = {
    partialAddress: addressParam,
    // If courtIds is empty, pass null to query all courts
    courtIDs: courtIds.length > 0 ? courtIds : null,
    contract: {
      chainId: chainId,
      address: contractAddress,
    },
    pagination: { skip, take },
  };

  return useQuery<StakingEventsResponse>({
    queryKey: ["stakingEventsByCourt", courtIds, skip, take, partialAddress, chainId],
    enabled: isEnabled,
    staleTime: 60000,
    queryFn: async () => {
      return await request<StakingEventsResponse>(`${atlasUri}/graphql`, query, variables);
    },
  });
};
