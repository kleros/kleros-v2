import { afterEach, assert, clearStore, describe, test } from "matchstick-as/assembly/index";
import { BigInt } from "@graphprotocol/graph-ts";
import { ensureArbitrable, updateArbitrableCases } from "../src/entities/Arbitrable";
import { getAndIncrementPeriodCounter } from "../src/entities/PeriodIndexCounter";
import { getFeeForJuror, updateEffectiveStake } from "../src/entities/Court";
import { ensureAnswer, updateCountsAndGetCurrentRuling } from "../src/entities/ClassicRound";
import { ensureClassicVote } from "../src/entities/ClassicVote";
import { ensureJurorTokensPerCourt, updateJurorEffectiveStake } from "../src/entities/JurorTokensPerCourt";
import { updateRoundTimeline } from "../src/entities/Round";
import { seedClassicRound, seedCourt, seedDispute, seedDisputeInCourt } from "./utils/entities";
import { bi, CHILD_COURT, GENERAL_COURT, JUROR_A } from "./utils/constants";

const juror = JUROR_A.toHexString();

describe("entities/Arbitrable", () => {
  afterEach(() => {
    clearStore();
  });

  test("ensureArbitrable returns an unsaved zeroed entity", () => {
    const arbitrable = ensureArbitrable("0xabc");

    assert.bigIntEquals(BigInt.zero(), arbitrable.totalDisputes);
    assert.entityCount("Arbitrable", 0);
  });

  test("updateArbitrableCases accumulates", () => {
    updateArbitrableCases("0xabc", bi(1));
    updateArbitrableCases("0xabc", bi(2));

    assert.fieldEquals("Arbitrable", "0xabc", "totalDisputes", "3");
  });
});

describe("entities/PeriodIndexCounter", () => {
  afterEach(() => {
    clearStore();
  });

  test("returns the previous value and increments per key", () => {
    assert.bigIntEquals(bi(0), getAndIncrementPeriodCounter("vote"));
    assert.bigIntEquals(bi(1), getAndIncrementPeriodCounter("vote"));
    assert.bigIntEquals(bi(0), getAndIncrementPeriodCounter("appeal"));
    assert.fieldEquals("PeriodIndexCounter", "vote", "counter", "2");
  });
});

describe("entities/Court", () => {
  afterEach(() => {
    clearStore();
  });

  test("updateEffectiveStake applies the delta to the court and every ancestor", () => {
    seedCourt(GENERAL_COURT);
    seedCourt(CHILD_COURT, GENERAL_COURT);
    seedCourt("3", CHILD_COURT);
    updateEffectiveStake("3", bi(40));

    assert.fieldEquals("Court", "3", "effectiveStake", "40");
    assert.fieldEquals("Court", CHILD_COURT, "effectiveStake", "40");
    assert.fieldEquals("Court", GENERAL_COURT, "effectiveStake", "40");
  });

  test("getFeeForJuror returns the court fee or zero", () => {
    seedCourt(GENERAL_COURT);

    assert.bigIntEquals(bi(100), getFeeForJuror(GENERAL_COURT));
    assert.bigIntEquals(bi(0), getFeeForJuror("42"));
  });
});

describe("entities/JurorTokensPerCourt", () => {
  afterEach(() => {
    clearStore();
  });

  test("ensureJurorTokensPerCourt creates a zeroed row once", () => {
    ensureJurorTokensPerCourt(juror, GENERAL_COURT);
    ensureJurorTokensPerCourt(juror, GENERAL_COURT);

    assert.entityCount("JurorTokensPerCourt", 1);
    assert.fieldEquals("JurorTokensPerCourt", `${juror}-1`, "staked", "0");
    assert.fieldEquals("JurorTokensPerCourt", `${juror}-1`, "court", GENERAL_COURT);
  });

  test("updateJurorEffectiveStake counts the juror in each ancestor while the stake is positive", () => {
    seedCourt(GENERAL_COURT);
    seedCourt(CHILD_COURT, GENERAL_COURT);
    updateJurorEffectiveStake(juror, CHILD_COURT, bi(10));
    updateJurorEffectiveStake(juror, CHILD_COURT, bi(5));

    assert.fieldEquals("Court", GENERAL_COURT, "effectiveNumberStakedJurors", "1");
    assert.fieldEquals("JurorTokensPerCourt", `${juror}-1`, "effectiveStake", "15");

    updateJurorEffectiveStake(juror, CHILD_COURT, bi(-15));

    assert.fieldEquals("Court", CHILD_COURT, "effectiveNumberStakedJurors", "0");
    assert.fieldEquals("Court", GENERAL_COURT, "effectiveNumberStakedJurors", "0");
  });
});

describe("entities/ClassicRound", () => {
  afterEach(() => {
    clearStore();
  });

  test("ensureAnswer returns an unsaved zeroed answer", () => {
    const answer = ensureAnswer("1-0-0", bi(2));

    assert.bigIntEquals(bi(2), answer.answerId);
    assert.bigIntEquals(bi(0), answer.count);
    assert.entityCount("Answer", 0);
  });

  test("updateCountsAndGetCurrentRuling keeps the earlier leader on a tie and reports it", () => {
    seedClassicRound("1", "0", 0);
    updateCountsAndGetCurrentRuling("1-0-0", bi(1), bi(1));
    const info = updateCountsAndGetCurrentRuling("1-0-0", bi(2), bi(1));

    assert.bigIntEquals(bi(1), info.ruling);
    assert.assertTrue(info.tied);
    assert.fieldEquals("ClassicRound", "1-0-0", "totalVoted", "2");
  });

  test("updateCountsAndGetCurrentRuling for an unknown round returns ruling 0, not tied", () => {
    const info = updateCountsAndGetCurrentRuling("9-9-9", bi(1), bi(1));

    assert.bigIntEquals(bi(0), info.ruling);
    assert.assertTrue(!info.tied);
    assert.entityCount("Answer", 0);
  });
});

describe("entities/ClassicVote", () => {
  afterEach(() => {
    clearStore();
  });

  test("ensureClassicVote links the draw of the dispute's current round", () => {
    const dispute = seedDispute("0", GENERAL_COURT, "vote", 1);
    ensureClassicVote("1-0-1", juror, bi(3), dispute);

    assert.fieldEquals("ClassicVote", "1-0-1-3", "draw", "0-1-3");
    assert.fieldEquals("ClassicVote", "1-0-1-3", "voted", "false");
  });

  test("ensureClassicVote returns the stored vote", () => {
    const dispute = seedDispute("0");
    const vote = ensureClassicVote("1-0-0", juror, bi(0), dispute);
    vote.voted = true;
    vote.save();

    assert.assertTrue(ensureClassicVote("1-0-0", juror, bi(0), dispute).voted);
  });
});

describe("entities/Round", () => {
  afterEach(() => {
    clearStore();
  });

  test("updateRoundTimeline stamps the period the dispute is leaving", () => {
    seedDisputeInCourt("0", "vote");
    updateRoundTimeline("0", "appeal", bi(77));

    assert.fieldEquals("Round", "0-0", "timeline", "[0, 0, 77, 0]");
  });

  test("updateRoundTimeline ignores an unknown dispute", () => {
    updateRoundTimeline("5", "vote", bi(77));

    assert.entityCount("Round", 0);
  });
});
