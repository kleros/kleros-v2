import { keccak256, encodeAbiParameters, toBytes, maxUint256, IntegerOutOfRangeError } from "viem";
import { describe, it, expect } from "vitest";

import { hashVote } from "./hashVote";

describe("hashVote", () => {
  describe("without justification", () => {
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
  });

  describe("with justification", () => {
    it("should hash choice, salt, and justification correctly", () => {
      const choice = 1n;
      const salt = 123456789n;
      const justification = "This is my justification";

      const result = hashVote(choice, salt, justification);

      const justificationHash = keccak256(toBytes(justification));
      const expectedEncoded = encodeAbiParameters(
        [{ type: "uint256" }, { type: "uint256" }, { type: "bytes32" }],
        [choice, salt, justificationHash]
      );
      const expectedHash = keccak256(expectedEncoded);

      expect(result).toBe(expectedHash);
    });

    it("should produce different hashes for different justifications", () => {
      const choice = 1n;
      const salt = 100n;

      const hash1 = hashVote(choice, salt, "Justification A");
      const hash2 = hashVote(choice, salt, "Justification B");

      expect(hash1).not.toBe(hash2);
    });

    it("should produce different hash than without justification", () => {
      const choice = 1n;
      const salt = 100n;
      const justification = "Some justification";

      const hashWithout = hashVote(choice, salt);
      const hashWith = hashVote(choice, salt, justification);

      expect(hashWithout).not.toBe(hashWith);
    });

    it("should handle empty string justification differently than undefined", () => {
      const choice = 1n;
      const salt = 100n;

      const hashNoJustification = hashVote(choice, salt);
      const hashEmptyJustification = hashVote(choice, salt, "");

      expect(hashNoJustification).not.toBe(hashEmptyJustification);
    });

    it("hashes justification as bytes32, not as abi string", () => {
      const choice = 1n;
      const salt = 1n;
      const justification = "abc";

      const hash = hashVote(choice, salt, justification);

      const wrongEncoded = encodeAbiParameters(
        [{ type: "uint256" }, { type: "uint256" }, { type: "string" }],
        [choice, salt, justification]
      );

      expect(hash).not.toBe(keccak256(wrongEncoded));
    });
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

    it("should handle unicode justification", () => {
      const result = hashVote(1n, 100n, "这是中文 🎉 émoji");
      expect(result).toMatch(/^0x[a-fA-F0-9]{64}$/);
    });

    it("produces deterministic hash for same unicode justification", () => {
      const j = "这是中文 🎉 émoji";

      const h1 = hashVote(1n, 1n, j);
      const h2 = hashVote(1n, 1n, j);

      expect(h1).toBe(h2);
    });

    it("should throw on negative choice", () => {
      const choice = -1n;
      const salt = 123456789n;

      expect(() => hashVote(choice, salt)).toThrow(IntegerOutOfRangeError);
    });
  });
});
