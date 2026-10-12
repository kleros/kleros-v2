import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";

import { T0 } from "src/test/builders";

import {
  formatDate,
  formatDateWithTime,
  getCurrentTime,
  getOneYearAgoTimestamp,
  getTimeLeft,
  secondsToDayHourMinute,
  timeLeftUntil,
} from "./date";

describe("date", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(T0 * 1000);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("getCurrentTime returns whole unix seconds", () => {
    vi.setSystemTime(T0 * 1000 + 999);
    expect(getCurrentTime()).toBe(T0);
  });

  it("getTimeLeft counts down to the deadline and never goes negative", () => {
    expect(getTimeLeft(T0 + 90)).toBe(90);
    expect(getTimeLeft(T0)).toBe(0);
    expect(getTimeLeft(T0 - 90)).toBe(0);
  });

  it("getOneYearAgoTimestamp is 365 days back", () => {
    expect(getOneYearAgoTimestamp()).toBe(T0 - 365 * 24 * 3600);
  });

  it.each([
    [0, "0h 0m 0s"],
    [59, "0h 0m 59s"],
    [3661, "1h 1m 1s"],
    [86399, "23h 59m 59s"],
    [86400, "1d 0h 0m"],
    [2 * 86400 + 5 * 3600 + 30 * 60 + 15, "2d 5h 30m"],
  ])("secondsToDayHourMinute(%d) = %j", (seconds, expected) => {
    expect(secondsToDayHourMinute(seconds)).toBe(expected);
  });

  it("formatDate renders a long date, or a GMT date-time", () => {
    expect(formatDate(T0)).toBe("January 01, 2026");
    // ICU names the zone GMT or UTC depending on the Node build.
    expect(formatDate(T0 + 13 * 3600 + 5 * 60, true)).toMatch(/^Jan 01, 2026, 1:05 PM (GMT|UTC)$/);
  });

  it("formatDateWithTime uses dd/mm/yyyy", () => {
    expect(formatDateWithTime(String(T0))).toBe("01/01/2026, 00:00");
  });

  it.each([
    [-1, "The date has already passed."],
    [1, "in 1 sec"],
    [45, "in 45 secs"],
    [60, "in 1 min"],
    [59 * 60, "in 59 mins"],
    [3600, "in 1 hr"],
    [23 * 3600, "in 23 hrs"],
    [24 * 3600, "in 1 day"],
    [47 * 3600, "in 1 day"],
    [48 * 3600, "after January 3, 2026"],
  ])("timeLeftUntil(now + %ds) = %j", (offset, expected) => {
    expect(timeLeftUntil(new Date((T0 + offset) * 1000).toISOString())).toBe(expected);
  });
});
