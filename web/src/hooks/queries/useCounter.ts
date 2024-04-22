import { useQuery } from "@tanstack/react-query";

import { useGraphqlBatcher } from "context/GraphqlBatcher";

import { graphql } from "src/graphql";
import { CounterQuery } from "src/graphql/graphql";

export type { CounterQuery };

const counterQuery = graphql(`
  query Counter {
    counter(id: "0") {
      id
      cases
      casesRuled
      casesVoting
      casesAppealing
      stakedPNK
      redistributedPNK
      paidETH
      activeJurors
    }
  }
`);

export const useCounterQuery = () => {
  const { graphqlBatcher } = useGraphqlBatcher();

  return useQuery<CounterQuery>({
    queryKey: [`useCounterQuery`],
    queryFn: async () => await graphqlBatcher.fetch({ id: crypto.randomUUID(), document: counterQuery, variables: {} }),
  });
};
