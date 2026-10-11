import { afterAll, assert, beforeAll, clearStore, describe, test } from "matchstick-as/assembly/index";
import { Address, BigInt } from "@graphprotocol/graph-ts";
import * as core from "../src/KlerosCore";
import * as dk from "../src/DisputeKitClassic";
import { handleStakeSet } from "../src/SortitionModule";
import { handleEvidenceEvent } from "../src/EvidenceModule";
import {
  at,
  createAppealDecisionEvent,
  createChoiceFundedEvent,
  createContributionEvent,
  createCourtCreatedEvent,
  createDisputeCreationEvent,
  createDisputeKitCreatedEvent,
  createDKDisputeCreationEvent,
  createDrawEvent,
  createEvidenceEvent,
  createJurorRewardPenaltyEvent,
  createNewPeriodEvent,
  createRulingEvent,
  createStakeSetEvent,
  createVoteCastEvent,
  createWithdrawalEvent,
  Period,
} from "./utils/events";
import {
  mockCurrentRuling,
  mockDisputeKitCore,
  mockDisputes,
  mockJurorBalance,
  mockNumberOfRounds,
  mockRoundInfo,
  mockSortitionModule,
  RoundInfo,
} from "./utils/mocks";
import { extraData } from "./utils/extra-data";
import {
  ARBITRABLE,
  bi,
  CROWDFUNDER,
  DAY_1,
  DAY_2,
  DK_CLASSIC,
  DK_OTHER,
  GENERAL_COURT,
  JUROR_A,
  JUROR_B,
  JUROR_C,
  NATIVE,
} from "./utils/constants";

const D = bi(0);
const a = JUROR_A.toHexString();
const b = JUROR_B.toHexString();
const c = JUROR_C.toHexString();
const cf = CROWDFUNDER.toHexString();

function setUpCourtAndJurors(): void {
  core.handleDisputeKitCreated(createDisputeKitCreatedEvent(bi(1), DK_CLASSIC));
  core.handleDisputeKitCreated(createDisputeKitCreatedEvent(bi(2), DK_OTHER));
  core.handleCourtCreated(
    createCourtCreatedEvent(
      bi(1),
      bi(0),
      false,
      bi(200),
      bi(10000),
      bi(100),
      bi(511),
      [bi(100), bi(200), bi(300), bi(400)],
      [bi(1), bi(2)]
    )
  );
  mockSortitionModule();
  const jurors: Address[] = [JUROR_A, JUROR_B, JUROR_C];
  for (let i = 0; i < jurors.length; i++) {
    mockJurorBalance(jurors[i], bi(1), bi(1000), bi(0), bi(1000));
    handleStakeSet(createStakeSetEvent(jurors[i], bi(1), bi(1000), bi(1000)));
  }
}

function createDispute(): void {
  mockDisputes(D, bi(1));
  mockRoundInfo(D, bi(0), new RoundInfo().withVotes(3));
  mockDisputeKitCore(DK_CLASSIC);
  mockNumberOfRounds(D, 1);
  dk.handleDisputeCreation(createDKDisputeCreationEvent(D, bi(2), extraData(1, 3, 1)));
  core.handleDisputeCreation(createDisputeCreationEvent(D, ARBITRABLE));
}

function drawRound(round: i32): void {
  core.handleDraw(createDrawEvent(JUROR_A, D, bi(round), bi(0)));
  core.handleDraw(createDrawEvent(JUROR_B, D, bi(round), bi(1)));
  core.handleDraw(createDrawEvent(JUROR_C, D, bi(round), bi(2)));
}

function vote(juror: Address, voteID: i32, choice: i32, disputeKit: Address = DK_CLASSIC): void {
  dk.handleVoteCast(createVoteCastEvent(D, juror, [bi(voteID)], bi(choice), "", disputeKit));
}

function period(p: Period, timestamp: i64 = DAY_1): void {
  core.handleNewPeriod(at(createNewPeriodEvent(D, p), timestamp));
}

