import { afterEach, assert, clearStore, dataSourceMock, describe, test } from "matchstick-as/assembly/index";
import { Address, BigInt, ByteArray, Bytes, crypto, ethereum, Wrapped } from "@graphprotocol/graph-ts";
import { handleAppealDecision, handleDisputeCreation, handleDraw, handleRuling } from "../src/KlerosCore";
import {
  createAppealDecisionEvent,
  createDisputeCreationEvent,
  createDrawEvent,
  createRulingEvent,
} from "./utils/events";
import {
  mockDisputes,
  mockDisputesReverts,
  mockJurorBalance,
  mockRoundInfo,
  mockSortitionModule,
  RoundInfo,
} from "./utils/mocks";
import { seedCourt, seedDisputeKit, seedUser } from "./utils/entities";
import { ARBITRABLE, bi, CORE, DAY_1, ERC20_TOKEN, GENERAL_COURT, JUROR_A, JUROR_B } from "./utils/constants";
import { DisputeCreation } from "../generated/KlerosCore/KlerosCore";
import { assertFieldUnset } from "./utils/assertions";

const DISPUTE_REQUEST = crypto.keccak256(ByteArray.fromUTF8("DisputeRequest(address,uint256,uint256)"));
const CROSS_CHAIN_DISPUTE_INCOMING = crypto.keccak256(
  ByteArray.fromUTF8("CrossChainDisputeIncoming(address,uint256,address,uint256,uint256,uint256)")
);

function word(value: BigInt): Bytes {
  return ethereum.encode(ethereum.Value.fromUnsignedBigInt(value))!;
}

function receiptLog(topics: Bytes[], data: Bytes): ethereum.Log {
  return new ethereum.Log(
    ARBITRABLE,
    topics,
    data,
    Bytes.empty(),
    Bytes.fromI32(1),
    Bytes.empty(),
    bi(0),
    bi(0),
    bi(0),
    "",
    new Wrapped(false)
  );
}

function withLogs(event: DisputeCreation, logs: ethereum.Log[]): DisputeCreation {
  event.receipt!.logs = logs;
  return event;
}

function setUpCourt(): void {
  seedCourt(GENERAL_COURT);
  seedDisputeKit("1");
}

function createDispute(id: i32, info: RoundInfo = new RoundInfo()): DisputeCreation {
  mockDisputes(bi(id), bi(1));
  mockRoundInfo(bi(id), bi(0), info);
  const event = createDisputeCreationEvent(bi(id), ARBITRABLE);
  handleDisputeCreation(event);
  return event;
}

function draw(juror: Address, voteID: i32): void {
  mockSortitionModule();
  mockJurorBalance(juror, bi(1), bi(1000), bi(1000), bi(1000));
  handleDraw(createDrawEvent(juror, bi(0), bi(0), bi(voteID)));
}

