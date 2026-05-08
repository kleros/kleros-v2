import type { Address, Hash } from "viem";

import { getEnvConfig } from "../config.ts";
import type { GraphQLResponse } from "./types.ts";

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

type DisputeDetailsResponse = {
  dispute: SubgraphDisputeDetails | null;
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

// assuming that we don't have more than 1000 items to fetch, so no need for pagination
const query = `
  query DisputeArchiveDetails($disputeID: ID!) {
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
      rounds {
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
        drawnJurors {
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
          localRounds {
            ... on ClassicRound {
              id
              winningChoice
              tied
              totalVoted
              totalCommited
              feeRewards
              totalFeeDispersed
              appealFeesDispersed
              fundedChoices
              answers {
                id
                answerId
                count
                paidFee
                funded
              }
            }
          }
        }
      }
    }
  }
`;

export async function fetchDisputeDetailsFromSubgraph(disputeID: bigint): Promise<SubgraphDisputeDetails | null> {
  const config = getEnvConfig();

  const response = await fetch(config.coreSubgraphUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      variables: { disputeID: disputeID.toString() },
    }),
  });

  if (!response.ok) {
    throw new Error("fetchDisputeDetailsFromSubgraph: fetch request failed.");
  }

  const json = (await response.json()) as GraphQLResponse<DisputeDetailsResponse>;

  if (json.errors?.length) {
    throw new Error(json.errors[0].message);
  }

  if (!json.data) {
    throw new Error("fetchDisputeDetailsFromSubgraph: fetch request did not return any data.");
  }

  return json.data.dispute;
}
