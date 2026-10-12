import { parseEther, parseUnits } from "viem";
import { describe, it, expect } from "vitest";

import { beautifyStatNumber, unbeautifyStatNumber } from "./beautifyStatNumber";
import { commify, uncommify } from "./commify";
import { formatETH, formatPNK, formatUSD, formatUnitsWei, formatValue, roundNumberDown } from "./format";
import { getCoherencePercent } from "./getCoherencePercent";
import { transformSearch } from "./transformSearch";

describe("commify", () => {
  it.each([
    [0, "0"],
    [999, "999"],
    [1000, "1,000"],
    [1234567, "1,234,567"],
    ["-1234567.891", "-1,234,567.891"],
    ["0001234", "1,234"],
    ["1234.50", "1,234.5"],
    ["1234.0", "1,234"],
    [".5", "0"],
    ["12abc", "0"],
    ["1e21", "0"],
  ])("commify(%j) = %j", (value, expected) => {
    expect(commify(value)).toBe(expected);
  });

  it("uncommify strips every thousands separator", () => {
    expect(uncommify("1,234,567.89")).toBe("1234567.89");
    expect(uncommify(commify("98765432.1"))).toBe("98765432.1");
  });
});

describe("beautifyStatNumber", () => {
  it.each([
    [0, "0"],
    [999, "999"],
    [1500, "1.5K"],
    [2_345_678, "2.35M"],
    [7_000_000_000, "7B"],
    [1_234_000_000_000, "1,234B"],
    [-1500, "-1.5K"],
    [0.25, "0.25"],
    [12.345, "12.35"],
  ])("beautifyStatNumber(%d) = %j", (value, expected) => {
    expect(beautifyStatNumber(value)).toBe(expected);
  });

  it("inverts fractions when asked (e.g. odds)", () => {
    expect(beautifyStatNumber(0.25, true)).toBe("4");
    expect(beautifyStatNumber(0.0005, true)).toBe("2K");
  });

  it.each([
    ["1.50K", 1500],
    ["2.35M", 2_350_000],
    ["1,234B", 1_234_000_000_000],
    ["42", 42],
  ])("unbeautifyStatNumber(%j) = %d", (value, expected) => {
    expect(unbeautifyStatNumber(value)).toBe(expected);
  });

  it("rejects strings it did not produce", () => {
    expect(() => unbeautifyStatNumber("1.5T")).toThrow("Invalid formatted number string");
    expect(() => unbeautifyStatNumber("-1K")).toThrow("Invalid formatted number string");
  });
});

describe("format", () => {
  it("roundNumberDown truncates toward negative infinity at the given precision", () => {
    expect(roundNumberDown(1.999, 2)).toBe(1.99);
    expect(roundNumberDown(1.999)).toBe(1);
    expect(roundNumberDown(-1.001, 2)).toBe(-1.01);
  });

  it("formatValue rounds half-up by default and down on request", () => {
    expect(formatValue("1234.5678", 2, false)).toBe("1,234.57");
    expect(formatValue("1234.5678", 2, true)).toBe("1,234.56");
  });

  it("formatUnitsWei reads 18 decimals", () => {
    expect(formatUnitsWei(parseUnits("1.5", 18))).toBe("1.5");
  });

  it("formatPNK shows whole PNK by default", () => {
    expect(formatPNK(parseUnits("12345.9", 18))).toBe("12,346");
    expect(formatPNK(parseUnits("12345.9", 18), 0, true)).toBe("12,345");
    expect(formatPNK(parseUnits("0.123", 18), 2)).toBe("0.12");
  });

  it("formatETH shows four decimals by default", () => {
    expect(formatETH(parseEther("0.123456"))).toBe("0.1235");
    expect(formatETH(parseEther("0.123456"), 4, true)).toBe("0.1234");
    expect(formatETH(parseEther("1000"))).toBe("1,000");
  });

  it("formatUSD prefixes the dollar sign", () => {
    expect(formatUSD(1234.5)).toBe("$1,234.5");
    expect(formatUSD(0.004)).toBe("$0");
  });
});

describe("getCoherencePercent", () => {
  it.each([
    [0, 0, "0%"],
    [1, 3, "33%"],
    [2, 3, "66%"],
    [5, 5, "100%"],
  ])("%d of %d coherent = %s", (num, den, expected) => {
    expect(getCoherencePercent(num, den)).toBe(expected);
  });
});

describe("transformSearch", () => {
  it("returns null for an empty search", () => {
    expect(transformSearch()).toBeNull();
    expect(transformSearch("")).toBeNull();
  });

  it("turns every word into an exact-or-prefix full-text term", () => {
    expect(transformSearch("  token   gate ")).toBe("token | token:* | gate | gate:*");
  });
});
