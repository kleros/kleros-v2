import type { Hex } from "viem";
import { arbitrumSepolia } from "viem/chains";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { getVoteKey } from "actions/helpers/storage/getVoteKey";

import { hashJustification } from "utils/crypto/hashJustification";
import { hashVote } from "utils/crypto/hashVote";

import { DisputeKits } from "src/consts";
import { MOCK_SHUTTER_DK_ADDRESS, mockContractsGenerated } from "src/test/mocks/contracts";

import { fakeEncrypt, verifyFakeEncryptOutput } from "../../../test/fakes/shutter";
import type { CommitContext } from "../context";
import { encodeShutterMessage } from "../helpers";
import type { ShutterCommitParams } from "../params";

import { shutterCommitBuilder } from "./shutter.builder";

vi.mock("hooks/contracts/generated", () => mockContractsGenerated);

// Mock import.meta.env
vi.stubEnv("REACT_APP_SHUTTER_API", "https://shutter.test.api");

describe("shutterCommitBuilder", () => {
  const mockContext: CommitContext = {
    account: "0xabcdef1234567890abcdef1234567890abcdef12",
    chain: arbitrumSepolia,
    walletClient: {} as CommitContext["walletClient"],
  };
  const mockStoreCommitData = vi.fn();
  const mockEncrypt = vi.fn(fakeEncrypt);

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

  const buildTxn = async (params: ShutterCommitParams) =>
    await shutterCommitBuilder.build(params, mockContext, {
      storeCommitData: mockStoreCommitData,
      encrypt: mockEncrypt,
    });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("transaction building", () => {
    it("should build correct transaction structure", async () => {
      const params = createParams();

      const result = await buildTxn(params);

      expect(result).toMatchObject({
        account: mockContext.account,
        address: MOCK_SHUTTER_DK_ADDRESS,
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

      const result = await buildTxn(params);

      // Args should be: [disputeId, voteIds, choiceCommit, justificationCommit, identity, encryptedCommitment]
      expect(result.args).toHaveLength(6);
      expect(result.args?.[0]).toBe(params.disputeId);
      expect(result.args?.[1]).toEqual(params.voteIds);
    });

    it("should compute choice commit using hashVote", async () => {
      const params = createParams({ choice: 3n, salt: 12345n });

      const result = await buildTxn(params);
      const expectedChoiceCommit = hashVote(params.choice, params.salt);

      expect(result.args?.[2]).toBe(expectedChoiceCommit);
    });

    it("should compute justification commit using hashJustification", async () => {
      const params = createParams({ salt: 12345n, justification: "My reasoning" });

      const result = await buildTxn(params);
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

      await buildTxn(params);

      expect(mockStoreCommitData).toHaveBeenCalledTimes(1);

      const expectedKey = getVoteKey(params.disputeId, params.roundIndex, params.voteIds);
      expect(mockStoreCommitData).toHaveBeenCalledWith(expectedKey, {
        choice: 1n,
        salt: 777n,
        justification: "Stored justification",
      });
    });
  });

  describe("shutter encryption", () => {
    it("should encrypt encoded shutter message", async () => {
      const params = createParams({ choice: 2n, salt: 555n, justification: "Test" });

      const result = await buildTxn(params);

      const encoded = encodeShutterMessage(2n, 555n, "Test");

      const { identity: expectedIdentity } = await fakeEncrypt(encoded, params.decryptionDelay);

      expect(result.args?.[4]).toBe(expectedIdentity);
    });

    it("should include identity and encrypted commitment from shutter", async () => {
      const params = createParams();

      const result = await buildTxn(params);

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

      const result = await buildTxn(params);

      const encoded = encodeShutterMessage(2n, 555n, "Test");

      const identity = result.args?.[4] as Hex;
      const encrypted = result.args?.[5] as Hex;

      expect(verifyFakeEncryptOutput(encoded, 120, identity, encrypted)).toBe(true);
    });

    it("should produce deterministic encryption output", async () => {
      const params = createParams({
        choice: 1n,
        salt: 100n,
        decryptionDelay: 120,
      });

      const result1 = await buildTxn(params);
      const result2 = await buildTxn(params);

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

      await buildTxn(params);

      expect(mockEncrypt).toHaveBeenCalledTimes(1);
      expect(mockEncrypt).toHaveBeenCalledWith(encodeShutterMessage(2n, 555n, "Test"), 120);
    });
  });

  describe("environment check", () => {
    it("should throw when REACT_APP_SHUTTER_API is not set", async () => {
      vi.stubEnv("REACT_APP_SHUTTER_API", "");
      const params = createParams();

      await expect(buildTxn(params)).rejects.toThrow(
        "Cannot commit vote: REACT_APP_SHUTTER_API environment variable is required but not set"
      );

      // Restore for other tests
      vi.stubEnv("REACT_APP_SHUTTER_API", "https://shutter.test.api");
    });
  });

  describe("edge cases", () => {
    it("should handle empty justification", async () => {
      const params = createParams({ justification: "" });

      const result = await buildTxn(params);

      expect(result.args).toHaveLength(6);
    });

    it("should handle multiple voteIds", async () => {
      const params = createParams({ voteIds: [1n, 2n, 3n, 4n, 5n] });

      const result = await buildTxn(params);

      expect(result.args?.[1]).toEqual([1n, 2n, 3n, 4n, 5n]);
    });
  });
});
