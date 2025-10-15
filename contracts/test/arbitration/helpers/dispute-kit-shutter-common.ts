import { deployments, ethers, getNamedAccounts, network } from "hardhat";
import { toBigInt, BigNumberish } from "ethers";
import {
  PNK,
  KlerosCore,
  SortitionModule,
  IncrementalNG,
  DisputeKitShutter,
  DisputeKitGatedShutterMock,
  TestERC20,
} from "../../../typechain-types";
import { expect } from "chai";
import { Courts } from "../../../deploy/utils";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { deployUpgradable } from "../../../deploy/utils/deployUpgradable";
import { encodeExtraData as encodeGatedExtraData } from "./dispute-kit-gated-common";

/* eslint-disable no-unused-vars */
/* eslint-disable no-unused-expressions */

// Type for the dispute kit (either DisputeKitShutter or DisputeKitGatedShutter)
export type DisputeKitShutterType = DisputeKitShutter | DisputeKitGatedShutterMock;

// Test context interface that holds all the test state
export interface ShutterTestContext {
  deployer: string;
  juror1: HardhatEthersSigner;
  juror2: HardhatEthersSigner;
  bot: HardhatEthersSigner;
  attacker: HardhatEthersSigner;
  disputeKit: DisputeKitShutterType;
  pnk: PNK;
  core: KlerosCore;
  sortitionModule: SortitionModule;
  rng: IncrementalNG;
  shutterDKID: number;
  shutterCourtID: number;
  RANDOM: bigint;
  ONE_THOUSAND_PNK: bigint;
  thousandPNK: (amount: BigNumberish) => bigint;
  // Shutter test data
  choice: bigint;
  salt: bigint;
  justification: string;
  identity: string;
  encryptedVote: Uint8Array;
  // Token gating support (optional)
  dai?: TestERC20;
  isGated?: boolean;
}

// Configuration for setting up a Shutter test
export interface ShutterTestConfig {
  contractName: string; // "DisputeKitShutter" or "DisputeKitGatedShutter"
  isGated?: boolean; // Whether to setup token gating
}

// Constants
export const enum Period {
  evidence = 0,
  commit = 1,
  vote = 2,
  appeal = 3,
  execution = 4,
}

const ONE_THOUSAND_PNK = 10n ** 21n;
const thousandPNK = (amount: BigNumberish) => toBigInt(amount) * ONE_THOUSAND_PNK;

// Helper function to encode extra data for dispute creation
export const encodeExtraData = (courtId: BigNumberish, minJurors: BigNumberish, disputeKitId: number) =>
  ethers.AbiCoder.defaultAbiCoder().encode(["uint256", "uint256", "uint256"], [courtId, minJurors, disputeKitId]);

// Helper function to generate full and recovery commitments
export const generateCommitments = (choice: bigint, salt: bigint, justification: string) => {
  // Recovery commitment: hash(choice, salt) - no justification
  const recoveryCommit = ethers.keccak256(
    ethers.AbiCoder.defaultAbiCoder().encode(["uint256", "uint256"], [choice, salt])
  );

  // Full commitment: hash(choice, salt, justificationHash)
  const justificationHash = ethers.keccak256(ethers.toUtf8Bytes(justification));
  const fullCommit = ethers.keccak256(
    ethers.AbiCoder.defaultAbiCoder().encode(["uint256", "uint256", "bytes32"], [choice, salt, justificationHash])
  );

  return { fullCommit, recoveryCommit };
};

// Helper to create dispute and draw jurors
export const createDisputeAndDraw = async (
  context: ShutterTestContext,
  courtId: BigNumberish,
  minJurors: BigNumberish,
  disputeKitId: number
) => {
  // Stake jurors
  for (const juror of [context.juror1, context.juror2]) {
    await context.pnk.transfer(juror.address, context.thousandPNK(10)).then((tx) => tx.wait());
    expect(await context.pnk.balanceOf(juror.address)).to.equal(context.thousandPNK(10));

    await context.pnk
      .connect(juror)
      .approve(context.core.target, context.thousandPNK(10), { gasLimit: 300000 })
      .then((tx) => tx.wait());

    await context.core
      .connect(juror)
      .setStake(context.shutterCourtID, context.thousandPNK(10), { gasLimit: 500000 })
      .then((tx) => tx.wait());

    expect(await context.sortitionModule.getJurorBalance(juror.address, context.shutterCourtID)).to.deep.equal([
      context.thousandPNK(10), // totalStaked
      0, // totalLocked
      context.thousandPNK(10), // stakedInCourt
      1, // nbOfCourts
    ]);

    // If gated, give tokens to jurors
    if (context.isGated && context.dai) {
      await context.dai.transfer(juror.address, 1);
    }
  }

  // Use gated extra data if this is a gated dispute kit with DAI token
  let extraData: string;
  if (context.isGated && context.dai) {
    extraData = encodeGatedExtraData(courtId, minJurors, disputeKitId, context.dai.target, false, 0);
  } else {
    extraData = encodeExtraData(courtId, minJurors, disputeKitId);
  }

  const arbitrationCost = await context.core["arbitrationCost(bytes)"](extraData);

  // Create dispute via core contract
  await context.core["createDispute(uint256,bytes)"](2, extraData, { value: arbitrationCost }).then((tx) => tx.wait());
  const disputeId = 0;

  await network.provider.send("evm_increaseTime", [2000]); // Wait for minStakingTime
  await network.provider.send("evm_mine");
  await context.sortitionModule.passPhase().then((tx) => tx.wait()); // Staking -> Generating

  await context.sortitionModule.passPhase().then((tx) => tx.wait()); // Generating -> Drawing
  await context.core.draw(disputeId, 70, { gasLimit: 10000000 });

  return disputeId;
};

