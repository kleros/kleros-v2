import { keccak256, encodeAbiParameters, toBytes } from "viem";
import { describe, it, expect } from "vitest";

import { hashJustification } from "./hashJustification";

describe("hashJustification", () => {
  it("hashes salt and justification correctly", () => {
    const salt = 123n;
    const justification = "This is my justification";

    const result = hashJustification(salt, justification);

    const justificationHash = keccak256(toBytes(justification));
    const encoded = encodeAbiParameters([{ type: "uint256" }, { type: "bytes32" }], [salt, justificationHash]);

    expect(result).toBe(keccak256(encoded));
  });

  it("produces different hashes for different justifications", () => {
    const salt = 100n;

    expect(hashJustification(salt, "A")).not.toBe(hashJustification(salt, "B"));
  });

  it("treats empty string as a real justification", () => {
    const salt = 1n;

    const empty = hashJustification(salt, "");
    const nonEmpty = hashJustification(salt, " ");

    expect(empty).not.toBe(nonEmpty);
  });

  it("handles unicode justification", () => {
    const result = hashJustification(1n, "这是中文 🎉 émoji");
    expect(result).toMatch(/^0x[a-fA-F0-9]{64}$/);
  });

  it("hashes justification as bytes32, not abi string", () => {
    const salt = 1n;
    const justification = "abc";

    const correct = hashJustification(salt, justification);

    const wrongEncoded = encodeAbiParameters([{ type: "uint256" }, { type: "string" }], [salt, justification]);

    expect(correct).not.toBe(keccak256(wrongEncoded));
  });

  it("is deterministic", () => {
    const salt = 5n;
    const justification = "same";

    expect(hashJustification(salt, justification)).toBe(hashJustification(salt, justification));
  });
});
