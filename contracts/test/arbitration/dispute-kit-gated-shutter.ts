import {
  setupTokenGatedTest,
  testTokenWhitelistManagement,
  testAccessControl,
  testUnsupportedTokenErrors,
  testERC20Gating,
  testERC721Gating,
  testERC1155Gating,
  testWhitelistIntegration,
  testNoTokenGateAddress,
  TokenGatedTestContext,
} from "./helpers/dispute-kit-gated-common";
import {
  setupShutterTest,
  testCommitPhase,
  testNormalFlowBotReveals,
  testRecoveryFlowJurorReveals,
  testEdgeCasesAndSecurity,
  ShutterTestContext,
} from "./helpers/dispute-kit-shutter-common";

/* eslint-disable no-unused-vars */
/* eslint-disable no-unused-expressions */

/**
 * Test suite for DisputeKitGatedShutter - a dispute kit that requires jurors to hold
 * specific tokens (ERC20, ERC721, or ERC1155) to participate in disputes, with additional
 * Shutter functionality for commit-reveal voting.
 *
 * Tests cover:
 * - All DisputeKitGated functionality (via shared tests)
 * - Shutter-specific commit/reveal mechanism
 * - Recovery commits for juror vote recovery
 * - Integration between token gating and Shutter features
 */
describe("DisputeKitGatedShutter", async () => {
  describe("Token Gating Features", async () => {
    let tokenContext: TokenGatedTestContext;

    beforeEach("Setup", async () => {
      tokenContext = await setupTokenGatedTest({ contractName: "DisputeKitGatedShutterMock" });
    });

    // Run all shared token gating tests
    testTokenWhitelistManagement(() => tokenContext);
    testAccessControl(() => tokenContext);
    testUnsupportedTokenErrors(() => tokenContext);
    testERC20Gating(() => tokenContext);
    testERC721Gating(() => tokenContext);
    testERC1155Gating(() => tokenContext);
    testWhitelistIntegration(() => tokenContext);
    testNoTokenGateAddress(() => tokenContext);
  });

  describe("Shutter Features", async () => {
    let shutterContext: ShutterTestContext;

    beforeEach("Setup", async () => {
      // Setup DisputeKitGatedShutter with token gating enabled
      shutterContext = await setupShutterTest({
        contractName: "DisputeKitGatedShutter",
        isGated: true, // Enable token gating for DAI
      });
    });

    // Run all shared Shutter tests
    testCommitPhase(() => shutterContext);
    testNormalFlowBotReveals(() => shutterContext);
    testRecoveryFlowJurorReveals(() => shutterContext);
    testEdgeCasesAndSecurity(() => shutterContext);
  });
});
