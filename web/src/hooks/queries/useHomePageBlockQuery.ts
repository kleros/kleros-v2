import { useQuery } from "@tanstack/react-query";

import { useGraphqlBatcher } from "context/GraphqlBatcher";
import { useMemo } from "react";

import { graphql } from "src/graphql";
import { HomePageBlockQuery } from "src/graphql/graphql";
export type { HomePageBlockQuery };

const homePageBlockQuery = graphql(`
  query HomePageBlock($blockNumber: Int) {
    presentCourts: courts(orderBy: id, orderDirection: asc) {
      id
      parent {
        id
      }
      name
      numberDisputes
      numberVotes
      feeForJuror
      effectiveStake
    }
    pastCourts: courts(orderBy: id, orderDirection: asc, block: { number: $blockNumber }) {
      id
      parent {
        id
      }
      name
      numberDisputes
      numberVotes
      feeForJuror
      effectiveStake
    }
  }
`);

export const useHomePageBlockQuery = (blockNumber: number | null, allTime: boolean) => {
  const isEnabled = blockNumber !== null || allTime;
  const { graphqlBatcher } = useGraphqlBatcher();

  const usedQuery = useQuery({
    queryKey: [`homePageBlockQuery${blockNumber}-${allTime}`],
    enabled: isEnabled,
    staleTime: Infinity,
    queryFn: async () => {
      const data = await graphqlBatcher.fetch({
        id: crypto.randomUUID(),
        document: homePageBlockQuery,
        variables: { blockNumber },
      });
      return data;
    },
  });

  const courtActivityStats = useMemo(() => {
    if (usedQuery.data && !usedQuery.isFetching) {
      // 1. court with most disputes
      // we only iterate through past courts, since more courts might exist at the present
      // these diffCourts have: average stakes, and dispute diff
      const diffCourts = allTime
        ? usedQuery.data.presentCourts.map((c) => ({
            ...c,
            numberDisputes: c.numberDisputes,
            treeNumberDisputes: c.numberDisputes,
            numberVotes: c.numberVotes,
            treeNumberVotes: c.numberVotes,
            effectiveStake: c.effectiveStake,
          }))
        : usedQuery.data.pastCourts.map((c, i) => ({
            ...c,
            numberDisputes: usedQuery.data.presentCourts[i].numberDisputes - c.numberDisputes,
            treeNumberDisputes: usedQuery.data.presentCourts[i].numberDisputes - c.numberDisputes,
            numberVotes: usedQuery.data.presentCourts[i].numberVotes - c.numberVotes,
            treeNumberVotes: usedQuery.data.presentCourts[i].numberVotes - c.numberVotes,
            effectiveStake: (BigInt(usedQuery.data.presentCourts[i].effectiveStake) + BigInt(c.effectiveStake)) / 2n,
          }));
      const mostDisputedCourt = diffCourts.toSorted((a, b) => b.numberDisputes - a.numberDisputes)[0];
      // 2. biggest chances of getting drawn
      // fact: getting drawn in a parent court also subjects you to its rewards
      // so, rewards/disputes trickle down

      for (const parent of diffCourts) {
        for (const child of diffCourts) {
          if (parent.id === child.parent?.id) {
            child.treeNumberVotes = String(Number(parent.treeNumberVotes) + Number(child.treeNumberVotes));
          }
        }
      }
      for (const c of diffCourts) {
        c.votesPerPnk = Number(c.numberVotes) / (Number(c.effectiveStake) / 1e18);
        c.treeVotesPerPnk = c.votesPerPnk;
      }
      for (const parent of diffCourts) {
        for (const child of diffCourts) {
          if (parent.id === child.parent?.id) {
            child.treeVotesPerPnk += parent.votesPerPnk;
          }
        }
      }
      const bestDrawingChancesCourt = diffCourts.toSorted((a, b) => b.treeVotesPerPnk - a.treeVotesPerPnk)[0];
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
      const bestExpectedRewardCourt = diffCourts.toSorted(
        (a, b) => b.treeExpectedRewardPerPnk - a.treeExpectedRewardPerPnk
      )[0];

      return { mostDisputedCourt, bestDrawingChancesCourt, bestExpectedRewardCourt, diffCourts };
    } else {
      return undefined;
    }
  }, [usedQuery]);

  return courtActivityStats;
};
