import { describe, it, expect } from "vitest";

import { findCurrentLocalRound } from "./getLocalRounds";

const rounds = (...ids: string[]) => ids.map((id) => ({ id }));

describe("findCurrentLocalRound", () => {
  it("should match the current round by id, not by position", () => {
    const localRounds = rounds("1-5-0", "1-5-1", "1-5-10", "1-5-2", "1-5-9");

    const result = findCurrentLocalRound([{ id: "1-5", currentLocalRoundIndex: "10", timestamp: "1", localRounds }]);

    expect(result).toEqual({ id: "1-5-10" });
  });

  it("should use the latest dispute kit dispute", () => {
    const result = findCurrentLocalRound([
      { id: "1-5", currentLocalRoundIndex: "2", timestamp: "200", localRounds: rounds("1-5-2") },
      { id: "2-5", currentLocalRoundIndex: "1", timestamp: "100", localRounds: rounds("2-5-0", "2-5-1") },
    ]);

    expect(result).toEqual({ id: "1-5-2" });
  });

  it("should return undefined without dispute kit disputes", () => {
    expect(findCurrentLocalRound(undefined)).toBeUndefined();
    expect(findCurrentLocalRound([])).toBeUndefined();
  });
});
