import {
  afterEach,
  assert,
  beforeEach,
  clearStore,
  dataSourceMock,
  describe,
  test,
} from "matchstick-as/assembly/index";
import { BigInt } from "@graphprotocol/graph-ts";
import { handleStakeDelayed, handleStakeLocked, handleStakeSet } from "../src/SortitionModule";
import { createStakeDelayedEvent, createStakeLockedEvent, createStakeSetEvent } from "./utils/events";
import { mockJurorBalance } from "./utils/mocks";
import { seedCourt } from "./utils/entities";
import { bi, CHILD_COURT, GENERAL_COURT, JUROR_A, JUROR_B } from "./utils/constants";

const jurorA = JUROR_A.toHexString();

function stakeSet(courtID: string, staked: i32, totalStaked: i32, totalLocked: i32 = 0): void {
  mockJurorBalance(JUROR_A, BigInt.fromString(courtID), bi(totalStaked), bi(totalLocked), bi(staked));
  handleStakeSet(createStakeSetEvent(JUROR_A, BigInt.fromString(courtID), bi(staked), bi(totalStaked)));
}

describe("SortitionModule - handleStakeSet", () => {
  beforeEach(() => {
    seedCourt(GENERAL_COURT);
    seedCourt(CHILD_COURT, GENERAL_COURT);
  });

  afterEach(() => {
    clearStore();
    dataSourceMock.resetValues();
  });

  test("records the juror's stake in the court and propagates the effective stake to the parent", () => {
    stakeSet(CHILD_COURT, 500, 500);

    assert.fieldEquals("User", jurorA, "totalStake", "500");
    assert.fieldEquals("JurorTokensPerCourt", `${jurorA}-2`, "staked", "500");
    assert.fieldEquals("JurorTokensPerCourt", `${jurorA}-2`, "effectiveStake", "500");
    assert.fieldEquals("JurorTokensPerCourt", `${jurorA}-2`, "delayed", "0");
    assert.fieldEquals("JurorTokensPerCourt", `${jurorA}-1`, "staked", "0");
    assert.fieldEquals("JurorTokensPerCourt", `${jurorA}-1`, "effectiveStake", "500");

    assert.fieldEquals("Court", CHILD_COURT, "stake", "500");
    assert.fieldEquals("Court", CHILD_COURT, "effectiveStake", "500");
    assert.fieldEquals("Court", CHILD_COURT, "numberStakedJurors", "1");
    assert.fieldEquals("Court", CHILD_COURT, "effectiveNumberStakedJurors", "1");
    assert.fieldEquals("Court", GENERAL_COURT, "stake", "0");
    assert.fieldEquals("Court", GENERAL_COURT, "effectiveStake", "500");
    assert.fieldEquals("Court", GENERAL_COURT, "numberStakedJurors", "0");
    assert.fieldEquals("Court", GENERAL_COURT, "effectiveNumberStakedJurors", "1");

    assert.fieldEquals("Counter", "0", "stakedPNK", "500");
    assert.fieldEquals("Counter", "0", "activeJurors", "1");
  });

  test("applies the delta when the stake changes and unstaking to zero deactivates the juror", () => {
    stakeSet(CHILD_COURT, 500, 500);
    stakeSet(CHILD_COURT, 800, 800);

    assert.fieldEquals("Court", CHILD_COURT, "stake", "800");
    assert.fieldEquals("Court", GENERAL_COURT, "effectiveStake", "800");
    assert.fieldEquals("Counter", "0", "stakedPNK", "800");
    assert.fieldEquals("Counter", "0", "activeJurors", "1");

    stakeSet(CHILD_COURT, 0, 0);

    assert.fieldEquals("User", jurorA, "totalStake", "0");
    assert.fieldEquals("Court", CHILD_COURT, "stake", "0");
    assert.fieldEquals("Court", CHILD_COURT, "numberStakedJurors", "0");
    assert.fieldEquals("Court", CHILD_COURT, "effectiveNumberStakedJurors", "0");
    assert.fieldEquals("Court", GENERAL_COURT, "effectiveNumberStakedJurors", "0");
    assert.fieldEquals("Counter", "0", "stakedPNK", "0");
    assert.fieldEquals("Counter", "0", "activeJurors", "0");
  });

  test("a juror staked in two courts counts once in activeJurors", () => {
    stakeSet(GENERAL_COURT, 300, 300);
    stakeSet(CHILD_COURT, 200, 500);

    assert.fieldEquals("User", jurorA, "totalStake", "500");
    assert.fieldEquals("Counter", "0", "activeJurors", "1");
    assert.fieldEquals("Court", GENERAL_COURT, "effectiveStake", "500");
    assert.fieldEquals("Court", GENERAL_COURT, "effectiveNumberStakedJurors", "1");
  });

  test("creates the user but no stake rows for an unknown court", () => {
    mockJurorBalance(JUROR_B, bi(99), bi(100), bi(0), bi(100));
    handleStakeSet(createStakeSetEvent(JUROR_B, bi(99), bi(100), bi(100)));

    assert.entityCount("User", 1);
    assert.entityCount("JurorTokensPerCourt", 0);
  });

  test("clears a pending delayed stake once the stake is set", () => {
    handleStakeDelayed(createStakeDelayedEvent(JUROR_A, bi(2), bi(700)));
    assert.fieldEquals("JurorTokensPerCourt", `${jurorA}-2`, "delayed", "700");

    stakeSet(CHILD_COURT, 700, 700);

    assert.fieldEquals("JurorTokensPerCourt", `${jurorA}-2`, "delayed", "0");
    assert.fieldEquals("User", jurorA, "totalDelayed", "0");
  });

  test(
    "KNOWN BUG: JurorTokensPerCourt.locked holds the juror's total locked PNK, not the court's",
    () => {
      // 400 PNK are locked by a dispute in court 1; nothing is locked in court 2.
      stakeSet(GENERAL_COURT, 1000, 1000, 400);
      stakeSet(CHILD_COURT, 500, 1500, 400);

      assert.fieldEquals("JurorTokensPerCourt", `${jurorA}-2`, "locked", "0");
    },
    true
  );
});

