import { useQuery } from "@tanstack/react-query";
import { useGraphqlBatcher } from "context/GraphqlBatcher";
import { isUndefined } from "utils/index";
import { graphql } from "src/graphql";
import { HomePageBlockQuery } from "src/graphql/graphql";

const homePageBlockQuery = graphql(`
  query HomePageBlock($pastTimestamp: BigInt) {
    presentCourts: courts(orderBy: id, orderDirection: asc, first: 1000) {
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
    pastCourts: courtCounters(
      where: { timestamp_lte: $pastTimestamp }
      orderBy: timestamp
      orderDirection: desc
      first: 1000
    ) {
      court {
        id
      }
      numberDisputes
      numberVotes
      effectiveStake
      timestamp
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
  courts.toSorted((a, b) => b.numberDisputes - a.numberDisputes)[0];
const getCourtBestDrawingChances = (courts: CourtWithTree[]) =>
  courts.toSorted((a, b) => b.treeVotesPerPnk - a.treeVotesPerPnk)[0];
const getBestExpectedRewardCourt = (courts: CourtWithTree[]) =>
  courts.toSorted((a, b) => b.treeExpectedRewardPerPnk - a.treeExpectedRewardPerPnk)[0];

const processData = (data: HomePageBlockQuery, allTime: boolean) => {
  const presentCourts = [...data.presentCourts].sort((a, b) => Number(a.id) - Number(b.id));
  const pastCourts = data.pastCourts;

  const presentCourtsMap = new Map(presentCourts.map((c) => [c.id, c]));
  const pastCourtsMap = new Map<string, CourtCounter>();
  if (!allTime) {
    for (const pastCourt of pastCourts) {
      const courtId = pastCourt.court.id;
      if (!pastCourtsMap.has(courtId)) {
        pastCourtsMap.set(courtId, pastCourt);
      }
    }
  }

  const processedCourtsMap = new Map<string, CourtWithTree>();
  const processCourt = (courtId: string): CourtWithTree => {
    if (processedCourtsMap.has(courtId)) return processedCourtsMap.get(courtId)!;

    const court = presentCourtsMap.get(courtId)!;
    const pastCourt = pastCourtsMap.get(courtId);

    const courtWithTree = !allTime && pastCourt ? addTreeValuesWithDiff(court, pastCourt) : addTreeValues(court);

    const parentId = court.parent?.id;
    if (!parentId || courtId === parentId) {
      processedCourtsMap.set(courtId, courtWithTree);
      return courtWithTree;
    }

    const parentCourt = processCourt(parentId);
    const fullTreeCourt: CourtWithTree = {
      ...courtWithTree,
      treeNumberDisputes: courtWithTree.treeNumberDisputes + parentCourt.treeNumberDisputes,
      treeNumberVotes: courtWithTree.treeNumberVotes + parentCourt.treeNumberVotes,
      treeVotesPerPnk: courtWithTree.treeVotesPerPnk + parentCourt.treeVotesPerPnk,
      treeDisputesPerPnk: courtWithTree.treeDisputesPerPnk + parentCourt.treeDisputesPerPnk,
      treeExpectedRewardPerPnk: courtWithTree.treeExpectedRewardPerPnk + parentCourt.treeExpectedRewardPerPnk,
    };

    processedCourtsMap.set(courtId, fullTreeCourt);
    return fullTreeCourt;
  };

  for (const court of presentCourts.toReversed()) {
    processCourt(court.id);
  }

  const processedCourts = [...processedCourtsMap.values()].sort((a, b) => Number(a.id) - Number(b.id));

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

  if (!pastCourt) {
    console.warn(`Missing snapshot for court ${presentCourt.id}, falling back to live`);
    return presentCourtWithTree;
  }

  const pastNumberVotes = Number(pastCourt.numberVotes);
  const pastNumberDisputes = Number(pastCourt.numberDisputes);
  const pastEffectiveStake = BigInt(pastCourt.effectiveStake);

  const diffNumberVotes = presentCourtWithTree.numberVotes - pastNumberVotes;
  const diffNumberDisputes = presentCourtWithTree.numberDisputes - pastNumberDisputes;

  const hasLiveActivity = presentCourtWithTree.numberDisputes > 0 || presentCourtWithTree.numberVotes > 0;
  const hasSnapshotActivity = diffNumberDisputes > 0 || diffNumberVotes > 0;

  if (!hasSnapshotActivity && hasLiveActivity) {
    console.warn(`Snapshot shows no delta for court ${presentCourt.id}, using live`);
    return presentCourtWithTree;
  }

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