// Helper to advance to commit period
export const advanceToCommitPeriod = async (context: ShutterTestContext, disputeId: number) => {
  // Advance from evidence to commit period
  await context.core.passPeriod(disputeId).then((tx) => tx.wait());

  // Verify we're in commit period
  const dispute = await context.core.disputes(disputeId);
  expect(dispute[2]).to.equal(Period.commit); // period is at index 2
};

// Helper to advance to vote period
export const advanceToVotePeriod = async (context: ShutterTestContext, disputeId: number) => {
  // Advance from commit to vote period
  const timesPerPeriod = [300, 300, 300, 300]; // Default times from deployment
  const commitPeriod = timesPerPeriod[Period.commit];

  await network.provider.send("evm_increaseTime", [Number(commitPeriod)]);
  await network.provider.send("evm_mine");

  await context.core.passPeriod(disputeId).then((tx) => tx.wait());

  // Verify we're in vote period
  const updatedDispute = await context.core.disputes(disputeId);
  expect(updatedDispute[2]).to.equal(Period.vote); // period is at index 2
};

// Helper to get vote IDs for a juror
export const getVoteIDsForJuror = async (
  context: ShutterTestContext,
  disputeId: number,
  juror: HardhatEthersSigner
) => {
  const localDisputeId = await context.disputeKit.coreDisputeIDToLocal(disputeId);
  const nbRounds = await context.disputeKit.getNumberOfRounds(localDisputeId);
  const roundIndex = Number(nbRounds) - 1;

  // Get all votes for this round and filter by juror
  const voteIDs: bigint[] = [];
  const maxVotes = 10; // Reasonable limit for testing

  for (let i = 0; i < maxVotes; i++) {
    try {
      const voteInfo = await context.disputeKit.getVoteInfo(disputeId, roundIndex, i);
      if (voteInfo[0] === juror.address) {
        // account is at index 0
        voteIDs.push(BigInt(i));
      }
    } catch {
      // No more votes
      break;
    }
  }

  return voteIDs;
};

