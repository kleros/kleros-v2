import { graphql } from "src/graphql";
import { useQuery } from "@tanstack/react-query";
import { CounterQuery } from "src/graphql/graphql";
import { graphqlQueryFnHelper } from "utils/graphqlQueryFnHelper";
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
  return useQuery<CounterQuery>({
    queryKey: [`useCounterQuery`],
    queryFn: async () => await graphqlQueryFnHelper(counterQuery, {}),
  });
};
