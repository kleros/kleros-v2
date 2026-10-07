import { decodeFunctionData, parseAbi, type Hash } from "viem";
import { describe, expect, it, vi } from "vitest";

vi.mock("@privy-io/react-auth", () => ({ useSendTransaction: vi.fn(), useWallets: vi.fn() }));
vi.mock("wagmi", () => ({ useAccount: vi.fn(), useConfig: vi.fn() }));
vi.mock("wagmi/actions", () => ({ writeContract: vi.fn() }));
vi.mock("hooks/useIsEmbeddedWallet", () => ({ useEmbeddedWallet: vi.fn() }));

import { routeWriteRequest, type IWriteRequest } from "./useWriteRequest";

const abi = parseAbi(["function setStake(uint96 courtID, uint256 newStake)", "function request()"]);
const HASH: Hash = "0x1111111111111111111111111111111111111111111111111111111111111111";
const ADDRESS = "0x00000000000000000000000000000000000000aa" as const;
const WALLET = "0x00000000000000000000000000000000000000bb" as const;

const makeDeps = (embeddedAddress?: `0x${string}`) => ({
  embeddedAddress,
  sendPrivyTransaction: vi.fn().mockResolvedValue({ hash: HASH }),
  writeWagmi: vi.fn().mockResolvedValue(HASH),
});

describe("routeWriteRequest", () => {
  it("sends embedded wallet requests silently and sponsored through Privy", async () => {
    const deps = makeDeps(WALLET);
    const request = {
      address: ADDRESS,
      abi,
      functionName: "setStake",
      args: [1n, 5n],
      chainId: 421614,
    } as IWriteRequest;

    const hash = await routeWriteRequest(request, deps);

    expect(hash).toBe(HASH);
    expect(deps.writeWagmi).not.toHaveBeenCalled();
    expect(deps.sendPrivyTransaction).toHaveBeenCalledTimes(1);
    const [tx, options] = deps.sendPrivyTransaction.mock.calls[0];
    expect(tx.to).toBe(ADDRESS);
    expect(tx.chainId).toBe(421614);
    expect(tx.value).toBeUndefined();
    expect(decodeFunctionData({ abi, data: tx.data })).toEqual({ functionName: "setStake", args: [1n, 5n] });
    expect(options).toEqual({ sponsor: true, uiOptions: { showWalletUIs: false }, address: WALLET });
  });

  it("passes value through for embedded wallets", async () => {
    const deps = makeDeps(WALLET);
    await routeWriteRequest({ address: ADDRESS, abi, functionName: "request", value: 7n } as IWriteRequest, deps);
    expect(deps.sendPrivyTransaction.mock.calls[0][0].value).toBe(7n);
  });

  it("routes external wallet requests to wagmi untouched", async () => {
    const deps = makeDeps(undefined);
    const request = { address: ADDRESS, abi, functionName: "request", value: 3n } as IWriteRequest;

    const hash = await routeWriteRequest(request, deps);

    expect(hash).toBe(HASH);
    expect(deps.sendPrivyTransaction).not.toHaveBeenCalled();
    expect(deps.writeWagmi).toHaveBeenCalledWith(request);
    expect(deps.writeWagmi.mock.calls[0][0]).toBe(request);
  });

  it("propagates Privy errors", async () => {
    const deps = makeDeps(WALLET);
    deps.sendPrivyTransaction.mockRejectedValue(new Error("sponsorship failed"));
    await expect(
      routeWriteRequest({ address: ADDRESS, abi, functionName: "request" } as IWriteRequest, deps)
    ).rejects.toThrow("sponsorship failed");
  });

  it("propagates wagmi errors", async () => {
    const deps = makeDeps(undefined);
    deps.writeWagmi.mockRejectedValue(new Error("User rejected"));
    await expect(
      routeWriteRequest({ address: ADDRESS, abi, functionName: "request" } as IWriteRequest, deps)
    ).rejects.toThrow("User rejected");
  });
});
