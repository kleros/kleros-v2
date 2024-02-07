import { graphql } from "src/graphql";
import { useQuery } from "@tanstack/react-query";
import { CounterQuery } from "src/graphql/graphql";
import { useGraphqlBatcher } from "context/GraphqlBatcher";
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
