import { toast } from "react-toastify";
import { BaseError, type PublicClient, type TransactionReceipt } from "viem";
import { afterEach, describe, it, expect, vi } from "vitest";

import { debounceErrorToast } from "./debounceErrorToast";
import { parseWagmiError } from "./parseWagmiError";
import { catchShortMessage, OPTIONS, wrapWithToast } from "./wrapWithToast";

vi.mock("react-toastify", () => ({ toast: { info: vi.fn(), success: vi.fn(), error: vi.fn() } }));

const HASH = "0x00000000000000000000000000000000000000000000000000000000000000ab";

const publicClientResolving = (status: TransactionReceipt["status"]) =>
  ({
    waitForTransactionReceipt: vi.fn().mockResolvedValue({ status, transactionHash: HASH }),
  }) as unknown as PublicClient & { waitForTransactionReceipt: ReturnType<typeof vi.fn> };

describe("parseWagmiError", () => {
  it("returns an empty string without an error", () => {
    expect(parseWagmiError(null)).toBe("");
  });

  it("prefers the first meta message, then the short message, then the raw message", () => {
    const withMeta = Object.assign(new Error("raw"), { shortMessage: "short", metaMessages: ["meta", "other"] });
    const withShort = Object.assign(new Error("raw"), { shortMessage: "short" });
    expect(parseWagmiError(withMeta as never)).toBe("meta");
    expect(parseWagmiError(withShort as never)).toBe("short");
    expect(parseWagmiError(new Error("raw") as never)).toBe("raw");
  });

  it("reads viem's BaseError shape", () => {
    const error = new BaseError("Execution reverted", { metaMessages: ["Error: NotEnoughFunds()"] });
    expect(parseWagmiError(error as never)).toBe("Error: NotEnoughFunds()");
  });
});

describe("wrapWithToast", () => {
  it("waits for two confirmations and reports a mined transaction", async () => {
    const client = publicClientResolving("success");

    const result = await wrapWithToast(async () => HASH, client);

    expect(client.waitForTransactionReceipt).toHaveBeenCalledWith({ hash: HASH, confirmations: 2 });
    expect(result).toEqual({ status: true, result: { status: "success", transactionHash: HASH } });
    expect(toast.info).toHaveBeenCalledWith("Transaction initiated", OPTIONS);
    expect(toast.success).toHaveBeenCalledWith("Transaction mined!", OPTIONS);
  });

  it("reports a reverted receipt as a failure", async () => {
    const result = await wrapWithToast(async () => HASH, publicClientResolving("reverted"));

    expect(result.status).toBe(false);
    expect(toast.error).toHaveBeenCalledWith("Transaction reverted!", OPTIONS);
  });

  it("shows the parsed error when the write is rejected, without waiting for a receipt", async () => {
    const client = publicClientResolving("success");
    const rejection = Object.assign(new Error("raw"), { shortMessage: "User rejected the request." });

    const result = await wrapWithToast(() => Promise.reject(rejection), client);

    expect(result).toEqual({ status: false });
    expect(client.waitForTransactionReceipt).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith("User rejected the request.", OPTIONS);
  });

  it("catchShortMessage toasts the parsed error and resolves", async () => {
    await catchShortMessage(Promise.reject(Object.assign(new Error("raw"), { shortMessage: "nope" })));
    expect(toast.error).toHaveBeenCalledWith("nope", OPTIONS);
  });
});

describe("debounceErrorToast", () => {
  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("shows only the last message after 5s of quiet", () => {
    vi.useFakeTimers();

    debounceErrorToast("first");
    vi.advanceTimersByTime(4999);
    debounceErrorToast("second");
    vi.advanceTimersByTime(4999);
    expect(toast.error).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(toast.error).toHaveBeenCalledWith("second", OPTIONS);
  });
});
