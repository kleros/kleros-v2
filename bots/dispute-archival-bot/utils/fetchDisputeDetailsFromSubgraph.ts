import type { Address, Hash } from "viem";

import { paginatedSubgraphQuery, querySubgraph } from "./query";

// also saving court in case it's not available later, since is a required field for Round
export type Court = {
  id: string;
  policy?: string | null;
  name?: string | null;
  hiddenVotes: boolean;
  minStake: string;
  alpha: string;
  feeForJuror: string;
  jurorsForCourtJump: string;
  timesPerPeriod: string[];
};

export type FeeToken = {
  id: string;
  accepted: boolean;
  rateInEth: string;
  rateDecimals: number;
  totalPaid: string;
  totalPaidInETH: string;
};

export type Justification = {
  id: string;
  juror: { id: string };
  transactionHash: Hash;
  timestamp: string;
  choice: string;
  reference: string;
};

export type ClassicVote = {
  id: string;
  juror: { id: string };
  localRound: { id: string };
  commit: Hash | null;
  commited: boolean;
  choice: string | null;
  voted: boolean;
  justification: Justification | null;
};

export type Draw = {
  id: string;
  blockNumber: string;
  voteIDNum: string;
  drawNotificationIndex: string | null;
  juror: { id: string };
  dispute: { id: string };
  round: { id: string };
  vote: ClassicVote | null;
};

export type Round = {
  id: string;
  dispute: { id: string };
  tokensAtStakePerJuror: string;
  totalFeesForJurors: string;
  nbVotes: string;
  isCurrentRound: boolean;
  repartitions: string;
  penalties: string;
  timeline: string[];
  jurorsDrawn: boolean;
  jurorRewardsDispersed: boolean;
  disputeKit: {
    id: string;
    address: Address | null;
    needsFreezing: boolean;
  };
  court: Court;
  feeToken: FeeToken | null;
  drawnJurors: Draw[];
};

export type ClassicAnswer = {
  id: string;
  answerId: string;
  count: string;
  paidFee: string;
  funded: boolean;
};

export type ClassicRound = {
  id: string;
  winningChoice: string;
  tied: boolean;
  totalVoted: string;
  totalCommited: string;
  feeRewards: string;
  totalFeeDispersed: string;
  appealFeesDispersed: boolean;
  fundedChoices: string[];
  answers: ClassicAnswer[];
};

export type ClassicDispute = {
  id: string;
  coreDispute: { id: string };
  currentLocalRoundIndex: string;
  timestamp: string;
  numberOfChoices: string;
  extraData: Hash;
  localRounds: ClassicRound[];
};

export type SubgraphDisputeDetails = {
  id: string;
  disputeID: string;
  createdAt?: string | null;
  transactionHash: string;
  court: Court;
  arbitrated: { id: string };
  period: string;
  ruled: boolean;
  currentRuling: string;
  tied: boolean;
  overridden: boolean;
  periodDeadline: string;
  periodNotificationIndex: string;
  lastPeriodChange: string;
  lastPeriodChangeBlockNumber: string;
  currentRoundIndex: string;
  isCrossChain: boolean | null;
  arbitrableChainId: string | null;
  templateId: string | null;
  externalDisputeId: string | null;
  rulingTimestamp: string | null;
  rulingTransactionHash: Hash | null;
  currentRound: { id: string };
  rounds: Round[];
  disputeKitDispute: ClassicDispute[];
};

// omitting the fields we need to paginate, these are ltr queried and stitched together
type RoundBase = Omit<Round, "drawnJurors">;
type ClassicRoundBase = Omit<ClassicRound, "answers">;
type ClassicDisputeBase = Omit<ClassicDispute, "localRounds">;

type DisputeBase = Omit<SubgraphDisputeDetails, "rounds" | "disputeKitDispute"> & {
  disputeKitDispute: ClassicDisputeBase[];
};

const courtFields = `
  id
  policy
  name
  hiddenVotes
  minStake
  alpha
  feeForJuror
  jurorsForCourtJump
  timesPerPeriod
`;

const disputeBaseQuery = `
  query DisputeDetails($disputeID: ID!) {
    dispute(id: $disputeID) {
      id
      disputeID
      createdAt
      transactionHash
      court {
        ${courtFields}
      }
      arbitrated {
        id
      }
      period
      ruled
      currentRuling
      tied
      overridden
      periodDeadline
      periodNotificationIndex
      lastPeriodChange
      lastPeriodChangeBlockNumber
      currentRoundIndex
      isCrossChain
      arbitrableChainId
      templateId
      externalDisputeId
      rulingTimestamp
      rulingTransactionHash
      currentRound {
        id
      }
      disputeKitDispute {
        ... on ClassicDispute {
          id
          coreDispute {
            id
          }
          currentLocalRoundIndex
          timestamp
          numberOfChoices
          extraData
        }
      }
    }
  }
`;

