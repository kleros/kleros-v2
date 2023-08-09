import { graphql } from "src/graphql";
import { useQuery } from "@tanstack/react-query";
import { AllCasesQuery } from "src/graphql/graphql";
import { graphqlQueryFnHelper } from "utils/graphqlQueryFnHelper";
export type { AllCasesQuery };

const allCasesQuery = graphql(`
  query AllCases {
    counter(id: 0) {
      cases
      casesRuled
    }
  }
`);

export const useAllCasesQuery = () => {
  return useQuery({
    queryKey: [`allCasesQuery`],
    queryFn: async () => await graphqlQueryFnHelper(allCasesQuery, {}),
  });
};
