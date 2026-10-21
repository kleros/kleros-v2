import { keccak256 } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { describe, expect, it, vi } from "vitest";

vi.mock("@privy-io/react-auth", () => ({ useSignTypedData: vi.fn() }));
vi.mock("react-use", () => ({ useLocalStorage: vi.fn() }));
vi.mock("wagmi", () => ({ useWalletClient: vi.fn() }));
vi.mock("hooks/useIsEmbeddedWallet", () => ({ useEmbeddedWallet: vi.fn() }));
vi.mock("utils/index", () => ({ isProductionDeployment: () => false, isUndefined: (v: unknown) => v === undefined }));

import messages from "consts/eip712-messages";

import { toPrivyTypedData } from "./useSigningAccount";

describe("signing account key derivation", () => {
  const signer = privateKeyToAccount(generatePrivateKey());

  it("signs the same payload on the embedded (Privy) and external (wagmi) paths", async () => {
    const typedData = messages.signingAccount(signer.address);
    // External path: wagmi/viem walletClient.signTypedData(typedData). Embedded path: Privy gets the stripped payload.
    const externalSignature = await signer.signTypedData(typedData);
    const embeddedSignature = await signer.signTypedData({
      ...toPrivyTypedData(typedData),
      account: undefined,
    } as never);

    expect(embeddedSignature).toBe(externalSignature);
    expect(keccak256(embeddedSignature)).toBe(keccak256(externalSignature));
  });

  it("only drops the `account` field, leaving domain, types, primaryType and message untouched", () => {
    const typedData = messages.signingAccount(signer.address);
    const { account, ...rest } = typedData;
    expect(account).toBe(signer.address.toLowerCase());
    expect(toPrivyTypedData(typedData)).toEqual(rest);
    expect(toPrivyTypedData(typedData)).not.toHaveProperty("account");
  });
});
