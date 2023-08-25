import { graphql } from "src/graphql";
import { Address } from "viem";
import { useQuery } from "@tanstack/react-query";
import { MyAppealCasesQuery, Period, Dispute_Filter } from "src/graphql/graphql";
import { graphqlQueryFnHelper } from "utils/graphqlQueryFnHelper";
import { isUndefined } from "utils/index";
export type { MyAppealCasesQuery };

const myAppealCases = graphql(`
  query MyAppealCases($id: ID!, $where: Dispute_filter) {
    user(id: $id) {
      disputes(orderBy: lastPeriodChange, where: $where) {
        period
      }
    }
  }
`);

export const useMyAppealCasesQuery = (user?: Address) => {
  const isEnabled = !isUndefined(user);

  return useQuery<MyAppealCasesQuery>({
    queryKey: [`useMyAppealCasesQuery`, user],
    enabled: isEnabled,
    queryFn: async () =>
      await graphqlQueryFnHelper(myAppealCases, {
        id: user?.toLowerCase(),
        where: { period: Period.Appeal },
      }),
  });
};
