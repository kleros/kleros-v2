import { graphql } from "src/graphql";
import { useQuery } from "@tanstack/react-query";
import { CounterQuery } from "src/graphql/graphql";
import { graphqlQueryFnHelper } from "utils/graphqlQueryFnHelper";

const counterQuery = graphql(`
  query Counter {
    counter(id: "0") {
      cases
      casesRuled
      casesAppealing
    }
  }
`);

export const useCounterQuery = () => {
  return useQuery<CounterQuery>({
    queryKey: [`useCounterQuery`],
    queryFn: async () => await graphqlQueryFnHelper(counterQuery, {}),
  });
};
