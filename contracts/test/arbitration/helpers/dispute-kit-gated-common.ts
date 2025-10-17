import { deployments, ethers, getNamedAccounts, network } from "hardhat";
import { toBigInt, BigNumberish, Addressable } from "ethers";
import {
  PNK,
  KlerosCore,
  SortitionModule,
  IncrementalNG,
  DisputeKitGatedMock,
  DisputeKitGatedShutterMock,
  TestERC20,
  TestERC721,
  TestERC1155,
} from "../../../typechain-types";
import { expect } from "chai";
import { Courts } from "../../../deploy/utils";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { deployERC1155, deployERC721 } from "../../../deploy/utils/deployTokens";
import { deployUpgradable } from "../../../deploy/utils/deployUpgradable";

/* eslint-disable no-unused-vars */
/* eslint-disable no-unused-expressions */ // https://github.com/standard/standard/issues/690#issuecomment-278533482

// Type for the dispute kit (either DisputeKitGated or DisputeKitGatedShutter)
export type DisputeKitGatedType = DisputeKitGatedMock | DisputeKitGatedShutterMock;

// Test context interface that holds all the test state
export interface TokenGatedTestContext {
  deployer: string;
  juror1: HardhatEthersSigner;
  juror2: HardhatEthersSigner;
  disputeKit: DisputeKitGatedType;
  pnk: PNK;
  dai: TestERC20;
  core: KlerosCore;
  sortitionModule: SortitionModule;
  rng: IncrementalNG;
  nft721: TestERC721;
  nft1155: TestERC1155;
  gatedDisputeKitID: number;
  minStake: bigint;
  RANDOM: bigint;
  TOKEN_ID: number;
  ONE_THOUSAND_PNK: bigint;
  thousandPNK: (amount: BigNumberish) => bigint;
  PNK: (amount: BigNumberish) => bigint;
}

// Configuration for setting up a token gated test
export interface TokenGatedTestConfig {
  contractName: string; // "DisputeKitGatedMock" or "DisputeKitGatedShutterMock"
}

// Constants for token amounts
const ONE_THOUSAND_PNK = 10n ** 21n;
const thousandPNK = (amount: BigNumberish) => toBigInt(amount) * ONE_THOUSAND_PNK;
const PNK_AMOUNT = (amount: BigNumberish) => toBigInt(amount) * 10n ** 18n;

// Helper function to encode extra data for dispute creation with token gating parameters
export const encodeExtraData = (
  courtId: BigNumberish,
  minJurors: BigNumberish,
  disputeKitId: number,
  tokenGate: string | Addressable,
  isERC1155: boolean,
  tokenId: BigNumberish
) => {
  // Packing of tokenGate and isERC1155
  // uint88 (padding 11 bytes) + bool (1 byte) + address (20 bytes) = 32 bytes
  const packed = ethers.solidityPacked(["uint88", "bool", "address"], [0, isERC1155, tokenGate]);
  return ethers.AbiCoder.defaultAbiCoder().encode(
    ["uint256", "uint256", "uint256", "bytes32", "uint256"],
    [courtId, minJurors, disputeKitId, packed, tokenId]
  );
};

// Helper function to add or remove tokens from the whitelist
export const whitelistTokens = async (
  context: TokenGatedTestContext,
  tokens: (string | Addressable)[],
  supported: boolean = true
) => {
  const tokenAddresses = tokens.map((token) => (typeof token === "string" ? token : token.toString()));
  return context.disputeKit.changeSupportedTokens(tokenAddresses, supported);
};

// Helper function to create a dispute with the specified token gate
export const createDisputeWithToken = async (
  context: TokenGatedTestContext,
  token: string | Addressable,
  isERC1155: boolean = false,
  tokenId: BigNumberish = 0
) => {
  const extraData = encodeExtraData(Courts.GENERAL, 3, context.gatedDisputeKitID, token, isERC1155, tokenId);
  const arbitrationCost = await context.core["arbitrationCost(bytes)"](extraData);
  return context.core["createDispute(uint256,bytes)"](2, extraData, { value: arbitrationCost });
};

