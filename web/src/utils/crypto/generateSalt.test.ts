import { keccak256 } from "viem";
import type { Account } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { describe, it, expect, vi } from "vitest";

import { generateSalt } from "./generateSalt";

describe("generateSalt", () => {
  const createMockAccount = (signatureToReturn: `0x${string}`): Account => {
    return {
      address: "0x1234567890123456789012345678901234567890",
      type: "local",
      signMessage: vi.fn().mockResolvedValue(signatureToReturn),
    } as unknown as Account;
  };

  it("should generate a valid salt from message signature", async () => {
    const mockSignature = "0xabc123def456" as `0x${string}`;
    const mockAccount = createMockAccount(mockSignature);
    const message = "test-message";

    const result = await generateSalt(mockAccount, message);

    expect(mockAccount.signMessage).toHaveBeenCalledWith({ message });
    expect(result).toBe(keccak256(mockSignature));
  });

  it("should return a valid hex string", async () => {
    const mockSignature = "0xabc123" as `0x${string}`;
    const mockAccount = createMockAccount(mockSignature);

    const result = await generateSalt(mockAccount, "some-message");

    expect(result).toMatch(/^0x[a-fA-F0-9]{64}$/);
  });

  it("should produce deterministic results for same signature", async () => {
    const mockSignature = "0xconst123" as `0x${string}`;
    const mockAccount1 = createMockAccount(mockSignature);
    const mockAccount2 = createMockAccount(mockSignature);

    const result1 = await generateSalt(mockAccount1, "message");
    const result2 = await generateSalt(mockAccount2, "message");

    expect(result1).toBe(result2);
  });

  it("should produce different results for different signatures", async () => {
    const mockAccount1 = createMockAccount("0xsig111" as `0x${string}`);
    const mockAccount2 = createMockAccount("0xsig222" as `0x${string}`);

    const result1 = await generateSalt(mockAccount1, "message");
    const result2 = await generateSalt(mockAccount2, "message");

    expect(result1).not.toBe(result2);
  });

  it("should throw error if signMessage is not available", async () => {
    const accountWithoutSignMessage = {
      address: "0x1234567890123456789012345678901234567890",
      type: "local",
    } as unknown as Account;

    await expect(generateSalt(accountWithoutSignMessage, "test")).rejects.toThrow(
      "signMessage method not available on signingAccount"
    );
  });

  it("should throw error if signature is undefined/null", async () => {
    const mockAccount = {
      address: "0x1234567890123456789012345678901234567890",
      type: "local",
      signMessage: vi.fn().mockResolvedValue(undefined),
    } as unknown as Account;

    await expect(generateSalt(mockAccount, "test")).rejects.toThrow("Cannot sign message");
  });

  it("should pass the correct message to signMessage", async () => {
    const mockAccount = createMockAccount("0xsig" as `0x${string}`);
    const testMessage = "dispute-123-round-0-voteids-1,2,3";

    await generateSalt(mockAccount, testMessage);

    expect(mockAccount.signMessage).toHaveBeenCalledWith({ message: testMessage });
  });

  it("works with a real viem account", async () => {
    const account = privateKeyToAccount("0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d");

    const message = "test-message";
    const salt = await generateSalt(account, message);

    expect(salt).toMatch(/^0x[a-fA-F0-9]{64}$/);
  });
});
