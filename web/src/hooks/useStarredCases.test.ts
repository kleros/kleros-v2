import { act, renderHook } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import useStarredCases from "./useStarredCases";

describe("useStarredCases", () => {
  it("stars and unstars a case, persisting the ids", () => {
    const { result } = renderHook(() => useStarredCases());

    act(() => result.current.starCase("12"));
    act(() => result.current.starCase("7"));
    expect(result.current.starredCaseIds).toEqual(["12", "7"]);
    expect(JSON.parse(localStorage.getItem("starredCases")!)).toEqual(["12", "7"]);

    act(() => result.current.starCase("12"));
    expect(result.current.starredCaseIds).toEqual(["7"]);
    expect(result.current.starredCases.has("12")).toBe(false);
  });

  it("restores starred cases and clears them all", () => {
    localStorage.setItem("starredCases", JSON.stringify(["3", "3", "5"]));
    const { result } = renderHook(() => useStarredCases());
    expect(result.current.starredCaseIds).toEqual(["3", "5"]);

    act(() => result.current.clearAll());
    expect(result.current.starredCaseIds).toEqual([]);
    expect(localStorage.getItem("starredCases")).toBe("[]");
  });
});
