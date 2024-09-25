import { useQuery } from "@tanstack/react-query";

import { useGraphqlBatcher } from "context/GraphqlBatcher";
import { useMemo } from "react";

import { graphql } from "src/graphql";
import { CourtAllTimeQuery } from "src/graphql/graphql";
export type { CourtAllTimeQuery };

const courtAllTimeQuery = graphql(`
  query CourtAllTime {
    presentCourts: courts(orderBy: id, orderDirection: asc) {
      id
      parent {
        id
      }
      name
      numberDisputes
      numberVotes
      feeForJuror
      stake
    }
  }
`);

export const useCourtAllTimeQuery = () => {
  const { graphqlBatcher } = useGraphqlBatcher();

  const usedQuery = useQuery({
    queryKey: [`courtAllTimeQuery`],
    staleTime: Infinity,
    queryFn: async () => {
      const data = await graphqlBatcher.fetch({
        id: crypto.randomUUID(),
        document: courtAllTimeQuery,
      });
      return data;
    },
  });

  const courtActivityStats = useMemo(() => {
    if (usedQuery.data && !usedQuery.isFetching) {
      // 1. court with most disputes
      // we only iterate through past courts, since more courts might exist at the present
      // these diffCourts have: average stakes, and dispute diff
      const diffCourts = usedQuery.data.presentCourts.map((c) => ({
        ...c,
        numberDisputes: c.numberDisputes,
        treeNumberDisputes: c.numberDisputes,
        numberVotes: c.numberVotes,
        treeNumberVotes: c.numberVotes,
        stake: c.stake,
      }));

      const mostDisputedCourt = diffCourts.sort((a, b) => b.numberDisputes - a.numberDisputes)[0];
      // 2. biggest chances of getting drawn
      // fact a: getting drawn in a parent court also subjects you to its rewards
      // fact b: staking in children, stakes in parents. but subgraph at this date doesn't reflect this
      // so, stakes trickle up, rewards/disputes trickle down

      for (const parent of diffCourts) {
        for (const child of diffCourts) {
          if (parent.id === child.parent?.id) {
            child.treeNumberVotes = String(Number(parent.treeNumberVotes) + Number(child.treeNumberVotes));
            child.treeNumberDisputes = String(Number(parent.treeNumberDisputes) + Number(child.treeNumberDisputes));
          }
        }
      }
      diffCourts.reverse();
      for (const child of diffCourts) {
        for (const parent of diffCourts) {
          if (parent.id === child.parent?.id) {
            parent.stake = String(BigInt(parent.stake) + BigInt(child.stake));
          }
        }
      }
      diffCourts.reverse();
      for (const c of diffCourts) {
        c.votesPerPnk = Number(c.numberVotes) / (Number(c.stake) / 1e18);
        c.treeVotesPerPnk = c.votesPerPnk;
        c.disputesPerPnk = Number(c.numberDisputes) / (Number(c.stake) / 1e18);
        c.treeDisputesPerPnk = c.disputesPerPnk;
      }
      for (const parent of diffCourts) {
        for (const child of diffCourts) {
          if (parent.id === child.parent?.id) {
            child.treeVotesPerPnk += parent.votesPerPnk;
            child.treeDisputesPerPnk += parent.disputesPerPnk;
          }
        }
      }
      const bestDrawingChancesCourt = diffCourts.sort((a, b) => b.treeVotesPerPnk - a.treeVotesPerPnk)[0];
      // 3. expected reward
      // since we isolated the exclusive disputes from the cumulative disputes
      // we can calculate the "isolated reward" of every court
      // after that's done, then just trickle the rewards down

      for (const c of diffCourts) {
        c.expectedRewardPerPnk = c.votesPerPnk * c.feeForJuror;
        c.treeExpectedRewardPerPnk = c.expectedRewardPerPnk;
      }
      for (const parent of diffCourts) {
        for (const child of diffCourts) {
          if (parent.id === child.parent?.id) {
            child.treeExpectedRewardPerPnk = parent.treeExpectedRewardPerPnk + child.treeExpectedRewardPerPnk;
          }
        }
      }
      const bestExpectedRewardCourt = diffCourts.sort(
        (a, b) => b.treeExpectedRewardPerPnk - a.treeExpectedRewardPerPnk
      )[0];

      return { mostDisputedCourt, bestDrawingChancesCourt, bestExpectedRewardCourt, diffCourts };
    } else {
      return undefined;
    }
  }, [usedQuery]);

  return courtActivityStats;
};
