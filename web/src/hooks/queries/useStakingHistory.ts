import { useQuery } from "@tanstack/react-query";

// dynamic atlasUri would go here
const atlasUri = "https://url.example/graphql";

const AUTH_TOKEN = "Bearer tokenExampleGoesHere";

export const useStakingHistory = (take: number, lastCursorId?: number) => {
  const variables = {
    pagination: { take, lastCursorId: lastCursorId ?? null },
  };

  return useQuery({
    queryKey: ["stakingHistoryQuery", take, lastCursorId],
    enabled: true,
    staleTime: 60000,
    queryFn: async () => {
      console.log("Fetching with variables:", variables);

      try {
        const response = await fetch(atlasUri, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: AUTH_TOKEN,
          },
          body: JSON.stringify({
            query: `
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
            `,
            variables,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(`GraphQL error: ${JSON.stringify(result)}`);
        }

        return result;
      } catch (error) {
        console.error("GraphQL Fetch Error:", error);
        throw error;
      }
    },
  });
};
