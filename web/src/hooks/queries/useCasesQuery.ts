import { graphql } from "src/graphql";
import { useQuery } from "@tanstack/react-query";
import { CasesPageQuery } from "src/graphql/graphql";
import { graphqlQueryFnHelper } from "~src/utils/graphqlQueryFnHelper";
export type { CasesPageQuery };

const casesQuery = graphql(`
  query CasesPage($skip: Int) {
    disputes(first: 3, skip: $skip, orderBy: lastPeriodChange, orderDirection: desc) {
      id
      arbitrated {
        id
      }
      court {
        id
        policy
        feeForJuror
        timesPerPeriod
      }
      period
      lastPeriodChange
    }
    counter(id: "0") {
      cases
    }
  }
`);

export const useCasesQuery = (skip: number) => {
  const isEnabled = skip !== undefined;

  return useQuery({
    queryKey: [`useCasesQuery${skip}`],
    enabled: isEnabled,
    queryFn: async () => graphqlQueryFnHelper(casesQuery, { skip: skip }),
  });
};
