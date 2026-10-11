import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";

import { T0 } from "src/test/builders";

import { useCountdown } from "./useCountdown";

describe("useCountdown", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(T0 * 1000);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("is undefined until a deadline is known", () => {
    const { result } = renderHook(() => useCountdown(undefined));
    expect(result.current).toBeUndefined();
  });

  it("ticks down once per second and stops at zero", () => {
    const { result } = renderHook(() => useCountdown(T0 + 2));
    expect(result.current).toBe(2);

    act(() => vi.advanceTimersByTime(1000));
    expect(result.current).toBe(1);

    act(() => vi.advanceTimersByTime(1000));
    expect(result.current).toBe(0);

    act(() => vi.advanceTimersByTime(5000));
    expect(result.current).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
  });

  it.fails("KNOWN BUG: counts timer ticks instead of reading the clock, so it lags after throttled timers", () => {
    const { result } = renderHook(() => useCountdown(T0 + 100));
    // A background tab delays the next tick by a minute; the clock moves on regardless.
    vi.setSystemTime((T0 + 60) * 1000);
    act(() => vi.advanceTimersByTime(1000));

    expect(result.current).toBe(40);
  });

  it("is zero for a deadline in the past", () => {
    const { result } = renderHook(() => useCountdown(T0 - 60));
    expect(result.current).toBe(0);
  });

  it("restarts from the new deadline when it changes", () => {
    const { result, rerender } = renderHook(({ deadline }) => useCountdown(deadline), {
      initialProps: { deadline: T0 + 10 },
    });
    for (let i = 0; i < 3; i++) act(() => vi.advanceTimersByTime(1000));
    expect(result.current).toBe(7);

    rerender({ deadline: T0 + 100 });
    expect(result.current).toBe(97);
  });
});
