// Viem artifacts
export * as devnetViem from "./devnet.viem";
export * as mainnetViem from "./mainnet.viem";
export * as testnetViem from "./testnet.viem";

// Common utils
export * from "./utils";

// Contracts getter
export { getContracts } from "./contractsViem";

// Dispute kits getter
export { getDisputeKits, type DisputeKitByIds, type DisputeKitInfos } from "./disputeKitsViem";
