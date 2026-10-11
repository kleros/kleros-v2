import type {
  Answer,
  ClassicContribution,
  ClassicDispute,
  ClassicEvidence,
  ClassicRound,
  ClassicVote,
  Counter,
  Court,
  CourtCounter,
  Dispute,
  Draw,
  JurorTokensPerCourt,
  Period,
  Round,
  User,
} from "src/graphql/graphql";

import { disputeKitClassic, klerosCore, CHAIN } from "../contracts";

import { DAY, eth, HOUR, pnk, secondsFromNow, type Fake } from "./types";

export type FakeCourt = Fake<Court>;
export type FakeDispute = Fake<Dispute>;
export type FakeUser = Fake<User>;
export type PeriodName = `${Period}`;

export const PERIODS: PeriodName[] = ["evidence", "commit", "vote", "appeal", "execution"];

/** Five periods of one day each, the order the contracts use: evidence, commit, vote, appeal, execution. */
export const TIMES_PER_PERIOD = Array(5).fill(String(DAY));

export const ARBITRABLE = "0x00000000000000000000000000000000000a5b1e";

export const aCourt = (overrides: FakeCourt = {}): FakeCourt => ({
  __typename: "Court",
  id: "1",
  name: "General Court",
  policy: `/ipfs/QmCourtPolicy${overrides.id ?? "1"}/policy.json`,
  minStake: pnk(200),
  alpha: "10000",
  feeForJuror: eth(0.001),
  hiddenVotes: false,
  timesPerPeriod: TIMES_PER_PERIOD,
  numberDisputes: "12",
  numberClosedDisputes: "5",
  numberAppealingDisputes: "1",
  numberVotingDisputes: "2",
  numberStakedJurors: "30",
  effectiveNumberStakedJurors: "28",
  numberVotes: "40",
  stake: pnk(1_500_000),
  effectiveStake: pnk(1_400_000),
  paidETH: eth(2.5),
  paidPNK: pnk(30_000),
  children: [],
  supportedDisputeKits: [{ id: "1", address: disputeKitClassic.address }],
  ...overrides,
});

export const anAnswer = (answerId: number, overrides: Fake<Answer> = {}): Fake<Answer> => ({
  id: `answer-${answerId}`,
  answerId: String(answerId),
  count: "0",
  paidFee: "0",
  funded: false,
  ...overrides,
});

export const aClassicRound = (overrides: Fake<ClassicRound> = {}): Fake<ClassicRound> => ({
  __typename: "ClassicRound",
  id: "classic-round-0",
  winningChoice: "0",
  answers: [],
  fundedChoices: [],
  appealFeesDispersed: false,
  totalFeeDispersed: "0",
  totalVoted: "0",
  totalCommited: "0",
  contributions: [],
  ...overrides,
});

export const aClassicDispute = (overrides: Fake<ClassicDispute> = {}): Fake<ClassicDispute> => ({
  __typename: "ClassicDispute",
  id: "classic-dispute-0",
  currentLocalRoundIndex: "0",
  numberOfChoices: "2",
  extraData: "0x",
  localRounds: [aClassicRound()],
  ...overrides,
});

export const aRound = (overrides: Fake<Round> = {}): Fake<Round> => ({
  id: "round-0",
  nbVotes: "3",
  hiddenVotes: false,
  jurorsDrawn: true,
  jurorRewardsDispersed: false,
  timesPerPeriod: TIMES_PER_PERIOD,
  timeline: ["0", "0", "0", "0", "0"],
  totalFeesForJurors: eth(0.003),
  tokensAtStakePerJuror: pnk(200),
  disputeKit: { id: "1", address: disputeKitClassic.address },
  drawnJurors: [],
  ...overrides,
});

/**
 * A classic-kit dispute in `period`; `lastPeriodChange` is two hours ago so every period has time left.
 * `id` drives the related ids (round, kit dispute, template).
 */
export const aDispute = ({
  id = "1",
  period = "evidence",
  court = aCourt(),
  ...overrides
}: Omit<FakeDispute, "period" | "id"> & { id?: string; period?: PeriodName } = {}): FakeDispute => {
  const ruled = period === "execution";
  const round = aRound({ id: `${id}-0`, court });
  const dispute: FakeDispute = {
    id,
    disputeID: id,
    period: period as Period,
    ruled,
    court,
    arbitrated: { id: ARBITRABLE },
    lastPeriodChange: secondsFromNow(-2 * HOUR),
    createdAt: secondsFromNow(-3 * DAY),
    transactionHash: `0x${id.padStart(64, "0")}`,
    currentRuling: ruled ? "1" : "0",
    currentRoundIndex: "0",
    overridden: false,
    tied: !ruled,
    isCrossChain: false,
    arbitrableChainId: String(CHAIN.id),
    templateId: id,
    currentRound: round,
    rounds: [round],
    disputeKitDispute: [aClassicDispute({ id: `${klerosCore.address}-${id}` })],
    ...overrides,
  };
  for (const r of dispute.rounds as Fake<Round>[]) r.dispute ??= dispute;
  return dispute;
};

