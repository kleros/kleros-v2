import { describe, expect, it } from "vitest";

import { formatTimeLeft } from "./date";

const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

describe("formatTimeLeft", () => {
  it("shows the two largest units", () => {
    expect(formatTimeLeft(2 * DAY + 5 * HOUR + 12 * MINUTE)).toBe("2d 5h");
    expect(formatTimeLeft(5 * HOUR + 12 * MINUTE + 30)).toBe("5h 12m");
    expect(formatTimeLeft(12 * MINUTE + 30)).toBe("12m 30s");
    expect(formatTimeLeft(30)).toBe("30s");
    expect(formatTimeLeft(0)).toBe("0s");
  });

  it("uses the units of the locale", () => {
    expect(formatTimeLeft(2 * DAY + 5 * HOUR, "fr")).toBe("2j 5h");
    expect(formatTimeLeft(12 * MINUTE + 30, "es")).toBe("12min 30s");
  });
});
