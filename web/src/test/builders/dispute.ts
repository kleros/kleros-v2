import type { Answer, DisputeDetails } from "@kleros/kleros-sdk";

import type { ClassicAppealQuery } from "queries/useClassicAppealQuery";
import type { DisputeDetailsQuery } from "queries/useDisputeDetailsQuery";

import { Period } from "src/graphql/graphql";

/** Fixed reference time (2026-01-01T00:00:00Z, seconds) all builders derive timestamps from. */
export const T0 = 1767225600;

export const DEFAULT_ARBITRABLE = "0x00000000000000000000000000000000000000a1";
export const DEFAULT_DISPUTE_KIT_ADDRESS = "0x00000000000000000000000000000000000000d1";

/** [evidence, commit, vote, appeal, execution] durations in seconds. */
export const DEFAULT_TIMES_PER_PERIOD = ["3600", "3600", "7200", "10800", "0"];

type DisputeDetailsDispute = NonNullable<DisputeDetailsQuery["dispute"]>;
type DisputeDetailsRound = DisputeDetailsDispute["currentRound"];

export const aDisputeDetailsRound = (overrides: Partial<DisputeDetailsRound> = {}): DisputeDetailsRound => ({
  __typename: "Round",
  id: "1-0",
  nbVotes: "3",
  timesPerPeriod: DEFAULT_TIMES_PER_PERIOD,
  hiddenVotes: false,
  disputeKit: { __typename: "DisputeKit", id: "1", address: DEFAULT_DISPUTE_KIT_ADDRESS },
  ...overrides,
});

/** `DisputeDetailsQuery["dispute"]` for dispute 1 in the General court, vote period. */
export const aDisputeDetails = (overrides: Partial<DisputeDetailsDispute> = {}): DisputeDetailsDispute => ({
  __typename: "Dispute",
  court: { __typename: "Court", id: "1", feeForJuror: "1000000000000000" },
  arbitrated: { __typename: "Arbitrable", id: DEFAULT_ARBITRABLE },
  period: Period.Vote,
  ruled: false,
  lastPeriodChange: String(T0),
  currentRuling: "0",
  overridden: false,
  tied: true,
  currentRound: aDisputeDetailsRound(),
  currentRoundIndex: "0",
  isCrossChain: false,
  arbitrableChainId: "421614",
  templateId: "1",
  rulingTimestamp: null,
  rulingTransactionHash: null,
  ...overrides,
});

type ClassicAppealDispute = NonNullable<ClassicAppealQuery["dispute"]>;
type ClassicDisputeKitDispute = ClassicAppealDispute["disputeKitDispute"][number];
export type ClassicLocalRound = ClassicDisputeKitDispute["localRounds"][number];
type ClassicAnswer = ClassicLocalRound["answers"][number];

export const aClassicAnswer = (overrides: Partial<ClassicAnswer> = {}): ClassicAnswer => ({
  __typename: "Answer",
  answerId: "1",
  count: "0",
  paidFee: "0",
  funded: false,
  ...overrides,
});

export const aClassicLocalRound = (overrides: Partial<ClassicLocalRound> = {}): ClassicLocalRound => ({
  __typename: "ClassicRound",
  winningChoice: "1",
  fundedChoices: [],
  appealFeesDispersed: false,
  totalFeeDispersed: "0",
  answers: [],
  ...overrides,
});

export const aClassicDisputeKitDispute = (
  overrides: Partial<ClassicDisputeKitDispute> = {}
): ClassicDisputeKitDispute => ({
  __typename: "ClassicDispute",
  id: "1-1",
  currentLocalRoundIndex: "0",
  localRounds: [aClassicLocalRound()],
  ...overrides,
});

/** `ClassicAppealQuery["dispute"]` in the appeal period with one classic local round. */
export const aClassicAppealDispute = (overrides: Partial<ClassicAppealDispute> = {}): ClassicAppealDispute => ({
  __typename: "Dispute",
  period: Period.Appeal,
  lastPeriodChange: String(T0),
  court: { __typename: "Court", id: "1" },
  currentRound: {
    __typename: "Round",
    timesPerPeriod: DEFAULT_TIMES_PER_PERIOD,
    disputeKit: { __typename: "DisputeKit", address: DEFAULT_DISPUTE_KIT_ADDRESS },
  },
  arbitrated: { __typename: "Arbitrable", id: DEFAULT_ARBITRABLE },
  disputeKitDispute: [aClassicDisputeKitDispute()],
  ...overrides,
});

/** Dispute template answer as populated by the SDK (`id` is hex). */
export const aTemplateAnswer = (overrides: Partial<Answer> = {}): Answer => ({
  id: "0x1",
  title: "Yes",
  description: "Accept the claim",
  ...overrides,
});

export const aPopulatedDispute = (overrides: Partial<DisputeDetails> = {}): DisputeDetails => ({
  title: "Was the delivery late?",
  description: "Buyer claims the parcel arrived after the deadline.",
  question: "Should the buyer be refunded?",
  answers: [aTemplateAnswer(), aTemplateAnswer({ id: "0x2", title: "No", description: "Reject the claim" })],
  policyURI: "/ipfs/QmPolicy/policy.json",
  arbitratorChainID: "421614",
  arbitratorAddress: "0x00000000000000000000000000000000000000c0",
  extraEvidences: [],
  version: "1.0",
  ...overrides,
});
