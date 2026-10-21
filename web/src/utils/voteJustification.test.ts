import { describe, expect, it } from "vitest";

import {
  getMissingJustificationCharacters,
  isVoteJustificationSufficient,
  MIN_VOTE_JUSTIFICATION_LENGTH,
} from "./voteJustification";

describe("isVoteJustificationSufficient", () => {
  it("requires at least 20 characters for the university court workshops", () => {
    expect(MIN_VOTE_JUSTIFICATION_LENGTH).toBe(20);
  });

  it("rejects an empty justification", () => {
    expect(isVoteJustificationSufficient("")).toBe(false);
  });

  it("rejects a justification one character short of the minimum", () => {
    expect(isVoteJustificationSufficient("a".repeat(19))).toBe(false);
  });

  it("accepts a justification of exactly the minimum length", () => {
    expect(isVoteJustificationSufficient("a".repeat(20))).toBe(true);
  });

  it("ignores surrounding whitespace when counting", () => {
    expect(isVoteJustificationSufficient(`   ${"a".repeat(19)}   `)).toBe(false);
    expect(isVoteJustificationSufficient(" ".repeat(200))).toBe(false);
  });
});

describe("getMissingJustificationCharacters", () => {
  it("returns the full minimum for an empty or whitespace-only justification", () => {
    expect(getMissingJustificationCharacters("")).toBe(20);
    expect(getMissingJustificationCharacters("   ")).toBe(20);
  });

  it("returns how many trimmed characters are still missing", () => {
    expect(getMissingJustificationCharacters(`  ${"a".repeat(5)}  `)).toBe(15);
    expect(getMissingJustificationCharacters("a".repeat(19))).toBe(1);
  });

  it("returns zero once the minimum is reached or exceeded", () => {
    expect(getMissingJustificationCharacters("a".repeat(20))).toBe(0);
    expect(getMissingJustificationCharacters("a".repeat(250))).toBe(0);
  });
});