// Helper function to assert whether a token is supported or not
export const expectTokenSupported = async (
  context: TokenGatedTestContext,
  token: string | Addressable,
  supported: boolean
) => {
  const tokenAddress = typeof token === "string" ? token : token.toString();
  expect(await context.disputeKit.supportedTokens(tokenAddress)).to.equal(supported);
};

// Helper function to stake and draw jurors
export const stakeAndDraw = async (
  context: TokenGatedTestContext,
  courtId: number,
  minJurors: BigNumberish,
  disputeKitId: number,
  tokenGate: string | Addressable,
  isERC1155: boolean,
  tokenId: BigNumberish
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
      .setStake(Courts.GENERAL, context.thousandPNK(10), { gasLimit: 500000 })
      .then((tx) => tx.wait());

    expect(await context.sortitionModule.getJurorBalance(juror.address, 1)).to.deep.equal([
      context.thousandPNK(10), // totalStaked
      0, // totalLocked
      context.thousandPNK(10), // stakedInCourt
      1, // nbOfCourts
    ]);
  }

  const extraData = encodeExtraData(courtId, minJurors, disputeKitId, tokenGate, isERC1155, tokenId);

  const tokenInfo = await context.disputeKit.extraDataToTokenInfo(extraData);
  expect(tokenInfo[0]).to.equal(tokenGate);
  expect(tokenInfo[1]).to.equal(isERC1155);
  expect(tokenInfo[2]).to.equal(tokenId);

  const arbitrationCost = await context.core["arbitrationCost(bytes)"](extraData);

  // Warning: this dispute cannot be executed, in reality it should be created by an arbitrable contract, not an EOA.
  const tx = await context.core["createDispute(uint256,bytes)"](2, extraData, { value: arbitrationCost }).then((tx) =>
    tx.wait()
  );
  const disputeId = 0;

  await network.provider.send("evm_increaseTime", [2000]); // Wait for minStakingTime
  await network.provider.send("evm_mine");
  await context.sortitionModule.passPhase().then((tx) => tx.wait()); // Staking -> Generating

  await context.sortitionModule.passPhase().then((tx) => tx.wait()); // Generating -> Drawing
  return context.core.draw(disputeId, 70, { gasLimit: 10000000 });
};

// Setup function that creates the test context
export async function setupTokenGatedTest(config: TokenGatedTestConfig): Promise<TokenGatedTestContext> {
  const { deployer } = await getNamedAccounts();
  const [, juror1, juror2] = await ethers.getSigners();

  await deployments.fixture(["Arbitration", "VeaMock"], {
    fallbackToGlobal: true,
    keepExistingDeployments: false,
  });

  const pnk = await ethers.getContract<PNK>("PNK");
  const dai = await ethers.getContract<TestERC20>("DAI");
  const weth = await ethers.getContract<TestERC20>("WETH");
  const core = await ethers.getContract<KlerosCore>("KlerosCore");
  const sortitionModule = await ethers.getContract<SortitionModule>("SortitionModule");

  const deploymentResult = await deployUpgradable(deployments, config.contractName, {
    from: deployer,
    proxyAlias: "UUPSProxy",
    args: [deployer, core.target, weth.target, 1],
    log: true,
  });
  await core.addNewDisputeKit(deploymentResult.address);
  const gatedDisputeKitID = Number((await core.getDisputeKitsLength()) - 1n);
  await core.enableDisputeKits(Courts.GENERAL, [gatedDisputeKitID], true);

  const disputeKit = await ethers.getContract<DisputeKitGatedType>(config.contractName);

  // Make the tests more deterministic with this dummy RNG
  await deployments.deploy("IncrementalNG", {
    from: deployer,
    args: [424242n],
    log: true,
  });
  const rng = await ethers.getContract<IncrementalNG>("IncrementalNG");

  await sortitionModule.changeRandomNumberGenerator(rng.target).then((tx) => tx.wait());

  const hre = require("hardhat");
  await deployERC721(hre, deployer, "TestERC721", "Nft721");
  const nft721 = await ethers.getContract<TestERC721>("Nft721");

  await deployERC1155(hre, deployer, "TestERC1155", "Nft1155");
  const nft1155 = await ethers.getContract<TestERC1155>("Nft1155");
  const TOKEN_ID = 888;
  await nft1155.mint(deployer, TOKEN_ID, 1, "0x00");

  const context: TokenGatedTestContext = {
    deployer,
    juror1,
    juror2,
    disputeKit,
    pnk,
    dai,
    core,
    sortitionModule,
    rng,
    nft721,
    nft1155,
    gatedDisputeKitID,
    minStake: PNK_AMOUNT(200),
    RANDOM: 424242n,
    TOKEN_ID,
    ONE_THOUSAND_PNK,
    thousandPNK,
    PNK: PNK_AMOUNT,
  };

  // Whitelist all tokens by default
  await whitelistTokens(context, [dai.target, nft721.target, nft1155.target], true);

  return context;
}

