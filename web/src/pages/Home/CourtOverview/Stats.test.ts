import { describe, it, expect } from "vitest";

import type { HomePageQuery } from "src/graphql/graphql";

import { getLastOrZero } from "./Stats";

describe("getLastOrZero", () => {
  it("reads the stat from the latest counter, defaulting to 0", () => {
    const counters = [{ cases: "1" }, { cases: "7" }] as unknown as HomePageQuery["counters"];
    expect(getLastOrZero(counters, "cases")).toBe("7");
    expect(getLastOrZero([], "cases")).toBe("0");
  });
});
