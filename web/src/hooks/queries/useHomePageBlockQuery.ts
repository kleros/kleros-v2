import { useQuery } from "@tanstack/react-query";

import { useGraphqlBatcher } from "context/GraphqlBatcher";

import { graphql } from "src/graphql";
import { HomePageBlockQuery } from "src/graphql/graphql";
export type { HomePageBlockQuery };

const homePageBlockQuery = graphql(`
  query HomePageBlock($blockNumber: Int) {
    courts(orderBy: id, orderDirection: asc, block: { number: $blockNumber }) {
      id
      name
      numberDisputes
      feeForJuror
      stake
    }
  }
`);

export const useHomePageBlockQuery = (blockNumber: number) => {
  const isEnabled = blockNumber != null;
  const { graphqlBatcher } = useGraphqlBatcher();

  return useQuery({
    queryKey: [`homePageBlockQuery${blockNumber}`],
    enabled: isEnabled,
    queryFn: async () => {
      const data = await graphqlBatcher.fetch({
        id: crypto.randomUUID(),
        document: homePageBlockQuery,
        variables: { blockNumber },
      });
      return data;
    },
  });
};
