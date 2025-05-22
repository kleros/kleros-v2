import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll,
  createMockedFunction,
  logStore, // Useful for debugging
} from "matchstick-as/assembly/index";
import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { KlerosCore, AppealDecision } from "../generated/KlerosCore/KlerosCore";
import { Court, Dispute, Round } from "../generated/schema";
import { handleAppealDecision } from "../src/KlerosCore";
import { createAppealDecisionEvent } from "./kleros-core-utils"; // Helper created in previous step
import { ZERO, ONE } from "../src/utils"; // Assuming these are exported from utils

// Default contract address for KlerosCore mock
const KLEROS_CORE_ADDRESS = Address.fromString("0x0000000000000000000000000000000000000001");
const ARBITRABLE_ADDRESS = Address.fromString("0x0000000000000000000000000000000000000002");
const DISPUTE_ID = BigInt.fromI32(0);
const COURT_ID = "0"; // String ID for Court

describe("KlerosCore - handleAppealDecision", () => {
  beforeAll(() => {
    clearStore(); // Ensure a clean state

    // 1. Create and save a Court entity
    let court = new Court(COURT_ID);
    court.hiddenVotes = false;
    court.minStake = BigInt.fromI32(100);
    court.alpha = BigInt.fromI32(1000);
    court.feeForJuror = BigInt.fromI32(10);
    court.jurorsForCourtJump = BigInt.fromI32(3);
    court.timesPerPeriod = [
      BigInt.fromI32(100),
      BigInt.fromI32(100),
      BigInt.fromI32(100),
      BigInt.fromI32(100),
      BigInt.fromI32(100),
    ];
    court.supportedDisputeKits = ["1"];
    court.numberDisputes = ZERO;
    court.numberClosedDisputes = ZERO;
    court.numberAppealingDisputes = ZERO;
    court.numberVotingDisputes = ZERO;
    court.frozenToken = ZERO;
    court.activeJurors = ZERO;
    court.inactiveJurors = ZERO;
    court.drawnJurors = ZERO;
    court.tokenStaked = ZERO;
    court.totalCoherentJurors = ZERO;
    court.totalResolvedDisputes = ZERO;
    court.appealPeriod = [ZERO,ZERO,ZERO,ZERO];
    court.numberCoherentVotes = ZERO;
    court.numberIncoherentVotes = ZERO;
    court.disputesWithoutVotes = ZERO;
    court.numberDelayedStakes = ZERO;
    court.delayedStakeAmount = ZERO;
    court.totalStake = ZERO;
    court.numberVotes = ZERO; // Will be updated
    court.save();

    // 2. Create and save a Dispute entity
    let dispute = new Dispute(DISPUTE_ID.toString());
    dispute.court = COURT_ID;
    dispute.arbitrable = ARBITRABLE_ADDRESS.toHexString();
    dispute.numberOfChoices = BigInt.fromI32(2);
    dispute.period = "evidence";
    dispute.lastPeriodChange = BigInt.fromI32(1000);
    dispute.lastPeriodChangeBlockNumber = BigInt.fromI32(1);
    dispute.periodNotificationIndex = ZERO;
    dispute.periodDeadline = BigInt.fromI32(1100);
    dispute.drawsInRound = ZERO;
    dispute.commitsInRound = ZERO;
    dispute.currentRuling = ZERO;
    dispute.tied = true;
    dispute.overridden = false;
    dispute.currentRoundIndex = ZERO; // Starts at round 0
    dispute.currentRound = `${DISPUTE_ID.toString()}-0`; // Initial round ID
    dispute.creator = Address.fromString("0x0000000000000000000000000000000000000003").toHexString();
    dispute.subcourtID = ZERO;
    dispute.category = ZERO;
    dispute.jurors = [];
    dispute.rewardsFund = ZERO;
    dispute.totalFeesForJurors = ZERO;
    dispute.totalStaked = ZERO;
    dispute.rounds = [];
    dispute.ruled = false;
    dispute.save();

    // 3. Create and save an initial Round entity (round0)
    let round0ID = `${DISPUTE_ID.toString()}-0`;
    let round0 = new Round(round0ID);
    round0.dispute = DISPUTE_ID.toString();
    round0.disputeKit = "1"; // Assume classic
    round0.court = COURT_ID;
    round0.pnkAtStake = BigInt.fromI32(1000);
    round0.raisedSoFar = BigInt.fromI32(500);
    round0.feeForJuror = BigInt.fromI32(10);
    round0.drawnJurors = []; // Initialize as empty
    round0.nbVotes = BigInt.fromI32(3); // Number of votes for this round
    round0.repartitions = ZERO;
    round0.totalAmount = BigInt.fromI32(1500);
    round0.deadline = BigInt.fromI32(1200);
    round0.isCurrentRound = true; // Crucial for the test
    round0.jurorsDrawn = false;
    round0.jurorRewardsDispersed = false;
    round0.winningChoice = ZERO;
    round0.tied = true;
    round0.totalVoted = ZERO;
    round0.fundedChoices = [];
    round0.save();

    // Link round0 to dispute's rounds array (if you store it like that)
    dispute.rounds = dispute.rounds.concat([round0.id]);
    dispute.save();


    // 4. Mock contract calls
    // Mock KlerosCore.bind()
    createMockedFunction(KLEROS_CORE_ADDRESS, "bind", "bind(address):(address)")
      .withArgs([ethereum.Value.fromAddress(KLEROS_CORE_ADDRESS)])
      .returns([ethereum.Value.fromAddress(KLEROS_CORE_ADDRESS)]);

    // Mock contract.disputes(disputeID)
    // disputes(uint256) returns (address,uint128,uint128,uint16,uint256,uint8,uint8)
    // (courtID, firstRoundID, lastRoundID, numberOfAppeals, jurorsNumber, jurorsForJump, arbitrableChainID)
    // We only care about courtID for this handler, which is disputeStorage.value0
    let disputeTuple = new ethereum.Tuple();
    disputeTuple.push(ethereum.Value.fromUnsignedBigInt(BigInt.fromString(COURT_ID))); // courtID (value0)
    disputeTuple.push(ethereum.Value.fromUnsignedBigInt(ZERO)); // firstRoundID
    disputeTuple.push(ethereum.Value.fromUnsignedBigInt(ZERO)); // lastRoundID
    disputeTuple.push(ethereum.Value.fromUnsignedBigInt(ZERO)); // numberOfAppeals
    disputeTuple.push(ethereum.Value.fromUnsignedBigInt(ZERO)); // jurorsNumber
    disputeTuple.push(ethereum.Value.fromI32(0)); // jurorsForJump (uint8)
    disputeTuple.push(ethereum.Value.fromI32(0)); // arbitrableChainID (uint8)

    createMockedFunction(KLEROS_CORE_ADDRESS, "disputes", "disputes(uint256):(uint256,uint128,uint128,uint16,uint256,uint8,uint8)")
      .withArgs([ethereum.Value.fromUnsignedBigInt(DISPUTE_ID)])
      .returns([ethereum.Value.fromTuple(disputeTuple)]);

    // Mock contract.getRoundInfo(disputeID, newRoundIndex) for the *new* round (round 1)
    // getRoundInfo(uint256,uint256) returns (uint256,uint256,uint256,address[],uint256,uint256,uint256,uint256)
    // (pnkAtStake, raisedSoFar, feeForJuror, drawnJurors, nbVotes, repartitions, totalAmount, deadline)
    let newRoundIndex = ONE;
    let roundInfoTuple = new ethereum.Tuple();
    roundInfoTuple.push(ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(2000))); // pnkAtStake for round 1
    roundInfoTuple.push(ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1000))); // raisedSoFar for round 1
    roundInfoTuple.push(ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(20)));    // feeForJuror for round 1
    roundInfoTuple.push(ethereum.Value.fromAddressArray([]));                      // drawnJurors for round 1
    roundInfoTuple.push(ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(5)));    // nbVotes for round 1 (IMPORTANT for court.numberVotes update)
    roundInfoTuple.push(ethereum.Value.fromUnsignedBigInt(ZERO));                  // repartitions for round 1
    roundInfoTuple.push(ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(3000))); // totalAmount for round 1
    roundInfoTuple.push(ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(2000)));  // deadline for round 1

    createMockedFunction(KLEROS_CORE_ADDRESS, "getRoundInfo", "getRoundInfo(uint256,uint256):(uint256,uint256,uint256,address[],uint256,uint256,uint256,uint256)")
      .withArgs([
        ethereum.Value.fromUnsignedBigInt(DISPUTE_ID),
        ethereum.Value.fromUnsignedBigInt(newRoundIndex) // newRoundIndex will be 1
      ])
      .returns([ethereum.Value.fromTuple(roundInfoTuple)]);
  });

  afterAll(() => {
    clearStore();
  });

  test("Should correctly update rounds on appeal decision", () => {
    // 1. Create AppealDecision event
    let appealTime = BigInt.fromI32(1500);
    let appealBlock = BigInt.fromI32(10);
    let appealLogIndex = BigInt.fromI32(1);
    let appealEvent = createAppealDecisionEvent(
      DISPUTE_ID,
      ARBITRABLE_ADDRESS,
      appealBlock,
      appealTime,
      appealLogIndex
    );
    appealEvent.address = KLEROS_CORE_ADDRESS; // Set the event address to match mocked contract

    // Store initial court votes
    let court = Court.load(COURT_ID)!;
    let initialCourtVotes = court.numberVotes;

    // 2. Call handleAppealDecision
    handleAppealDecision(appealEvent);

    // 3. Assertions
    // Assert round0.isCurrentRound is false
    let round0ID = `${DISPUTE_ID.toString()}-0`;
    assert.fieldEquals("Round", round0ID, "isCurrentRound", "false");

    // Load the Dispute
    let dispute = Dispute.load(DISPUTE_ID.toString())!;
    assert.assertNotNull(dispute);

    // Assert dispute.currentRoundIndex == ONE
    assert.bigIntEquals(ONE, dispute.currentRoundIndex);

    // Assert a new Round (round1) is created and isCurrentRound is true
    let round1ID = `${DISPUTE_ID.toString()}-1`;
    assert.entityCount("Round", 2); // round0 and round1
    assert.fieldEquals("Round", round1ID, "isCurrentRound", "true");
    assert.fieldEquals("Round", round1ID, "dispute", DISPUTE_ID.toString());
    assert.fieldEquals("Round", round1ID, "court", COURT_ID);
    // Check some values from mocked getRoundInfo for round1
    assert.fieldEquals("Round", round1ID, "pnkAtStake", "2000");
    assert.fieldEquals("Round", round1ID, "raisedSoFar", "1000");
    assert.fieldEquals("Round", round1ID, "feeForJuror", "20");
    assert.fieldEquals("Round", round1ID, "nbVotes", "5"); // From mocked getRoundInfo for new round

    // Assert dispute.currentRound points to round1
    assert.stringEquals(round1ID, dispute.currentRound);

    // Assert court.numberVotes has been updated
    // Initial court votes + nbVotes from new round (mocked as 5)
    let expectedCourtVotes = initialCourtVotes.plus(BigInt.fromI32(5));
    assert.fieldEquals("Court", COURT_ID, "numberVotes", expectedCourtVotes.toString());

    // Optional: Log store to see entities - useful for debugging
    // logStore();
  });
});