// Test suites as functions that accept context

export function testTokenWhitelistManagement(context: () => TokenGatedTestContext) {
  describe("Token Whitelist Management", async () => {
    describe("changeSupportedTokens function", async () => {
      it("Should allow owner to whitelist single token", async () => {
        const ctx = context();
        await whitelistTokens(ctx, [ctx.dai.target], true);
        await expectTokenSupported(ctx, ctx.dai.target, true);
      });

      it("Should allow owner to whitelist multiple tokens", async () => {
        const ctx = context();
        await whitelistTokens(ctx, [ctx.dai.target, ctx.nft721.target, ctx.nft1155.target], true);
        await expectTokenSupported(ctx, ctx.dai.target, true);
        await expectTokenSupported(ctx, ctx.nft721.target, true);
        await expectTokenSupported(ctx, ctx.nft1155.target, true);
      });

      it("Should allow owner to remove single token from whitelist", async () => {
        const ctx = context();
        await whitelistTokens(ctx, [ctx.dai.target], true);
        await expectTokenSupported(ctx, ctx.dai.target, true);

        await whitelistTokens(ctx, [ctx.dai.target], false);
        await expectTokenSupported(ctx, ctx.dai.target, false);
      });

      it("Should allow owner to remove multiple tokens from whitelist", async () => {
        const ctx = context();
        await whitelistTokens(ctx, [ctx.dai.target, ctx.nft721.target], true);
        await expectTokenSupported(ctx, ctx.dai.target, true);
        await expectTokenSupported(ctx, ctx.nft721.target, true);

        await whitelistTokens(ctx, [ctx.dai.target, ctx.nft721.target], false);
        await expectTokenSupported(ctx, ctx.dai.target, false);
        await expectTokenSupported(ctx, ctx.nft721.target, false);
      });

      it("Should handle mixed operations (add some, remove some)", async () => {
        const ctx = context();
        await whitelistTokens(ctx, [ctx.dai.target, ctx.nft721.target], true);
        await expectTokenSupported(ctx, ctx.dai.target, true);
        await expectTokenSupported(ctx, ctx.nft721.target, true);

        await whitelistTokens(ctx, [ctx.dai.target], false);
        await whitelistTokens(ctx, [ctx.nft1155.target], true);

        await expectTokenSupported(ctx, ctx.dai.target, false);
        await expectTokenSupported(ctx, ctx.nft721.target, true);
        await expectTokenSupported(ctx, ctx.nft1155.target, true);
      });

      it("Should handle duplicate operations correctly", async () => {
        const ctx = context();
        // Whitelist token twice - should not revert
        await whitelistTokens(ctx, [ctx.dai.target], true);
        await whitelistTokens(ctx, [ctx.dai.target], true);
        await expectTokenSupported(ctx, ctx.dai.target, true);

        // Remove token twice - should not revert
        await whitelistTokens(ctx, [ctx.dai.target], false);
        await whitelistTokens(ctx, [ctx.dai.target], false);
        await expectTokenSupported(ctx, ctx.dai.target, false);
      });
    });
  });
}

