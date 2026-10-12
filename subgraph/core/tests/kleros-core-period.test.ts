import { afterEach, assert, clearStore, describe, test } from "matchstick-as/assembly/index";
import { Address, BigInt } from "@graphprotocol/graph-ts";
import { handleNewPeriod } from "../src/KlerosCore";
import { addUserActiveDispute } from "../src/entities/User";
import { ClassicVote } from "../generated/schema";
import { at, createNewPeriodEvent, Period } from "./utils/events";
import { mockCurrentRuling } from "./utils/mocks";
import { seedDisputeInCourt, seedDraw, seedUser } from "./utils/entities";
import { bi, DAY_1, GENERAL_COURT, JUROR_A, JUROR_B, JUROR_C } from "./utils/constants";

function newPeriod(period: Period, timestamp: i64 = DAY_1): void {
  handleNewPeriod(at(createNewPeriodEvent(bi(0), period), timestamp));
}

function seedVote(juror: Address, voteID: i32, choice: i32, voted: boolean = true): void {
  seedDraw("0", 0, voteID, juror);
  const vote = new ClassicVote(`1-0-0-${voteID}`);
  vote.coreDispute = "0";
  vote.localRound = "1-0-0";
  vote.juror = juror.toHexString();
  vote.draw = `0-0-${voteID}`;
  vote.commited = false;
  vote.voted = voted;
  if (voted) vote.choice = BigInt.fromI32(choice);
  vote.save();
}

describe("KlerosCore - handleNewPeriod", () => {
  afterEach(() => {
    clearStore();
  });

  test("moves the dispute to the next period with the round's deadline", () => {
    seedDisputeInCourt("0");
    newPeriod(Period.commit);

    assert.fieldEquals("Dispute", "0", "period", "commit");
    assert.fieldEquals("Dispute", "0", "lastPeriodChange", DAY_1.toString());
    // Round.timesPerPeriod[commit] is 200.
    assert.fieldEquals("Dispute", "0", "periodDeadline", (DAY_1 + 200).toString());
    assert.fieldEquals("Dispute", "0", "periodNotificationIndex", "0");
    assert.fieldEquals("PeriodIndexCounter", "commit", "counter", "1");
    // The timeline records when the period being left ended.
    assert.fieldEquals("Round", "0-0", "timeline", `[${DAY_1.toString()}, 0, 0, 0]`);
  });

  test("counts disputes entering and leaving the vote period", () => {
    seedDisputeInCourt("0");
    newPeriod(Period.vote);

    assert.fieldEquals("Court", GENERAL_COURT, "numberVotingDisputes", "1");
    assert.fieldEquals("Counter", "0", "casesVoting", "1");

    newPeriod(Period.appeal);

    assert.fieldEquals("Court", GENERAL_COURT, "numberVotingDisputes", "0");
    assert.fieldEquals("Court", GENERAL_COURT, "numberAppealingDisputes", "1");
    assert.fieldEquals("Counter", "0", "casesVoting", "0");
    assert.fieldEquals("Counter", "0", "casesAppealing", "1");
  });

  test("an appeal returns the dispute to evidence and stamps the previous round's appeal time", () => {
    seedDisputeInCourt("0", "appeal", 1);
    newPeriod(Period.evidence, DAY_1 + 50);

    assert.fieldEquals("Dispute", "0", "period", "evidence");
    assert.fieldEquals("Court", GENERAL_COURT, "numberAppealingDisputes", "-1");
    assert.fieldEquals("Round", "0-0", "timeline", `[0, 0, 0, ${(DAY_1 + 50).toString()}]`);
    assert.fieldEquals("Round", "0-1", "timeline", "[0, 0, 0, 0]");
  });

  test("execution stores the final ruling and an unbounded deadline", () => {
    seedDisputeInCourt("0", "appeal");
    mockCurrentRuling(bi(0), bi(2), false, true);
    newPeriod(Period.execution);

    assert.fieldEquals("Dispute", "0", "period", "execution");
    assert.fieldEquals("Dispute", "0", "currentRuling", "2");
    assert.fieldEquals("Dispute", "0", "tied", "false");
    assert.fieldEquals("Dispute", "0", "overridden", "true");
    assert.fieldEquals("Dispute", "0", "periodDeadline", "18446744073709551615");
    assert.fieldEquals("Court", GENERAL_COURT, "numberAppealingDisputes", "-1");
  });

  test("execution scores every drawn juror against the final ruling", () => {
    seedDisputeInCourt("0", "appeal");
    seedUser(JUROR_A);
    seedUser(JUROR_B);
    seedUser(JUROR_C);
    seedVote(JUROR_A, 0, 1);
    seedVote(JUROR_B, 1, 2);
    seedVote(JUROR_C, 2, 0, false);
    mockCurrentRuling(bi(0), bi(1), false);
    newPeriod(Period.execution);

    const a = JUROR_A.toHexString();
    const b = JUROR_B.toHexString();
    const c = JUROR_C.toHexString();
    assert.fieldEquals("User", a, "totalResolvedVotes", "1");
    assert.fieldEquals("User", a, "totalCoherentVotes", "1");
    // round(1 / (1 + 10) * 100)
    assert.fieldEquals("User", a, "coherenceScore", "9");
    assert.fieldEquals("User", b, "totalResolvedVotes", "1");
    assert.fieldEquals("User", b, "totalCoherentVotes", "0");
    assert.fieldEquals("User", b, "coherenceScore", "0");
    assert.fieldEquals("User", c, "totalResolvedVotes", "1");
    assert.fieldEquals("User", c, "totalCoherentVotes", "0");
    assert.fieldEquals("Counter", "0", "totalLeaderboardJurors", "3");
  });

  test("ignores an unknown dispute", () => {
    newPeriod(Period.vote);

    assert.entityCount("Dispute", 0);
    assert.entityCount("Counter", 0);
  });

  test(
    "KNOWN BUG: entering the appeal period increments the drawn jurors' totalAppealingDisputes",
    () => {
      seedDisputeInCourt("0", "vote");
      addUserActiveDispute(JUROR_A.toHexString(), "0");
      newPeriod(Period.appeal);

      assert.fieldEquals("User", JUROR_A.toHexString(), "totalAppealingDisputes", "1");
    },
    true
  );
});