// Setup function that creates the test context
export async function setupShutterTest(config: ShutterTestConfig): Promise<ShutterTestContext> {
  const { deployer } = await getNamedAccounts();
  const [, juror1, juror2, bot, attacker] = await ethers.getSigners();

  await deployments.fixture(["Arbitration", "VeaMock"], {
    fallbackToGlobal: true,
    keepExistingDeployments: false,
  });

  const pnk = await ethers.getContract<PNK>("PNK");
  const core = await ethers.getContract<KlerosCore>("KlerosCore");
  const sortitionModule = await ethers.getContract<SortitionModule>("SortitionModule");

  let disputeKit: DisputeKitShutterType;
  let shutterDKID: number;
  let shutterCourtID: number;
  let dai: TestERC20 | undefined;

  if (config.contractName === "DisputeKitShutter") {
    disputeKit = await ethers.getContract<DisputeKitShutter>("DisputeKitShutter");
    shutterDKID = 2;
    shutterCourtID = 2; // Court with hidden votes

    // Create a court with hidden votes enabled for testing DisputeKitShutter
    await core.createCourt(
      Courts.GENERAL, // parent
      true, // hiddenVotes - MUST be true for DisputeKitShutter
      ethers.parseEther("200"), // minStake
      10000, // alpha
      ethers.parseEther("0.1"), // feeForJuror
      16, // jurorsForCourtJump
      [300, 300, 300, 300], // timesPerPeriod for evidence, commit, vote, appeal
      ethers.toBeHex(5), // sortitionExtraData
      [1, shutterDKID] // supportedDisputeKits - must include Classic (1) and Shutter (2)
    );
  } else if (config.contractName === "DisputeKitGatedShutter") {
    // For gated shutter, we need to deploy it if not already deployed
    const weth = await ethers.getContract<TestERC20>("WETH");
    dai = await ethers.getContract<TestERC20>("DAI");

    const deploymentResult = await deployUpgradable(deployments, "DisputeKitGatedShutterMock", {
      from: deployer,
      proxyAlias: "UUPSProxy",
      args: [deployer, core.target, weth.target, 1],
      log: true,
    });
    await core.addNewDisputeKit(deploymentResult.address);
    shutterDKID = Number((await core.getDisputeKitsLength()) - 1n);

    // For gated shutter, we use the General Court but with hidden votes enabled
    shutterCourtID = Courts.GENERAL;

    // Enable hidden votes on the General Court
    await core.changeCourtParameters(
      Courts.GENERAL,
      true, // hiddenVotes
      ethers.parseEther("200"), // minStake
      10000, // alpha
      ethers.parseEther("0.1"), // feeForJuror
      16, // jurorsForCourtJump
      [300, 300, 300, 300] // timesPerPeriod
    );

    await core.enableDisputeKits(Courts.GENERAL, [shutterDKID], true);

    disputeKit = await ethers.getContract<DisputeKitGatedShutterMock>("DisputeKitGatedShutterMock");

    // If gated, whitelist DAI token
    if (config.isGated) {
      const gatedKit = disputeKit as DisputeKitGatedShutterMock;
      await gatedKit.changeSupportedTokens([dai.target], true);
    }
  } else {
    throw new Error(`Unknown contract name: ${config.contractName}`);
  }

  // Make the tests more deterministic with this dummy RNG
  const RANDOM = 424242n;
  await deployments.deploy("IncrementalNG", {
    from: deployer,
    args: [RANDOM],
    log: true,
  });
  const rng = await ethers.getContract<IncrementalNG>("IncrementalNG");
  await sortitionModule.changeRandomNumberGenerator(rng.target).then((tx) => tx.wait());

  // Test data
  const choice = 1n;
  const salt = 12345n;
  const justification = "This is my justification for the vote";
  const identity = ethers.keccak256(ethers.toUtf8Bytes("shutter-identity"));
  const encryptedVote = ethers.toUtf8Bytes("encrypted-vote-data");

  const context: ShutterTestContext = {
    deployer,
    juror1,
    juror2,
    bot,
    attacker,
    disputeKit,
    pnk,
    core,
    sortitionModule,
    rng,
    shutterDKID,
    shutterCourtID,
    RANDOM,
    ONE_THOUSAND_PNK,
    thousandPNK,
    choice,
    salt,
    justification,
    identity,
    encryptedVote,
    dai,
    isGated: config.isGated,
  };

  return context;
}

// Test suites as functions that accept context

