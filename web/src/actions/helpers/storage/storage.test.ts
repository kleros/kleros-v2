import { maxUint256 } from "viem";
import { describe, it, expect, beforeEach } from "vitest";

import type { CommitData } from "./types";

import { storeCommitData, restoreCommitData, removeCommitData } from "./index";

describe("Storage helpers", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("storeCommitData", () => {
    it("should store commit data in localStorage", () => {
      const key = "test-key";
      const data: CommitData = {
        choice: 1n,
        salt: 123456789n,
      };

      storeCommitData(key, data);

      const stored = localStorage.getItem(key);
      expect(stored).not.toBeNull();

      const parsed = JSON.parse(stored!);
      expect(parsed.choice).toBe("1");
      expect(parsed.salt).toBe("123456789");
    });

    it("should store data with justification", () => {
      const key = "test-key-with-justification";
      const data: CommitData = {
        choice: 2n,
        salt: 999n,
        justification: "This is my reasoning",
      };

      storeCommitData(key, data);

      const stored = localStorage.getItem(key);
      const parsed = JSON.parse(stored!);

      expect(parsed.choice).toBe("2");
      expect(parsed.salt).toBe("999");
      expect(parsed.justification).toBe("This is my reasoning");
    });

    it("should overwrite existing data with same key", () => {
      const key = "overwrite-key";

      storeCommitData(key, { choice: 1n, salt: 100n });
      storeCommitData(key, { choice: 2n, salt: 200n });

      const stored = localStorage.getItem(key);
      const parsed = JSON.parse(stored!);

      expect(parsed.choice).toBe("2");
      expect(parsed.salt).toBe("200");
    });

    it("should handle large bigint values", () => {
      const key = "large-values";
      const data: CommitData = {
        choice: maxUint256,
        salt: BigInt("99999999999999999999999999999999999999999"),
      };

      storeCommitData(key, data);

      const stored = localStorage.getItem(key);
      const parsed = JSON.parse(stored!);

      expect(parsed.choice).toBe(maxUint256.toString());
      expect(parsed.salt).toBe("99999999999999999999999999999999999999999");
    });
  });

  describe("restoreCommitData", () => {
    it("should restore commit data from localStorage", () => {
      const key = "restore-test";
      const originalData: CommitData = {
        choice: 3n,
        salt: 555n,
      };

      storeCommitData(key, originalData);
      const restored = restoreCommitData(key);

      expect(restored).toBeDefined();
      expect(restored?.choice).toBe(3n);
      expect(restored?.salt).toBe(555n);
    });

    it("should restore data with justification", () => {
      const key = "restore-with-justification";
      const originalData: CommitData = {
        choice: 1n,
        salt: 100n,
        justification: "My reason",
      };

      storeCommitData(key, originalData);
      const restored = restoreCommitData(key);

      expect(restored?.justification).toBe("My reason");
    });

    it("should return undefined for non-existent key", () => {
      const result = restoreCommitData("non-existent-key");

      expect(result).toBeUndefined();
    });

    it("should return undefined for invalid JSON", () => {
      localStorage.setItem("invalid-json", "not valid json {{{");

      const result = restoreCommitData("invalid-json");

      expect(result).toBeUndefined();
    });

    it("should correctly convert string values back to bigint", () => {
      const key = "bigint-conversion";
      localStorage.setItem(
        key,
        JSON.stringify({
          choice: "12345678901234567890",
          salt: "98765432109876543210",
        })
      );

      const restored = restoreCommitData(key);

      expect(restored?.choice).toBe(BigInt("12345678901234567890"));
      expect(restored?.salt).toBe(BigInt("98765432109876543210"));
      expect(typeof restored?.choice).toBe("bigint");
      expect(typeof restored?.salt).toBe("bigint");
    });

    it("should handle missing justification field", () => {
      const key = "no-justification";
      localStorage.setItem(
        key,
        JSON.stringify({
          choice: "1",
          salt: "2",
        })
      );

      const restored = restoreCommitData(key);

      expect(restored).toBeDefined();
      expect(restored?.justification).toBeUndefined();
    });
  });

  describe("removeCommitData", () => {
    it("should remove data from localStorage", () => {
      const key = "remove-test";
      storeCommitData(key, { choice: 1n, salt: 1n });

      expect(localStorage.getItem(key)).not.toBeNull();

      removeCommitData(key);

      expect(localStorage.getItem(key)).toBeNull();
    });

    it("should not throw when removing non-existent key", () => {
      expect(() => removeCommitData("non-existent")).not.toThrow();
    });
  });

  describe("round-trip integration", () => {
    it("should maintain data integrity through store and restore", () => {
      const key = "round-trip";
      const originalData: CommitData = {
        choice: 42n,
        salt: BigInt("123456789012345678901234567890"),
        justification: "Complete justification with unicode: 你好 🎉",
      };

      storeCommitData(key, originalData);
      const restored = restoreCommitData(key);

      expect(restored?.choice).toBe(originalData.choice);
      expect(restored?.salt).toBe(originalData.salt);
      expect(restored?.justification).toBe(originalData.justification);
    });

    it("should handle zero values", () => {
      const key = "zero-values";
      const data: CommitData = {
        choice: 0n,
        salt: 0n,
      };

      storeCommitData(key, data);
      const restored = restoreCommitData(key);

      expect(restored?.choice).toBe(0n);
      expect(restored?.salt).toBe(0n);
    });
  });
});
