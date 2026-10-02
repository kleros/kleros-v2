import { describe, expect, it } from "vitest";
import { cloneJson, parseJson, stringifyJson } from "./json";

describe("journal json", () => {
  it("round-trips bigints inside nested values", () => {
    const value = { amount: 10n ** 24n, steps: [{ minOut: 1n, note: "x" }], flag: true, none: null };
    expect(parseJson(stringifyJson(value))).toEqual(value);
    expect(stringifyJson({ a: 1n })).toBe('{"a":{"$bigint":"1"}}');
  });

  it("clones deeply", () => {
    const value = { a: [1n] };
    const copy = cloneJson(value);
    copy.a.push(2n);
    expect(value.a).toEqual([1n]);
  });
});