export function testCommitPhase(context: () => ShutterTestContext) {
  describe("Commit Phase - castCommitShutter()", () => {
    describe("Successful commits", () => {
      it("Should allow juror to commit vote with recovery commitment", async () => {
        const ctx = context();
        const disputeId = await createDisputeAndDraw(ctx, ctx.shutterCourtID, 3, ctx.shutterDKID);
        await advanceToCommitPeriod(ctx, disputeId);

        const voteIDs = await getVoteIDsForJuror(ctx, disputeId, ctx.juror1);
        expect(voteIDs.length).to.be.greaterThan(0);

        const { fullCommit, recoveryCommit } = generateCommitments(ctx.choice, ctx.salt, ctx.justification);

        await expect(
          ctx.disputeKit
            .connect(ctx.juror1)
            .castCommitShutter(disputeId, voteIDs, fullCommit, recoveryCommit, ctx.identity, ctx.encryptedVote)
        )
          .to.emit(ctx.disputeKit, "CommitCastShutter")
          .withArgs(disputeId, ctx.juror1.address, fullCommit, recoveryCommit, ctx.identity, ctx.encryptedVote);

        // Verify recovery commitment was stored
        const localDisputeId = await ctx.disputeKit.coreDisputeIDToLocal(disputeId);
        const storedRecoveryCommit = await ctx.disputeKit.recoveryCommitments(localDisputeId, 0, voteIDs[0]);
        expect(storedRecoveryCommit).to.equal(recoveryCommit);
      });

      it("Should allow juror to update commitment multiple times", async () => {
        const ctx = context();
        const disputeId = await createDisputeAndDraw(ctx, ctx.shutterCourtID, 3, ctx.shutterDKID);
        await advanceToCommitPeriod(ctx, disputeId);

        const voteIDs = await getVoteIDsForJuror(ctx, disputeId, ctx.juror1);

        // First commitment
        const { fullCommit: commit1, recoveryCommit: recovery1 } = generateCommitments(1n, 111n, "First justification");
        await ctx.disputeKit
          .connect(ctx.juror1)
          .castCommitShutter(disputeId, voteIDs, commit1, recovery1, ctx.identity, ctx.encryptedVote);

        // Second commitment (overwrites first)
        const { fullCommit: commit2, recoveryCommit: recovery2 } = generateCommitments(
          2n,
          222n,
          "Second justification"
        );
        await ctx.disputeKit
          .connect(ctx.juror1)
          .castCommitShutter(disputeId, voteIDs, commit2, recovery2, ctx.identity, ctx.encryptedVote);

        // Verify only the second commitment is stored
        const localDisputeId = await ctx.disputeKit.coreDisputeIDToLocal(disputeId);
        const storedRecoveryCommit = await ctx.disputeKit.recoveryCommitments(localDisputeId, 0, voteIDs[0]);
        expect(storedRecoveryCommit).to.equal(recovery2);
      });
    });

    describe("Failed commits", () => {
      it("Should revert if recovery commitment is empty", async () => {
        const ctx = context();
        const disputeId = await createDisputeAndDraw(ctx, ctx.shutterCourtID, 3, ctx.shutterDKID);
        await advanceToCommitPeriod(ctx, disputeId);

        const voteIDs = await getVoteIDsForJuror(ctx, disputeId, ctx.juror1);
        const { fullCommit } = generateCommitments(ctx.choice, ctx.salt, ctx.justification);

        await expect(
          ctx.disputeKit.connect(ctx.juror1).castCommitShutter(
            disputeId,
            voteIDs,
            fullCommit,
            ethers.ZeroHash, // Empty recovery commit
            ctx.identity,
            ctx.encryptedVote
          )
        ).to.be.revertedWithCustomError(ctx.disputeKit, "EmptyRecoveryCommit");
      });

      it("Should revert if not in commit period", async () => {
        const ctx = context();
        const disputeId = await createDisputeAndDraw(ctx, ctx.shutterCourtID, 3, ctx.shutterDKID);
        // Still in evidence period

        const voteIDs = await getVoteIDsForJuror(ctx, disputeId, ctx.juror1);
        const { fullCommit, recoveryCommit } = generateCommitments(ctx.choice, ctx.salt, ctx.justification);

        await expect(
          ctx.disputeKit
            .connect(ctx.juror1)
            .castCommitShutter(disputeId, voteIDs, fullCommit, recoveryCommit, ctx.identity, ctx.encryptedVote)
        ).to.be.revertedWithCustomError(ctx.disputeKit, "NotCommitPeriod");
      });

      it("Should revert if juror doesn't own the vote", async () => {
        const ctx = context();
        const disputeId = await createDisputeAndDraw(ctx, ctx.shutterCourtID, 3, ctx.shutterDKID);
        await advanceToCommitPeriod(ctx, disputeId);

        const voteIDs = await getVoteIDsForJuror(ctx, disputeId, ctx.juror1);
        const { fullCommit, recoveryCommit } = generateCommitments(ctx.choice, ctx.salt, ctx.justification);

        await expect(
          ctx.disputeKit.connect(ctx.juror2).castCommitShutter(
            disputeId,
            voteIDs, // Using juror1's vote IDs
            fullCommit,
            recoveryCommit,
            ctx.identity,
            ctx.encryptedVote
          )
        ).to.be.revertedWithCustomError(ctx.disputeKit, "JurorHasToOwnTheVote");
      });
    });
  });
}