/** Both sides fund the appeal of round 0; KlerosCore then opens round 1 in `nextDisputeKit`. */
function crowdfundAppeal(nextDisputeKit: i32): void {
  dk.handleContributionEvent(createContributionEvent(D, bi(0), bi(1), JUROR_B, bi(450)));
  dk.handleChoiceFunded(createChoiceFundedEvent(D, bi(0), bi(1)));
  dk.handleContributionEvent(createContributionEvent(D, bi(0), bi(2), CROWDFUNDER, bi(600)));
  mockNumberOfRounds(D, 2);
  mockRoundInfo(D, bi(1), new RoundInfo().withDisputeKit(nextDisputeKit).withTotalFees(bi(700)));
  dk.handleChoiceFunded(createChoiceFundedEvent(D, bi(0), bi(2)));
}

describe("Lifecycle: create, draw, vote, appeal, rule, execute, withdraw", () => {
  beforeAll(() => {
    setUpCourtAndJurors();
    createDispute();
    handleEvidenceEvent(createEvidenceEvent(D, ARBITRABLE, '{"name":"claim"}'));
    drawRound(0);

    period(Period.vote);
    vote(JUROR_A, 0, 1);
    vote(JUROR_B, 1, 1);
    vote(JUROR_C, 2, 2);
    period(Period.appeal);

    crowdfundAppeal(1);
    core.handleAppealDecision(createAppealDecisionEvent(D, ARBITRABLE));
    period(Period.evidence);

    drawRound(1);
    period(Period.vote);
    vote(JUROR_A, 0, 2);
    vote(JUROR_B, 1, 2);
    vote(JUROR_C, 2, 2);
    period(Period.appeal);

    mockCurrentRuling(D, bi(2), false);
    period(Period.execution, DAY_2);
    mockDisputes(D, bi(1), 4, true, false);
    core.handleRuling(at(createRulingEvent(ARBITRABLE, D, bi(2)), DAY_2));

    // KlerosCore.execute for round 0: A and B are penalised, C is rewarded.
    mockRoundInfo(D, bi(0), new RoundInfo().withVotes(3).withRepartitions(6));
    const penalty = BigInt.fromI32(-1000);
    core.handleJurorRewardPenalty(
      createJurorRewardPenaltyEvent(JUROR_A, D, bi(0), bi(0), bi(0), penalty, bi(0), NATIVE)
    );
    core.handleJurorRewardPenalty(
      createJurorRewardPenaltyEvent(JUROR_B, D, bi(0), bi(0), bi(0), penalty, bi(0), NATIVE)
    );
    core.handleJurorRewardPenalty(
      createJurorRewardPenaltyEvent(JUROR_C, D, bi(0), bi(10000), bi(10000), bi(2000), bi(300), NATIVE)
    );

    // The winning side's funder takes the round 0 fee rewards (450 + 600 - 700 appeal cost).
    dk.handleWithdrawal(createWithdrawalEvent(D, bi(2), CROWDFUNDER, bi(350)));
  });

  afterAll(() => {
    clearStore();
  });

  test("the dispute ends ruled in execution on round 1", () => {
    assert.fieldEquals("Dispute", "0", "period", "execution");
    assert.fieldEquals("Dispute", "0", "ruled", "true");
    assert.fieldEquals("Dispute", "0", "currentRuling", "2");
    assert.fieldEquals("Dispute", "0", "currentRoundIndex", "1");
    assert.fieldEquals("Dispute", "0", "evidenceCount", "1");
    assert.fieldEquals("Round", "0-0", "isCurrentRound", "false");
    assert.fieldEquals("Round", "0-0", "jurorsDrawn", "true");
    assert.fieldEquals("Round", "0-0", "jurorRewardsDispersed", "true");
    assert.fieldEquals("Round", "0-1", "isCurrentRound", "true");
  });

  test("court and global counters return to rest", () => {
    assert.fieldEquals("Court", GENERAL_COURT, "numberDisputes", "1");
    assert.fieldEquals("Court", GENERAL_COURT, "numberVotes", "6");
    assert.fieldEquals("Court", GENERAL_COURT, "numberVotingDisputes", "0");
    assert.fieldEquals("Court", GENERAL_COURT, "numberAppealingDisputes", "0");
    assert.fieldEquals("Court", GENERAL_COURT, "numberClosedDisputes", "1");
    assert.fieldEquals("Court", GENERAL_COURT, "stake", "3000");
    assert.fieldEquals("Court", GENERAL_COURT, "paidETH", "300");
    assert.fieldEquals("Court", GENERAL_COURT, "paidPNK", "2000");
    assert.fieldEquals("Counter", "0", "cases", "1");
    assert.fieldEquals("Counter", "0", "casesVoting", "0");
    assert.fieldEquals("Counter", "0", "casesAppealing", "0");
    assert.fieldEquals("Counter", "0", "casesRuled", "1");
    assert.fieldEquals("Counter", "0", "activeJurors", "3");
  });

  test("each round's votes are tallied in their own local round", () => {
    assert.fieldEquals("ClassicDispute", "1-0", "currentLocalRoundIndex", "1");
    assert.fieldEquals("ClassicRound", "1-0-0", "winningChoice", "1");
    assert.fieldEquals("ClassicRound", "1-0-0", "totalVoted", "3");
    assert.fieldEquals("ClassicRound", "1-0-0", "fundedChoices", "[1, 2]");
    assert.fieldEquals("ClassicRound", "1-0-1", "winningChoice", "2");
    assert.fieldEquals("ClassicRound", "1-0-1", "totalVoted", "3");
    assert.fieldEquals("ClassicVote", "1-0-1-0", "choice", "2");
  });

  test("jurors are scored on every round against the final ruling", () => {
    assert.fieldEquals("User", a, "totalResolvedVotes", "2");
    assert.fieldEquals("User", a, "totalCoherentVotes", "1");
    assert.fieldEquals("User", c, "totalResolvedVotes", "2");
    assert.fieldEquals("User", c, "totalCoherentVotes", "2");
    assert.fieldEquals("User", c, "coherenceScore", "17");
    assert.fieldEquals("User", b, "totalDisputes", "1");
    assert.fieldEquals("User", c, "totalResolvedDisputes", "1");
    assert.fieldEquals("Counter", "0", "totalLeaderboardJurors", "3");
  });

  test("appeal crowdfunding is recorded and the winner's withdrawal settles round 0", () => {
    assert.fieldEquals("ClassicRound", "1-0-0", "feeRewards", "350");
    assert.fieldEquals("ClassicContribution", `1-0-0-${b}-1`, "amount", "450");
    assert.fieldEquals("ClassicContribution", `1-0-0-${b}-1`, "rewardWithdrawn", "false");
    assert.fieldEquals("ClassicContribution", `1-0-0-${cf}-2`, "rewardWithdrawn", "true");
    assert.fieldEquals("ClassicContribution", `1-0-0-${cf}-2`, "rewardAmount", "350");
    assert.fieldEquals("ClassicRound", "1-0-0", "appealFeesDispersed", "true");
  });
});

