import { graphql } from "src/graphql";
import { Address } from "viem";
import { useQuery } from "@tanstack/react-query";
import { CasesPageQuery, Dispute_Filter, MyCasesQuery, DisputeDetailsFragment } from "src/graphql/graphql";
import { graphqlQueryFnHelper } from "utils/graphqlQueryFnHelper";
import { isUndefined } from "utils/index";
export type { CasesPageQuery, DisputeDetailsFragment };

export const disputeFragment = graphql(`
  fragment DisputeDetails on Dispute {
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
`);

const casesQueryWhere = graphql(`
  query CasesPageWhere($skip: Int, $where: Dispute_filter) {
    disputes(first: 3, skip: $skip, orderBy: lastPeriodChange, orderDirection: desc, where: $where) {
      ...DisputeDetails
    }
  }
`);

const casesQuery = graphql(`
  query CasesPage($skip: Int) {
    disputes(first: 3, skip: $skip, orderBy: lastPeriodChange, orderDirection: desc) {
      ...DisputeDetails
    }
  }
`);

const myCasesQuery = graphql(`
  query MyCases($id: ID!, $skip: Int) {
    user(id: $id) {
      disputes(first: 3, skip: $skip, orderBy: lastPeriodChange, orderDirection: desc) {
        ...DisputeDetails
      }
    }
  }
`);

export const useCasesQuery = (skip = 0, where?: Dispute_Filter) => {
  return useQuery<CasesPageQuery>({
    queryKey: [`useCasesQuery`, skip],
    queryFn: async () => await graphqlQueryFnHelper(isUndefined(where) ? casesQuery : casesQueryWhere, { skip, where }),
  });
};

export const useMyCasesQuery = (user?: Address, skip = 0) => {
  const isEnabled = !isUndefined(user);

  return useQuery<MyCasesQuery>({
    queryKey: [`useMyCasesQuery`, user, skip],
    enabled: isEnabled,
    queryFn: async () => await graphqlQueryFnHelper(myCasesQuery, { skip, id: user?.toLowerCase() }),
  });
};