describe("KlerosCore - handleDisputeCreation", () => {
  afterEach(() => {
    clearStore();
    dataSourceMock.resetValues();
  });

  test("creates the dispute in the evidence period of its first round", () => {
    setUpCourt();
    createDispute(0);

    assert.entityCount("Dispute", 1);
    assert.fieldEquals("Dispute", "0", "court", GENERAL_COURT);
    assert.fieldEquals("Dispute", "0", "disputeID", "0");
    assert.fieldEquals("Dispute", "0", "arbitrated", ARBITRABLE.toHexString());
    assert.fieldEquals("Dispute", "0", "period", "evidence");
    assert.fieldEquals("Dispute", "0", "ruled", "false");
    assert.fieldEquals("Dispute", "0", "currentRound", "0-0");
    assert.fieldEquals("Dispute", "0", "currentRoundIndex", "0");
    assert.fieldEquals("Dispute", "0", "createdAt", DAY_1.toString());
    // Court.timesPerPeriod[evidence] is 100.
    assert.fieldEquals("Dispute", "0", "periodDeadline", (DAY_1 + 100).toString());
    assert.fieldEquals("Dispute", "0", "periodNotificationIndex", "0");
    assert.fieldEquals("PeriodIndexCounter", "evidence", "counter", "1");
  });

  test("creates round 0 from KlerosCore.getRoundInfo", () => {
    setUpCourt();
    createDispute(0, new RoundInfo().withVotes(5));

    assert.fieldEquals("Round", "0-0", "disputeKit", "1");
    assert.fieldEquals("Round", "0-0", "court", GENERAL_COURT);
    assert.fieldEquals("Round", "0-0", "dispute", "0");
    assert.fieldEquals("Round", "0-0", "nbVotes", "5");
    assert.fieldEquals("Round", "0-0", "tokensAtStakePerJuror", "1000");
    assert.fieldEquals("Round", "0-0", "totalFeesForJurors", "300");
    assert.fieldEquals("Round", "0-0", "timesPerPeriod", "[100, 200, 300, 400]");
    assert.fieldEquals("Round", "0-0", "timeline", "[0, 0, 0, 0]");
    assert.fieldEquals("Round", "0-0", "isCurrentRound", "true");
    assert.fieldEquals("Round", "0-0", "jurorsDrawn", "false");
    assert.fieldEquals("Round", "0-0", "jurorRewardsDispersed", "false");
  });

  test("updates court, arbitrable and global counters", () => {
    setUpCourt();
    createDispute(0);
    createDispute(1, new RoundInfo().withVotes(5));

    assert.fieldEquals("Court", GENERAL_COURT, "numberDisputes", "2");
    assert.fieldEquals("Court", GENERAL_COURT, "numberVotes", "8");
    assert.fieldEquals("CourtCounter", "1-0", "numberDisputes", "2");
    assert.fieldEquals("CourtCounter", "1-0", "numberVotes", "8");
    assert.fieldEquals("CourtCounter", "1-" + DAY_1.toString(), "numberDisputes", "2");
    assert.fieldEquals("Arbitrable", ARBITRABLE.toHexString(), "totalDisputes", "2");
    assert.fieldEquals("Counter", "0", "cases", "2");
  });

  test("ignores a dispute whose court is not indexed", () => {
    seedDisputeKit("1");
    createDispute(0);

    assert.entityCount("Dispute", 0);
    assert.entityCount("Round", 0);
  });

  test("stores an ERC20 fee token on the round", () => {
    setUpCourt();
    createDispute(0, new RoundInfo().withFeeToken(ERC20_TOKEN));

    assert.fieldEquals("Round", "0-0", "feeToken", ERC20_TOKEN.toHexString());
  });

  test(
    "KNOWN BUG: a round paid in the native currency has a null feeToken",
    () => {
      setUpCourt();
      createDispute(0);

      assertFieldUnset("Round", "0-0", "feeToken");
    },
    true
  );

  test("reads templateId from the arbitrable's DisputeRequest in the same receipt", () => {
    setUpCourt();
    dataSourceMock.setNetwork("arbitrum-sepolia");
    mockDisputes(bi(4), bi(1));
    mockRoundInfo(bi(4), bi(0), new RoundInfo());
    const event = withLogs(createDisputeCreationEvent(bi(4), ARBITRABLE), [
      // A DisputeRequest for another dispute in the same receipt is skipped.
      receiptLog([Bytes.fromByteArray(DISPUTE_REQUEST), word(bi(0)), word(bi(3))], word(bi(66))),
      receiptLog([Bytes.fromByteArray(DISPUTE_REQUEST), word(bi(0)), word(bi(4))], word(bi(7))),
    ]);
    handleDisputeCreation(event);

    assert.fieldEquals("Dispute", "4", "templateId", "7");
    assert.fieldEquals("Dispute", "4", "isCrossChain", "false");
    assert.fieldEquals("Dispute", "4", "arbitrableChainId", "421614");
  });

  test("reads chain and templateId from CrossChainDisputeIncoming", () => {
    setUpCourt();
    mockDisputes(bi(4), bi(1));
    mockRoundInfo(bi(4), bi(0), new RoundInfo());
    const data = new ethereum.Tuple();
    data.push(ethereum.Value.fromAddress(CORE));
    data.push(ethereum.Value.fromUnsignedBigInt(bi(100)));
    data.push(ethereum.Value.fromUnsignedBigInt(bi(9)));
    const event = withLogs(createDisputeCreationEvent(bi(4), ARBITRABLE), [
      receiptLog(
        [Bytes.fromByteArray(CROSS_CHAIN_DISPUTE_INCOMING), word(bi(0)), word(bi(1)), word(bi(4))],
        ethereum.encode(ethereum.Value.fromTuple(data))!
      ),
    ]);
    handleDisputeCreation(event);

    assert.fieldEquals("Dispute", "4", "isCrossChain", "true");
    assert.fieldEquals("Dispute", "4", "arbitrableChainId", "100");
    assert.fieldEquals("Dispute", "4", "templateId", "9");
  });

  test("leaves templateId unset when the receipt has no matching request", () => {
    setUpCourt();
    createDispute(0);

    assertFieldUnset("Dispute", "0", "templateId");
    assertFieldUnset("Dispute", "0", "isCrossChain");
  });
});

