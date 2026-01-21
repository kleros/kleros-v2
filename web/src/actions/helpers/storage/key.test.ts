import { describe, it, expect } from "vitest";

import { getVoteKey } from "./key";

describe("getVoteKey", () => {
  it("should generate correct key format", () => {
    const disputeId = 123n;
    const roundIndex = 0;
    const voteIds = [1n, 2n, 3n];

    const result = getVoteKey(disputeId, roundIndex, voteIds);

    expect(result).toBe("dispute-123-round-0-voteids-1,2,3");
  });

  it("should handle single voteId", () => {
    const result = getVoteKey(1n, 0, [5n]);

    expect(result).toBe("dispute-1-round-0-voteids-5");
  });

  it("should handle large dispute IDs", () => {
    const largeDisputeId = BigInt("999999999999999999999");
    const result = getVoteKey(largeDisputeId, 2, [1n]);

    expect(result).toBe("dispute-999999999999999999999-round-2-voteids-1");
  });

  it("should handle different round indices", () => {
    const disputeId = 100n;
    const voteIds = [1n];

    const result0 = getVoteKey(disputeId, 0, voteIds);
    const result1 = getVoteKey(disputeId, 1, voteIds);
    const result5 = getVoteKey(disputeId, 5, voteIds);

    expect(result0).toBe("dispute-100-round-0-voteids-1");
    expect(result1).toBe("dispute-100-round-1-voteids-1");
    expect(result5).toBe("dispute-100-round-5-voteids-1");
  });

  it("should generate unique keys for different inputs", () => {
    const key1 = getVoteKey(1n, 0, [1n]);
    const key2 = getVoteKey(1n, 0, [2n]);
    const key3 = getVoteKey(2n, 0, [1n]);
    const key4 = getVoteKey(1n, 1, [1n]);

    // All keys should be different
    const keys = [key1, key2, key3, key4];
    const uniqueKeys = new Set(keys);
    expect(uniqueKeys.size).toBe(4);
  });

  it("should handle multiple voteIds in order", () => {
    const result = getVoteKey(1n, 0, [10n, 20n, 30n]);

    expect(result).toContain("10,20,30");
  });

  it("should generate same key for same inputs (deterministic)", () => {
    const key1 = getVoteKey(42n, 3, [7n, 8n, 9n]);
    const key2 = getVoteKey(42n, 3, [7n, 8n, 9n]);

    expect(key1).toBe(key2);
  });
});
