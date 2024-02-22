import { graphql } from "src/graphql";
import { useQuery } from "@tanstack/react-query";
import { AllCasesQuery } from "src/graphql/graphql";
import { useGraphqlBatcher } from "context/GraphqlBatcher";
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
  const { graphqlBatcher } = useGraphqlBatcher();
  return useQuery({
    queryKey: [`allCasesQuery`],
    queryFn: async () =>
      await graphqlBatcher.fetch({ id: crypto.randomUUID(), document: allCasesQuery, variables: {} }),
  });
};
