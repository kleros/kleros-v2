import { afterEach, assert, beforeEach, clearStore, describe, test } from "matchstick-as/assembly/index";
import { Address, BigInt } from "@graphprotocol/graph-ts";
import { handleJurorRewardPenalty } from "../src/KlerosCore";
import { addUserActiveDispute } from "../src/entities/User";
import { createJurorRewardPenaltyEvent } from "./utils/events";
import {
  mockCoherentCount,
  mockDisputeKitAddress,
  mockJurorBalance,
  mockRates,
  mockRoundInfo,
  mockSortitionModule,
  RoundInfo,
} from "./utils/mocks";
import { seedDisputeInCourt } from "./utils/entities";
import { assertFieldUnset } from "./utils/assertions";
import { bi, DK_CLASSIC, ERC20_TOKEN, GENERAL_COURT, JUROR_A, NATIVE } from "./utils/constants";

const juror = JUROR_A.toHexString();
const shiftID = `${juror}-0-0`;
const penaltyID = `0-0-${juror}`;

function rewardPenalty(
  coherencyPnk: i32,
  amountPnk: i32,
  amountFee: i32,
  feeToken: Address = NATIVE,
  repartitions: i32 = 1
): void {
  mockSortitionModule();
  mockJurorBalance(JUROR_A, bi(1), bi(1000), bi(0), bi(1000));
  mockRoundInfo(bi(0), bi(0), new RoundInfo().withVotes(3).withRepartitions(repartitions).withFeeToken(feeToken));
  handleJurorRewardPenalty(
    createJurorRewardPenaltyEvent(
      JUROR_A,
      bi(0),
      bi(0),
      bi(coherencyPnk),
      bi(coherencyPnk),
      BigInt.fromI32(amountPnk),
      BigInt.fromI32(amountFee),
      feeToken
    )
  );
}

describe("KlerosCore - handleJurorRewardPenalty", () => {
  beforeEach(() => {
    seedDisputeInCourt("0", "execution");
    addUserActiveDispute(juror, "0");
  });

  afterEach(() => {
    clearStore();
  });

  test("records a native-currency reward on the juror, court and global counters", () => {
    rewardPenalty(10000, 500, 100);

    assert.fieldEquals("JurorRewardPenalty", shiftID, "juror", juror);
    assert.fieldEquals("JurorRewardPenalty", shiftID, "dispute", "0");
    assert.fieldEquals("JurorRewardPenalty", shiftID, "pnkAmount", "500");
    assert.fieldEquals("JurorRewardPenalty", shiftID, "ethAmount", "100");
    assert.fieldEquals("JurorRewardPenalty", shiftID, "feeTokenAmount", "0");
    assert.fieldEquals("Court", GENERAL_COURT, "paidETH", "100");
    assert.fieldEquals("Court", GENERAL_COURT, "paidPNK", "500");
    assert.fieldEquals("Counter", "0", "paidETH", "100");
    assert.fieldEquals("Counter", "0", "redistributedPNK", "500");
    assert.fieldEquals("User", juror, "resolvedDisputes", "[0]");
    assert.fieldEquals("User", juror, "totalResolvedDisputes", "1");
    assert.fieldEquals("User", juror, "activeDisputes", "0");
  });

  test("records a penalty without counting it as redistributed PNK", () => {
    rewardPenalty(0, -300, 0);

    assert.fieldEquals("JurorRewardPenalty", shiftID, "pnkAmount", "-300");
    assert.fieldEquals("Court", GENERAL_COURT, "paidPNK", "0");
    assert.fieldEquals("Counter", "0", "redistributedPNK", "0");
    assert.fieldEquals("User", juror, "totalResolvedDisputes", "1");
  });

  test("creates a Penalty per juror and round and counts each draw", () => {
    rewardPenalty(10000, 200, 50);

    assert.fieldEquals("Penalty", penaltyID, "round", "0-0");
    assert.fieldEquals("Penalty", penaltyID, "numberDraws", "1");
    assert.fieldEquals("Penalty", penaltyID, "amount", "200");
    assert.fieldEquals("Penalty", penaltyID, "degreeOfCoherencyPnk", "10000");
    assert.fieldEquals("Penalty", penaltyID, "degreeOfCoherencyFee", "10000");

    // Same juror drawn for a second vote in the round.
    rewardPenalty(10000, 200, 50);

    assert.entityCount("Penalty", 1);
    assert.fieldEquals("Penalty", penaltyID, "numberDraws", "2");
    assert.fieldEquals("Penalty", penaltyID, "amount", "400");
    assert.fieldEquals("JurorRewardPenalty", shiftID, "ethAmount", "100");
  });

  test("refreshes the juror's stake from the sortition module", () => {
    rewardPenalty(10000, 200, 50);

    assert.fieldEquals("JurorTokensPerCourt", `${juror}-1`, "staked", "1000");
  });

  test("marks juror rewards dispersed once every repartition is executed", () => {
    rewardPenalty(10000, 200, 50, NATIVE, 6);

    assert.fieldEquals("Round", "0-0", "jurorRewardsDispersed", "true");
  });

  test("leaves juror rewards undispersed while penalties are still being executed", () => {
    rewardPenalty(0, -200, 0, NATIVE, 2);

    assert.fieldEquals("Round", "0-0", "jurorRewardsDispersed", "false");
  });

  test(
    "KNOWN BUG: rewards are not marked dispersed when only the penalty pass is done",
    () => {
      // 2 of 3 jurors are coherent, so KlerosCore loops to 2 * nbVotes; repartitions = nbVotes is mid-way.
      mockDisputeKitAddress(bi(1), DK_CLASSIC);
      mockCoherentCount(DK_CLASSIC, bi(0), bi(0), 2);
      rewardPenalty(0, -200, 0, NATIVE, 3);

      assert.fieldEquals("Round", "0-0", "jurorRewardsDispersed", "false");
    },
    true
  );

  test(
    "KNOWN BUG: a native-currency shift has isNativeCurrency = true and no feeToken",
    () => {
      rewardPenalty(10000, 500, 100);

      assert.fieldEquals("JurorRewardPenalty", shiftID, "isNativeCurrency", "true");
      assertFieldUnset("JurorRewardPenalty", shiftID, "feeToken");
    },
    true
  );

  test(
    "KNOWN BUG: an ERC20 fee is tracked in token units and converted to ETH",
    () => {
      // 1 token = 0.5 ETH: rateInEth 500000 with 6 decimals.
      mockRates(ERC20_TOKEN, bi(500000), 6);
      rewardPenalty(10000, 500, 1000, ERC20_TOKEN);

      assert.fieldEquals("JurorRewardPenalty", shiftID, "feeTokenAmount", "1000");
      assert.fieldEquals("JurorRewardPenalty", shiftID, "ethAmount", "500");
      assert.fieldEquals("Court", GENERAL_COURT, "paidETH", "500");
      assert.fieldEquals("FeeToken", ERC20_TOKEN.toHexString(), "totalPaid", "1000");
    },
    true
  );

  test(
    "KNOWN BUG: Penalty.degreeOfCoherencyPnk averages the juror's draws",
    () => {
      rewardPenalty(10000, 200, 50);
      rewardPenalty(0, -200, 0);

      assert.fieldEquals("Penalty", penaltyID, "degreeOfCoherencyPnk", "5000");
    },
    true
  );
});
