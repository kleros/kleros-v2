import { renderHook } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { useParsedAmount } from "./useParsedAmount";

describe("useParsedAmount", () => {
  it.each([
    ["0", 0n],
    ["1", 10n ** 18n],
    ["0.5", 5n * 10n ** 17n],
    ["1234.000000000000000001", 1234n * 10n ** 18n + 1n],
  ] as const)("parses %s with 18 decimals", (amount, expected) => {
    const { result } = renderHook(() => useParsedAmount(amount as `${number}`));
    expect(result.current).toBe(expected);
  });
});
