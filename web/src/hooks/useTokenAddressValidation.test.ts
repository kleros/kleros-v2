import { act, waitFor } from "@testing-library/react";
import { erc20Abi, parseAbi } from "viem";
import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";

import type { ReadMock } from "src/test/msw/rpc";
import { renderHookWithProviders } from "src/test/renderWithProviders";

import { useERC1155Validation, useERC20ERC721Validation } from "./useTokenAddressValidation";

const TOKEN = "0x00000000000000000000000000000000000070c3";
const PROBE = "0x0000000000000000000000000000000000001234";
const erc1155Abi = parseAbi(["function balanceOf(address account, uint256 id) view returns (uint256)"]);

const balanceOf = (abi: ReadMock["abi"], reverts = false, seen: unknown[][] = []): ReadMock => ({
  address: TOKEN,
  abi,
  functionName: "balanceOf",
  result: (args) => {
    seen.push([...args]);
    if (reverts) throw new Error("not a token");
    return 0n;
  },
});

/** Lets the hook's 500 ms input debounce elapse. */
const settle = async () => {
  await act(() => vi.advanceTimersByTimeAsync(500));
};

describe("useERC20ERC721Validation", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("is idle for an empty address", async () => {
    const { result } = renderHookWithProviders(() => useERC20ERC721Validation({ address: "" }));
    await settle();
    expect(result.current).toEqual({ isValidating: false, isValid: null, error: null });
  });

  it("rejects a malformed address without touching the network", async () => {
    const { result, rpcCalls } = renderHookWithProviders(() => useERC20ERC721Validation({ address: "0x123" }));
    await settle();

    expect(result.current).toEqual({ isValidating: false, isValid: false, error: "Invalid Ethereum address format" });
    expect(rpcCalls.filter((c) => c.method === "eth_call")).toEqual([]);
  });

  it("accepts a contract that answers balanceOf(address) for a probe account", async () => {
    const seen: unknown[][] = [];
    const { result } = renderHookWithProviders(() => useERC20ERC721Validation({ address: TOKEN }), {
      reads: [balanceOf(erc20Abi, false, seen)],
    });
    await settle();

    await waitFor(() => expect(result.current.isValid).toBe(true));
    expect(result.current.error).toBeNull();
    expect(seen).toEqual([[PROBE]]);
  });

  it("reports an address that reverts balanceOf as not a token, after one retry", async () => {
    const seen: unknown[][] = [];
    const { result } = renderHookWithProviders(() => useERC20ERC721Validation({ address: TOKEN }), {
      reads: [balanceOf(erc20Abi, true, seen)],
    });
    await settle();
    await act(() => vi.advanceTimersByTimeAsync(1000));

    await waitFor(() => expect(result.current.error).toBe("Not a valid ERC-20 or ERC-721 token address"));
    expect(result.current.isValid).toBe(false);
    expect(seen).toHaveLength(2);
  });

  it("does not validate while disabled", async () => {
    const { result, rpcCalls } = renderHookWithProviders(() =>
      useERC20ERC721Validation({ address: TOKEN, enabled: false })
    );
    await settle();

    expect(result.current.isValidating).toBe(false);
    expect(rpcCalls.filter((c) => c.method === "eth_call")).toEqual([]);
  });

  it("only validates the address the user settled on", async () => {
    const seen: unknown[][] = [];
    const { result, rerender } = renderHookWithProviders(
      ({ address }: { address: string }) => useERC20ERC721Validation({ address }),
      { initialProps: { address: "0x00" }, reads: [balanceOf(erc20Abi, false, seen)] }
    );
    await act(() => vi.advanceTimersByTimeAsync(200));
    rerender({ address: TOKEN });
    await settle();

    await waitFor(() => expect(result.current.isValid).toBe(true));
    expect(seen).toHaveLength(1);
  });
});

describe("useERC1155Validation", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("probes balanceOf(address, 0)", async () => {
    const seen: unknown[][] = [];
    const { result } = renderHookWithProviders(() => useERC1155Validation({ address: TOKEN }), {
      reads: [balanceOf(erc1155Abi, false, seen)],
    });
    await settle();

    await waitFor(() => expect(result.current.isValid).toBe(true));
    expect(seen).toEqual([[PROBE, 0n]]);
  });

  it("names the ERC-1155 interface when the probe reverts", async () => {
    const { result } = renderHookWithProviders(() => useERC1155Validation({ address: TOKEN }), {
      reads: [balanceOf(erc1155Abi, true)],
    });
    await settle();
    await act(() => vi.advanceTimersByTimeAsync(1000));

    await waitFor(() => expect(result.current.error).toBe("Not a valid ERC-1155 token address"));
  });
});
