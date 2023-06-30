import useSWR from "swr";
import { graphql } from "src/graphql";
import { CasesPageQuery } from "src/graphql/graphql";
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
  return useSWR<CasesPageQuery>({
    query: casesQuery,
    variables: { skip: skip },
  });
};
