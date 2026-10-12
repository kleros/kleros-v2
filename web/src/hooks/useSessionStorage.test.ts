import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, it, expect } from "vitest";

import { useSessionStorage } from "./useSessionStorage";

describe("useSessionStorage", () => {
  afterEach(() => {
    sessionStorage.clear();
  });

  it("starts from the default, or from a stored JSON value", () => {
    expect(renderHook(() => useSessionStorage("k", 1)).result.current[0]).toBe(1);

    sessionStorage.setItem("k", JSON.stringify({ step: 2 }));
    expect(renderHook(() => useSessionStorage("k", {})).result.current[0]).toEqual({ step: 2 });
  });

  it("falls back to the default on corrupted storage", () => {
    sessionStorage.setItem("k", "{oops");
    expect(renderHook(() => useSessionStorage("k", "fallback")).result.current[0]).toBe("fallback");
  });

  it("persists the new value", () => {
    const { result } = renderHook(() => useSessionStorage("k", 0));
    act(() => result.current[1](9));

    expect(result.current[0]).toBe(9);
    expect(sessionStorage.getItem("k")).toBe("9");
  });
});
