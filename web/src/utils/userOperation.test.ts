import {
  encodeAbiParameters,
  encodeEventTopics,
  pad,
  parseAbi,
  type Address,
  type Log,
  type TransactionReceipt,
} from "viem";
import { describe, expect, it } from "vitest";

import { ENTRY_POINT_ADDRESSES, isUserOperationReverted } from "./userOperation";

const userOperationEventAbi = parseAbi([
  "event UserOperationEvent(bytes32 indexed userOpHash, address indexed sender, address indexed paymaster, uint256 nonce, bool success, uint256 actualGasCost, uint256 actualGasUsed)",
]);

const JUROR: Address = "0x00000000000000000000000000000000000000aa";
const OTHER: Address = "0x00000000000000000000000000000000000000bb";
const PAYMASTER: Address = "0x00000000000000000000000000000000000000cc";

const userOpLog = (entryPoint: Address, sender: Address, success: boolean): Log =>
  ({
    address: entryPoint,
    topics: encodeEventTopics({
      abi: userOperationEventAbi,
      eventName: "UserOperationEvent",
      args: { userOpHash: pad("0x01", { size: 32 }), sender, paymaster: PAYMASTER },
    }),
    data: encodeAbiParameters(
      [{ type: "uint256" }, { type: "bool" }, { type: "uint256" }, { type: "uint256" }],
      [0n, success, 1n, 1n]
    ),
  }) as unknown as Log;

const receipt = (logs: Log[]) => ({ status: "success", logs }) as unknown as TransactionReceipt;

describe("isUserOperationReverted", () => {
  it.each(ENTRY_POINT_ADDRESSES)("detects a reverted inner call for EntryPoint %s", (entryPoint) => {
    expect(isUserOperationReverted(receipt([userOpLog(entryPoint, JUROR, false)]), JUROR)).toBe(true);
  });

  it("passes a successful user operation", () => {
    expect(isUserOperationReverted(receipt([userOpLog(ENTRY_POINT_ADDRESSES[1], JUROR, true)]), JUROR)).toBe(false);
  });

  it("ignores failed operations of other senders when a sender is given", () => {
    expect(isUserOperationReverted(receipt([userOpLog(ENTRY_POINT_ADDRESSES[1], OTHER, false)]), JUROR)).toBe(false);
  });

  it("matches the sender case-insensitively", () => {
    const checksummed = "0x00000000000000000000000000000000000000Aa" as Address;
    expect(isUserOperationReverted(receipt([userOpLog(ENTRY_POINT_ADDRESSES[0], JUROR, false)]), checksummed)).toBe(
      true
    );
  });

  it("treats any failed operation as a failure when no sender is given", () => {
    expect(isUserOperationReverted(receipt([userOpLog(ENTRY_POINT_ADDRESSES[2], OTHER, false)]))).toBe(true);
  });

  it("ignores same-shaped events emitted by a non EntryPoint contract", () => {
    expect(isUserOperationReverted(receipt([userOpLog(OTHER, JUROR, false)]), JUROR)).toBe(false);
  });

  it("is unaffected for receipts without user operation events (external wallets)", () => {
    expect(isUserOperationReverted(receipt([]), JUROR)).toBe(false);
  });
});
