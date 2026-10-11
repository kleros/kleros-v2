/**
 * Mock contract data for dispute kit builders tests.
 * This file contains mock ABIs and addresses used in test files.
 *
 * These are exported as separate objects that can be imported in vi.mock factories.
 */

// Classic Dispute Kit
export const MOCK_CLASSIC_DK_ADDRESS = "0x1234567890123456789012345678901234567890";
export const MOCK_CLASSIC_DK_ABI = [
  { name: "castCommit", type: "function" },
  { name: "castVote", type: "function" },
  { name: "fundAppeal", type: "function" },
];

// Gated Dispute Kit
export const MOCK_GATED_DK_ADDRESS = "0x1234567890123456789012345678901234567891";
export const MOCK_GATED_DK_ABI = [
  { name: "castCommit", type: "function" },
  { name: "castVote", type: "function" },
  { name: "fundAppeal", type: "function" },
];

// Shutter Dispute Kit
export const MOCK_SHUTTER_DK_ADDRESS = "0x1234567890123456789012345678901234567892";
export const MOCK_SHUTTER_DK_ABI = [
  { name: "castCommitShutter", type: "function" },
  { name: "castVoteShutter", type: "function" },
  { name: "fundAppeal", type: "function" },
];

// Gated Shutter Dispute Kit
export const MOCK_GATED_SHUTTER_DK_ADDRESS = "0x1234567890123456789012345678901234567893";
export const MOCK_GATED_SHUTTER_DK_ABI = [
  { name: "castCommitShutter", type: "function" },
  { name: "castVoteShutter", type: "function" },
  { name: "castVote", type: "function" },
  { name: "fundAppeal", type: "function" },
];

// Argentina Consumer Protection (gated) Dispute Kit
export const MOCK_ARGENTINA_CONSUMER_PROTECTION_DK_ADDRESS = "0x1234567890123456789012345678901234567894";
export const MOCK_ARGENTINA_CONSUMER_PROTECTION_DK_ABI = [
  { name: "castCommit", type: "function" },
  { name: "castVote", type: "function" },
  { name: "fundAppeal", type: "function" },
];

// Classic University Dispute Kit
export const MOCK_CLASSIC_UNIVERSITY_DK_ADDRESS = "0x1234567890123456789012345678901234567895";
export const MOCK_CLASSIC_UNIVERSITY_DK_ABI = [
  { name: "castCommit", type: "function" },
  { name: "castVote", type: "function" },
  { name: "fundAppeal", type: "function" },
];

// Chain ID for Arbitrum Sepolia
export const ARBITRUM_SEPOLIA_CHAIN_ID = 421614;

/**
 * Complete mock module for hooks/contracts/generated.
 * Import this in vi.mock factory to mock all dispute kit contracts.
 */
export const mockContractsGenerated = {
  disputeKitClassicAbi: MOCK_CLASSIC_DK_ABI,
  disputeKitClassicAddress: {
    [ARBITRUM_SEPOLIA_CHAIN_ID]: MOCK_CLASSIC_DK_ADDRESS,
  },
  disputeKitGatedAbi: MOCK_GATED_DK_ABI,
  disputeKitGatedAddress: {
    [ARBITRUM_SEPOLIA_CHAIN_ID]: MOCK_GATED_DK_ADDRESS,
  },
  disputeKitShutterAbi: MOCK_SHUTTER_DK_ABI,
  disputeKitShutterAddress: {
    [ARBITRUM_SEPOLIA_CHAIN_ID]: MOCK_SHUTTER_DK_ADDRESS,
  },
  disputeKitGatedShutterAbi: MOCK_GATED_SHUTTER_DK_ABI,
  disputeKitGatedShutterAddress: {
    [ARBITRUM_SEPOLIA_CHAIN_ID]: MOCK_GATED_SHUTTER_DK_ADDRESS,
  },
  disputeKitGatedArgentinaConsumerProtectionAbi: MOCK_ARGENTINA_CONSUMER_PROTECTION_DK_ABI,
  disputeKitGatedArgentinaConsumerProtectionAddress: {
    [ARBITRUM_SEPOLIA_CHAIN_ID]: MOCK_ARGENTINA_CONSUMER_PROTECTION_DK_ADDRESS,
  },
  disputeKitClassicUniversityAbi: MOCK_CLASSIC_UNIVERSITY_DK_ABI,
  disputeKitClassicUniversityAddress: {
    [ARBITRUM_SEPOLIA_CHAIN_ID]: MOCK_CLASSIC_UNIVERSITY_DK_ADDRESS,
  },
};

/** Mocked address and ABI per on-chain dispute kit id, for table-driven builder tests. */
export const MOCK_DK_CONTRACTS = {
  1: { address: MOCK_CLASSIC_DK_ADDRESS, abi: MOCK_CLASSIC_DK_ABI },
  2: { address: MOCK_SHUTTER_DK_ADDRESS, abi: MOCK_SHUTTER_DK_ABI },
  3: { address: MOCK_GATED_DK_ADDRESS, abi: MOCK_GATED_DK_ABI },
  4: { address: MOCK_GATED_SHUTTER_DK_ADDRESS, abi: MOCK_GATED_SHUTTER_DK_ABI },
  5: { address: MOCK_ARGENTINA_CONSUMER_PROTECTION_DK_ADDRESS, abi: MOCK_ARGENTINA_CONSUMER_PROTECTION_DK_ABI },
  6: { address: MOCK_CLASSIC_UNIVERSITY_DK_ADDRESS, abi: MOCK_CLASSIC_UNIVERSITY_DK_ABI },
} as const;
