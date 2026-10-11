import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSessionStorage } from "./useSessionStorage";

describe("useSessionStorage", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  it("returns the default when the key is absent", () => {
    const { result } = renderHook(() => useSessionStorage("key", "fallback"));

    expect(result.current[0]).toBe("fallback");
  });

  it("reads and JSON-parses a stored value", () => {
    window.sessionStorage.setItem("key", JSON.stringify({ a: 1 }));

    const { result } = renderHook(() => useSessionStorage("key", {}));

    expect(result.current[0]).toEqual({ a: 1 });
  });

  it("returns the default when the stored value is not JSON", () => {
    window.sessionStorage.setItem("key", "{corrupt");

    const { result } = renderHook(() => useSessionStorage("key", "fallback"));

    expect(result.current[0]).toBe("fallback");
  });

  it("writes JSON to sessionStorage and updates the state", () => {
    const { result } = renderHook(() => useSessionStorage<string | undefined>("key", undefined));

    act(() => result.current[1]("token"));

    expect(result.current[0]).toBe("token");
    expect(window.sessionStorage.getItem("key")).toBe('"token"');
  });

  it("rethrows a sessionStorage write error after updating the state", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });
    const { result } = renderHook(() => useSessionStorage("key", "a"));

    let thrown: unknown;
    act(() => {
      try {
        result.current[1]("b");
      } catch (error) {
        thrown = error;
      }
    });

    expect(thrown).toEqual(new Error("QuotaExceededError"));
    expect(result.current[0]).toBe("b");
  });
});
