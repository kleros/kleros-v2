import { request } from "graphql-request";

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

export type StakingEventsByCourtResponse = {
  userStakingEvents: {
    items: Array<{ item: StakingEventItem }>;
    count: number;
  };
};

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

export async function fetchStakingEventsByCourt(
  atlasUri: string,
  partialAddress: string,
  courtIds: number[] | null,
  contractAddress: string,
  chainId: number,
  skip: number,
  take: number
): Promise<StakingEventsByCourtResponse> {
  const variables = {
    partialAddress,
    courtIDs: courtIds,
    contract: {
      chainId,
      address: contractAddress,
    },
    pagination: { skip, take, sortByTimeStamp: "DESC" },
  };

  try {
    return await request<StakingEventsByCourtResponse>(`${atlasUri}/graphql`, query, variables);
  } catch (errors: any) {
    console.log("Error fetching staking events by court:", { errors });
    const errorMessage = Array.isArray(errors?.response?.errors)
      ? errors.response.errors[0]?.message
      : "Error fetching staking events by court";
    throw Error(errorMessage);
  }
}