export function testAccessControl(context: () => TokenGatedTestContext) {
  describe("Access Control", async () => {
    it("Should revert when non-owner tries to change supported tokens", async () => {
      const ctx = context();
      await expect(ctx.disputeKit.connect(ctx.juror1).changeSupportedTokens([ctx.dai.target], true)).to.be.reverted;
    });

    it("Should revert when non-owner tries to remove supported tokens", async () => {
      const ctx = context();
      // First whitelist as owner
      await whitelistTokens(ctx, [ctx.dai.target], true);

      // Then try to remove as non-owner
      await expect(ctx.disputeKit.connect(ctx.juror1).changeSupportedTokens([ctx.dai.target], false)).to.be.reverted;
    });
  });
}

export function testUnsupportedTokenErrors(context: () => TokenGatedTestContext) {
  describe("Error Handling - Unsupported Tokens", async () => {
    it("Should revert with TokenNotSupported when creating dispute with unsupported ERC20", async () => {
      const ctx = context();
      await whitelistTokens(ctx, [ctx.dai.target], false);

      await expect(createDisputeWithToken(ctx, ctx.dai.target))
        .to.be.revertedWithCustomError(ctx.disputeKit, "TokenNotSupported")
        .withArgs(ctx.dai.target);
    });

    it("Should revert with TokenNotSupported when creating dispute with unsupported ERC721", async () => {
      const ctx = context();
      await whitelistTokens(ctx, [ctx.nft721.target], false);

      await expect(createDisputeWithToken(ctx, ctx.nft721.target))
        .to.be.revertedWithCustomError(ctx.disputeKit, "TokenNotSupported")
        .withArgs(ctx.nft721.target);
    });

    it("Should revert with TokenNotSupported when creating dispute with unsupported ERC1155", async () => {
      const ctx = context();
      await whitelistTokens(ctx, [ctx.nft1155.target], false);

      await expect(createDisputeWithToken(ctx, ctx.nft1155.target, true, ctx.TOKEN_ID))
        .to.be.revertedWithCustomError(ctx.disputeKit, "TokenNotSupported")
        .withArgs(ctx.nft1155.target);
    });

    it("Should allow dispute creation after token is whitelisted", async () => {
      const ctx = context();
      await whitelistTokens(ctx, [ctx.dai.target], false);

      await expect(createDisputeWithToken(ctx, ctx.dai.target)).to.be.revertedWithCustomError(
        ctx.disputeKit,
        "TokenNotSupported"
      );

      await whitelistTokens(ctx, [ctx.dai.target], true);

      await expect(createDisputeWithToken(ctx, ctx.dai.target)).to.not.be.reverted;
    });
  });
}

