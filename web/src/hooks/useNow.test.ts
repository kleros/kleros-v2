import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useNow } from "./useNow";

const START = 1_800_000_000;

describe("useNow", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(START * 1000);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("refreshes every interval, sharing one value between components", () => {
    const first = renderHook(() => useNow(60_000));
    act(() => vi.advanceTimersByTime(30_000));
    const second = renderHook(() => useNow(60_000));
    expect(second.result.current).toBe(first.result.current);

    act(() => vi.advanceTimersByTime(30_000));
    expect(first.result.current).toBe(START + 60);
    expect(second.result.current).toBe(START + 60);
  });

  it("catches up as soon as the page is visible again", () => {
    const { result } = renderHook(() => useNow(60_000));
    vi.setSystemTime((START + 3 * 60 * 60) * 1000);
    vi.spyOn(document, "visibilityState", "get").mockReturnValue("visible");

    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(result.current).toBe(START + 3 * 60 * 60);
  });

  it("stops ticking once no component reads it", () => {
    const { unmount } = renderHook(() => useNow(1000));
    expect(vi.getTimerCount()).toBe(1);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
