import { graphql } from "src/graphql";
import { Address } from "viem";
import { useQuery } from "@tanstack/react-query";
import { MyCasesCounterQuery, Dispute_Filter } from "src/graphql/graphql";
import { graphqlQueryFnHelper } from "utils/graphqlQueryFnHelper";
import { isUndefined } from "utils/index";
export type { MyCasesCounterQuery };

const myCasesCounter = graphql(`
  query MyCasesCounter($id: ID!, $where: Dispute_filter) {
    user(id: $id) {
      totalAppealingDisputes
      disputes(orderBy: lastPeriodChange, where: $where) {
        id
      }
    }
  }
`);

export const useMyCasesCounterQuery = (user?: Address, where?: Dispute_Filter) => {
  const isEnabled = !isUndefined(user);

  return useQuery<MyCasesCounterQuery>({
    queryKey: [`useMyCasesCounterQuery`, user],
    enabled: isEnabled,
    queryFn: async () =>
      await graphqlQueryFnHelper(myCasesCounter, {
        id: user?.toLowerCase(),
        where,
      }),
  });
};
