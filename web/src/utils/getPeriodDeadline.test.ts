import { describe, expect, it } from "vitest";

import { Periods } from "consts/periods";

import { getPeriodDeadline } from "./getPeriodDeadline";

const TIMES_PER_PERIOD = ["100", "200", "300", "400"];

describe("getPeriodDeadline", () => {
  it("adds the current period's duration to the last period change", () => {
    expect(getPeriodDeadline(Periods.evidence, "1000", TIMES_PER_PERIOD)).toBe(1100);
    expect(getPeriodDeadline(Periods.commit, "1000", TIMES_PER_PERIOD)).toBe(1200);
    expect(getPeriodDeadline(Periods.vote, "1000", TIMES_PER_PERIOD)).toBe(1300);
    expect(getPeriodDeadline(Periods.appeal, "1000", TIMES_PER_PERIOD)).toBe(1400);
  });

  it("has no deadline in the execution period", () => {
    expect(getPeriodDeadline(Periods.execution, "1000", TIMES_PER_PERIOD)).toBeUndefined();
  });

  it("has no deadline while the data is missing", () => {
    expect(getPeriodDeadline(Periods.vote, undefined, TIMES_PER_PERIOD)).toBeUndefined();
    expect(getPeriodDeadline(Periods.vote, "1000", undefined)).toBeUndefined();
    expect(getPeriodDeadline(Periods.vote, "1000", [])).toBeUndefined();
  });

  it("has no deadline when the period never ends in practice", () => {
    const maxUint256 = (2n ** 256n - 1n).toString();
    expect(getPeriodDeadline(Periods.vote, "1000", ["100", "200", maxUint256, "400"])).toBeUndefined();
  });

  it("has no deadline when the data is not numeric", () => {
    expect(getPeriodDeadline(Periods.vote, "", TIMES_PER_PERIOD)).toBeUndefined();
    expect(getPeriodDeadline(Periods.vote, "1000", ["100", "200", "abc", "400"])).toBeUndefined();
  });
});
