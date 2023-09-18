import { graphql } from "src/graphql";
import { useQuery } from "@tanstack/react-query";
import { CasesPageQuery } from "src/graphql/graphql";
import { graphqlQueryFnHelper } from "~src/utils/graphqlQueryFnHelper";
export type { CasesPageQuery };

const casesQuery = graphql(`
  query CasesPage($first: Int, $skip: Int) {
    disputes(first: $first, skip: $skip, orderBy: lastPeriodChange, orderDirection: desc) {
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

export const useCasesQuery = (skip: number, first = 3) => {
  const isEnabled = skip !== undefined;

  return useQuery({
    queryKey: [`useCasesQuery${skip},${first}`],
    enabled: isEnabled,
    queryFn: async () => await graphqlQueryFnHelper(casesQuery, { skip, first }),
  });
};
