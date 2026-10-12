import { afterEach, assert, clearStore, describe, test } from "matchstick-as/assembly/index";
import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
  handleChoiceFunded,
  handleCommitCast,
  handleContributionEvent,
  handleDisputeCreation,
  handleVoteCast,
  handleWithdrawal,
} from "../src/DisputeKitClassic";
import { ClassicRound } from "../generated/schema";
import {
  createChoiceFundedEvent,
  createCommitCastEvent,
  createContributionEvent,
  createDKDisputeCreationEvent,
  createVoteCastEvent,
  createWithdrawalEvent,
} from "./utils/events";
import { mockDisputeKitCore, mockNumberOfRounds, mockRoundInfo, RoundInfo } from "./utils/mocks";
import {
  seedClassicContribution,
  seedClassicDispute,
  seedClassicRound,
  seedDisputeInCourt,
  seedDisputeKit,
  seedRound,
} from "./utils/entities";
import { bi, CROWDFUNDER, DAY_1, DK_CLASSIC, DK_OTHER, JUROR_A, JUROR_B, JUROR_C } from "./utils/constants";
import { extraData } from "./utils/extra-data";

const cf = CROWDFUNDER.toHexString();

function createLocalDispute(disputeKit: Address, data: Bytes, numberOfRounds: i32 = 1): void {
  mockDisputeKitCore(disputeKit);
  mockNumberOfRounds(bi(0), numberOfRounds);
  handleDisputeCreation(createDKDisputeCreationEvent(bi(0), bi(2), data, disputeKit));
}

/** Dispute 0 in dispute kit 1 with core and local rounds 0..currentRoundIndex. */
function seedDisputeInKit(period: string, currentRoundIndex: i32): void {
  seedDisputeInCourt("0", period, currentRoundIndex);
  seedDisputeKit("1", DK_CLASSIC);
  seedDisputeKit("2", DK_OTHER);
  seedClassicDispute("1", "0", currentRoundIndex);
  for (let i = 0; i <= currentRoundIndex; i++) seedClassicRound("1", "0", i);
}

function vote(juror: Address, voteIDs: BigInt[], choice: i32): void {
  handleVoteCast(createVoteCastEvent(bi(0), juror, voteIDs, bi(choice), "because"));
}

function contribute(round: i32, choice: i32, amount: i32): void {
  handleContributionEvent(createContributionEvent(bi(0), bi(round), bi(choice), CROWDFUNDER, bi(amount)));
}

function totalFeeDispersed(localRoundID: string): BigInt {
  const round = ClassicRound.load(localRoundID);
  return round ? round.totalFeeDispersed : BigInt.zero();
}

