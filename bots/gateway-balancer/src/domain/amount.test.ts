import { describe, expect, it } from "vitest";
import { applyBps, lossBps, mulDiv, splitProRata } from "./amount";

describe("amount helpers", () => {
  it("splits pro-rata and gives rounding dust to the largest weight", () => {
    expect(splitProRata(100n, [1n, 1n, 1n])).toEqual([34n, 33n, 33n]);
    expect(splitProRata(100n, [1n, 3n])).toEqual([25n, 75n]);
    expect(splitProRata(7n, [2n, 5n])).toEqual([2n, 5n]);
    const parts = splitProRata(1_000_000_007n, [123n, 456n, 789n]);
    expect(parts.reduce((a, b) => a + b, 0n)).toBe(1_000_000_007n);
  });

  it("handles zero weights and rejects bad input", () => {
    expect(splitProRata(10n, [0n, 0n])).toEqual([10n, 0n]);
    expect(() => splitProRata(10n, [])).toThrow();
    expect(() => splitProRata(-1n, [1n])).toThrow();
  });

  it("applies basis points and computes loss", () => {
    expect(applyBps(10_000n, 500)).toBe(500n);
    expect(lossBps(100n, 95n)).toBe(500);
    expect(lossBps(100n, 100n)).toBe(0);
    expect(lossBps(100n, 120n)).toBe(0);
    expect(lossBps(0n, 1n)).toBe(0);
  });

  it("mulDiv floors and refuses a zero denominator", () => {
    expect(mulDiv(10n, 1n, 3n)).toBe(3n);
    expect(() => mulDiv(1n, 1n, 0n)).toThrow();
  });
});
