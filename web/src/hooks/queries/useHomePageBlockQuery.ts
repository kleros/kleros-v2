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
      feeForJuror
      stake
    }
    pastCourts: courts(orderBy: id, orderDirection: asc, block: { number: $blockNumber }) {
      id
      parent {
        id
      }
      name
      numberDisputes
      feeForJuror
      stake
    }
  }
`);

export const useHomePageBlockQuery = (blockNumber: number) => {
  const isEnabled = blockNumber != null;
  const { graphqlBatcher } = useGraphqlBatcher();

  const usedQuery = useQuery({
    queryKey: [`homePageBlockQuery${blockNumber}`],
    enabled: isEnabled,
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

      const diffCourts = usedQuery.data.pastCourts.map((c, i) => ({
        ...c,
        numberDisputes: usedQuery.data.presentCourts[i].numberDisputes - c.numberDisputes,
        treeNumberDisputes: usedQuery.data.presentCourts[i].numberDisputes - c.numberDisputes,
        stake: (BigInt(usedQuery.data.presentCourts[i].stake) + BigInt(c.stake)) / 2n,
      }));
      const mostDisputedCourt = diffCourts.sort((a, b) => b.numberDisputes - a.numberDisputes)[0];
      // 2. biggest chances of getting drawn
      // fact a: getting drawn in a parent court also subjects you to its rewards
      // fact b: staking in children, stakes in parents. but subgraph at this date doesn't reflect this
      // so, stakes trickle up, rewards/disputes trickle down

      for (const parent of diffCourts) {
        for (const child of diffCourts) {
          if (parent.id === child.parent?.id) {
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
      //
      for (const c of diffCourts) {
        c.disputesPerPnk = Number(c.numberDisputes) / (Number(c.stake) / 1e18);
        c.treeDisputesPerPnk = c.disputesPerPnk;
      }
      for (const parent of diffCourts) {
        for (const child of diffCourts) {
          if (parent.id === child.parent?.id) {
            child.treeDisputesPerPnk += parent.disputesPerPnk;
          }
        }
      }
      const bestDrawingChancesCourt = diffCourts.sort((a, b) => b.treeDisputesPerPnk - a.treeDisputesPerPnk)[0];
      // 3. expected reward
      // since we isolated the exclusive disputes from the cumulative disputes
      // we can calculate the "isolated reward" of every court
      // after that's done, then just trickle the rewards down

      for (const c of diffCourts) {
        c.expectedRewardPerPnk = c.disputesPerPnk * c.feeForJuror;
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

      return { mostDisputedCourt, bestDrawingChancesCourt, bestExpectedRewardCourt };
    } else {
      return undefined;
    }
  }, [usedQuery]);

  return courtActivityStats;
};
