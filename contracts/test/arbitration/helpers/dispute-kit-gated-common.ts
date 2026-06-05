import hre, { deployments, ethers, getNamedAccounts, network } from "hardhat";
import { toBigInt, BigNumberish, Addressable, EventLog, Log } from "ethers";
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

// https://github.com/standard/standard/issues/690#issuecomment-278533482

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
  contractName: "DisputeKitGatedMock" | "DisputeKitGatedShutterMock";
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
  supported: boolean = true,
  courtId: BigNumberish = Courts.GENERAL
) => {
  const tokenAddresses = tokens.map((token) => (typeof token === "string" ? token : token.toString()));

  const nft1155Address = context.nft1155.target.toString();
  const isErc1155Included = tokenAddresses.some((tokenAddress) => tokenAddress === nft1155Address);
  const erc721LikeTokens = tokenAddresses.filter((tokenAddress) => tokenAddress !== nft1155Address);

  if (erc721LikeTokens.length > 0)
    await context.disputeKit.changeSupportedErc721Tokens(courtId, erc721LikeTokens, supported);
  if (isErc1155Included)
    await context.disputeKit.changeSupportedErc1155TokenIds(courtId, nft1155Address, [context.TOKEN_ID], supported);
};

// Helper function to create a dispute with the specified token gate
export const createDisputeWithToken = async (
  context: TokenGatedTestContext,
  token: string | Addressable,
  isERC1155: boolean = false,
  tokenId: BigNumberish = 0,
  courtId: BigNumberish = Courts.GENERAL
) => {
  const extraData = encodeExtraData(courtId, 3, context.gatedDisputeKitID, token, isERC1155, tokenId);
  const arbitrationCost = await context.core["arbitrationCost(bytes)"](extraData);
  return context.core["createDispute(uint256,bytes)"](2, extraData, {
    value: arbitrationCost,
  });
};

// Helper function to assert whether a token is supported or not
export const expectTokenSupported = async (
  context: TokenGatedTestContext,
  token: string | Addressable,
  supported: boolean,
  courtId: BigNumberish = Courts.GENERAL,
  tokenId?: BigNumberish
) => {
  const tokenAddress = typeof token === "string" ? token : token.toString();

  const nft1155Address = context.nft1155.target.toString();
  const isKnownErc1155 = tokenAddress === nft1155Address;

  if (tokenId !== undefined || isKnownErc1155) {
    const effectiveTokenId = tokenId ?? context.TOKEN_ID;
    expect(await context.disputeKit.isErc1155TokenIdSupported(courtId, tokenAddress, effectiveTokenId)).to.equal(
      supported
    );
    return;
  }

  expect(await context.disputeKit.isErc721TokenSupported(courtId, tokenAddress)).to.equal(supported);
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
      .approve(context.core.target, context.thousandPNK(10), {
        gasLimit: 300000,
      })
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
  await context.core["createDispute(uint256,bytes)"](2, extraData, {
    value: arbitrationCost,
  }).then((tx) => tx.wait());
  const disputeId = 0;

  await network.provider.send("evm_increaseTime", [2000]); // Wait for minStakingTime
  await network.provider.send("evm_mine");
  await context.sortitionModule.passPhase().then((tx) => tx.wait()); // Staking -> Generating

  await context.sortitionModule.passPhase().then((tx) => tx.wait()); // Generating -> Drawing
  return context.core.draw(disputeId, 70, { gasLimit: 10000000 });
};

// Helper functions to check if a log is of type EventLog and also a draw event
const isDrawEventLog = (log: Log | EventLog, coreAddress: string | Addressable): log is EventLog => {
  return log instanceof EventLog && log.fragment.name === "Draw" && log.address === coreAddress;
};

// Helper functions to check if a log is of type EventLog and also a court created event
const isCourtCreatedEventLog = (log: Log | EventLog, coreAddress: string | Addressable): log is EventLog => {
  return log instanceof EventLog && log.fragment.name === "CourtCreated" && log.address === coreAddress;
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
    args: [deployer, core.target, weth.target],
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
    describe("changeSupportedErc721Tokens / changeSupportedErc1155TokenIds functions", async () => {
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

      it("Should not affect other courts when whitelisting tokens", async () => {
        const ctx = context();

        // Setup already whitelists DAI in GENERAL only.
        await expectTokenSupported(ctx, ctx.dai.target, true, Courts.GENERAL);
        await expectTokenSupported(ctx, ctx.dai.target, false, Courts.FORKING);

        // Whitelist in FORKING should not affect GENERAL.
        await whitelistTokens(ctx, [ctx.dai.target], true, Courts.FORKING);
        await expectTokenSupported(ctx, ctx.dai.target, true, Courts.FORKING);
        await expectTokenSupported(ctx, ctx.dai.target, true, Courts.GENERAL);
      });

      it("Should keep court-specific state isolated across add/remove operations", async () => {
        const ctx = context();

        // Whitelist DAI in both courts, then remove only in GENERAL.
        await whitelistTokens(ctx, [ctx.dai.target], true, Courts.FORKING);
        await expectTokenSupported(ctx, ctx.dai.target, true, Courts.GENERAL);
        await expectTokenSupported(ctx, ctx.dai.target, true, Courts.FORKING);

        await whitelistTokens(ctx, [ctx.dai.target], false, Courts.GENERAL);
        await expectTokenSupported(ctx, ctx.dai.target, false, Courts.GENERAL);
        await expectTokenSupported(ctx, ctx.dai.target, true, Courts.FORKING);
      });
    });
  });
}