describe("KlerosCore - handleAppealDecision", () => {
  afterEach(() => {
    clearStore();
  });

  test("opens the next round and adds its votes to the court", () => {
    setUpCourt();
    createDispute(0);
    mockRoundInfo(bi(0), bi(1), new RoundInfo().withVotes(7));
    handleAppealDecision(createAppealDecisionEvent(bi(0), ARBITRABLE));

    assert.fieldEquals("Dispute", "0", "currentRoundIndex", "1");
    assert.fieldEquals("Dispute", "0", "currentRound", "0-1");
    assert.fieldEquals("Round", "0-0", "isCurrentRound", "false");
    assert.fieldEquals("Round", "0-1", "isCurrentRound", "true");
    assert.fieldEquals("Round", "0-1", "nbVotes", "7");
    assert.fieldEquals("Court", GENERAL_COURT, "numberVotes", "10");
    assert.fieldEquals("CourtCounter", "1-0", "numberVotes", "10");
    assert.fieldEquals("Court", GENERAL_COURT, "numberDisputes", "1");
  });

  test("ignores an unknown dispute", () => {
    handleAppealDecision(createAppealDecisionEvent(bi(3), ARBITRABLE));

    assert.entityCount("Round", 0);
  });
});

describe("KlerosCore - handleDraw", () => {
  afterEach(() => {
    clearStore();
  });

  test("creates the draw and adds the dispute to the juror", () => {
    setUpCourt();
    createDispute(0, new RoundInfo().withVotes(2));
    seedUser(JUROR_A);
    draw(JUROR_A, 0);

    const juror = JUROR_A.toHexString();
    assert.fieldEquals("Draw", "0-0-0", "juror", juror);
    assert.fieldEquals("Draw", "0-0-0", "round", "0-0");
    assert.fieldEquals("Draw", "0-0-0", "dispute", "0");
    assert.fieldEquals("Draw", "0-0-0", "voteIDNum", "0");
    assert.fieldEquals("Draw", "0-0-0", "drawNotificationIndex", "0");
    assert.fieldEquals("User", juror, "disputes", "[0]");
    assert.fieldEquals("User", juror, "activeDisputes", "1");
    assert.fieldEquals("User", juror, "totalDisputes", "1");
    assert.fieldEquals("JurorTokensPerCourt", `${juror}-1`, "locked", "1000");
    assert.fieldEquals("Round", "0-0", "jurorsDrawn", "false");
  });

  test("counts a juror drawn twice in the same dispute once", () => {
    setUpCourt();
    createDispute(0, new RoundInfo().withVotes(3));
    seedUser(JUROR_A);
    draw(JUROR_A, 0);
    draw(JUROR_A, 1);

    const juror = JUROR_A.toHexString();
    assert.fieldEquals("User", juror, "activeDisputes", "1");
    assert.fieldEquals("User", juror, "totalDisputes", "1");
    assert.fieldEquals("PeriodIndexCounter", "draw", "counter", "1");
  });

  test("marks the round drawn once every vote has a juror", () => {
    setUpCourt();
    createDispute(0, new RoundInfo().withVotes(2));
    draw(JUROR_A, 0);
    draw(JUROR_B, 1);

    assert.entityCount("Draw", 2);
    assert.fieldEquals("Round", "0-0", "jurorsDrawn", "true");
  });
});

describe("KlerosCore - handleRuling", () => {
  afterEach(() => {
    clearStore();
  });

  test("marks the dispute ruled, reads the executed flag and closes it in the court", () => {
    setUpCourt();
    createDispute(0);
    mockDisputes(bi(0), bi(1), 4, true, true);
    handleRuling(createRulingEvent(ARBITRABLE, bi(0), bi(1)));

    assert.fieldEquals("Dispute", "0", "ruled", "true");
    assert.fieldEquals("Dispute", "0", "executed", "true");
    assert.fieldEquals("Dispute", "0", "rulingTimestamp", DAY_1.toString());
    assert.fieldEquals("Court", GENERAL_COURT, "numberClosedDisputes", "1");
    assert.fieldEquals("Counter", "0", "casesRuled", "1");
  });

  test("still records the ruling when KlerosCore.disputes reverts", () => {
    setUpCourt();
    createDispute(0);
    mockDisputesReverts(bi(0));
    handleRuling(createRulingEvent(ARBITRABLE, bi(0), bi(1)));

    assert.fieldEquals("Dispute", "0", "ruled", "true");
    assert.fieldEquals("Dispute", "0", "executed", "false");
  });
});