export function testNormalFlowBotReveals(context: () => ShutterTestContext) {
  describe("Normal Flow - Bot Reveals", () => {
    describe("Successful reveals", () => {
      it("Should allow bot to reveal vote with full justification", async () => {
        const ctx = context();
        const disputeId = await createDisputeAndDraw(ctx, ctx.shutterCourtID, 3, ctx.shutterDKID);
        await advanceToCommitPeriod(ctx, disputeId);

        const voteIDs = await getVoteIDsForJuror(ctx, disputeId, ctx.juror1);
        const { fullCommit, recoveryCommit } = generateCommitments(ctx.choice, ctx.salt, ctx.justification);

        // Juror commits
        await ctx.disputeKit
          .connect(ctx.juror1)
          .castCommitShutter(disputeId, voteIDs, fullCommit, recoveryCommit, ctx.identity, ctx.encryptedVote);

        await advanceToVotePeriod(ctx, disputeId);

        // Bot reveals vote
        await expect(
          ctx.disputeKit.connect(ctx.bot).castVoteShutter(disputeId, voteIDs, ctx.choice, ctx.salt, ctx.justification)
        )
          .to.emit(ctx.disputeKit, "VoteCast")
          .withArgs(disputeId, ctx.juror1.address, voteIDs, ctx.choice, ctx.justification);

        // Verify vote was counted
        const voteInfo = await ctx.disputeKit.getVoteInfo(disputeId, 0, Number(voteIDs[0]));
        expect(voteInfo[3]).to.be.true; // voted is at index 3
        expect(voteInfo[2]).to.equal(ctx.choice); // choice is at index 2
      });
    });

    describe("Failed reveals", () => {
      it("Should revert if wrong choice provided", async () => {
        const ctx = context();
        const disputeId = await createDisputeAndDraw(ctx, ctx.shutterCourtID, 3, ctx.shutterDKID);
        await advanceToCommitPeriod(ctx, disputeId);

        const voteIDs = await getVoteIDsForJuror(ctx, disputeId, ctx.juror1);
        const { fullCommit, recoveryCommit } = generateCommitments(ctx.choice, ctx.salt, ctx.justification);

        await ctx.disputeKit
          .connect(ctx.juror1)
          .castCommitShutter(disputeId, voteIDs, fullCommit, recoveryCommit, ctx.identity, ctx.encryptedVote);

        await advanceToVotePeriod(ctx, disputeId);

        const wrongChoice = 2n;
        await expect(
          ctx.disputeKit.connect(ctx.bot).castVoteShutter(
            disputeId,
            voteIDs,
            wrongChoice, // Wrong choice
            ctx.salt,
            ctx.justification
          )
        ).to.be.revertedWithCustomError(ctx.disputeKit, "HashDoesNotMatchHiddenVoteCommitment");
      });

      it("Should revert if wrong salt provided", async () => {
        const ctx = context();
        const disputeId = await createDisputeAndDraw(ctx, ctx.shutterCourtID, 3, ctx.shutterDKID);
        await advanceToCommitPeriod(ctx, disputeId);

        const voteIDs = await getVoteIDsForJuror(ctx, disputeId, ctx.juror1);
        const { fullCommit, recoveryCommit } = generateCommitments(ctx.choice, ctx.salt, ctx.justification);

        await ctx.disputeKit
          .connect(ctx.juror1)
          .castCommitShutter(disputeId, voteIDs, fullCommit, recoveryCommit, ctx.identity, ctx.encryptedVote);

        await advanceToVotePeriod(ctx, disputeId);

        const wrongSalt = 99999n;
        await expect(
          ctx.disputeKit.connect(ctx.bot).castVoteShutter(
            disputeId,
            voteIDs,
            ctx.choice,
            wrongSalt, // Wrong salt
            ctx.justification
          )
        ).to.be.revertedWithCustomError(ctx.disputeKit, "HashDoesNotMatchHiddenVoteCommitment");
      });

      it("Should revert if wrong justification provided", async () => {
        const ctx = context();
        const disputeId = await createDisputeAndDraw(ctx, ctx.shutterCourtID, 3, ctx.shutterDKID);
        await advanceToCommitPeriod(ctx, disputeId);

        const voteIDs = await getVoteIDsForJuror(ctx, disputeId, ctx.juror1);
        const { fullCommit, recoveryCommit } = generateCommitments(ctx.choice, ctx.salt, ctx.justification);

        await ctx.disputeKit
          .connect(ctx.juror1)
          .castCommitShutter(disputeId, voteIDs, fullCommit, recoveryCommit, ctx.identity, ctx.encryptedVote);

        await advanceToVotePeriod(ctx, disputeId);

        const wrongJustification = "Wrong justification";
        await expect(
          ctx.disputeKit.connect(ctx.bot).castVoteShutter(
            disputeId,
            voteIDs,
            ctx.choice,
            ctx.salt,
            wrongJustification // Wrong justification
          )
        ).to.be.revertedWithCustomError(ctx.disputeKit, "HashDoesNotMatchHiddenVoteCommitment");
      });

      it("Should revert if vote already cast", async () => {
        const ctx = context();
        const disputeId = await createDisputeAndDraw(ctx, ctx.shutterCourtID, 3, ctx.shutterDKID);
        await advanceToCommitPeriod(ctx, disputeId);

        const voteIDs = await getVoteIDsForJuror(ctx, disputeId, ctx.juror1);
        const { fullCommit, recoveryCommit } = generateCommitments(ctx.choice, ctx.salt, ctx.justification);

        await ctx.disputeKit
          .connect(ctx.juror1)
          .castCommitShutter(disputeId, voteIDs, fullCommit, recoveryCommit, ctx.identity, ctx.encryptedVote);

        await advanceToVotePeriod(ctx, disputeId);

        // First vote succeeds
        await ctx.disputeKit
          .connect(ctx.bot)
          .castVoteShutter(disputeId, voteIDs, ctx.choice, ctx.salt, ctx.justification);

        // Second vote fails
        await expect(
          ctx.disputeKit.connect(ctx.bot).castVoteShutter(disputeId, voteIDs, ctx.choice, ctx.salt, ctx.justification)
        ).to.be.revertedWithCustomError(ctx.disputeKit, "VoteAlreadyCast");
      });
    });
  });
}

