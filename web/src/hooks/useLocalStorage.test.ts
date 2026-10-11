import { act, renderHook } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import { useLocalStorage } from "./useLocalStorage";

describe("useLocalStorage", () => {
  it("starts from the default when nothing is stored", () => {
    const { result } = renderHook(() => useLocalStorage("key", { a: 1 }));
    expect(result.current[0]).toEqual({ a: 1 });
  });

  it("reads a stored JSON value", () => {
    localStorage.setItem("key", JSON.stringify(["x"]));
    const { result } = renderHook(() => useLocalStorage<string[]>("key", []));
    expect(result.current[0]).toEqual(["x"]);
  });

  it("falls back to the default on corrupted storage", () => {
    localStorage.setItem("key", "{not json");
    const { result } = renderHook(() => useLocalStorage("key", "fallback"));
    expect(result.current[0]).toBe("fallback");
  });

  it("persists and returns the new value", () => {
    const { result } = renderHook(() => useLocalStorage("key", 0));
    act(() => (result.current[1] as (v: number) => void)(5));
    expect(result.current[0]).toBe(5);
    expect(localStorage.getItem("key")).toBe("5");
  });

  it("still updates in memory when storage throws", () => {
    vi.mocked(localStorage.setItem).mockImplementationOnce(() => {
      throw new Error("QuotaExceededError");
    });
    const { result } = renderHook(() => useLocalStorage("key", 0));

    let thrown: unknown;
    act(() => {
      try {
        (result.current[1] as (v: number) => void)(5);
      } catch (error) {
        thrown = error;
      }
    });

    expect(thrown).toEqual(new Error("QuotaExceededError"));
    expect(result.current[0]).toBe(5);
  });
});