describe("DisputeKitClassic - handleDisputeCreation", () => {
  afterEach(() => {
    clearStore();
  });

  test("creates the local dispute and its first round under the dispute kit from extraData", () => {
    seedDisputeInCourt("0");
    createLocalDispute(DK_CLASSIC, extraData(1, 3, 1));

    assert.fieldEquals("ClassicDispute", "1-0", "coreDispute", "0");
    assert.fieldEquals("ClassicDispute", "1-0", "numberOfChoices", "2");
    assert.fieldEquals("ClassicDispute", "1-0", "currentLocalRoundIndex", "0");
    assert.fieldEquals("ClassicDispute", "1-0", "timestamp", DAY_1.toString());
    assert.fieldEquals("ClassicRound", "1-0-0", "localDispute", "1-0");
    assert.fieldEquals("ClassicRound", "1-0-0", "tied", "true");
    assert.fieldEquals("ClassicRound", "1-0-0", "winningChoice", "0");
    assert.fieldEquals("ClassicRound", "1-0-0", "feeRewards", "0");
    assert.fieldEquals("ClassicRound", "1-0-0", "fundedChoices", "[]");
  });

  test("uses a non-classic dispute kit id from extraData", () => {
    seedDisputeInCourt("0");
    createLocalDispute(DK_OTHER, extraData(1, 3, 2));

    assert.entityCount("ClassicDispute", 1);
    assert.fieldEquals("ClassicDispute", "2-0", "coreDispute", "0");
    assert.fieldEquals("ClassicRound", "2-0-0", "localDispute", "2-0");
  });

  test(
    "KNOWN BUG: extraData without a dispute kit id defaults to the classic kit (1)",
    () => {
      seedDisputeInCourt("0");
      createLocalDispute(DK_CLASSIC, Bytes.empty());

      assert.fieldEquals("ClassicDispute", "1-0", "coreDispute", "0");
    },
    true
  );

  test(
    "KNOWN BUG: extraData with dispute kit id 0 defaults to the classic kit (1)",
    () => {
      seedDisputeInCourt("0");
      createLocalDispute(DK_CLASSIC, extraData(1, 3, 0));

      assert.fieldEquals("ClassicDispute", "1-0", "coreDispute", "0");
    },
    true
  );

  test(
    "KNOWN BUG: ClassicDispute.extraData is stored as emitted",
    () => {
      seedDisputeInCourt("0");
      const data = extraData(1, 3, 1);
      const emitted = data.toHexString();
      createLocalDispute(DK_CLASSIC, data);

      assert.fieldEquals("ClassicDispute", "1-0", "extraData", emitted);
    },
    true
  );

  test(
    "KNOWN BUG: a dispute kit jump creates the local dispute under the new kit",
    () => {
      // KlerosCore.appeal passes the original extraData (kit 1) to kit 2 and has already pushed round 1.
      seedDisputeInKit("appeal", 0);
      mockRoundInfo(bi(0), bi(1), new RoundInfo().withDisputeKit(2));
      createLocalDispute(DK_OTHER, extraData(1, 3, 1), 2);

      assert.fieldEquals("ClassicDispute", "2-0", "currentLocalRoundIndex", "1");
      assert.fieldEquals("ClassicRound", "2-0-1", "localDispute", "2-0");
      assert.fieldEquals("ClassicDispute", "1-0", "currentLocalRoundIndex", "0");
    },
    true
  );
});

describe("DisputeKitClassic - handleCommitCast", () => {
  afterEach(() => {
    clearStore();
  });

  test("records a commit for each vote id", () => {
    seedDisputeInKit("commit", 0);
    const commit = Bytes.fromHexString("0x1234567890123456789012345678901234567890123456789012345678901234");
    handleCommitCast(createCommitCastEvent(bi(0), JUROR_A, [bi(0), bi(2)], commit));

    assert.entityCount("ClassicVote", 2);
    assert.fieldEquals("ClassicVote", "1-0-0-0", "commited", "true");
    assert.fieldEquals("ClassicVote", "1-0-0-0", "commit", commit.toHexString());
    assert.fieldEquals("ClassicVote", "1-0-0-0", "voted", "false");
    assert.fieldEquals("ClassicVote", "1-0-0-0", "juror", JUROR_A.toHexString());
    assert.fieldEquals("ClassicVote", "1-0-0-2", "draw", "0-0-2");
    assert.fieldEquals("ClassicVote", "1-0-0-2", "localRound", "1-0-0");
  });

  test("ignores a dispute that is not in an indexed dispute kit", () => {
    seedDisputeInCourt("0", "commit");
    handleCommitCast(createCommitCastEvent(bi(0), JUROR_A, [bi(0)], Bytes.fromI32(1)));

    assert.entityCount("ClassicVote", 0);
  });
});

