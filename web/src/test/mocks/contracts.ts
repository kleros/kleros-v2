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
};
