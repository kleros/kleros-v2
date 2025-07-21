import { useQuery } from "@tanstack/react-query";

import { useGraphqlBatcher } from "context/GraphqlBatcher";

import { graphql } from "src/graphql";
import { SupportedDisputeKitsQuery } from "src/graphql/graphql";

const supportedDisputeKitsQuery = graphql(`
  query SupportedDisputeKits($id: ID!) {
    court(id: $id) {
      supportedDisputeKits {
        id
        address
      }
    }
  }
`);

export const useSupportedDisputeKits = (courtId?: string) => {
  const { graphqlBatcher } = useGraphqlBatcher();
  return useQuery<SupportedDisputeKitsQuery>({
    enabled: !!courtId,
    queryKey: ["SupportedDisputeKits", courtId],
    staleTime: Infinity,
    queryFn: async () =>
      await graphqlBatcher.fetch({
        id: crypto.randomUUID(),
        document: supportedDisputeKitsQuery,
        variables: { id: courtId },
      }),
  });
};
