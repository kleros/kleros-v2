import {
  setupTokenGatedTest,
  testFixedTokenGateConfiguration,
  testERC20Gating,
  testERC721Gating,
  testERC1155Gating,
  TokenGatedTestContext,
} from "./helpers/dispute-kit-gated-common";

/**
 * Test suite for DisputeKitGated instances configured with fixed ERC20, ERC721,
 * or ERC1155 token gates.
 *
 * Tests cover:
 * - Eligibility based on the configured token and ERC1155 token ID
 * - Fixed configuration across disputes and rejected reinitialization
 * - ERC20, ERC721, and ERC1155 drawing filters
 * - Filtering cutoff and fallback drawing after the attempt limit
 */
describe("DisputeKitGated", async () => {
  let context: TokenGatedTestContext;

  beforeEach("Setup", async () => {
    context = await setupTokenGatedTest({
      contractName: "DisputeKitGated",
    });
  });

  // Run all shared tests with the context
  testFixedTokenGateConfiguration(() => context);
  testERC20Gating(() => context);
  testERC721Gating(() => context);
  testERC1155Gating(() => context);
});