export function testAccessControl(context: () => TokenGatedTestContext) {
  describe("Access Control", async () => {
    it("Should revert when non-owner tries to change supported ERC721-like tokens", async () => {
      const ctx = context();
      await expect(
        ctx.disputeKit.connect(ctx.juror1).changeSupportedErc721Tokens(Courts.GENERAL, [ctx.dai.target], true)
      ).to.be.reverted;
    });

    it("Should revert when non-owner tries to change supported ERC1155 tokenIds", async () => {
      const ctx = context();
      await expect(
        ctx.disputeKit
          .connect(ctx.juror1)
          .changeSupportedErc1155TokenIds(Courts.GENERAL, ctx.nft1155.target, [ctx.TOKEN_ID], true)
      ).to.be.reverted;
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
        .withArgs(Courts.GENERAL, ctx.dai.target);
    });

    it("Should check token support using the courtID encoded in extraData", async () => {
      const ctx = context();

      // Enable the dispute kit in FORKING court so dispute creation reaches DK logic.
      const deployerSigner = await ethers.getSigner(ctx.deployer);
      await ctx.core.connect(deployerSigner).enableDisputeKits(Courts.FORKING, [ctx.gatedDisputeKitID], true);

      // DAI is supported in GENERAL from setup, but not in FORKING by default.
      await expectTokenSupported(ctx, ctx.dai.target, true, Courts.GENERAL);
      await expectTokenSupported(ctx, ctx.dai.target, false, Courts.FORKING);

      await expect(createDisputeWithToken(ctx, ctx.dai.target, false, 0, Courts.FORKING))
        .to.be.revertedWithCustomError(ctx.disputeKit, "TokenNotSupported")
        .withArgs(Courts.FORKING, ctx.dai.target);
    });

    it("Should revert with TokenNotSupported when creating dispute with unsupported ERC721", async () => {
      const ctx = context();
      await whitelistTokens(ctx, [ctx.nft721.target], false);

      await expect(createDisputeWithToken(ctx, ctx.nft721.target))
        .to.be.revertedWithCustomError(ctx.disputeKit, "TokenNotSupported")
        .withArgs(Courts.GENERAL, ctx.nft721.target);
    });

    it("Should revert with TokenNotSupported when creating dispute with unsupported ERC1155", async () => {
      const ctx = context();
      await whitelistTokens(ctx, [ctx.nft1155.target], false);

      await expect(createDisputeWithToken(ctx, ctx.nft1155.target, true, ctx.TOKEN_ID))
        .to.be.revertedWithCustomError(ctx.disputeKit, "TokenNotSupported")
        .withArgs(Courts.GENERAL, ctx.nft1155.target);
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
      const drawLogs = tx?.logs.filter((log) => isDrawEventLog(log, ctx.core.target)) || [];
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
      const drawLogs = tx?.logs.filter((log) => isDrawEventLog(log, ctx.core.target)) || [];
      expect(drawLogs).to.have.length(nbOfJurors);
      drawLogs.forEach((log) => {
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
      const drawLogs = tx?.logs.filter((log) => isDrawEventLog(log, ctx.core.target)) || [];
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
      const drawLogs = tx?.logs.filter((log) => isDrawEventLog(log, ctx.core.target)) || [];
      expect(drawLogs).to.have.length(nbOfJurors);
      drawLogs.forEach((log) => {
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
      const drawLogs = tx?.logs.filter((log) => isDrawEventLog(log, ctx.core.target)) || [];
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
      const drawLogs = tx?.logs.filter((log) => isDrawEventLog(log, ctx.core.target)) || [];
      expect(drawLogs).to.have.length(nbOfJurors);
      drawLogs.forEach((log) => {
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
      const drawLogs = tx?.logs.filter((log) => isDrawEventLog(log, ctx.core.target)) || [];
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
        .withArgs(Courts.GENERAL, ctx.dai.target);
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

export function testTokenGateRequired(context: () => TokenGatedTestContext) {
  describe("Token Gate Required (address(0) is invalid)", async () => {
    it("Should revert when whitelisting address(0)", async () => {
      const ctx = context();
      await expect(
        ctx.disputeKit.changeSupportedErc721Tokens(Courts.GENERAL, [ethers.ZeroAddress], true)
      ).to.be.revertedWithCustomError(ctx.disputeKit, "TokenGateRequired");
    });

    it("Should revert when creating dispute with tokenGate = address(0)", async () => {
      const ctx = context();
      await expect(createDisputeWithToken(ctx, ethers.ZeroAddress, false, 0)).to.be.revertedWithCustomError(
        ctx.disputeKit,
        "TokenGateRequired"
      );
    });

    it("Should parse address(0) correctly from insufficient extraData", async () => {
      const ctx = context();
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

export function testCourtEligibilityMisconfiguration(context: () => TokenGatedTestContext) {
  describe("Court eligibility misconfiguration (eligibility set before token config)", async () => {
    async function createCourtWithEligibility(ctx: TokenGatedTestContext): Promise<number> {
      const deployerSigner = await ethers.getSigner(ctx.deployer);

      const tx = await ctx.core
        .connect(deployerSigner)
        .createCourt(
          Courts.GENERAL, // parent
          false, // hiddenVotes
          ctx.minStake, // minStake
          10000, // alpha
          ethers.parseEther("0.1"), // feeForJuror
          16, // jurorsForCourtJump
          [300, 300, 300, 300], // timesPerPeriod
          ethers.toBeHex(5), // sortitionExtraData
          [1, ctx.gatedDisputeKitID], // supportedDisputeKits (must include Classic)
          ctx.disputeKit.target // eligibility predicate
        )
        .then((tx) => tx.wait());

      const createdLog = tx?.logs.find((log) => isCourtCreatedEventLog(log, ctx.core.target));
      expect(createdLog, "CourtCreated log not found").to.not.equal(undefined);

      return Number(createdLog?.args[0]);
    }

    async function fundAndApprove(ctx: TokenGatedTestContext, juror: HardhatEthersSigner, amount: bigint) {
      await ctx.pnk.transfer(juror.address, amount).then((tx) => tx.wait());
      await ctx.pnk
        .connect(juror)
        .approve(ctx.core.target, amount, { gasLimit: 300000 })
        .then((tx) => tx.wait());
    }

    // eslint-disable-next-line max-len
    it("Should revert NotEligibleForStaking when eligibility is set but no supported tokens are configured", async () => {
      const ctx = context();
      const courtId = await createCourtWithEligibility(ctx);

      expect(await ctx.disputeKit.supportedErc721TokensLength(courtId)).to.equal(0);
      expect(await ctx.disputeKit.supportedErc1155TokensLength(courtId)).to.equal(0);

      await fundAndApprove(ctx, ctx.juror1, ctx.thousandPNK(10));
      await expect(ctx.core.connect(ctx.juror1).setStake(courtId, ctx.thousandPNK(10))).to.be.revertedWithCustomError(
        ctx.core,
        "NotEligibleForStaking"
      );
    });

    it("Should not revert eligibility when ERC721 supported set contains address(0)", async () => {
      const ctx = context();
      const courtId = await createCourtWithEligibility(ctx);
      await ctx.disputeKit.unsafeAddSupportedErc721Token(courtId, ethers.ZeroAddress);

      expect(await ctx.disputeKit.supportedErc721TokensLength(courtId)).to.equal(1);
      expect(await ctx.disputeKit.supportedErc721TokensAt(courtId, 0)).to.equal(ethers.ZeroAddress);
      expect(await ctx.disputeKit.isEligible(ctx.juror1.address, courtId)).to.equal(false);

      await fundAndApprove(ctx, ctx.juror1, ctx.thousandPNK(10));
      await expect(ctx.core.connect(ctx.juror1).setStake(courtId, ctx.thousandPNK(10))).to.be.revertedWithCustomError(
        ctx.core,
        "NotEligibleForStaking"
      );
    });

    it("Should not revert eligibility when ERC1155 supported set contains address(0)", async () => {
      const ctx = context();
      const courtId = await createCourtWithEligibility(ctx);
      await ctx.disputeKit.unsafeAddSupportedErc1155Token(courtId, ethers.ZeroAddress);

      expect(await ctx.disputeKit.supportedErc1155TokensLength(courtId)).to.equal(1);
      expect(await ctx.disputeKit.supportedErc1155TokensAt(courtId, 0)).to.equal(ethers.ZeroAddress);
      expect(await ctx.disputeKit.isEligible(ctx.juror1.address, courtId)).to.equal(false);

      await fundAndApprove(ctx, ctx.juror1, ctx.thousandPNK(10));
      await expect(ctx.core.connect(ctx.juror1).setStake(courtId, ctx.thousandPNK(10))).to.be.revertedWithCustomError(
        ctx.core,
        "NotEligibleForStaking"
      );
    });
  });
}
