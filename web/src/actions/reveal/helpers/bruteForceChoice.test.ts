import { describe, it, expect } from "vitest";

import type { Answer } from "@kleros/kleros-sdk";

import { hashVote } from "utils/crypto/hashVote";

import { bruteForceChoice } from "./bruteForceChoice";

describe("bruteForceChoice", () => {
  const createCommit = (choice: bigint, salt: `0x${string}`): string => hashVote(choice, BigInt(salt));

  const mockAnswers: Answer[] = [
    { id: "0x0", title: "Refuse To Arbitrate", description: "RTA" },
    { id: "0x1", title: "Option 1", description: "First option" },
    { id: "0x2", title: "Option 2", description: "Second option" },
    { id: "0x3", title: "Option 3", description: "Third option" },
  ];

  describe("successful choice recovery", () => {
    it("should recover choice 0 (Refuse To Arbitrate)", async () => {
      const salt = "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890" as `0x${string}`;
      const commit = createCommit(0n, salt);

      const result = await bruteForceChoice(salt, mockAnswers, commit);

      expect(result).toBe(0n);
    });

    it("should recover choice 1", async () => {
      const salt = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef" as `0x${string}`;
      const commit = createCommit(1n, salt);

      const result = await bruteForceChoice(salt, mockAnswers, commit);

      expect(result).toBe(1n);
    });

    it("should recover choice 2", async () => {
      const salt = "0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321" as `0x${string}`;
      const commit = createCommit(2n, salt);

      const result = await bruteForceChoice(salt, mockAnswers, commit);

      expect(result).toBe(2n);
    });

    it("should recover the last choice in the list", async () => {
      const salt = "0x9999999999999999999999999999999999999999999999999999999999999999" as `0x${string}`;
      const commit = createCommit(3n, salt);

      const result = await bruteForceChoice(salt, mockAnswers, commit);

      expect(result).toBe(3n);
    });
  });

  describe("empty answers handling", () => {
    it("should default to RFA when answers array is empty", async () => {
      const salt = "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890" as `0x${string}`;
      const commit = createCommit(0n, salt);

      const result = await bruteForceChoice(salt, [], commit);

      expect(result).toBe(0n);
    });
  });

  describe("error cases", () => {
    it("should throw error when choice cannot be found", async () => {
      const salt = "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890" as `0x${string}`;
      // Create a commit for choice 99 which doesn't exist in our answer set
      const commit = createCommit(99n, salt);

      await expect(bruteForceChoice(salt, mockAnswers, commit)).rejects.toThrow("Unable to retrieve choice.");
    });

    it("should throw when commit doesn't match any answer", async () => {
      const salt = "0x1111111111111111111111111111111111111111111111111111111111111111" as `0x${string}`;
      const fakeCommit = "0x0000000000000000000000000000000000000000000000000000000000000000";

      await expect(bruteForceChoice(salt, mockAnswers, fakeCommit)).rejects.toThrow("Unable to retrieve choice.");
    });
  });

  describe("deterministic behavior", () => {
    it("should return same choice for same inputs", async () => {
      const salt = "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890" as `0x${string}`;
      const commit = createCommit(1n, salt);

      const result1 = await bruteForceChoice(salt, mockAnswers, commit);
      const result2 = await bruteForceChoice(salt, mockAnswers, commit);

      expect(result1).toBe(result2);
    });

    it("iterates answers in the given orderh", async () => {
      const salt = "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890" as `0x${string}`;
      const answers: Answer[] = [
        { id: "5", title: "Five", description: "" },
        { id: "1", title: "One", description: "" },
      ];

      const commit = createCommit(1n, salt);

      const result = await bruteForceChoice(salt, answers, commit);
      expect(result).toBe(1n);
    });
  });

  describe("answer format handling", () => {
    it("should handle answers with hex string IDs", async () => {
      const answersWithHexIds: Answer[] = [
        { id: "0x0", title: "A", description: "" },
        { id: "0xa", title: "B", description: "" },
        { id: "0xf", title: "C", description: "" },
      ];

      const salt = "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890" as `0x${string}`;
      const commit = createCommit(10n, salt); // 0xa = 10

      const result = await bruteForceChoice(salt, answersWithHexIds, commit);

      expect(result).toBe(10n);
    });

    it("should handle answers with numeric string IDs", async () => {
      const answersWithNumericIds: Answer[] = [
        { id: "0", title: "A", description: "" },
        { id: "1", title: "B", description: "" },
        { id: "2", title: "C", description: "" },
      ];

      const salt = "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890" as `0x${string}`;
      const commit = createCommit(2n, salt);

      const result = await bruteForceChoice(salt, answersWithNumericIds, commit);

      expect(result).toBe(2n);
    });
  });
});
