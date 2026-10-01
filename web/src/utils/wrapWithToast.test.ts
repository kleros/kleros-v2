import { encodeAbiParameters, encodeEventTopics, pad, parseAbi, type Address, type PublicClient } from "viem";
import { describe, expect, it, vi } from "vitest";
vi.mock("react-toastify", () => ({ toast: { info: vi.fn(), success: vi.fn(), error: vi.fn() } }));

import { toast } from "react-toastify";

import { ENTRY_POINT_ADDRESSES } from "./userOperation";
import { wrapWithToast } from "./wrapWithToast";

const abi = parseAbi([
  "event UserOperationEvent(bytes32 indexed userOpHash, address indexed sender, address indexed paymaster, uint256 nonce, bool success, uint256 actualGasCost, uint256 actualGasUsed)",
]);
const JUROR: Address = "0x00000000000000000000000000000000000000aa";
const HASH = "0x1111111111111111111111111111111111111111111111111111111111111111" as const;

const clientWith = (logs: unknown[]) =>
  ({ waitForTransactionReceipt: vi.fn().mockResolvedValue({ status: "success", logs }) }) as unknown as PublicClient;

const failedUserOp = () => ({
  address: ENTRY_POINT_ADDRESSES[1],
  topics: encodeEventTopics({
    abi,
    eventName: "UserOperationEvent",
    args: { userOpHash: pad("0x01", { size: 32 }), sender: JUROR, paymaster: JUROR },
  }),
  data: encodeAbiParameters(
    [{ type: "uint256" }, { type: "bool" }, { type: "uint256" }, { type: "uint256" }],
    [0n, false, 1n, 1n]
  ),
});

describe("wrapWithToast", () => {
  it("reports a reverted inner user operation as a failure", async () => {
    const { status } = await wrapWithToast(async () => HASH, clientWith([failedUserOp()]), JUROR);
    expect(status).toBe(false);
    expect(toast.error).toHaveBeenCalledWith("Transaction reverted!", expect.anything());
  });

  it("keeps successful plain receipts successful", async () => {
    const { status } = await wrapWithToast(async () => HASH, clientWith([]), JUROR);
    expect(status).toBe(true);
  });
});