export function testRecoveryFlowJurorReveals(context: () => ShutterTestContext) {
  describe("Recovery Flow - Juror Reveals", () => {
    describe("Successful recovery reveals", () => {
      it("Should allow juror to recover vote without justification", async () => {
        const ctx = context();
        const disputeId = await createDisputeAndDraw(ctx, ctx.shutterCourtID, 3, ctx.shutterDKID);
        await advanceToCommitPeriod(ctx, disputeId);

        const voteIDs = await getVoteIDsForJuror(ctx, disputeId, ctx.juror1);
        const { fullCommit, recoveryCommit } = generateCommitments(ctx.choice, ctx.salt, ctx.justification);

        // Juror commits
        await ctx.disputeKit
          .connect(ctx.juror1)
          .castCommitShutter(disputeId, voteIDs, fullCommit, recoveryCommit, ctx.identity, ctx.encryptedVote);

        await advanceToVotePeriod(ctx, disputeId);

        // Juror reveals vote (Shutter failed, so juror must reveal)
        // Note: justification can be anything as it won't be validated
        await expect(
          ctx.disputeKit.connect(ctx.juror1).castVoteShutter(
            disputeId,
            voteIDs,
            ctx.choice,
            ctx.salt,
            "" // Empty justification is fine for recovery
          )
        )
          .to.emit(ctx.disputeKit, "VoteCast")
          .withArgs(disputeId, ctx.juror1.address, voteIDs, ctx.choice, "");

        // Verify vote was counted
        const voteInfo = await ctx.disputeKit.getVoteInfo(disputeId, 0, Number(voteIDs[0]));
        expect(voteInfo[3]).to.be.true; // voted is at index 3
        expect(voteInfo[2]).to.equal(ctx.choice); // choice is at index 2
      });

      it("Should validate against recovery commitment when juror reveals", async () => {
        const ctx = context();
        const disputeId = await createDisputeAndDraw(ctx, ctx.shutterCourtID, 3, ctx.shutterDKID);
        await advanceToCommitPeriod(ctx, disputeId);

        const voteIDs = await getVoteIDsForJuror(ctx, disputeId, ctx.juror1);
        const { fullCommit, recoveryCommit } = generateCommitments(ctx.choice, ctx.salt, ctx.justification);

        await ctx.disputeKit
          .connect(ctx.juror1)
          .castCommitShutter(disputeId, voteIDs, fullCommit, recoveryCommit, ctx.identity, ctx.encryptedVote);

        await advanceToVotePeriod(ctx, disputeId);

        // Juror can provide any justification - it won't be validated
        const differentJustification = "This is a different justification that won't be checked";
        await expect(
          ctx.disputeKit.connect(ctx.juror1).castVoteShutter(
            disputeId,
            voteIDs,
            ctx.choice,
            ctx.salt,
            differentJustification // Different justification is OK for recovery
          )
        ).to.not.be.reverted;
      });
    });

    describe("Failed recovery reveals", () => {
      it("Should revert if wrong choice in recovery", async () => {
        const ctx = context();
        const disputeId = await createDisputeAndDraw(ctx, ctx.shutterCourtID, 3, ctx.shutterDKID);
        await advanceToCommitPeriod(ctx, disputeId);

        const voteIDs = await getVoteIDsForJuror(ctx, disputeId, ctx.juror1);
        const { fullCommit, recoveryCommit } = generateCommitments(ctx.choice, ctx.salt, ctx.justification);

        await ctx.disputeKit
          .connect(ctx.juror1)
          .castCommitShutter(disputeId, voteIDs, fullCommit, recoveryCommit, ctx.identity, ctx.encryptedVote);

        await advanceToVotePeriod(ctx, disputeId);

        const wrongChoice = 2n;
        await expect(
          ctx.disputeKit.connect(ctx.juror1).castVoteShutter(
            disputeId,
            voteIDs,
            wrongChoice, // Wrong choice
            ctx.salt,
            ""
          )
        ).to.be.revertedWithCustomError(ctx.disputeKit, "HashDoesNotMatchHiddenVoteCommitment");
      });

      it("Should revert if wrong salt in recovery", async () => {
        const ctx = context();
        const disputeId = await createDisputeAndDraw(ctx, ctx.shutterCourtID, 3, ctx.shutterDKID);
        await advanceToCommitPeriod(ctx, disputeId);

        const voteIDs = await getVoteIDsForJuror(ctx, disputeId, ctx.juror1);
        const { fullCommit, recoveryCommit } = generateCommitments(ctx.choice, ctx.salt, ctx.justification);

        await ctx.disputeKit
          .connect(ctx.juror1)
          .castCommitShutter(disputeId, voteIDs, fullCommit, recoveryCommit, ctx.identity, ctx.encryptedVote);

        await advanceToVotePeriod(ctx, disputeId);

        const wrongSalt = 99999n;
        await expect(
          ctx.disputeKit.connect(ctx.juror1).castVoteShutter(
            disputeId,
            voteIDs,
            ctx.choice,
            wrongSalt, // Wrong salt
            ""
          )
        ).to.be.revertedWithCustomError(ctx.disputeKit, "HashDoesNotMatchHiddenVoteCommitment");
      });

      it("Should revert if non-juror tries to reveal without correct full commitment", async () => {
        const ctx = context();
        const disputeId = await createDisputeAndDraw(ctx, ctx.shutterCourtID, 3, ctx.shutterDKID);
        await advanceToCommitPeriod(ctx, disputeId);

        const voteIDs = await getVoteIDsForJuror(ctx, disputeId, ctx.juror1);
        const { fullCommit, recoveryCommit } = generateCommitments(ctx.choice, ctx.salt, ctx.justification);

        await ctx.disputeKit
          .connect(ctx.juror1)
          .castCommitShutter(disputeId, voteIDs, fullCommit, recoveryCommit, ctx.identity, ctx.encryptedVote);

        await advanceToVotePeriod(ctx, disputeId);

        // Attacker tries to reveal with only choice and salt (no justification)
        await expect(
          ctx.disputeKit.connect(ctx.attacker).castVoteShutter(
            disputeId,
            voteIDs,
            ctx.choice,
            ctx.salt,
            "" // No justification - would work for juror but not for others
          )
        ).to.be.revertedWithCustomError(ctx.disputeKit, "HashDoesNotMatchHiddenVoteCommitment");
      });
    });
  });
}

