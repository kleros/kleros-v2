import { keccak256, encodeAbiParameters, maxUint256, IntegerOutOfRangeError } from "viem";
import { describe, it, expect } from "vitest";

import { hashVote } from "./hashVote";

describe("hashVote", () => {
  it("should hash choice and salt correctly", () => {
    const choice = 1n;
    const salt = 123456789n;

    const result = hashVote(choice, salt);

    const expectedEncoded = encodeAbiParameters([{ type: "uint256" }, { type: "uint256" }], [choice, salt]);
    const expectedHash = keccak256(expectedEncoded);

    expect(result).toBe(expectedHash);
  });

  it("should produce different hashes for different choices", () => {
    const salt = 123456789n;

    const hash1 = hashVote(0n, salt);
    const hash2 = hashVote(1n, salt);
    const hash3 = hashVote(2n, salt);

    expect(hash1).not.toBe(hash2);
    expect(hash2).not.toBe(hash3);
    expect(hash1).not.toBe(hash3);
  });

  it("should produce different hashes for different salts", () => {
    const choice = 1n;

    const hash1 = hashVote(choice, 111n);
    const hash2 = hashVote(choice, 222n);

    expect(hash1).not.toBe(hash2);
  });

  it("should produce consistent hashes for same inputs", () => {
    const choice = 1n;
    const salt = 999n;

    const hash1 = hashVote(choice, salt);
    const hash2 = hashVote(choice, salt);

    expect(hash1).toBe(hash2);
  });

  it("should return a valid hex string starting with 0x", () => {
    const result = hashVote(1n, 100n);

    expect(result).toMatch(/^0x[a-fA-F0-9]{64}$/);
  });

  describe("edge cases", () => {
    it("should handle zero choice", () => {
      const result = hashVote(0n, 100n);
      expect(result).toMatch(/^0x[a-fA-F0-9]{64}$/);
    });

    it("should produce deterministic hash for Maximum uint", () => {
      const largeChoice = maxUint256;
      const largeSalt = BigInt("99999999999999999999999999999999999999999999999999");

      const hash1 = hashVote(largeChoice, largeSalt);
      const hash2 = hashVote(largeChoice, largeSalt);
      expect(hash1).toBe(hash2);
    });

    it("should handle Maximum UINT value", () => {
      const uintMaxChoice = maxUint256;
      const salt = 123456789n;

      const result = hashVote(uintMaxChoice, salt);

      const expectedEncoded = encodeAbiParameters([{ type: "uint256" }, { type: "uint256" }], [uintMaxChoice, salt]);
      const expectedHash = keccak256(expectedEncoded);

      expect(result).toBe(expectedHash);
    });

    it("should produce a valid hex string Maximum UINT value", () => {
      const uintMaxChoice = maxUint256;
      const salt = 123456789n;

      const result = hashVote(uintMaxChoice, salt);

      expect(result).toMatch(/^0x[a-fA-F0-9]{64}$/);
    });

    it("should throw on negative choice", () => {
      const choice = -1n;
      const salt = 123456789n;

      expect(() => hashVote(choice, salt)).toThrow(IntegerOutOfRangeError);
    });
  });
});