describe("SortitionModule - handleStakeDelayed", () => {
  beforeEach(() => {
    seedCourt(GENERAL_COURT);
    seedCourt(CHILD_COURT, GENERAL_COURT);
  });

  afterEach(() => {
    clearStore();
    dataSourceMock.resetValues();
  });

  test("records the latest delayed amount per juror and court", () => {
    handleStakeDelayed(createStakeDelayedEvent(JUROR_A, bi(2), bi(700)));
    handleStakeDelayed(createStakeDelayedEvent(JUROR_A, bi(2), bi(900)));

    assert.fieldEquals("JurorTokensPerCourt", `${jurorA}-2`, "delayed", "900");
    assert.fieldEquals("User", jurorA, "totalDelayed", "900");
  });

  test("sums delayed amounts across courts in User.totalDelayed", () => {
    handleStakeDelayed(createStakeDelayedEvent(JUROR_A, bi(1), bi(100)));
    handleStakeDelayed(createStakeDelayedEvent(JUROR_A, bi(2), bi(250)));

    assert.fieldEquals("User", jurorA, "totalDelayed", "350");
  });

  test("ignores an unknown court", () => {
    handleStakeDelayed(createStakeDelayedEvent(JUROR_A, bi(99), bi(100)));

    assert.entityCount("JurorTokensPerCourt", 0);
  });

  test(
    "KNOWN BUG: Court.delayedStake is rebuilt from Court.stake instead of the previous delayedStake",
    () => {
      stakeSet(CHILD_COURT, 1000, 1000);
      handleStakeDelayed(createStakeDelayedEvent(JUROR_A, bi(2), bi(500)));

      assert.fieldEquals("Court", CHILD_COURT, "delayedStake", "500");
    },
    true
  );
});

describe("SortitionModule - handleStakeLocked", () => {
  afterEach(() => {
    clearStore();
  });

  test("is a no-op", () => {
    seedCourt(GENERAL_COURT);
    handleStakeLocked(createStakeLockedEvent(JUROR_A, bi(100), false));

    assert.entityCount("User", 0);
    assert.entityCount("JurorTokensPerCourt", 0);
    assert.entityCount("Court", 1);
  });
});
