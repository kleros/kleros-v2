import {
  setupTokenGatedTest,
  testTokenWhitelistManagement,
  testAccessControl,
  testUnsupportedTokenErrors,
  testERC20Gating,
  testERC721Gating,
  testERC1155Gating,
  testWhitelistIntegration,
  TokenGatedTestContext,
} from "./helpers/dispute-kit-gated-common";

/* eslint-disable no-unused-vars */
/* eslint-disable no-unused-expressions */

/**
 * Test suite for DisputeKitGated - a dispute kit that requires jurors to hold
 * specific tokens (ERC20, ERC721, or ERC1155) to participate in disputes.
 *
 * Tests cover:
 * - Token whitelist management and access control
 * - Error handling for unsupported tokens
 * - Token gating functionality for different token types
 * - Integration between whitelist and dispute creation
 */
describe("DisputeKitGated", async () => {
  let context: TokenGatedTestContext;

  beforeEach("Setup", async () => {
    context = await setupTokenGatedTest({ contractName: "DisputeKitGatedMock" });
  });

  // Run all shared tests with the context
  testTokenWhitelistManagement(() => context);
  testAccessControl(() => context);
  testUnsupportedTokenErrors(() => context);
  testERC20Gating(() => context);
  testERC721Gating(() => context);
  testERC1155Gating(() => context);
  testWhitelistIntegration(() => context);
});
