import { afterEach, assert, clearStore, describe, test } from "matchstick-as/assembly/index";
import { BigInt } from "@graphprotocol/graph-ts";
import {
  getDelta,
  updateActiveJurors,
  updateCases,
  updateCasesRuled,
  updateCourtCumulativeMetric,
  updateCourtStateVariable,
  updatePaidETH,
  updateStakedPNK,
} from "../src/datapoint";
import { bi, DAY_1, DAY_2 } from "./utils/constants";

const day1 = DAY_1.toString();
const day2 = DAY_2.toString();
const ts1 = BigInt.fromI64(DAY_1 + 3600);
const ts2 = BigInt.fromI64(DAY_2 + 3600);

describe("datapoint - global Counter", () => {
  afterEach(() => {
    clearStore();
  });

  test("getDelta is new minus previous", () => {
    assert.bigIntEquals(bi(-30), getDelta(bi(100), bi(70)));
  });

  test("keeps running totals in Counter 0 and the day's snapshot", () => {
    updateCases(bi(1), ts1);
    updateCases(bi(1), ts1);
    updateStakedPNK(bi(500), ts1);

    assert.fieldEquals("Counter", "0", "cases", "2");
    assert.fieldEquals("Counter", "0", "stakedPNK", "500");
    assert.fieldEquals("Counter", "0", "casesRuled", "0");
    assert.fieldEquals("Counter", day1, "cases", "2");
    assert.fieldEquals("Counter", day1, "stakedPNK", "500");
  });

  test("a new day starts from the running totals", () => {
    updatePaidETH(bi(100), ts1);
    updateActiveJurors(bi(1), ts2);
    updateCasesRuled(bi(1), ts2);

    assert.fieldEquals("Counter", day1, "paidETH", "100");
    assert.fieldEquals("Counter", day1, "activeJurors", "0");
    assert.fieldEquals("Counter", day2, "paidETH", "100");
    assert.fieldEquals("Counter", day2, "activeJurors", "1");
    assert.fieldEquals("Counter", day2, "casesRuled", "1");
    assert.entityCount("Counter", 4);
  });

  test("seeds a zeroed Counter on the 2023-08-08 launch day", () => {
    updateCases(bi(1), ts1);

    assert.fieldEquals("Counter", "1691452800", "cases", "0");
    assert.fieldEquals("Counter", "1691452800", "stakedPNK", "0");
  });
});

describe("datapoint - CourtCounter", () => {
  afterEach(() => {
    clearStore();
  });

  test("updateCourtCumulativeMetric accumulates a metric in the running and daily counters", () => {
    updateCourtCumulativeMetric("1", bi(1), ts1, "numberDisputes");
    updateCourtCumulativeMetric("1", bi(1), ts1, "numberDisputes");

    assert.fieldEquals("CourtCounter", "1-0", "court", "1");
    assert.fieldEquals("CourtCounter", "1-0", "numberDisputes", "2");
    assert.fieldEquals("CourtCounter", "1-0", "numberVotes", "0");
    assert.fieldEquals("CourtCounter", `1-${day1}`, "numberDisputes", "2");
    assert.fieldEquals("CourtCounter", `1-${day1}`, "timestamp", day1);
  });

  test(
    "KNOWN BUG: the first update of a day does not shift the daily counter's other metric",
    () => {
      // handleDisputeCreation updates numberDisputes, then numberVotes.
      updateCourtCumulativeMetric("1", bi(1), ts1, "numberDisputes");
      updateCourtCumulativeMetric("1", bi(3), ts1, "numberVotes");

      assert.fieldEquals("CourtCounter", "1-0", "numberVotes", "3");
      assert.fieldEquals("CourtCounter", `1-${day1}`, "numberVotes", "3");
    },
    true
  );

  test("updateCourtStateVariable overwrites effectiveStake on existing counters", () => {
    updateCourtCumulativeMetric("1", bi(1), ts1, "numberDisputes");
    updateCourtStateVariable("1", bi(700), ts1, "effectiveStake");

    assert.fieldEquals("CourtCounter", "1-0", "effectiveStake", "700");
    assert.fieldEquals("CourtCounter", `1-${day1}`, "effectiveStake", "700");
    assert.fieldEquals("CourtCounter", `1-${day1}`, "numberDisputes", "1");
  });

  test(
    "KNOWN BUG: a new day's CourtCounter carries over every other metric",
    () => {
      updateCourtCumulativeMetric("1", bi(1), ts1, "numberDisputes");
      updateCourtCumulativeMetric("1", bi(3), ts1, "numberVotes");
      updateCourtCumulativeMetric("1", bi(3), ts2, "numberVotes");

      assert.fieldEquals("CourtCounter", `1-${day2}`, "numberVotes", "6");
      assert.fieldEquals("CourtCounter", `1-${day2}`, "numberDisputes", "1");
    },
    true
  );

  test(
    "KNOWN BUG: updateCourtStateVariable saves the running CourtCounter it creates",
    () => {
      updateCourtStateVariable("1", bi(500), ts1, "effectiveStake");

      assert.fieldEquals("CourtCounter", "1-0", "effectiveStake", "500");
    },
    true
  );

  test(
    "KNOWN BUG: updateCourtStateVariable saves the daily CourtCounter it creates",
    () => {
      updateCourtCumulativeMetric("1", bi(1), ts1, "numberDisputes");
      updateCourtStateVariable("1", bi(500), ts2, "effectiveStake");

      assert.fieldEquals("CourtCounter", `1-${day2}`, "effectiveStake", "500");
    },
    true
  );
});