export function testERC20Gating(context: () => TokenGatedTestContext) {
  describe("When gating with DAI token", async () => {
    it("Should draw no juror if they don't have any DAI balance", async () => {
      const ctx = context();
      const nbOfJurors = 15n;
      const tx = await stakeAndDraw(
        ctx,
        Courts.GENERAL,
        nbOfJurors,
        ctx.gatedDisputeKitID,
        ctx.dai.target,
        false,
        0
      ).then((tx) => tx.wait());

      // Ensure that no juror is drawn
      const drawLogs =
        tx?.logs.filter((log: any) => log.fragment?.name === "Draw" && log.address === ctx.core.target) || [];
      expect(drawLogs).to.have.length(0);
    });

    it("Should draw only the jurors who have some DAI balance", async () => {
      const ctx = context();
      await ctx.dai.transfer(ctx.juror1.address, 1);

      const nbOfJurors = 15n;
      const tx = await stakeAndDraw(
        ctx,
        Courts.GENERAL,
        nbOfJurors,
        ctx.gatedDisputeKitID,
        ctx.dai.target,
        false,
        0
      ).then((tx) => tx.wait());

      // Ensure that only juror1 is drawn
      const drawLogs =
        tx?.logs.filter((log: any) => log.fragment?.name === "Draw" && log.address === ctx.core.target) || [];
      expect(drawLogs).to.have.length(nbOfJurors);
      drawLogs.forEach((log: any) => {
        expect(log.args[0]).to.equal(ctx.juror1.address);
      });

      // Ensure that juror1 has PNK locked
      expect(await ctx.sortitionModule.getJurorBalance(ctx.juror1.address, Courts.GENERAL)).to.deep.equal([
        ctx.thousandPNK(10), // totalStaked
        ctx.minStake * nbOfJurors, // totalLocked
        ctx.thousandPNK(10), // stakedInCourt
        1, // nbOfCourts
      ]);

      // Ensure that juror2 has no PNK locked
      expect(await ctx.sortitionModule.getJurorBalance(ctx.juror2.address, Courts.GENERAL)).to.deep.equal([
        ctx.thousandPNK(10), // totalStaked
        0, // totalLocked
        ctx.thousandPNK(10), // stakedInCourt
        1, // nbOfCourts
      ]);
    });
  });
}

export function testERC721Gating(context: () => TokenGatedTestContext) {
  describe("When gating with ERC721 token", async () => {
    it("Should draw no juror if they don't own the ERC721 token", async () => {
      const ctx = context();
      const nbOfJurors = 15n;
      const tx = await stakeAndDraw(
        ctx,
        Courts.GENERAL,
        nbOfJurors,
        ctx.gatedDisputeKitID,
        ctx.nft721.target,
        false,
        0
      ).then((tx) => tx.wait());

      // Ensure that no juror is drawn
      const drawLogs =
        tx?.logs.filter((log: any) => log.fragment?.name === "Draw" && log.address === ctx.core.target) || [];
      expect(drawLogs).to.have.length(0);
    });

    it("Should draw only the jurors owning the ERC721 token", async () => {
      const ctx = context();
      await ctx.nft721.safeMint(ctx.juror2.address);

      const nbOfJurors = 15n;
      const tx = await stakeAndDraw(
        ctx,
        Courts.GENERAL,
        nbOfJurors,
        ctx.gatedDisputeKitID,
        ctx.nft721.target,
        false,
        0
      ).then((tx) => tx.wait());

      // Ensure that only juror2 is drawn
      const drawLogs =
        tx?.logs.filter((log: any) => log.fragment?.name === "Draw" && log.address === ctx.core.target) || [];
      expect(drawLogs).to.have.length(nbOfJurors);
      drawLogs.forEach((log: any) => {
        expect(log.args[0]).to.equal(ctx.juror2.address);
      });

      // Ensure that juror1 has no PNK locked
      expect(await ctx.sortitionModule.getJurorBalance(ctx.juror1.address, Courts.GENERAL)).to.deep.equal([
        ctx.thousandPNK(10), // totalStaked
        0, // totalLocked
        ctx.thousandPNK(10), // stakedInCourt
        1, // nbOfCourts
      ]);

      // Ensure that juror2 has PNK locked
      expect(await ctx.sortitionModule.getJurorBalance(ctx.juror2.address, Courts.GENERAL)).to.deep.equal([
        ctx.thousandPNK(10), // totalStaked
        ctx.minStake * nbOfJurors, // totalLocked
        ctx.thousandPNK(10), // stakedInCourt
        1, // nbOfCourts
      ]);
    });
  });
}

