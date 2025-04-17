// Typechain Ethers v6 artifacts
export * as arbitrum from "./arbitrum";
export * as arbitrumSepolia from "./arbitrumSepolia";
export * as arbitrumSepoliaDevnet from "./arbitrumSepoliaDevnet";

// Viem artifacts
export * as devnetViem from "./devnet.viem";
export * as mainnetViem from "./mainnet.viem";
export * as testnetViem from "./testnet.viem";

// Typechain-types
export * from "../typechain-types";

// Common utils
export * from "./utils";

// Contracts getters
export { getContracts as getContractsEthers } from "./contractsEthers";
export { getContracts as getContractsViem } from "./contractsViem";
