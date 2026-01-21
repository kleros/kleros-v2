import type { Account } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { describe, it, expect, vi, beforeEach } from "vitest";

import type { Answer } from "@kleros/kleros-sdk";

import { generateSalt } from "utils/crypto/generateSalt";
import { hashVote } from "utils/crypto/hashVote";

import { DisputeKits } from "src/consts";

import { restoreCommitData } from "../helpers/storage";

import type { ResolveRevealContext, ResolveRevealParams } from "./params";
import { resolveRevealInputs } from "./resolveRevealInputs";

// Mock storage module
vi.mock("../helpers/storage", () => ({
  restoreCommitData: vi.fn(),
}));

// Mock generateSalt
vi.mock("utils/crypto/generateSalt", () => ({
  generateSalt: vi.fn(),
}));

describe("resolveRevealInputs", () => {
  const mockRestoreCommitData = vi.mocked(restoreCommitData);
  const mockGenerateSalt = vi.mocked(generateSalt);

  const createParams = (overrides: Partial<ResolveRevealParams> = {}): ResolveRevealParams => ({
    disputeId: 1n,
    voteIds: [0n],
    roundIndex: 0,
    type: DisputeKits.Classic,
    ...overrides,
  });

  const createMockAccount = (): Account => {
    return {
      address: "0x1234567890123456789012345678901234567890",
      type: "local",
      signMessage: vi.fn(),
    } as unknown as Account;
  };

  const createCommit = (choice: bigint, salt: `0x${string}`): `0x${string}` => hashVote(choice, BigInt(salt));

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("when commit data exists in storage", () => {
    it("should return stored choice and salt", async () => {
      const params = createParams();
      const context: ResolveRevealContext = {};

      mockRestoreCommitData.mockReturnValue({
        choice: 2n,
        salt: 12345n,
        justification: "stored justification",
      });

      const result = await resolveRevealInputs(params, context);

      expect(result.choice).toBe(2n);
      expect(result.salt).toBe(12345n);
      // Note: justification from params takes precedence over stored justification
      // If params.justification is undefined, it defaults to empty string ""
      expect(result.justification).toBe("");
    });

    it("should use params justification over empty storage justification", async () => {
      const params = createParams({ justification: "param justification" });
      const context: ResolveRevealContext = {};

      mockRestoreCommitData.mockReturnValue({
        choice: 1n,
        salt: 100n,
        justification: undefined,
      });

      const result = await resolveRevealInputs(params, context);

      expect(result.justification).toBe("param justification");
    });

    it("should default justification to empty string if not provided", async () => {
      const params = createParams();
      const context: ResolveRevealContext = {};

      mockRestoreCommitData.mockReturnValue({
        choice: 1n,
        salt: 100n,
      });

      const result = await resolveRevealInputs(params, context);

      expect(result.justification).toBe("");
    });

    it("should use correct storage key", async () => {
      const params = createParams({
        disputeId: 42n,
        roundIndex: 3,
        voteIds: [5n, 6n],
      });
      const context: ResolveRevealContext = {};

      mockRestoreCommitData.mockReturnValue({
        choice: 1n,
        salt: 100n,
      });

      await resolveRevealInputs(params, context);

      expect(mockRestoreCommitData).toHaveBeenCalledWith("dispute-42-round-3-voteids-5,6");
    });

    it("should preserve other params in result", async () => {
      const params = createParams({
        disputeId: 99n,
        voteIds: [7n, 8n],
        roundIndex: 2,
        type: DisputeKits.Classic,
      });
      const context: ResolveRevealContext = {};

      mockRestoreCommitData.mockReturnValue({
        choice: 1n,
        salt: 200n,
      });

      const result = await resolveRevealInputs(params, context);

      expect(result.disputeId).toBe(99n);
      expect(result.voteIds).toEqual([7n, 8n]);
      expect(result.roundIndex).toBe(2);
      expect(result.type).toBe(DisputeKits.Classic);
    });
  });

  describe("when commit data is NOT in storage", () => {
    beforeEach(() => {
      mockRestoreCommitData.mockReturnValue(undefined);
    });

    describe("regenerating salt", () => {
      it("should throw if no signing account available", async () => {
        const params = createParams();
        const context: ResolveRevealContext = {};

        await expect(resolveRevealInputs(params, context)).rejects.toThrow(
          "Cannot regenerate salt: no signing account available"
        );
      });

      it("should use provided signingAccount", async () => {
        const signingAccount = createMockAccount();
        const mockSalt = "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890" as `0x${string}`;
        mockGenerateSalt.mockResolvedValue(mockSalt);

        const mockAnswers: Answer[] = [{ id: "0x1", title: "A", description: "" }];
        const commit = createCommit(1n, mockSalt);

        const params = createParams();
        const context: ResolveRevealContext = {
          signingAccount,
          answers: mockAnswers,
          commit,
        };

        await resolveRevealInputs(params, context);

        expect(mockGenerateSalt).toHaveBeenCalledWith(signingAccount, expect.any(String));
      });

      it("should call generateSigningAccount if signingAccount not provided", async () => {
        const generatedAccount = createMockAccount();
        const mockSalt = "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890" as `0x${string}`;
        mockGenerateSalt.mockResolvedValue(mockSalt);

        const mockAnswers: Answer[] = [{ id: "0x1", title: "A", description: "" }];
        const commit = createCommit(1n, mockSalt);

        const generateSigningAccount = vi.fn().mockResolvedValue(generatedAccount);

        const params = createParams();
        const context: ResolveRevealContext = {
          generateSigningAccount,
          answers: mockAnswers,
          commit,
        };

        await resolveRevealInputs(params, context);

        expect(generateSigningAccount).toHaveBeenCalled();
        expect(mockGenerateSalt).toHaveBeenCalledWith(generatedAccount, expect.any(String));
      });

      it("should throw if generateSigningAccount returns undefined", async () => {
        const generateSigningAccount = vi.fn().mockResolvedValue(undefined);

        const params = createParams();
        const context: ResolveRevealContext = {
          generateSigningAccount,
        };

        await expect(resolveRevealInputs(params, context)).rejects.toThrow(
          "Cannot regenerate salt: unable to generate signing account"
        );
      });
    });

    describe("brute forcing choice", () => {
      it("should throw if answers not provided", async () => {
        const signingAccount = createMockAccount();
        const mockSalt = "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890" as `0x${string}`;
        mockGenerateSalt.mockResolvedValue(mockSalt);

        const params = createParams();
        const context: ResolveRevealContext = {
          signingAccount,
          commit: "0x1234",
          // answers is missing
        };

        await expect(resolveRevealInputs(params, context)).rejects.toThrow(
          "Cannot retrieve choice: answers and commit not available"
        );
      });

      it("should throw if commit not provided", async () => {
        const signingAccount = createMockAccount();
        const mockSalt = "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890" as `0x${string}`;
        mockGenerateSalt.mockResolvedValue(mockSalt);

        const params = createParams();
        const context: ResolveRevealContext = {
          signingAccount,
          answers: [{ id: "0x1", title: "A", description: "" }],
          // commit is missing
        };

        await expect(resolveRevealInputs(params, context)).rejects.toThrow(
          "Cannot retrieve choice: answers and commit not available"
        );
      });

      it("should correctly brute force and return choice", async () => {
        const signingAccount = createMockAccount();
        const mockSalt = "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890" as `0x${string}`;
        mockGenerateSalt.mockResolvedValue(mockSalt);

        const mockAnswers: Answer[] = [
          { id: "0x0", title: "RTA", description: "" },
          { id: "0x1", title: "Option 1", description: "" },
          { id: "0x2", title: "Option 2", description: "" },
        ];

        // Create commit for choice 2
        const commit = createCommit(2n, mockSalt);

        const params = createParams();
        const context: ResolveRevealContext = {
          signingAccount,
          answers: mockAnswers,
          commit,
        };

        const result = await resolveRevealInputs(params, context);

        expect(result.choice).toBe(2n);
        expect(result.salt).toBe(BigInt(mockSalt));
      });
    });
  });

  describe("justification handling", () => {
    it("should use provided justification from params when no storage", async () => {
      mockRestoreCommitData.mockReturnValue(undefined);

      const signingAccount = createMockAccount();
      const mockSalt = "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890" as `0x${string}`;
      mockGenerateSalt.mockResolvedValue(mockSalt);

      const mockAnswers: Answer[] = [{ id: "0x1", title: "A", description: "" }];
      const commit = createCommit(1n, mockSalt);

      const params = createParams({ justification: "my justification" });
      const context: ResolveRevealContext = {
        signingAccount,
        answers: mockAnswers,
        commit,
      };

      const result = await resolveRevealInputs(params, context);

      expect(result.justification).toBe("my justification");
    });

    it("should default to empty string justification", async () => {
      mockRestoreCommitData.mockReturnValue(undefined);

      const signingAccount = createMockAccount();
      const mockSalt = "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890" as `0x${string}`;
      mockGenerateSalt.mockResolvedValue(mockSalt);

      const mockAnswers: Answer[] = [{ id: "0x1", title: "A", description: "" }];
      const commit = createCommit(1n, mockSalt);

      const params = createParams();
      const context: ResolveRevealContext = {
        signingAccount,
        answers: mockAnswers,
        commit,
      };

      const result = await resolveRevealInputs(params, context);

      expect(result.justification).toBe("");
    });
  });

  describe("resolveRevealInputs (integration)", () => {
    it("reconstructs choice and salt end-to-end", async () => {
      const account = privateKeyToAccount("0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef");

      const answers: Answer[] = [
        { id: "0x1", title: "A", description: "" },
        { id: "0x2", title: "B", description: "" },
      ];

      const key = "integration-test-key";

      const salt = await generateSalt(account, key);
      const commit = hashVote(2n, BigInt(salt));

      const result = await resolveRevealInputs(
        {
          disputeId: 1n,
          roundIndex: 0,
          voteIds: [0n],
          type: DisputeKits.Classic,
        },
        {
          signingAccount: account,
          answers,
          commit,
        }
      );

      expect(result.choice).toBe(2n);
      expect(result.salt).toBe(BigInt(salt));
    });
  });
});
