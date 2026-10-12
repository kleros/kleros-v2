import { describe, it, expect } from "vitest";

import { getDeadline } from "./Timeline";

describe("Timeline getDeadline", () => {
  const times = ["100", "200", "300", "400", "500"];

  it("is the last period change plus the current period duration", () => {
    expect(getDeadline(2, "1000", times)).toBe(1300);
  });

  it("is 0 when the data is missing or the index is past the last period", () => {
    expect(getDeadline(0)).toBe(0);
    expect(getDeadline(0, "1000")).toBe(0);
    expect(getDeadline(5, "1000", times)).toBe(0);
  });
});
