import { type Address, isAddressEqual, parseAbi, parseEventLogs, type TransactionReceipt } from "viem";

/** ERC-4337 EntryPoint v0.6, v0.7 and v0.8. */
export const ENTRY_POINT_ADDRESSES: readonly Address[] = [
  "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
  "0x0000000071727De22E5E9d8BAf0edAc6f37da032",
  "0x4337084D9E255Ff0702461CF8895CE9E3b5Ff108",
];

const userOperationEventAbi = parseAbi([
  "event UserOperationEvent(bytes32 indexed userOpHash, address indexed sender, address indexed paymaster, uint256 nonce, bool success, uint256 actualGasCost, uint256 actualGasUsed)",
]);

/**
 * Sponsored sends return the EntryPoint `handleOps` transaction: the bundle can succeed while the user
 * operation's inner call reverts. Returns true when the receipt carries a failed `UserOperationEvent`
 * (for `sender` when given). Receipts without such events (external wallets) are never reverted here.
 */
export const isUserOperationReverted = (receipt: TransactionReceipt, sender?: Address): boolean => {
  const entryPointLogs = receipt.logs.filter((log) =>
    ENTRY_POINT_ADDRESSES.some((entryPoint) => isAddressEqual(entryPoint, log.address))
  );
  return parseEventLogs({ abi: userOperationEventAbi, logs: entryPointLogs, strict: false }).some(
    (log) => log.args.success === false && (!sender || (log.args.sender && isAddressEqual(log.args.sender, sender)))
  );
};