export const aUser = (address: string, overrides: FakeUser = {}): FakeUser => ({
  id: address.toLowerCase(),
  userAddress: address.toLowerCase(),
  totalDisputes: "0",
  totalResolvedDisputes: "0",
  totalAppealingDisputes: "0",
  totalCoherentVotes: "0",
  totalResolvedVotes: "0",
  coherenceScore: "0",
  tokens: [],
  shifts: [],
  disputes: [],
  draws: [],
  ...overrides,
});

export const aStake = (
  juror: FakeUser,
  court: FakeCourt,
  staked: string,
  overrides: Fake<JurorTokensPerCourt> = {}
): Fake<JurorTokensPerCourt> => ({
  id: `${juror.id}-${court.id}`,
  juror,
  court,
  staked,
  effectiveStake: staked,
  locked: "0",
  delayed: "0",
  ...overrides,
});

export const aCounter = (overrides: Fake<Counter> = {}): Fake<Counter> => ({
  id: "0",
  cases: "12",
  casesRuled: "5",
  casesVoting: "2",
  casesAppealing: "1",
  stakedPNK: pnk(1_500_000),
  redistributedPNK: pnk(30_000),
  paidETH: eth(2.5),
  activeJurors: "30",
  totalLeaderboardJurors: "3",
  ...overrides,
});

export const aCourtCounter = (court: FakeCourt, overrides: Fake<CourtCounter> = {}): Fake<CourtCounter> => ({
  id: `${court.id}-counter`,
  court,
  numberDisputes: court.numberDisputes as string,
  numberVotes: court.numberVotes as string,
  effectiveStake: court.effectiveStake as string,
  timestamp: secondsFromNow(-31 * DAY),
  ...overrides,
});

export const anEvidence = (
  dispute: FakeDispute,
  index: number,
  overrides: Fake<ClassicEvidence> = {}
): Fake<ClassicEvidence> => ({
  __typename: "ClassicEvidence",
  id: `${dispute.id}-${index}`,
  dispute,
  evidenceIndex: String(index),
  evidence: "",
  name: `Evidence ${index}`,
  description: `Description of evidence ${index}`,
  sender: { id: ARBITRABLE },
  senderAddress: ARBITRABLE,
  timestamp: secondsFromNow(-DAY + index * HOUR),
  transactionHash: `0x${String(index).padStart(64, "e")}`,
  ...overrides,
});

export const aVote = (overrides: Fake<ClassicVote> = {}): Fake<ClassicVote> => ({
  __typename: "ClassicVote",
  id: "vote-0",
  commited: false,
  voted: false,
  ...overrides,
});

export const aDraw = (
  dispute: FakeDispute,
  juror: FakeUser,
  voteIDNum: number,
  overrides: Fake<Draw> = {}
): Fake<Draw> => ({
  id: `${dispute.id}-0-${voteIDNum}`,
  dispute,
  juror,
  round: dispute.currentRound,
  voteIDNum: String(voteIDNum),
  blockNumber: String(1000 + voteIDNum),
  vote: aVote({
    id: `${dispute.id}-0-${voteIDNum}`,
    localRound:
      (
        (dispute.disputeKitDispute as Fake<ClassicDispute>[] | undefined)?.[0]?.localRounds as
          | Fake<ClassicRound>[]
          | undefined
      )?.[0] ?? aClassicRound(),
  }),
  ...overrides,
});

export const aContribution = (
  dispute: FakeDispute,
  contributor: FakeUser,
  overrides: Fake<ClassicContribution> = {}
): Fake<ClassicContribution> => ({
  __typename: "ClassicContribution",
  id: `${dispute.id}-${contributor.id}`,
  coreDispute: dispute,
  contributor,
  amount: "0",
  choice: "1",
  rewardWithdrawn: false,
  ...overrides,
});

export type TemplateOptions = {
  id: string;
  title?: string;
  description?: string;
  question?: string;
  answers?: { title: string; description?: string }[];
};

/** A dispute template without data mappings, so the app renders it without external calls. */
export const aDisputeTemplate = ({
  id,
  title = `Case ${id} title`,
  description = `Case ${id} description`,
  question = "Should the payment be released?",
  answers = [{ title: "Yes" }, { title: "No" }],
}: TemplateOptions) => ({
  id,
  templateTag: "e2e",
  templateDataMappings: "",
  templateData: JSON.stringify({
    title,
    description,
    question,
    answers: answers.map((answer, i) => ({
      id: `0x${(i + 1).toString(16)}`,
      title: answer.title,
      description: answer.description ?? answer.title,
    })),
    policyURI: `/ipfs/QmDisputePolicy${id}/policy.json`,
    arbitratorChainID: String(CHAIN.id),
    arbitratorAddress: klerosCore.address,
    category: "E2E",
    lang: "en_US",
    version: "1.0",
  }),
});
