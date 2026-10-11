import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";

import { refetchWithRetry } from "./refecthWithRetry";

describe("refetchWithRetry", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns the first result that carries data", async () => {
    const fn = vi.fn().mockResolvedValue({ data: { ok: true } });
    await expect(refetchWithRetry(fn)).resolves.toEqual({ data: { ok: true } });
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("retries empty results and errors after the delay", async () => {
    const fn = vi
      .fn()
      .mockResolvedValueOnce({ data: undefined })
      .mockRejectedValueOnce(new Error("indexing"))
      .mockResolvedValueOnce({ data: 1 });

    const result = refetchWithRetry(fn, 5, 2000);
    await vi.advanceTimersByTimeAsync(2000);
    expect(fn).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(2000);

    await expect(result).resolves.toEqual({ data: 1 });
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it("gives up with undefined after the last attempt, without a trailing wait", async () => {
    const fn = vi.fn().mockResolvedValue(undefined);

    const result = refetchWithRetry(fn, 3, 1000);
    await vi.advanceTimersByTimeAsync(2000);

    await expect(result).resolves.toBeUndefined();
    expect(fn).toHaveBeenCalledTimes(3);
  });
});
