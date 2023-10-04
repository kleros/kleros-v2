import { graphql } from "src/graphql";
import { Address } from "viem";
import { useQuery } from "@tanstack/react-query";
import {
  CasesPageQuery,
  Dispute_Filter,
  OrderDirection,
  MyCasesQuery,
  DisputeDetailsFragment,
} from "src/graphql/graphql";
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
  query CasesPageWhere($skip: Int, $where: Dispute_filter, $orderDirection: OrderDirection, $first: Int) {
    disputes(first: $first, skip: $skip, orderBy: lastPeriodChange, orderDirection: $orderDirection, where: $where) {
      ...DisputeDetails
    }
  }
`);

const casesQuery = graphql(`
  query CasesPage($skip: Int, $orderDirection: OrderDirection, $first: Int) {
    disputes(first: $first, skip: $skip, orderBy: lastPeriodChange, orderDirection: $orderDirection) {
      ...DisputeDetails
    }
  }
`);

const myCasesQuery = graphql(`
  query MyCases($id: ID!, $skip: Int, $orderDirection: OrderDirection) {
    user(id: $id) {
      disputes(first: 3, skip: $skip, orderBy: lastPeriodChange, orderDirection: $orderDirection) {
        ...DisputeDetails
      }
    }
  }
`);

const myCasesQueryWhere = graphql(`
  query myCasesPageWhere($id: ID!, $skip: Int, $where: Dispute_filter, $orderDirection: OrderDirection) {
    user(id: $id) {
      disputes(first: 3, skip: $skip, orderBy: lastPeriodChange, orderDirection: $orderDirection, where: $where) {
        ...DisputeDetails
      }
    }
  }
`);

export const useCasesQuery = (skip = 0, first = 3, where?: Dispute_Filter, sortOrder?: OrderDirection) => {
  return useQuery<CasesPageQuery>({
    queryKey: [`useCasesQuery`, skip, where, sortOrder, first],
    queryFn: async () =>
      await graphqlQueryFnHelper(isUndefined(where) ? casesQuery : casesQueryWhere, {
        first,
        skip,
        where,
        orderDirection: sortOrder ?? "desc",
      }),
  });
};

export const useMyCasesQuery = (user?: Address, skip = 0, where?: Dispute_Filter, sortOrder?: OrderDirection) => {
  const isEnabled = !isUndefined(user);

  return useQuery<MyCasesQuery>({
    queryKey: [`useMyCasesQuery`, user, skip, where, sortOrder],
    enabled: isEnabled,
    queryFn: async () =>
      await graphqlQueryFnHelper(isUndefined(where) ? myCasesQuery : myCasesQueryWhere, {
        skip,
        id: user?.toLowerCase(),
        where,
        orderDirection: sortOrder ?? "desc",
      }),
  });
};
