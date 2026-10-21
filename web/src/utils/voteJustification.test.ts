import { describe, expect, it } from "vitest";

import { isVoteJustificationSufficient, MIN_VOTE_JUSTIFICATION_LENGTH } from "./voteJustification";

describe("isVoteJustificationSufficient", () => {
  it("requires at least 100 characters", () => {
    expect(MIN_VOTE_JUSTIFICATION_LENGTH).toBe(100);
  });

  it("rejects an empty justification", () => {
    expect(isVoteJustificationSufficient("")).toBe(false);
  });

  it("rejects a justification one character short of the minimum", () => {
    expect(isVoteJustificationSufficient("a".repeat(99))).toBe(false);
  });

  it("accepts a justification of exactly the minimum length", () => {
    expect(isVoteJustificationSufficient("a".repeat(100))).toBe(true);
  });

  it("ignores surrounding whitespace when counting", () => {
    expect(isVoteJustificationSufficient(`   ${"a".repeat(99)}   `)).toBe(false);
    expect(isVoteJustificationSufficient(" ".repeat(200))).toBe(false);
  });
});