export function testHashFunctionBehavior(context: () => ShutterTestContext) {
  describe("Hash Function Behavior", () => {
    it("Should compute different hashes for juror recovery vs non-juror normal flow", async () => {
      const ctx = context();

      // Test 1: Verify hashVote matches generateCommitments for non-juror case
      const { fullCommit, recoveryCommit } = generateCommitments(ctx.choice, ctx.salt, ctx.justification);
      const nonJurorHash = await ctx.disputeKit.hashVote(ctx.choice, ctx.salt, ctx.justification);
      expect(nonJurorHash).to.equal(fullCommit, "Non-juror hash should match full commitment");

      // Test 2: Verify the two commitment types are different
      expect(fullCommit).to.not.equal(recoveryCommit, "Full and recovery commitments should differ");

      // Test 3: Calculate what the juror hash would be and verify it matches recovery commitment
      const jurorExpectedHash = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(["uint256", "uint256"], [ctx.choice, ctx.salt])
      );
      expect(jurorExpectedHash).to.equal(recoveryCommit, "Juror hash calculation should match recovery commitment");

      // Test 4: Verify that changing justification affects non-juror hash but not juror hash
      const differentJustification = "Different justification";
      const { fullCommit: newFullCommit } = generateCommitments(ctx.choice, ctx.salt, differentJustification);
      const newNonJurorHash = await ctx.disputeKit.hashVote(ctx.choice, ctx.salt, differentJustification);

      expect(newNonJurorHash).to.equal(newFullCommit, "New non-juror hash should match new full commitment");
      expect(newNonJurorHash).to.not.equal(nonJurorHash, "Non-juror hash should change with justification");
      // Note: juror hash would remain the same (recoveryCommit) regardless of justification
    });

    it("Should correctly compute hash for normal flow", async () => {
      const ctx = context();
      // Test hashVote function directly
      const justificationHash = ethers.keccak256(ethers.toUtf8Bytes(ctx.justification));
      const expectedHash = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["uint256", "uint256", "bytes32"],
          [ctx.choice, ctx.salt, justificationHash]
        )
      );

      // When called by non-juror (normal case), should include justification
      const computedHash = await ctx.disputeKit.hashVote(ctx.choice, ctx.salt, ctx.justification);
      expect(computedHash).to.equal(expectedHash);
    });
  });
}

