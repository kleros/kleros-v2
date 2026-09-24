import { useQuery } from "@tanstack/react-query";
import { Address, Hash, zeroAddress } from "viem";

import { DisputeDetails } from "@kleros/kleros-sdk/src/dataMappings/utils/disputeDetailsTypes";

import { useGraphqlBatcher } from "context/GraphqlBatcher";
import { getIpfsUrl } from "utils/getIpfsUrl";
import { isUndefined } from "utils/index";

import { graphql } from "src/graphql";

// NOTE: we are redefining type and hardcoding them here,
// to make sure we can update the actual ones freely without backwards compatibility for the archived ones

type Court = {
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

type FeeToken = {
  id: string;
  accepted: boolean;
  rateInEth: string;
  rateDecimals: number;
  totalPaid: string;
  totalPaidInETH: string;
};

type Justification = {
  id: string;
  juror: { id: string };
  transactionHash: Hash;
  timestamp: string;
  choice: string;
  reference: string;
};

type ClassicVote = {
  id: string;
  juror: { id: string };
  localRound: { id: string };
  commit: Hash | null;
  commited: boolean;
  choice: string | null;
  voted: boolean;
  justification: Justification | null;
};

type Draw = {
  id: string;
  blockNumber: string;
  voteIDNum: string;
  drawNotificationIndex: string | null;
  juror: { id: string };
  dispute: { id: string };
  round: { id: string };
  vote: ClassicVote | null;
};

type Round = {
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

type ClassicAnswer = {
  id: string;
  answerId: string;
  count: string;
  paidFee: string;
  funded: boolean;
};

type ClassicRound = {
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

type ClassicDispute = {
  id: string;
  coreDispute: { id: string };
  currentLocalRoundIndex: string;
  timestamp: string;
  numberOfChoices: string;
  extraData: Hash;
  localRounds: ClassicRound[];
};

type ArchiveSubgraphDisputeDetails = {
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
  currentRound: {
    id: string;
    nbVotes: string;
    timesPerPeriod: string[];
    hiddenVotes: boolean;
    disputeKit: { address: Address };
  };
  rounds: Round[];
  disputeKitDispute: ClassicDispute[];
};

type ArchiveEvidence = {
  id: string;
  evidence: string;
  senderAddress: Address;
  sender?: { id: Address };
  evidenceIndex: string;
  timestamp: string;
  transactionHash: Hash;
  name?: string;
  description?: string;
  fileURI?: string;
  fileTypeExtension?: string;
};

type ArchiveDisputeTemplateData = {
  id: string;
  templateTag: string | null;
  templateData: string;
  templateDataMappings: string;
};

export type DisputeArchiveSnapshot = {
  dispute: ArchiveSubgraphDisputeDetails;
  populated?: DisputeDetails;
  evidences?: ArchiveEvidence[];
  disputeTemplate?: ArchiveDisputeTemplateData;
};

function parseArchiveDocument(data: unknown) {
  if (isUndefined(data)) {
    return null;
  }
  const archiveData = data as Record<string, unknown>;
  if (isUndefined(archiveData.dispute)) {
    return null;
  }
  const dispute = archiveData.dispute as ArchiveSubgraphDisputeDetails;
  const currentRound = dispute.rounds.find((round) => round.id === dispute.currentRound.id);
  // TEMP: stable contracts will have court details back to court and per index, this is just for current dev
  dispute.currentRound = {
    ...dispute.currentRound,
    nbVotes: currentRound?.nbVotes ?? "0",
    timesPerPeriod: dispute.court.timesPerPeriod,
    hiddenVotes: dispute.court.hiddenVotes,
    disputeKit: {
      address: currentRound?.disputeKit.address ?? zeroAddress,
    },
  };
  return {
    dispute,
    populated: archiveData.populated as DisputeDetails | undefined,
    evidences: Array.isArray(archiveData.evidences) ? (archiveData.evidences as ArchiveEvidence[]) : [],
    disputeTemplate: archiveData.disputeTemplate as ArchiveDisputeTemplateData,
  };
}

const disputeArchiveDetailsQuery = graphql(`
  query DisputeArchiveDetails($disputeID: ID!) {
    dispute(id: $disputeID) {
      archiveCid
      isArchived
    }
  }
`);

export const useDisputeArchiveSnapshot = (disputeID?: string) => {
  const { graphqlBatcher } = useGraphqlBatcher();
  const isEnabled = !isUndefined(disputeID);

  return useQuery({
    queryKey: ["disputeArchiveSnapshot", disputeID],
    enabled: isEnabled,
    staleTime: Infinity,
    queryFn: async (): Promise<DisputeArchiveSnapshot | null> => {
      const { dispute } = await graphqlBatcher.fetch({
        id: crypto.randomUUID(),
        document: disputeArchiveDetailsQuery,
        variables: { disputeID: disputeID! },
      });

      const archiveCid = dispute?.archiveCid;
      if (isUndefined(archiveCid)) {
        return null;
      }

      const response = await fetch(getIpfsUrl(archiveCid));
      if (!response.ok) {
        throw new Error(`useDisputeArchiveSnapshot: IPFS fetch failed ${response.status}`);
      }

      const json: unknown = await response.json();
      const parsed = parseArchiveDocument(json);

      if (parsed == null) {
        throw new Error("useDisputeArchiveSnapshot: unable to parse archive dispute data");
      }
      return parsed;
    },
  });
};