const roundsQuery = `
  query Rounds($disputeID: String!, $first: Int!, $skip: Int!) {
    rounds(
      where: { dispute: $disputeID }
      first: $first
      skip: $skip
      orderBy: id
      orderDirection: asc
    ) {
       id
  dispute {
    id
  }
  tokensAtStakePerJuror
  totalFeesForJurors
  nbVotes
  isCurrentRound
  repartitions
  penalties
  timeline
  jurorsDrawn
  jurorRewardsDispersed
  disputeKit {
    id
    address
    needsFreezing
  }
  court {
    ${courtFields}
  }
  feeToken {
    id
    accepted
    rateInEth
    rateDecimals
    totalPaid
    totalPaidInETH
  }
    }
  }
`;

const drawsQuery = `
  query Draws($disputeID: String!, $first: Int!, $skip: Int!) {
    draws(
      where: { dispute: $disputeID }
      first: $first
      skip: $skip
      orderBy: voteIDNum
      orderDirection: asc
    ) {
        id
        blockNumber
        voteIDNum
        drawNotificationIndex
        dispute {
          id
        }
        round {
          id
        }
        juror {
          id
        }
        vote {
          ... on ClassicVote {
          id
          juror {
            id
          }
          localRound {
            id
          }
          commit
          commited
          choice
          voted
          justification {
            id
            juror {
              id
            }
            choice
            reference
            transactionHash
            timestamp
          }
        } 
      }
    }
  }
`;

const classicRoundsQuery = `
  query ClassicRounds($localDisputeID: String!, $first: Int!, $skip: Int!) {
    classicRounds(
      where: { localDispute: $localDisputeID }
      first: $first
      skip: $skip
      orderBy: id
      orderDirection: asc
    ) {
      id
      winningChoice
      tied
      totalVoted
      totalCommited
      feeRewards
      totalFeeDispersed
      appealFeesDispersed
      fundedChoices
    }
  }
`;

const answersQuery = `
  query Answers($localRoundID: String!, $first: Int!, $skip: Int!) {
    answers(
      where: { localRound: $localRoundID }
      first: $first
      skip: $skip
      orderBy: answerId
      orderDirection: asc
    ) {
      id
      answerId
      count
      paidFee
      funded
    }
  }
`;

const QUERY_NAME = "fetchDisputeDetailsFromSubgraph";

function paginateRounds(disputeID: string) {
  return paginatedSubgraphQuery<RoundBase>(QUERY_NAME, roundsQuery, "rounds", { disputeID });
}

function paginateDrawnJurors(disputeID: string) {
  return paginatedSubgraphQuery<Draw>(QUERY_NAME, drawsQuery, "draws", { disputeID });
}

function paginateLocalRounds(classicDisputeId: string) {
  return paginatedSubgraphQuery<ClassicRoundBase>(QUERY_NAME, classicRoundsQuery, "classicRounds", {
    localDisputeID: classicDisputeId,
  });
}

function paginateAnswers(localRoundID: string) {
  return paginatedSubgraphQuery<ClassicAnswer>(QUERY_NAME, answersQuery, "answers", { localRoundID });
}

function attachDrawsToRounds(rounds: RoundBase[], draws: Draw[]) {
  const drawsByRoundId = new Map<string, Draw[]>();

  // sorting the draws to rounds, since we fetch draws by dispute id all together
  for (const draw of draws) {
    const roundDraws = drawsByRoundId.get(draw.round.id);
    if (roundDraws) {
      roundDraws.push(draw);
    } else {
      drawsByRoundId.set(draw.round.id, [draw]);
    }
  }

  return rounds.map((round) => ({
    ...round,
    drawnJurors: drawsByRoundId.get(round.id) ?? [],
  })) as Round[];
}

async function fetchClassicDisputesWithLocalRounds(classicDisputes: ClassicDisputeBase[]) {
  return Promise.all(
    classicDisputes.map(async (classicDispute) => {
      const localRoundsBase = await paginateLocalRounds(classicDispute.id);
      const localRounds = await Promise.all(
        localRoundsBase.map(async (localRound) => ({
          ...localRound,
          answers: await paginateAnswers(localRound.id),
        }))
      );

      return {
        ...classicDispute,
        localRounds,
      };
    })
  );
}

export async function fetchDisputeDetailsFromSubgraph(disputeID: string): Promise<SubgraphDisputeDetails | null> {
  const { dispute: disputeBase } = await querySubgraph<{ dispute: DisputeBase | null }>(QUERY_NAME, disputeBaseQuery, {
    disputeID,
  });

  if (!disputeBase) {
    return null;
  }

  const [roundsBase, draws] = await Promise.all([paginateRounds(disputeID), paginateDrawnJurors(disputeID)]);
  const disputeKitDispute = await fetchClassicDisputesWithLocalRounds(disputeBase.disputeKitDispute);

  return {
    ...disputeBase,
    rounds: attachDrawsToRounds(roundsBase, draws),
    disputeKitDispute,
  };
}
