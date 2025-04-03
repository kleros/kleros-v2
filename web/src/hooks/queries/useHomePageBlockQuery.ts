import { useQuery } from "@tanstack/react-query";
import { useGraphqlBatcher } from "context/GraphqlBatcher";
import { isUndefined } from "utils/index";
import { graphql } from "src/graphql";
import { HomePageBlockQuery } from "src/graphql/graphql";

const homePageBlockQuery = graphql(`
  query HomePageBlock($pastTimestamp: BigInt) {
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
    pastCourts: courtCounters(where: { timestamp_lte: $pastTimestamp }, orderBy: timestamp, orderDirection: desc) {
      court {
        id
      }
      numberDisputes
      numberVotes
      effectiveStake
    }
  }
`);

type Court = HomePageBlockQuery["presentCourts"][number];
type CourtCounter = HomePageBlockQuery["pastCourts"][number];
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

const getCourtMostDisputes = (courts: CourtWithTree[]) =>
  courts.toSorted((a: CourtWithTree, b: CourtWithTree) => b.numberDisputes - a.numberDisputes)[0];
const getCourtBestDrawingChances = (courts: CourtWithTree[]) =>
  courts.toSorted((a, b) => b.treeVotesPerPnk - a.treeVotesPerPnk)[0];
const getBestExpectedRewardCourt = (courts: CourtWithTree[]) =>
  courts.toSorted((a, b) => b.treeExpectedRewardPerPnk - a.treeExpectedRewardPerPnk)[0];

const processData = (data: HomePageBlockQuery, allTime: boolean) => {
  const presentCourts = data.presentCourts;
  const pastCourts = data.pastCourts;

  const pastCourtsMap = new Map<string, CourtCounter>();
  if (!allTime) {
    for (const pastCourt of pastCourts) {
      const courtId = pastCourt.court.id;
      if (!pastCourtsMap.has(courtId)) {
        pastCourtsMap.set(courtId, pastCourt);
      }
    }
  }

  const processedCourts: CourtWithTree[] = Array(presentCourts.length);
  const processed = new Set<number>();

  const processCourt = (id: number): CourtWithTree => {
    if (processed.has(id)) return processedCourts[id];

    processed.add(id);
    const court = presentCourts[id];
    const pastCourt = pastCourtsMap.get(court.id);
    const courtWithTree = !allTime && pastCourt ? addTreeValuesWithDiff(court, pastCourt) : addTreeValues(court);
    const parentIndex = court.parent ? Number(court.parent.id) - 1 : 0;

    if (id === parentIndex) {
      processedCourts[id] = courtWithTree;
      return courtWithTree;
    }

    processedCourts[id] = {
      ...courtWithTree,
      treeNumberDisputes: courtWithTree.treeNumberDisputes + processCourt(parentIndex).treeNumberDisputes,
      treeNumberVotes: courtWithTree.treeNumberVotes + processCourt(parentIndex).treeNumberVotes,
      treeVotesPerPnk: courtWithTree.treeVotesPerPnk + processCourt(parentIndex).treeVotesPerPnk,
      treeDisputesPerPnk: courtWithTree.treeDisputesPerPnk + processCourt(parentIndex).treeDisputesPerPnk,
      treeExpectedRewardPerPnk:
        courtWithTree.treeExpectedRewardPerPnk + processCourt(parentIndex).treeExpectedRewardPerPnk,
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
  const votesPerPnk = Number(court.numberVotes) / (Number(court.effectiveStake) / 1e18) || 0;
  const disputesPerPnk = Number(court.numberDisputes) / (Number(court.effectiveStake) / 1e18) || 0;
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

const addTreeValuesWithDiff = (presentCourt: Court, pastCourt: CourtCounter | undefined): CourtWithTree => {
  const presentCourtWithTree = addTreeValues(presentCourt);
  const pastNumberVotes = pastCourt ? Number(pastCourt.numberVotes) : 0;
  const pastNumberDisputes = pastCourt ? Number(pastCourt.numberDisputes) : 0;
  const pastEffectiveStake = pastCourt ? BigInt(pastCourt.effectiveStake) : BigInt(0);

  const diffNumberVotes = presentCourtWithTree.numberVotes - pastNumberVotes;
  const diffNumberDisputes = presentCourtWithTree.numberDisputes - pastNumberDisputes;
  const avgEffectiveStake = (presentCourtWithTree.effectiveStake + pastEffectiveStake) / 2n;
  const votesPerPnk = diffNumberVotes / (Number(avgEffectiveStake) / 1e18) || 0;
  const disputesPerPnk = diffNumberDisputes / (Number(avgEffectiveStake) / 1e18) || 0;
  const expectedRewardPerPnk = votesPerPnk * (Number(presentCourt.feeForJuror) / 1e18);
  return {
    ...presentCourt,
    numberDisputes: diffNumberDisputes,
    treeNumberDisputes: diffNumberDisputes,
    numberVotes: diffNumberVotes,
    treeNumberVotes: diffNumberVotes,
    feeForJuror: presentCourtWithTree.feeForJuror,
    effectiveStake: avgEffectiveStake,
    votesPerPnk,
    treeVotesPerPnk: votesPerPnk,
    disputesPerPnk,
    treeDisputesPerPnk: disputesPerPnk,
    expectedRewardPerPnk,
    treeExpectedRewardPerPnk: expectedRewardPerPnk,
  };
};

export const useHomePageBlockQuery = (pastTimestamp: bigint | undefined, allTime: boolean) => {
  const { graphqlBatcher } = useGraphqlBatcher();
  const isEnabled = !isUndefined(pastTimestamp) || allTime;

  return useQuery<HomePageBlockStats>({
    queryKey: [`homePageBlockQuery${pastTimestamp?.toString()}-${allTime}`],
    enabled: isEnabled,
    staleTime: Infinity,
    queryFn: async () => {
      const data = await graphqlBatcher.fetch({
        id: crypto.randomUUID(),
        document: homePageBlockQuery,
        variables: { pastTimestamp: allTime ? "0" : pastTimestamp?.toString() },
      });
      return processData(data, allTime);
    },
  });
};
