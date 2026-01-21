import { arbitrumSepolia } from "viem/chains";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { storeCommitData } from "actions/helpers/storage";

import { hashJustification } from "utils/crypto/hashJustification";
import { hashVote } from "utils/crypto/hashVote";
import { encrypt } from "utils/crypto/shutter";

import { DisputeKits } from "src/consts";

import { fakeEncrypt, verifyFakeEncryptOutput } from "../../../test/fakes/shutter";
import type { CommitContext } from "../context";
import { encodeShutterMessage } from "../helpers";
import type { ShutterCommitParams } from "../params";

import { shutterCommitBuilder } from "./shutter.builder";

// Mock the dependencies
vi.mock("actions/helpers/storage", () => ({
  storeCommitData: vi.fn(),
}));

vi.mock("hooks/contracts/generated", () => ({
  disputeKitShutterAbi: [{ name: "castCommitShutter", type: "function" }],
  disputeKitShutterAddress: {
    421614: "0xSHUTTER12345678901234567890123456789012" as const,
  },
}));

vi.mock("utils/crypto/shutter", async () => {
  const { fakeEncrypt } = await import("../../../test/fakes/shutter");

  return {
    encrypt: vi.fn(fakeEncrypt),
  };
});

// Mock import.meta.env
vi.stubEnv("REACT_APP_SHUTTER_API", "https://shutter.test.api");