describe("DisputeKitClassic - handleVoteCast", () => {
  afterEach(() => {
    clearStore();
  });

  test("records the votes, the justification and the leading choice", () => {
    seedDisputeInKit("vote", 0);
    vote(JUROR_A, [bi(0), bi(1)], 1);

    assert.fieldEquals("ClassicVote", "1-0-0-0", "voted", "true");
    assert.fieldEquals("ClassicVote", "1-0-0-1", "choice", "1");
    assert.fieldEquals("ClassicVote", "1-0-0-1", "justification", "1-0-0-0,1");
    assert.fieldEquals("ClassicJustification", "1-0-0-0,1", "reference", "because");
    assert.fieldEquals("ClassicJustification", "1-0-0-0,1", "juror", JUROR_A.toHexString());
    assert.fieldEquals("ClassicJustification", "1-0-0-0,1", "choice", "1");
    assert.fieldEquals("Answer", "1-0-0-1", "count", "2");
    assert.fieldEquals("ClassicRound", "1-0-0", "totalVoted", "2");
    assert.fieldEquals("ClassicRound", "1-0-0", "winningChoice", "1");
    assert.fieldEquals("ClassicRound", "1-0-0", "tied", "false");
    assert.fieldEquals("Dispute", "0", "currentRuling", "1");
    assert.fieldEquals("Dispute", "0", "tied", "false");
  });

  test("tracks ties between choices", () => {
    seedDisputeInKit("vote", 0);
    vote(JUROR_A, [bi(0)], 1);
    vote(JUROR_B, [bi(1)], 2);

    assert.fieldEquals("ClassicRound", "1-0-0", "tied", "true");
    assert.fieldEquals("Dispute", "0", "tied", "true");

    vote(JUROR_C, [bi(2)], 2);

    assert.fieldEquals("ClassicRound", "1-0-0", "winningChoice", "2");
    assert.fieldEquals("ClassicRound", "1-0-0", "tied", "false");
    assert.fieldEquals("ClassicRound", "1-0-0", "totalVoted", "3");
    assert.fieldEquals("Dispute", "0", "currentRuling", "2");
  });

  test("turns a commit into a revealed vote", () => {
    seedDisputeInKit("commit", 0);
    handleCommitCast(createCommitCastEvent(bi(0), JUROR_A, [bi(0)], Bytes.fromI32(1)));
    vote(JUROR_A, [bi(0)], 2);

    assert.entityCount("ClassicVote", 1);
    assert.fieldEquals("ClassicVote", "1-0-0-0", "commited", "true");
    assert.fieldEquals("ClassicVote", "1-0-0-0", "voted", "true");
    assert.fieldEquals("ClassicVote", "1-0-0-0", "choice", "2");
  });

  test("ignores an unknown dispute", () => {
    vote(JUROR_A, [bi(0)], 1);

    assert.entityCount("ClassicVote", 0);
    assert.entityCount("ClassicJustification", 0);
  });
});

describe("DisputeKitClassic - handleContributionEvent", () => {
  afterEach(() => {
    clearStore();
  });

  test("records the contribution and the choice's paid fee", () => {
    seedDisputeInKit("appeal", 0);
    contribute(0, 1, 100);

    const id = `1-0-0-${cf}-1`;
    assert.fieldEquals("ClassicContribution", id, "contributor", cf);
    assert.fieldEquals("ClassicContribution", id, "coreDispute", "0");
    assert.fieldEquals("ClassicContribution", id, "localRound", "1-0-0");
    assert.fieldEquals("ClassicContribution", id, "amount", "100");
    assert.fieldEquals("ClassicContribution", id, "choice", "1");
    assert.fieldEquals("ClassicContribution", id, "rewardWithdrawn", "false");
    assert.fieldEquals("Answer", "1-0-0-1", "paidFee", "100");
    assert.fieldEquals("User", cf, "id", cf);
  });

  test("adds repeated contributions to the same choice", () => {
    seedDisputeInKit("appeal", 0);
    contribute(0, 1, 100);
    contribute(0, 1, 50);

    assert.entityCount("ClassicContribution", 1);
    assert.fieldEquals("ClassicContribution", `1-0-0-${cf}-1`, "amount", "150");
    assert.fieldEquals("Answer", "1-0-0-1", "paidFee", "150");
  });

  test("ignores a round that is not indexed", () => {
    seedDisputeInKit("appeal", 0);
    contribute(5, 1, 100);

    assert.entityCount("ClassicContribution", 0);
    assert.entityCount("Answer", 0);
  });
});

