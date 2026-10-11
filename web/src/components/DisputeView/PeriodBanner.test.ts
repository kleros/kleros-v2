import { describe, it, expect } from "vitest";

import { Periods } from "consts/periods";

import { lightTheme } from "styles/themes";

import { getPeriodPhrase } from "./DisputeInfo";
import { getPeriodColors, getPeriodLabel } from "./PeriodBanner";

import { getPeriodEndTimestamp } from "./index";

const t = (key: string) => key;

describe("getPeriodLabel", () => {
  it.each([
    [Periods.evidence, "case_status.in_progress_submitting_evidence", "case_status.submitting_evidence"],
    [Periods.commit, "case_status.in_progress_committing_vote", "case_status.committing_vote"],
    [Periods.vote, "case_status.in_progress_voting", "case_status.voting"],
    [Periods.appeal, "case_status.crowdfunding_appeal", "case_status.crowdfunding_appeal"],
    [Periods.execution, "case_status.closed", "case_status.closed"],
    [99 as Periods, "case_status.in_progress", "case_status.in_progress"],
  ])("period %i: verbose %s, short %s", (period, verbose, short) => {
    expect(getPeriodLabel(period, true, t)).toBe(verbose);
    expect(getPeriodLabel(period, false, t)).toBe(short);
  });
});

describe("getPeriodColors", () => {
  it.each([
    [Periods.appeal, [lightTheme.tint, lightTheme.tintMedium]],
    [Periods.execution, [lightTheme.secondaryPurple, lightTheme.mediumPurple]],
    [Periods.evidence, [lightTheme.primaryBlue, lightTheme.mediumBlue]],
    [Periods.vote, [lightTheme.primaryBlue, lightTheme.mediumBlue]],
  ])("period %i uses [front, background] %j", (period, colors) => {
    expect(getPeriodColors(period, lightTheme)).toEqual(colors);
  });
});

describe("getPeriodPhrase", () => {
  it.each([
    [Periods.evidence, "dispute_info.voting_starts"],
    [Periods.commit, "dispute_info.voting_deadline"],
    [Periods.vote, "dispute_info.voting_deadline"],
    [Periods.appeal, "dispute_info.appeal_deadline"],
    [Periods.execution, "dispute_info.final_decision"],
  ])("period %i -> %s", (period, key) => {
    expect(getPeriodPhrase(period, t)).toBe(key);
  });
});

describe("getPeriodEndTimestamp", () => {
  it("adds the current period duration to the last period change", () => {
    expect(getPeriodEndTimestamp("1000", Periods.vote, ["10", "20", "30", "40", "50"])).toBe(1030);
  });
});