describe("shutterCommitBuilder", () => {
  const mockContext: CommitContext = {
    account: "0xabcdef1234567890abcdef1234567890abcdef12" as `0x${string}`,
    chain: arbitrumSepolia,
    walletClient: {} as CommitContext["walletClient"],
  };

  const mockEncrypt = vi.mocked(encrypt);

  const createParams = (overrides: Partial<ShutterCommitParams> = {}): ShutterCommitParams => ({
    disputeId: 1n,
    voteIds: [0n],
    choice: 1n,
    salt: 123456789n,
    roundIndex: 0,
    decryptionDelay: 60,
    justification: "My vote justification",
    type: DisputeKits.Shutter,
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("transaction building", () => {
    it("should build correct transaction structure", async () => {
      const params = createParams();

      const result = await shutterCommitBuilder.build(params, mockContext);

      expect(result).toMatchObject({
        account: mockContext.account,
        address: "0xSHUTTER12345678901234567890123456789012",
        functionName: "castCommitShutter",
        chain: mockContext.chain,
      });
    });

    it("should include all required args", async () => {
      const params = createParams({
        disputeId: 42n,
        voteIds: [1n, 2n],
        choice: 2n,
        salt: 999n,
        justification: "Test justification",
      });

      const result = await shutterCommitBuilder.build(params, mockContext);

      // Args should be: [disputeId, voteIds, choiceCommit, justificationCommit, identity, encryptedCommitment]
      expect(result.args).toHaveLength(6);
      expect(result.args?.[0]).toBe(params.disputeId);
      expect(result.args?.[1]).toEqual(params.voteIds);
    });

    it("should compute choice commit using hashVote", async () => {
      const params = createParams({ choice: 3n, salt: 12345n });

      const result = await shutterCommitBuilder.build(params, mockContext);
      const expectedChoiceCommit = hashVote(params.choice, params.salt);

      expect(result.args?.[2]).toBe(expectedChoiceCommit);
    });

    it("should compute justification commit using hashJustification", async () => {
      const params = createParams({ salt: 12345n, justification: "My reasoning" });

      const result = await shutterCommitBuilder.build(params, mockContext);
      const expectedJustificationCommit = hashJustification(params.salt, params.justification);

      expect(result.args?.[3]).toBe(expectedJustificationCommit);
    });
  });

  describe("storage interaction", () => {
    it("should store commit data with justification", async () => {
      const params = createParams({
        disputeId: 100n,
        roundIndex: 2,
        voteIds: [5n, 6n],
        choice: 1n,
        salt: 777n,
        justification: "Stored justification",
      });

      await shutterCommitBuilder.build(params, mockContext);

      expect(storeCommitData).toHaveBeenCalledTimes(1);
      expect(storeCommitData).toHaveBeenCalledWith("dispute-100-round-2-voteids-5,6", {
        choice: 1n,
        salt: 777n,
        justification: "Stored justification",
      });
    });
  });

  describe("shutter encryption", () => {
    it("should encrypt encoded shutter message", async () => {
      const params = createParams({ choice: 2n, salt: 555n, justification: "Test" });

      const result = await shutterCommitBuilder.build(params, mockContext);

      const encoded = encodeShutterMessage(2n, 555n, "Test");

      const { identity: expectedIdentity } = fakeEncrypt(encoded, params.decryptionDelay);

      expect(result.args?.[4]).toBe(expectedIdentity);
    });

    it("should include identity and encrypted commitment from shutter", async () => {
      const params = createParams();

      const result = await shutterCommitBuilder.build(params, mockContext);

      // Args[4] is identity, Args[5] is encryptedCommitment
      expect(result.args?.[4]).toMatch(/^0x[a-fA-F0-9]+$/);
      expect(result.args?.[5]).toMatch(/^0x[a-fA-F0-9]+$/);
    });

    it("should encrypt encoded shutter message deterministically", async () => {
      const params = createParams({
        choice: 2n,
        salt: 555n,
        justification: "Test",
        decryptionDelay: 120,
      });

      const result = await shutterCommitBuilder.build(params, mockContext);

      const encoded = encodeShutterMessage(2n, 555n, "Test");

      const identity = result.args?.[4] as `0x${string}`;
      const encrypted = result.args?.[5] as `0x${string}`;

      expect(verifyFakeEncryptOutput(encoded, 120, identity, encrypted)).toBe(true);
    });

    it("should produce deterministic encryption output", async () => {
      const params = createParams({
        choice: 1n,
        salt: 100n,
        decryptionDelay: 120,
      });

      const result1 = await shutterCommitBuilder.build(params, mockContext);
      const result2 = await shutterCommitBuilder.build(params, mockContext);

      // Same inputs should produce same outputs
      expect(result1.args?.[4]).toBe(result2.args?.[4]); // identity
      expect(result1.args?.[5]).toBe(result2.args?.[5]); // encryptedCommitment
    });
    it("calls encrypt with encoded shutter message and correct delay", async () => {
      const params = createParams({
        choice: 2n,
        salt: 555n,
        justification: "Test",
        decryptionDelay: 120,
      });

      await shutterCommitBuilder.build(params, mockContext);

      expect(mockEncrypt).toHaveBeenCalledTimes(1);
      expect(mockEncrypt).toHaveBeenCalledWith(encodeShutterMessage(2n, 555n, "Test"), 120);
    });
  });

  describe("environment check", () => {
    it("should throw when REACT_APP_SHUTTER_API is not set", async () => {
      vi.stubEnv("REACT_APP_SHUTTER_API", "");
      const params = createParams();

      await expect(shutterCommitBuilder.build(params, mockContext)).rejects.toThrow(
        "Cannot commit vote: REACT_APP_SHUTTER_API environment variable is required but not set"
      );

      // Restore for other tests
      vi.stubEnv("REACT_APP_SHUTTER_API", "https://shutter.test.api");
    });
  });

  describe("edge cases", () => {
    it("should handle empty justification", async () => {
      const params = createParams({ justification: "" });

      const result = await shutterCommitBuilder.build(params, mockContext);

      expect(result.args).toHaveLength(6);
    });

    it("should handle multiple voteIds", async () => {
      const params = createParams({ voteIds: [1n, 2n, 3n, 4n, 5n] });

      const result = await shutterCommitBuilder.build(params, mockContext);

      expect(result.args?.[1]).toEqual([1n, 2n, 3n, 4n, 5n]);
    });
  });
});
