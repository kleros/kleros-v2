import { act, waitFor } from "@testing-library/react";
import { toast } from "react-toastify";
import { decodeFunctionData, getAddress, hexToBigInt, parseEther } from "viem";
import { describe, it, expect, vi } from "vitest";
import { useAccount } from "wagmi";

import { DisputeKits } from "src/dispute-kits/disputeKits";
import { DISPUTE_KIT_REGISTRY } from "src/dispute-kits/registry";
import { MOCK_ACCOUNT_1 } from "src/test/mocks";
import { renderHookWithProviders } from "src/test/renderWithProviders";

import { useFundAppeal } from "./useFundAppeal";

vi.mock("react-toastify", () => ({ toast: { info: vi.fn(), success: vi.fn(), error: vi.fn() } }));

const renderFundAppeal = (options: Parameters<typeof renderHookWithProviders>[1] = {}) => {
  const onSuccess = vi.fn();
  const rendered = renderHookWithProviders(() => ({ fund: useFundAppeal(onSuccess), account: useAccount() }), options);
  return { ...rendered, onSuccess };
};

describe("useFundAppeal", () => {
  it.each([DisputeKits.Classic, DisputeKits.GatedShutter])(
    "sends fundAppeal with the contribution as value to kit %i through the wallet",
    async (disputeKitId) => {
      const kit = DISPUTE_KIT_REGISTRY[disputeKitId];
      const { result, sentTransactions, onSuccess, queryClient } = renderFundAppeal();
      const invalidate = vi.spyOn(queryClient, "invalidateQueries");
      await waitFor(() => expect(result.current.account.isConnected).toBe(true));

      let outcome: Awaited<ReturnType<typeof result.current.fund.mutateAsync>> | undefined;
      await act(async () => {
        outcome = await result.current.fund.mutateAsync({
          disputeId: 12n,
          choice: 2n,
          fundAmount: parseEther("0.2"),
          disputeKitId,
        });
      });

      expect(sentTransactions).toHaveLength(1);
      const [tx] = sentTransactions;
      expect(getAddress(tx.to)).toBe(getAddress(kit.address));
      expect(getAddress(tx.from)).toBe(getAddress(MOCK_ACCOUNT_1));
      expect(hexToBigInt(tx.value!)).toBe(parseEther("0.2"));
      expect(decodeFunctionData({ abi: kit.disputeKitAbi, data: tx.data! })).toMatchObject({
        functionName: "fundAppeal",
        args: [12n, 2n],
      });
      expect(outcome).toMatchObject({ status: true });
      await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
      expect(invalidate).toHaveBeenCalledWith({ queryKey: ["useClassicAppealQuery"] });
    }
  );

  it("reports a reverted transaction without calling onSuccess", async () => {
    const { result, onSuccess } = renderFundAppeal({ receiptStatus: "reverted" });
    await waitFor(() => expect(result.current.account.isConnected).toBe(true));

    let outcome: Awaited<ReturnType<typeof result.current.fund.mutateAsync>> | undefined;
    await act(async () => {
      outcome = await result.current.fund.mutateAsync({
        disputeId: 1n,
        choice: 1n,
        fundAmount: 1n,
        disputeKitId: DisputeKits.Classic,
      });
    });

    expect(outcome).toMatchObject({ status: false });
    expect(toast.error).toHaveBeenCalledWith("Transaction reverted!", expect.anything());
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("refuses to send without a connected wallet", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { result, sentTransactions } = renderFundAppeal({ account: null });

    await act(async () => {
      await result.current.fund
        .mutateAsync({ disputeId: 1n, choice: 1n, fundAmount: 1n, disputeKitId: DisputeKits.Classic })
        .catch(() => undefined);
    });

    await waitFor(() =>
      expect((result.current.fund.error as Error | null)?.message).toBe("Account not defined. Is the wallet connected?")
    );
    expect(toast.error).toHaveBeenCalledWith("Account not defined. Is the wallet connected?", expect.anything());
    expect(sentTransactions).toEqual([]);
  });
});