export function testERC1155Gating(context: () => TokenGatedTestContext) {
  describe("When gating with ERC1155 token", async () => {
    it("Should draw no juror if they don't own the ERC1155 token", async () => {
      const ctx = context();
      const nbOfJurors = 15n;
      const tx = await stakeAndDraw(
        ctx,
        Courts.GENERAL,
        nbOfJurors,
        ctx.gatedDisputeKitID,
        ctx.nft1155.target,
        true,
        ctx.TOKEN_ID
      ).then((tx) => tx.wait());

      // Ensure that no juror is drawn
      const drawLogs =
        tx?.logs.filter((log: any) => log.fragment?.name === "Draw" && log.address === ctx.core.target) || [];
      expect(drawLogs).to.have.length(0);
    });

    it("Should draw only the jurors owning the ERC1155 token", async () => {
      const ctx = context();
      await ctx.nft1155.mint(ctx.juror2.address, ctx.TOKEN_ID, 1, "0x00");

      const nbOfJurors = 15n;
      const tx = await stakeAndDraw(
        ctx,
        Courts.GENERAL,
        nbOfJurors,
        ctx.gatedDisputeKitID,
        ctx.nft1155.target,
        true,
        ctx.TOKEN_ID
      ).then((tx) => tx.wait());

      // Ensure that only juror2 is drawn
      const drawLogs =
        tx?.logs.filter((log: any) => log.fragment?.name === "Draw" && log.address === ctx.core.target) || [];
      expect(drawLogs).to.have.length(nbOfJurors);
      drawLogs.forEach((log: any) => {
        expect(log.args[0]).to.equal(ctx.juror2.address);
      });

      // Ensure that juror1 has no PNK locked
      expect(await ctx.sortitionModule.getJurorBalance(ctx.juror1.address, Courts.GENERAL)).to.deep.equal([
        ctx.thousandPNK(10), // totalStaked
        0, // totalLocked
        ctx.thousandPNK(10), // stakedInCourt
        1, // nbOfCourts
      ]);

      // Ensure that juror2 has PNK locked
      expect(await ctx.sortitionModule.getJurorBalance(ctx.juror2.address, Courts.GENERAL)).to.deep.equal([
        ctx.thousandPNK(10), // totalStaked
        ctx.minStake * nbOfJurors, // totalLocked
        ctx.thousandPNK(10), // stakedInCourt
        1, // nbOfCourts
      ]);
    });
  });
}

export function testWhitelistIntegration(context: () => TokenGatedTestContext) {
  describe("Whitelist Integration Tests", async () => {
    it("Should allow new disputes after whitelisting a token", async () => {
      const ctx = context();
      // Whitelist DAI token
      await whitelistTokens(ctx, [ctx.dai.target], true);

      // Transfer DAI to juror1 for token gating
      await ctx.dai.transfer(ctx.juror1.address, 1);

      const nbOfJurors = 3n;
      const tx = await stakeAndDraw(
        ctx,
        Courts.GENERAL,
        nbOfJurors,
        ctx.gatedDisputeKitID,
        ctx.dai.target,
        false,
        0
      ).then((tx) => tx.wait());

      // Verify dispute was created and juror drawn
      const drawLogs =
        tx?.logs.filter((log: any) => log.fragment?.name === "Draw" && log.address === ctx.core.target) || [];
      expect(drawLogs).to.have.length(nbOfJurors);
    });

    it("Should prevent new disputes after removing token from whitelist", async () => {
      const ctx = context();
      await whitelistTokens(ctx, [ctx.dai.target], true);
      await ctx.dai.transfer(ctx.juror1.address, 1);

      // Create first dispute (should work)
      await expect(createDisputeWithToken(ctx, ctx.dai.target)).to.not.be.reverted;

      // Remove token from whitelist
      await whitelistTokens(ctx, [ctx.dai.target], false);

      // Try to create another dispute (should fail)
      await expect(createDisputeWithToken(ctx, ctx.dai.target))
        .to.be.revertedWithCustomError(ctx.disputeKit, "TokenNotSupported")
        .withArgs(ctx.dai.target);
    });

    it("Should maintain whitelist state correctly across multiple operations", async () => {
      const ctx = context();
      const tokens = [ctx.dai.target, ctx.nft721.target, ctx.nft1155.target];

      // All tokens should already be supported from the main setup
      for (const token of tokens) {
        await expectTokenSupported(ctx, token, true);
      }

      // Remove middle token
      await whitelistTokens(ctx, [ctx.nft721.target], false);
      await expectTokenSupported(ctx, ctx.dai.target, true);
      await expectTokenSupported(ctx, ctx.nft721.target, false);
      await expectTokenSupported(ctx, ctx.nft1155.target, true);

      // Re-add middle token
      await whitelistTokens(ctx, [ctx.nft721.target], true);
      for (const token of tokens) {
        await expectTokenSupported(ctx, token, true);
      }
    });
  });
}

