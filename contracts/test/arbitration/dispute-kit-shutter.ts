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
 * Test suite for DisputeKitShutter - implements shielded voting with commit-reveal mechanism
 * using the Shutter protocol for encrypted vote storage and decryption.
 *
 * Tests cover:
 * - Commit phase with recovery commitments
 * - Normal flow where bot reveals votes
 * - Recovery flow where jurors reveal their own votes
 * - Hash function behavior for different callers
 * - Edge cases and security considerations
 */
describe("DisputeKitShutter", async () => {
  let context: ShutterTestContext;

  beforeEach("Setup", async () => {
    context = await setupShutterTest({ contractName: "DisputeKitShutter" });
  });

  // Run all shared Shutter tests with the context
  testCommitPhase(() => context);
  testNormalFlowBotReveals(() => context);
  testRecoveryFlowJurorReveals(() => context);
  testEdgeCasesAndSecurity(() => context);
});