export function testEdgeCasesAndSecurity(context: () => ShutterTestContext) {
  describe("Edge Cases and Security", () => {
    it("Should handle mixed normal and recovery reveals in same dispute", async () => {
      const ctx = context();
      const disputeId = await createDisputeAndDraw(ctx, ctx.shutterCourtID, 3, ctx.shutterDKID);
      await advanceToCommitPeriod(ctx, disputeId);

      const voteIDsJuror1 = await getVoteIDsForJuror(ctx, disputeId, ctx.juror1);
      const voteIDsJuror2 = await getVoteIDsForJuror(ctx, disputeId, ctx.juror2);

      const { fullCommit: commit1, recoveryCommit: recovery1 } = generateCommitments(1n, 111n, "Juror 1 justification");
      const { fullCommit: commit2, recoveryCommit: recovery2 } = generateCommitments(2n, 222n, "Juror 2 justification");

      // Both jurors commit
      await ctx.disputeKit
        .connect(ctx.juror1)
        .castCommitShutter(disputeId, voteIDsJuror1, commit1, recovery1, ctx.identity, ctx.encryptedVote);

      await ctx.disputeKit
        .connect(ctx.juror2)
        .castCommitShutter(disputeId, voteIDsJuror2, commit2, recovery2, ctx.identity, ctx.encryptedVote);

      await advanceToVotePeriod(ctx, disputeId);

      // Juror1 uses recovery flow (Shutter failed for them)
      await ctx.disputeKit.connect(ctx.juror1).castVoteShutter(
        disputeId,
        voteIDsJuror1,
        1n,
        111n,
        "Different justification" // Recovery doesn't check this
      );

      // Bot reveals juror2's vote normally
      await ctx.disputeKit.connect(ctx.bot).castVoteShutter(
        disputeId,
        voteIDsJuror2,
        2n,
        222n,
        "Juror 2 justification" // Must match exactly
      );

      // Verify both votes were counted
      const vote1Info = await ctx.disputeKit.getVoteInfo(disputeId, 0, Number(voteIDsJuror1[0]));
      const vote2Info = await ctx.disputeKit.getVoteInfo(disputeId, 0, Number(voteIDsJuror2[0]));

      expect(vote1Info[3]).to.be.true; // voted is at index 3
      expect(vote1Info[2]).to.equal(1n); // choice is at index 2
      expect(vote2Info[3]).to.be.true;
      expect(vote2Info[2]).to.equal(2n);
    });

    it("Should allow anyone to reveal vote with correct data only", async () => {
      const ctx = context();
      const disputeId = await createDisputeAndDraw(ctx, ctx.shutterCourtID, 3, ctx.shutterDKID);
      await advanceToCommitPeriod(ctx, disputeId);

      const voteIDsJuror1 = await getVoteIDsForJuror(ctx, disputeId, ctx.juror1);
      const { fullCommit, recoveryCommit } = generateCommitments(ctx.choice, ctx.salt, ctx.justification);

      await ctx.disputeKit
        .connect(ctx.juror1)
        .castCommitShutter(disputeId, voteIDsJuror1, fullCommit, recoveryCommit, ctx.identity, ctx.encryptedVote);

      // Juror2 commits with a different choice
      const differentChoice = 2n;
      const voteIDsJuror2 = await getVoteIDsForJuror(ctx, disputeId, ctx.juror2);
      const { fullCommit: commit2, recoveryCommit: recovery2 } = generateCommitments(
        differentChoice,
        ctx.salt,
        ctx.justification
      );

      await ctx.disputeKit
        .connect(ctx.juror2)
        .castCommitShutter(disputeId, voteIDsJuror2, commit2, recovery2, ctx.identity, ctx.encryptedVote);

      await advanceToVotePeriod(ctx, disputeId);

      // In normal Shutter operation, anyone (bot/attacker) can reveal the vote if they have the correct data
      // This is by design - the security comes from the fact that only Shutter knows the decryption key
      await expect(
        ctx.disputeKit
          .connect(ctx.attacker)
          .castVoteShutter(disputeId, voteIDsJuror1, ctx.choice, ctx.salt, ctx.justification)
      )
        .to.emit(ctx.disputeKit, "VoteCast")
        .withArgs(disputeId, ctx.juror1.address, voteIDsJuror1, ctx.choice, ctx.justification);

      // Attacker cannot change juror2's vote to a different choice
      await expect(
        ctx.disputeKit.connect(ctx.attacker).castVoteShutter(
          disputeId,
          voteIDsJuror2,
          1n, // Wrong choice
          ctx.salt,
          ctx.justification
        )
      ).to.be.revertedWithCustomError(ctx.disputeKit, "HashDoesNotMatchHiddenVoteCommitment");
    });
  });
}