export function testNoTokenGateAddress(context: () => TokenGatedTestContext) {
  describe("No Token Gate Edge Case (address(0))", async () => {
    it("Should verify that address(0) is supported by default", async () => {
      const ctx = context();
      await expectTokenSupported(ctx, ethers.ZeroAddress, true);
    });

    it("Should allow dispute creation with address(0) as tokenGate", async () => {
      const ctx = context();
      // Create dispute with address(0) as tokenGate - should not revert
      await expect(createDisputeWithToken(ctx, ethers.ZeroAddress, false, 0)).to.not.be.reverted;
    });

    it("Should draw all staked jurors when tokenGate is address(0)", async () => {
      const ctx = context();
      // Neither juror has any special tokens, but both are staked
      const nbOfJurors = 15n;
      const tx = await stakeAndDraw(
        ctx,
        Courts.GENERAL,
        nbOfJurors,
        ctx.gatedDisputeKitID,
        ethers.ZeroAddress,
        false,
        0
      ).then((tx) => tx.wait());

      // Both jurors should be eligible for drawing since there's no token gate
      const drawLogs =
        tx?.logs.filter((log: any) => log.fragment?.name === "Draw" && log.address === ctx.core.target) || [];
      expect(drawLogs.length).to.equal(nbOfJurors);

      // Verify that draws include both jurors (not just one)
      const drawnJurors = new Set(drawLogs.map((log: any) => log.args[0]));
      expect(drawnJurors.size).to.be.greaterThan(1, "Should draw from multiple jurors");
    });

    it("Should behave like non-gated dispute kit when tokenGate is address(0)", async () => {
      const ctx = context();
      // Verify that with address(0), jurors don't need any token balance
      const nbOfJurors = 3n;

      // Ensure jurors have no DAI tokens
      expect(await ctx.dai.balanceOf(ctx.juror1.address)).to.equal(0);
      expect(await ctx.dai.balanceOf(ctx.juror2.address)).to.equal(0);

      const tx = await stakeAndDraw(
        ctx,
        Courts.GENERAL,
        nbOfJurors,
        ctx.gatedDisputeKitID,
        ethers.ZeroAddress,
        false,
        0
      ).then((tx) => tx.wait());

      // Jurors should still be drawn despite having no tokens
      const drawLogs =
        tx?.logs.filter((log: any) => log.fragment?.name === "Draw" && log.address === ctx.core.target) || [];
      expect(drawLogs).to.have.length(nbOfJurors);
    });

    it("Should parse address(0) correctly from insufficient extraData", async () => {
      const ctx = context();
      // Create extraData that's too short (less than 160 bytes)
      // This should return address(0) from _extraDataToTokenInfo
      const shortExtraData = ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint256", "uint256", "uint256"],
        [Courts.GENERAL, 3, ctx.gatedDisputeKitID]
      );

      const tokenInfo = await ctx.disputeKit.extraDataToTokenInfo(shortExtraData);
      expect(tokenInfo[0]).to.equal(ethers.ZeroAddress);
      expect(tokenInfo[1]).to.equal(false);
      expect(tokenInfo[2]).to.equal(0);
    });
  });
}
