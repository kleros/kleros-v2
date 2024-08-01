import { useQuery } from "@tanstack/react-query";

import { useGraphqlBatcher } from "context/GraphqlBatcher";

import { graphql } from "src/graphql";
import { DisputeMaintenanceQuery } from "src/graphql/graphql";
import { isUndefined } from "src/utils";

const disputeMaintenance = graphql(`
  query DisputeMaintenance($disputeId: ID!, $disputeIdAsString: String!) {
    dispute(id: $disputeId) {
      currentRound {
        jurorsDrawn
      }
      rounds {
        jurorRewardsDispersed
        nbVotes
      }
    }
    contributions(where: { coreDispute: $disputeIdAsString }) {
      contributor {
        id
      }
      ... on ClassicContribution {
        choice
        rewardWithdrawn
      }
      coreDispute {
        currentRoundIndex
      }
    }
  }
`);

const useDisputeMaintenanceQuery = (id?: string) => {
  const isEnabled = !isUndefined(id);

  const { graphqlBatcher } = useGraphqlBatcher();
  return useQuery<DisputeMaintenanceQuery>({
    queryKey: [`disputeMaintenanceQuery-${id}`],
    enabled: isEnabled,
    queryFn: async () =>
      await graphqlBatcher.fetch({
        id: crypto.randomUUID(),
        document: disputeMaintenance,
        variables: { disputeId: id?.toString(), disputeIdAsString: id?.toString() },
      }),
  });
};

export default useDisputeMaintenanceQuery;
