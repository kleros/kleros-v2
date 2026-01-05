import { request } from "graphql-request";

export type StakingEventNode = {
  name: string;
  args: any;
  blockTimestamp: string;
  transactionHash: string;
};

export type StakingHistoryResponse = {
  userStakingEvents: {
    edges: Array<{
      node: StakingEventNode;
      cursor: string;
    }>;
    count: number;
    hasNextPage: boolean;
  };
};

const query = `
  query GetStakingEvents($pagination: PaginationArgs) {
    userStakingEvents(pagination: $pagination) {
      edges {
        node {
          name
          args
          blockTimestamp
          transactionHash
        }
        cursor
      }
      count
      hasNextPage
    }
  }
`;

export async function fetchStakingHistory(
  atlasUri: string,
  take: number,
  lastCursorId?: number
): Promise<StakingHistoryResponse> {
  const variables = {
    pagination: { take, lastCursorId: lastCursorId ?? null },
  };

  try {
    return await request<StakingHistoryResponse>(`${atlasUri}/graphql`, query, variables);
  } catch (errors: any) {
    console.log("Error fetching staking history:", { errors });
    const errorMessage = Array.isArray(errors?.response?.errors)
      ? errors.response.errors[0]?.message
      : "Error fetching staking history";
    throw Error(errorMessage);
  }
}
