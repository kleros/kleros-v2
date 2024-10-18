import { useQuery } from "@tanstack/react-query";

import { useGraphqlBatcher } from "context/GraphqlBatcher";
import { isUndefined } from "utils/index";

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

type Court = HomePageBlockQuery["presentCourts"][number];
type CourtWithTree = Court & {
  numberDisputes: number;
  numberVotes: number;
  feeForJuror: bigint;
  effectiveStake: bigint;
  treeNumberDisputes: number;
  treeNumberVotes: number;
  votesPerPnk: number;
  treeVotesPerPnk: number;
  disputesPerPnk: number;
  treeDisputesPerPnk: number;
  expectedRewardPerPnk: number;
  treeExpectedRewardPerPnk: number;
};

export type HomePageBlockStats = {
  mostDisputedCourt: CourtWithTree;
  bestDrawingChancesCourt: CourtWithTree;
  bestExpectedRewardCourt: CourtWithTree;
  courts: CourtWithTree[];
};

export const useHomePageBlockQuery = (blockNumber: number | undefined, allTime: boolean) => {
  const isEnabled = !isUndefined(blockNumber) || allTime;
  const { graphqlBatcher } = useGraphqlBatcher();

  return useQuery<HomePageBlockStats>({
    queryKey: [`homePageBlockQuery${blockNumber}-${allTime}`],
    enabled: isEnabled,
    staleTime: Infinity,
    queryFn: async () => {
      const data = await graphqlBatcher.fetch({
        id: crypto.randomUUID(),
        document: homePageBlockQuery,
        variables: { blockNumber },
      });

      return processData(data, allTime);
    },
  });
};

const processData = (data: HomePageBlockQuery, allTime: boolean) => {
  const presentCourts = data.presentCourts;
  const pastCourts = data.pastCourts;
  const processedCourts: CourtWithTree[] = Array(presentCourts.length);
  const processed = new Set();

  const processCourt = (id: number): CourtWithTree => {
    if (processed.has(id)) return processedCourts[id];

    processed.add(id);
    const court =
      !allTime && id < data.pastCourts.length
        ? addTreeValuesWithDiff(presentCourts[id], pastCourts[id])
        : addTreeValues(presentCourts[id]);
    const parentIndex = court.parent ? Number(court.parent.id) - 1 : 0;

    if (id === parentIndex) {
      processedCourts[id] = court;
      return court;
    }

    processedCourts[id] = {
      ...court,
      treeNumberDisputes: court.treeNumberDisputes + processCourt(parentIndex).treeNumberDisputes,
      treeNumberVotes: court.treeNumberVotes + processCourt(parentIndex).treeNumberVotes,
      treeVotesPerPnk: court.treeVotesPerPnk + processCourt(parentIndex).treeVotesPerPnk,
      treeDisputesPerPnk: court.treeDisputesPerPnk + processCourt(parentIndex).treeDisputesPerPnk,
      treeExpectedRewardPerPnk: court.treeExpectedRewardPerPnk + processCourt(parentIndex).treeExpectedRewardPerPnk,
    };

    return processedCourts[id];
  };

  for (const court of presentCourts.toReversed()) {
    processCourt(Number(court.id) - 1);
  }

  processedCourts.reverse();

  return {
    mostDisputedCourt: getCourtMostDisputes(processedCourts),
    bestDrawingChancesCourt: getCourtBestDrawingChances(processedCourts),
    bestExpectedRewardCourt: getBestExpectedRewardCourt(processedCourts),
    courts: processedCourts,
  };
};

const addTreeValues = (court: Court): CourtWithTree => {
  const votesPerPnk = Number(court.numberVotes) / (Number(court.effectiveStake) / 1e18);
  const disputesPerPnk = Number(court.numberDisputes) / (Number(court.effectiveStake) / 1e18);
  const expectedRewardPerPnk = votesPerPnk * (Number(court.feeForJuror) / 1e18);
  return {
    ...court,
    numberDisputes: Number(court.numberDisputes),
    numberVotes: Number(court.numberVotes),
    feeForJuror: BigInt(court.feeForJuror) / BigInt(1e18),
    effectiveStake: BigInt(court.effectiveStake),
    treeNumberDisputes: Number(court.numberDisputes),
    treeNumberVotes: Number(court.numberVotes),
    votesPerPnk,
    treeVotesPerPnk: votesPerPnk,
    disputesPerPnk,
    treeDisputesPerPnk: disputesPerPnk,
    expectedRewardPerPnk,
    treeExpectedRewardPerPnk: expectedRewardPerPnk,
  };
};

const addTreeValuesWithDiff = (presentCourt: Court, pastCourt: Court): CourtWithTree => {
  const presentCourtWithTree = addTreeValues(presentCourt);
  const pastCourtWithTree = addTreeValues(pastCourt);
  const diffNumberVotes = presentCourtWithTree.numberVotes - pastCourtWithTree.numberVotes;
  const diffNumberDisputes = presentCourtWithTree.numberDisputes - pastCourtWithTree.numberDisputes;
  const avgEffectiveStake = (presentCourtWithTree.effectiveStake + pastCourtWithTree.effectiveStake) / 2n;
  const votesPerPnk = diffNumberVotes / (Number(avgEffectiveStake) / 1e18);
  const disputesPerPnk = diffNumberDisputes / (Number(avgEffectiveStake) / 1e18);
  const expectedRewardPerPnk = votesPerPnk * (Number(presentCourt.feeForJuror) / 1e18);
  return {
    ...presentCourt,
    numberDisputes: presentCourtWithTree.numberDisputes - pastCourtWithTree.numberDisputes,
    treeNumberDisputes: presentCourtWithTree.treeNumberDisputes - pastCourtWithTree.treeNumberDisputes,
    numberVotes: diffNumberVotes,
    treeNumberVotes: presentCourtWithTree.treeNumberVotes - pastCourtWithTree.treeNumberVotes,
    effectiveStake: avgEffectiveStake,
    votesPerPnk,
    treeVotesPerPnk: votesPerPnk,
    disputesPerPnk,
    treeDisputesPerPnk: disputesPerPnk,
    expectedRewardPerPnk,
    treeExpectedRewardPerPnk: expectedRewardPerPnk,
  };
};

const getCourtMostDisputes = (courts: CourtWithTree[]) =>
  courts.toSorted((a: CourtWithTree, b: CourtWithTree) => b.numberDisputes - a.numberDisputes)[0];
const getCourtBestDrawingChances = (courts: CourtWithTree[]) =>
  courts.toSorted((a, b) => b.treeVotesPerPnk - a.treeVotesPerPnk)[0];
const getBestExpectedRewardCourt = (courts: CourtWithTree[]) =>
  courts.toSorted((a, b) => b.treeExpectedRewardPerPnk - a.treeExpectedRewardPerPnk)[0];