describe("Lifecycle: an appeal that jumps to another dispute kit", () => {
  beforeAll(() => {
    setUpCourtAndJurors();
    createDispute();
    drawRound(0);
    period(Period.vote);
    vote(JUROR_A, 0, 1);
    vote(JUROR_B, 1, 1);
    vote(JUROR_C, 2, 2);
    period(Period.appeal);

    crowdfundAppeal(2);
    // KlerosCore.appeal hands kit 2 the extraData of kit 1, then emits AppealDecision.
    mockDisputeKitCore(DK_OTHER);
    dk.handleDisputeCreation(createDKDisputeCreationEvent(D, bi(2), extraData(1, 3, 1), DK_OTHER));
    core.handleAppealDecision(createAppealDecisionEvent(D, ARBITRABLE));
    period(Period.evidence);

    drawRound(1);
    period(Period.vote);
    vote(JUROR_A, 0, 2, DK_OTHER);
    vote(JUROR_B, 1, 2, DK_OTHER);
  });

  afterAll(() => {
    clearStore();
  });

  test("round 1 runs in dispute kit 2 and kit 1 opens no further local round", () => {
    assert.fieldEquals("Round", "0-1", "disputeKit", "2");
    assert.fieldEquals("ClassicRound", "1-0-0", "fundedChoices", "[1, 2]");
    assert.fieldEquals("ClassicRound", "1-0-0", "feeRewards", "350");
  });

  test(
    "KNOWN BUG: votes cast in the new dispute kit are recorded",
    () => {
      assert.fieldEquals("ClassicVote", "2-0-1-0", "choice", "2");
      assert.fieldEquals("ClassicRound", "2-0-1", "totalVoted", "2");
    },
    true
  );

  test(
    "KNOWN BUG: the original kit's local dispute is not overwritten by the jump",
    () => {
      assert.fieldEquals("ClassicDispute", "1-0", "currentLocalRoundIndex", "0");
      assert.notInStore("ClassicRound", "1-0-1");
    },
    true
  );
});