describe("DisputeKitClassic - handleChoiceFunded", () => {
  afterEach(() => {
    clearStore();
  });

  test("marks the first funded choice and adds its fees to the round", () => {
    seedDisputeInKit("appeal", 0);
    contribute(0, 1, 450);
    handleChoiceFunded(createChoiceFundedEvent(bi(0), bi(0), bi(1)));

    assert.fieldEquals("Answer", "1-0-0-1", "funded", "true");
    assert.fieldEquals("ClassicRound", "1-0-0", "fundedChoices", "[1]");
    assert.fieldEquals("ClassicRound", "1-0-0", "feeRewards", "450");
    assert.entityCount("ClassicRound", 1);
  });

  test("the second funded choice deducts the appeal cost and opens the next local round", () => {
    seedDisputeInKit("appeal", 0);
    contribute(0, 1, 450);
    contribute(0, 2, 600);
    handleChoiceFunded(createChoiceFundedEvent(bi(0), bi(0), bi(1)));
    mockDisputeKitCore(DK_CLASSIC);
    mockNumberOfRounds(bi(0), 2);
    mockRoundInfo(bi(0), bi(1), new RoundInfo().withTotalFees(bi(700)));
    handleChoiceFunded(createChoiceFundedEvent(bi(0), bi(0), bi(2)));

    assert.fieldEquals("ClassicRound", "1-0-0", "fundedChoices", "[1, 2]");
    assert.fieldEquals("ClassicRound", "1-0-0", "feeRewards", "350");
    assert.fieldEquals("ClassicDispute", "1-0", "currentLocalRoundIndex", "1");
    assert.fieldEquals("ClassicRound", "1-0-1", "localDispute", "1-0");
    assert.fieldEquals("ClassicRound", "1-0-1", "feeRewards", "0");
  });

  test("does not open a local round when the appeal jumps to another dispute kit", () => {
    seedDisputeInKit("appeal", 0);
    contribute(0, 1, 450);
    contribute(0, 2, 600);
    handleChoiceFunded(createChoiceFundedEvent(bi(0), bi(0), bi(1)));
    mockDisputeKitCore(DK_CLASSIC);
    mockNumberOfRounds(bi(0), 2);
    mockRoundInfo(bi(0), bi(1), new RoundInfo().withDisputeKit(2).withTotalFees(bi(700)));
    handleChoiceFunded(createChoiceFundedEvent(bi(0), bi(0), bi(2)));

    assert.fieldEquals("ClassicRound", "1-0-0", "feeRewards", "350");
    assert.fieldEquals("ClassicDispute", "1-0", "currentLocalRoundIndex", "0");
    assert.notInStore("ClassicRound", "1-0-1");
  });
});

