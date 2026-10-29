import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const STORAGE_KEY = "jurorActionSubmissions";
const JUROR = "0xAbC0000000000000000000000000000000000001";
const NOW = 1_800_000_000;
const DAY = 24 * 60 * 60;

// The store caches what it read: load a fresh copy, as a page load does.
const loadStore = async () => {
  vi.resetModules();
  return import("./useJurorActionSubmissions");
};

const stored = () => JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");

describe("useJurorActionSubmissions", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(NOW * 1000);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("remembers a submission across page loads", async () => {
    const store = await loadStore();
    store.markJurorActionSubmitted(JUROR, 12n, "vote", [0n, 1n], 150n);
    const expected = { [store.getSubmissionKey(JUROR, "12", "vote")]: { block: "150", voteIds: ["0", "1"], at: NOW } };
    expect(stored()).toEqual(expected);

    const { useJurorActionSubmissions } = await loadStore();
    expect(renderHook(() => useJurorActionSubmissions()).result.current).toEqual(expected);
  });

  it("keeps the other submissions and replaces an earlier one of the same action", async () => {
    const store = await loadStore();
    store.markJurorActionSubmitted(JUROR, 12n, "commit", [0n, 1n, 2n], 150n);
    store.markJurorActionSubmitted(JUROR, 13n, "vote", [0n], 151n);
    store.markJurorActionSubmitted(JUROR, 12n, "commit", [2n], 160n);

    expect(stored()).toEqual({
      [store.getSubmissionKey(JUROR, "12", "commit")]: { block: "160", voteIds: ["2"], at: NOW },
      [store.getSubmissionKey(JUROR, "13", "vote")]: { block: "151", voteIds: ["0"], at: NOW },
    });
  });

  it("forgets submissions older than a day on the next page load", async () => {
    const store = await loadStore();
    store.markJurorActionSubmitted(JUROR, 12n, "vote", [0n], 150n);
    vi.setSystemTime((NOW + DAY) * 1000);

    const { useJurorActionSubmissions } = await loadStore();
    expect(renderHook(() => useJurorActionSubmissions()).result.current).toEqual({});
  });

  it("drops submissions older than a day when an open tab writes a new one", async () => {
    const store = await loadStore();
    store.markJurorActionSubmitted(JUROR, 12n, "vote", [0n], 150n);
    vi.setSystemTime((NOW + DAY) * 1000);
    store.markJurorActionSubmitted(JUROR, 13n, "vote", [0n], 200n);

    expect(Object.keys(stored())).toEqual([store.getSubmissionKey(JUROR, "13", "vote")]);
  });

  it("shows the submissions sent from another tab", async () => {
    const { useJurorActionSubmissions, getSubmissionKey } = await loadStore();
    const { result } = renderHook(() => useJurorActionSubmissions());
    expect(result.current).toEqual({});

    const submission = { block: "150", voteIds: ["0"], at: NOW };
    const key = getSubmissionKey(JUROR, "12", "reveal");
    act(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ [key]: submission }));
      window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }));
    });
    expect(result.current).toEqual({ [key]: submission });
  });

  it("ignores malformed stored entries", async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        withoutVoteIds: { block: "150", at: NOW },
        hexBlock: { block: "0x96", voteIds: ["0"], at: NOW },
        nonNumericVoteId: { block: "150", voteIds: ["first"], at: NOW },
        valid: { block: "150", voteIds: ["0"], at: NOW },
      })
    );

    const { useJurorActionSubmissions } = await loadStore();
    expect(Object.keys(renderHook(() => useJurorActionSubmissions()).result.current)).toEqual(["valid"]);
  });

  it("still remembers a submission until the page reloads when storage is unavailable", async () => {
    const store = await loadStore();
    vi.mocked(localStorage.setItem).mockImplementationOnce(() => {
      throw new Error("QuotaExceededError");
    });
    const { result } = renderHook(() => store.useJurorActionSubmissions());

    act(() => store.markJurorActionSubmitted(JUROR, 12n, "vote", [0n], 150n));
    expect(result.current).toHaveProperty(store.getSubmissionKey(JUROR, "12", "vote"));
    expect(stored()).toEqual({});
  });
});
