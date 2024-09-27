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
      const diffCourts = allTime
        ? usedQuery.data.presentCourts.map((presentCourt) => ({
            ...presentCourt,
            numberDisputes: presentCourt.numberDisputes,
            treeNumberDisputes: presentCourt.numberDisputes,
            numberVotes: presentCourt.numberVotes,
            treeNumberVotes: presentCourt.numberVotes,
            effectiveStake: presentCourt.effectiveStake,
            votesPerPnk: Number(presentCourt.numberVotes) / (Number(presentCourt.effectiveStake) / 1e18),
            treeVotesPerPnk: Number(presentCourt.numberVotes) / (Number(presentCourt.effectiveStake) / 1e18),
            disputesPerPnk: Number(presentCourt.numberDisputes) / (Number(presentCourt.effectiveStake) / 1e18),
            treeDisputesPerPnk: Number(presentCourt.numberDisputes) / (Number(presentCourt.effectiveStake) / 1e18),
          }))
        : usedQuery.data.presentCourts.map((presentCourt) => {
            const pastCourt = usedQuery.data.pastCourts.find((pastCourt) => pastCourt.id === presentCourt.id);

            return {
              ...presentCourt,
              numberDisputes: pastCourt
                ? presentCourt.numberDisputes - pastCourt.numberDisputes
                : presentCourt.numberDisputes,
              treeNumberDisputes: pastCourt
                ? presentCourt.numberDisputes - pastCourt.numberDisputes
                : presentCourt.numberDisputes,
              numberVotes: pastCourt ? presentCourt.numberVotes - pastCourt.numberVotes : presentCourt.numberVotes,
              treeNumberVotes: pastCourt ? presentCourt.numberVotes - pastCourt.numberVotes : presentCourt.numberVotes,
              effectiveStake: pastCourt
                ? (BigInt(presentCourt.effectiveStake) + BigInt(pastCourt.effectiveStake)) / 2n
                : presentCourt.effectiveStake,
              votesPerPnk:
                Number(pastCourt ? presentCourt.numberVotes - pastCourt.numberVotes : presentCourt.numberVotes) /
                (Number(
                  pastCourt
                    ? (BigInt(presentCourt.effectiveStake) + BigInt(pastCourt.effectiveStake)) / 2n
                    : presentCourt.effectiveStake
                ) /
                  1e18),
              treeVotesPerPnk:
                Number(pastCourt ? presentCourt.numberVotes - pastCourt.numberVotes : presentCourt.numberVotes) /
                (Number(
                  pastCourt
                    ? (BigInt(presentCourt.effectiveStake) + BigInt(pastCourt.effectiveStake)) / 2n
                    : presentCourt.effectiveStake
                ) /
                  1e18),
              disputesPerPnk:
                Number(
                  pastCourt ? presentCourt.numberDisputes - pastCourt.numberDisputes : presentCourt.numberDisputes
                ) /
                (Number(
                  pastCourt
                    ? (BigInt(presentCourt.effectiveStake) + BigInt(pastCourt.effectiveStake)) / 2n
                    : presentCourt.effectiveStake
                ) /
                  1e18),
              treeDisputesPerPnk:
                Number(
                  pastCourt ? presentCourt.numberDisputes - pastCourt.numberDisputes : presentCourt.numberDisputes
                ) /
                (Number(
                  pastCourt
                    ? (BigInt(presentCourt.effectiveStake) + BigInt(pastCourt.effectiveStake)) / 2n
                    : presentCourt.effectiveStake
                ) /
                  1e18),
            };
          });

      const mostDisputedCourt = diffCourts.toSorted((a, b) => b.numberDisputes - a.numberDisputes)[0];
      // 1. biggest chances of getting drawn
      // fact: getting drawn in a parent court also subjects you to its rewards
      // so, rewards/disputes trickle down

      for (const parent of diffCourts) {
        for (const child of diffCourts) {
          if (parent.id === child.parent?.id) {
            child.treeNumberVotes = String(Number(parent.treeNumberVotes) + Number(child.treeNumberVotes));
            child.treeNumberDisputes = String(Number(parent.treeNumberDisputes) + Number(child.treeNumberDisputes));
          }
        }
      }

      for (const parent of diffCourts) {
        for (const child of diffCourts) {
          if (parent.id === child.parent?.id) {
            child.treeVotesPerPnk += parent.votesPerPnk;
            child.treeDisputesPerPnk += parent.disputesPerPnk;
          }
        }
      }
      const bestDrawingChancesCourt = diffCourts.toSorted((a, b) => b.treeVotesPerPnk - a.treeVotesPerPnk)[0];
      // 2. expected reward
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