describe("DisputeKitClassic - handleWithdrawal", () => {
  afterEach(() => {
    clearStore();
  });

  test("marks the contribution withdrawn and the round's fees dispersed", () => {
    seedDisputeInKit("execution", 1);
    const round = ClassicRound.load("1-0-0")!;
    round.feeRewards = bi(150);
    round.save();
    seedClassicContribution("1", "0", 0, CROWDFUNDER, 1, bi(100));
    handleWithdrawal(createWithdrawalEvent(bi(0), bi(1), CROWDFUNDER, bi(150)));

    const id = `1-0-0-${cf}-1`;
    assert.fieldEquals("ClassicContribution", id, "rewardWithdrawn", "true");
    assert.fieldEquals("ClassicContribution", id, "rewardAmount", "150");
    assert.fieldEquals("ClassicContribution", id, "amount", "100");
    assert.fieldEquals("ClassicRound", "1-0-0", "totalFeeDispersed", "150");
    assert.fieldEquals("ClassicRound", "1-0-0", "appealFeesDispersed", "true");
  });

  test("ignores an unknown dispute", () => {
    handleWithdrawal(createWithdrawalEvent(bi(0), bi(1), CROWDFUNDER, bi(150)));

    assert.entityCount("ClassicContribution", 0);
  });

  test(
    "KNOWN BUG: a reimbursement in the last round (no appeal) is recorded",
    () => {
      seedDisputeInKit("execution", 0);
      seedClassicContribution("1", "0", 0, CROWDFUNDER, 1, bi(100));
      handleWithdrawal(createWithdrawalEvent(bi(0), bi(1), CROWDFUNDER, bi(100)));

      assert.fieldEquals("ClassicContribution", `1-0-0-${cf}-1`, "rewardWithdrawn", "true");
    },
    true
  );

  test(
    "KNOWN BUG: rounds after the first are visited by their own index",
    () => {
      seedDisputeInKit("execution", 2);
      seedClassicContribution("1", "0", 1, CROWDFUNDER, 1, bi(100));
      handleWithdrawal(createWithdrawalEvent(bi(0), bi(1), CROWDFUNDER, bi(100)));

      assert.fieldEquals("ClassicContribution", `1-0-1-${cf}-1`, "rewardWithdrawn", "true");
    },
    true
  );

  test(
    "KNOWN BUG: no contribution is created for a round the contributor did not fund",
    () => {
      seedDisputeInKit("execution", 2);
      seedClassicContribution("1", "0", 1, CROWDFUNDER, 1, bi(100));
      handleWithdrawal(createWithdrawalEvent(bi(0), bi(1), CROWDFUNDER, bi(100)));

      assert.notInStore("ClassicContribution", `1-0-0-${cf}-1`);
    },
    true
  );

  test(
    "KNOWN BUG: one Withdrawal adds its amount to totalFeeDispersed once across rounds",
    () => {
      seedDisputeInKit("execution", 2);
      seedClassicContribution("1", "0", 1, CROWDFUNDER, 1, bi(100));
      handleWithdrawal(createWithdrawalEvent(bi(0), bi(1), CROWDFUNDER, bi(100)));

      const total = totalFeeDispersed("1-0-0").plus(totalFeeDispersed("1-0-1")).plus(totalFeeDispersed("1-0-2"));
      assert.bigIntEquals(bi(100), total);
    },
    true
  );

  test(
    "KNOWN BUG: a round without a ClassicRound does not stop the remaining rounds",
    () => {
      // Round 0 ran in a dispute kit this handler does not index (no ClassicRound "3-0-0").
      seedDisputeInKit("execution", 2);
      seedRound("0", 0, "3");
      seedClassicContribution("1", "0", 1, CROWDFUNDER, 1, bi(100));
      handleWithdrawal(createWithdrawalEvent(bi(0), bi(1), CROWDFUNDER, bi(100)));

      assert.bigIntEquals(bi(100), totalFeeDispersed("1-0-1"));
    },
    true
  );

  test(
    "KNOWN BUG: a Withdrawal from one dispute kit leaves another kit's rounds untouched",
    () => {
      seedDisputeInKit("execution", 2);
      seedRound("0", 0, "2");
      seedClassicDispute("2", "0", 0);
      seedClassicRound("2", "0", 0);
      seedClassicContribution("1", "0", 1, CROWDFUNDER, 1, bi(100));
      handleWithdrawal(createWithdrawalEvent(bi(0), bi(1), CROWDFUNDER, bi(100), DK_CLASSIC));

      assert.bigIntEquals(BigInt.zero(), totalFeeDispersed("2-0-0"));
      assert.notInStore("ClassicContribution", `2-0-0-${cf}-1`);
    },
    true
  );
});
