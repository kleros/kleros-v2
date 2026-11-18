import hre, { deployments, ethers, getNamedAccounts, network } from "hardhat";
import { toBigInt, BigNumberish, Addressable, EventLog, Log } from "ethers";
import {
  PNK,
  KlerosCore,
  SortitionModule,
  IncrementalNG,
  DisputeKitGated,
  DisputeKitGatedShutter,
  TestERC20,
  TestERC721,
  TestERC1155,
} from "../../../typechain-types";
import { expect } from "chai";
import { Courts } from "../../../deploy/utils";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { deployERC20, deployERC1155, deployERC721 } from "../../../deploy/utils/deployTokens";
import { deployUpgradable } from "../../../deploy/utils/deployUpgradable";

// https://github.com/standard/standard/issues/690#issuecomment-278533482

// Type for the dispute kit (either DisputeKitGated or DisputeKitGatedShutter)
export type DisputeKitGatedType = DisputeKitGated | DisputeKitGatedShutter;

// Test context interface that holds all the test state
export interface TokenGatedTestContext {
  deployer: string;
  juror1: HardhatEthersSigner;
  juror2: HardhatEthersSigner;
  disputeKit: DisputeKitGatedType;
  disputeKitERC1155?: DisputeKitGatedType;
  disputeKitDAI?: DisputeKitGatedType;
  pnk: PNK;
  dai: TestERC20;
  core: KlerosCore;
  sortitionModule: SortitionModule;
  rng: IncrementalNG;
  nft721: TestERC721;
  nft1155: TestERC1155;
  gatedDisputeKitID: number;
  gatedDisputeKitIDERC1155?: number;
  gatedDisputeKitIDDAI?: number;
  minStake: bigint;
  RANDOM: bigint;
  TOKEN_ID: number;
  ONE_THOUSAND_PNK: bigint;
  thousandPNK: (amount: BigNumberish) => bigint;
  PNK: (amount: BigNumberish) => bigint;
}

// Configuration for setting up a token gated test
export interface TokenGatedTestConfig {
  contractName: "DisputeKitGated" | "DisputeKitGatedShutter";
}

// Constants for token amounts
const ONE_THOUSAND_PNK = 10n ** 21n;
const thousandPNK = (amount: BigNumberish) => toBigInt(amount) * ONE_THOUSAND_PNK;
const PNK_AMOUNT = (amount: BigNumberish) => toBigInt(amount) * 10n ** 18n;

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
      .depositTokens(context.thousandPNK(10))
      .then((tx) => tx.wait());

    await context.core
      .connect(juror)
      .setStake(Courts.GENERAL, context.thousandPNK(10), { gasLimit: 500000 })
      .then((tx) => tx.wait());

    const delayedStake = await context.sortitionModule.delayedStakes(juror.address, 1);
    expect(delayedStake.stake).to.equal(context.thousandPNK(10));
    expect(delayedStake.pending).to.equal(true);
    expect(await context.sortitionModule.getJurorBalance(juror.address)).to.deep.equal([0n, 0n]);
    expect(await context.sortitionModule.stakeOf(juror.address, 1)).to.equal(0n);
    expect((await context.sortitionModule.getJurorCourtIDs(juror.address)).length).to.equal(0);
  }

  await network.provider.send("evm_increaseTime", [Number(await context.sortitionModule.stakingDelay())]);
  await network.provider.send("evm_mine");
  await context.sortitionModule
    .executeDelayedStakes([context.juror1.address, context.juror2.address], [Courts.GENERAL, Courts.GENERAL])
    .then((tx) => tx.wait());
  for (const juror of [context.juror1, context.juror2]) {
    expect(await context.sortitionModule.stakeOf(juror.address, Courts.GENERAL)).to.equal(context.thousandPNK(10));
  }

  const extraData = ethers.AbiCoder.defaultAbiCoder().encode(
    ["uint256", "uint256", "uint256"],
    [courtId, minJurors, disputeKitId]
  );

  const disputeKit = await ethers.getContractAt("DisputeKitGated", await context.core.disputeKits(disputeKitId));
  expect(await disputeKit.tokenGate()).to.equal(await ethers.resolveAddress(tokenGate));
  expect(await disputeKit.isERC1155()).to.equal(isERC1155);
  expect(await disputeKit.tokenId()).to.equal(tokenId);

  const arbitrationCost = await context.core.arbitrationCost(extraData);

  // Warning: this dispute cannot be executed, in reality it should be created by an arbitrable contract, not an EOA.
  await context.core
    .createDispute(2, extraData, {
      value: arbitrationCost,
    })
    .then((tx) => tx.wait());
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

// Setup function that creates the test context
export async function setupTokenGatedTest(config: TokenGatedTestConfig): Promise<TokenGatedTestContext> {
  const { deployer } = await getNamedAccounts();
  const [, juror1, juror2] = await ethers.getSigners();

  await deployments.fixture(["Arbitration", "VeaMock"], {
    fallbackToGlobal: true,
    keepExistingDeployments: false,
  });

  const pnk = await ethers.getContract<PNK>("PNK");
  await deployERC20(hre, deployer, "DAI");
  const dai = await ethers.getContract<TestERC20>("DAI");
  const weth = await ethers.getContract<TestERC20>("WETH");
  const core = await ethers.getContract<KlerosCore>("KlerosCore");
  const sortitionModule = await ethers.getContract<SortitionModule>("SortitionModule");

  await deployERC721(hre, deployer, "TestERC721", "Nft721");
  const nft721 = await ethers.getContract<TestERC721>("Nft721");

  const deploymentResult = await deployUpgradable(deployments, config.contractName, {
    from: deployer,
    args: [core.target, weth.target, 1, 70, nft721.target, false, 0],
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

  const deploymentResultERC1155 = await deployUpgradable(deployments, `${config.contractName}ERC1155`, {
    newImplementation: config.contractName,
    from: deployer,
    args: [core.target, weth.target, 1, 70, nft1155.target, true, TOKEN_ID],
    log: true,
  });
  await core.addNewDisputeKit(deploymentResultERC1155.address);
  const gatedDisputeKitIDERC1155 = Number((await core.getDisputeKitsLength()) - 1n);
  await core.enableDisputeKits(Courts.GENERAL, [gatedDisputeKitIDERC1155], true);

  context.disputeKitERC1155 = await ethers.getContract<DisputeKitGatedType>(`${config.contractName}ERC1155`);
  context.gatedDisputeKitIDERC1155 = gatedDisputeKitIDERC1155;

  const deploymentResultDAI = await deployUpgradable(deployments, `${config.contractName}DAI`, {
    newImplementation: config.contractName,
    from: deployer,
    args: [core.target, weth.target, 1, 70, dai.target, false, 0],
    log: true,
  });
  await core.addNewDisputeKit(deploymentResultDAI.address);
  const gatedDisputeKitIDDAI = Number((await core.getDisputeKitsLength()) - 1n);
  await core.enableDisputeKits(Courts.GENERAL, [gatedDisputeKitIDDAI], true);

  context.disputeKitDAI = await ethers.getContract<DisputeKitGatedType>(`${config.contractName}DAI`);
  context.gatedDisputeKitIDDAI = gatedDisputeKitIDDAI;

  return context;
}

// Test suites as functions that accept context

export function testFixedTokenGateConfiguration(context: () => TokenGatedTestContext) {
  const gateConfiguration = async (ctx: TokenGatedTestContext) =>
    [await ctx.disputeKit.tokenGate(), await ctx.disputeKit.isERC1155(), await ctx.disputeKit.tokenId()] as const;

  const giveConfiguredToken = async (ctx: TokenGatedTestContext) => {
    const [tokenGate, isERC1155, tokenId] = await gateConfiguration(ctx);
    if (isERC1155) {
      expect(tokenGate).to.equal(ctx.nft1155.target);
      await ctx.nft1155.mint(ctx.juror1.address, tokenId, 1, "0x00");
    } else if (tokenGate === ctx.nft721.target) {
      await ctx.nft721.safeMint(ctx.juror1.address);
    } else {
      expect(tokenGate).to.equal(ctx.dai.target);
      await ctx.dai.transfer(ctx.juror1.address, 1);
    }
  };

  describe("Fixed Token Gate Configuration", () => {
    it("Should base eligibility on the configured token and token ID", async () => {
      const ctx = context();
      const [tokenGate, isERC1155, tokenId] = await gateConfiguration(ctx);
      expect(await ctx.disputeKit.isEligible(ctx.juror1.address, Courts.GENERAL)).to.equal(false);

      // Give juror2 a different token or token ID, which must not grant eligibility.
      if (isERC1155) {
        await ctx.nft1155.mint(ctx.juror2.address, toBigInt(tokenId) + 1n, 1, "0x00");
      } else if (tokenGate === ctx.nft721.target) {
        await ctx.dai.transfer(ctx.juror2.address, 1);
      } else {
        await ctx.nft721.safeMint(ctx.juror2.address);
      }
      await giveConfiguredToken(ctx);
      expect(await ctx.disputeKit.isEligible(ctx.juror1.address, Courts.GENERAL)).to.equal(true);
      expect(await ctx.disputeKit.isEligible(ctx.juror2.address, Courts.GENERAL)).to.equal(false);
    });

    it("Should keep the fixed gate when Core creates disputes with different trailing extraData", async () => {
      const ctx = context();
      const configuredGate = await gateConfiguration(ctx);
      await giveConfiguredToken(ctx);
      const routing = ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint256", "uint256", "uint256"],
        [Courts.GENERAL, 3, ctx.gatedDisputeKitID]
      );
      const differentToken = configuredGate[0] === ctx.dai.target ? ctx.nft721.target : ctx.dai.target;
      const trailingGate = ethers.AbiCoder.defaultAbiCoder().encode(
        ["address", "uint256"],
        [differentToken, toBigInt(configuredGate[2]) + 1n]
      );

      for (const [disputeId, extraData] of [routing, ethers.concat([routing, trailingGate])].entries()) {
        await ctx.core
          .createDispute(2, extraData, {
            value: await ctx.core.arbitrationCost(extraData),
          })
          .then((tx) => tx.wait());
        expect(await ctx.core.getDisputeKitID(disputeId, 0)).to.equal(ctx.gatedDisputeKitID);
        expect(await ctx.core.getNumberOfVotes(disputeId, 0)).to.equal(3);
        expect((await ctx.disputeKit.coreDisputeIDToActive(disputeId)).dispute).to.equal(true);
        expect(await ctx.disputeKit.coreDisputeIDToLocal(disputeId)).to.equal(disputeId);
        expect(await gateConfiguration(ctx)).to.deep.equal(configuredGate);
        expect(await ctx.disputeKit.isEligible(ctx.juror1.address, Courts.GENERAL)).to.equal(true);
      }
    });

    it("Should prevent reinitialization from replacing the fixed gate", async () => {
      const ctx = context();
      const configuredGate = await gateConfiguration(ctx);
      await giveConfiguredToken(ctx);
      const differentToken = configuredGate[0] === ctx.dai.target ? ctx.nft721.target : ctx.dai.target;
      await expect(
        ctx.disputeKit
          .connect(ctx.juror1)
          .initialize(
            ctx.core.target,
            await ctx.disputeKit.wNative(),
            1,
            await ctx.disputeKit.maxExtraFilteringAttempts(),
            differentToken,
            false,
            toBigInt(configuredGate[2]) + 1n
          )
      ).to.be.revertedWith("Initializable: contract is already initialized");
      expect(await gateConfiguration(ctx)).to.deep.equal(configuredGate);
      expect(await ctx.disputeKit.isEligible(ctx.juror1.address, Courts.GENERAL)).to.equal(true);
    });

    it("Should exclude non-holders until the filtering cutoff and draw them once fallback starts", async () => {
      const ctx = context();
      for (const juror of [ctx.juror1, ctx.juror2]) {
        expect(await ctx.disputeKit.isEligible(juror.address, Courts.GENERAL)).to.equal(false);
      }
      const initialDraw = await stakeAndDraw(
        ctx,
        Courts.GENERAL,
        3n,
        ctx.gatedDisputeKitID,
        await ctx.disputeKit.tokenGate(),
        await ctx.disputeKit.isERC1155(),
        await ctx.disputeKit.tokenId()
      );
      await expect(initialDraw).to.not.emit(ctx.core, "Draw");

      const round = await ctx.core.getRoundInfo(0, 0);
      expect(round.nbVotes).to.equal(3n);
      expect(round.drawnJurors).to.deep.equal([]);
      const cutoff = round.nbVotes + toBigInt(await ctx.disputeKit.maxExtraFilteringAttempts());
      expect(round.drawIterations).to.be.lessThan(cutoff);

      // Finish the filtered attempts: the next nonce will be exactly the cutoff.
      await expect(ctx.core.draw(0, cutoff - round.drawIterations)).to.not.emit(ctx.core, "Draw");
      const beforeFallback = await ctx.core.getRoundInfo(0, 0);
      expect(beforeFallback.drawIterations).to.equal(cutoff);
      expect(beforeFallback.drawnJurors).to.deep.equal([]);

      const receipt = await ctx.core.draw(0, 1).then((tx) => tx.wait());
      if (!receipt) throw new Error("Failed to get drawing transaction receipt");
      const drawLogs = receipt.logs.filter((log) => isDrawEventLog(log, ctx.core.target));
      expect(drawLogs).to.have.length(1);
      const drawnJuror = drawLogs[0].args[0];
      expect(drawnJuror).to.be.oneOf([ctx.juror1.address, ctx.juror2.address]);
      expect(await ctx.disputeKit.isEligible(drawnJuror, Courts.GENERAL)).to.equal(false);
      const afterFallback = await ctx.core.getRoundInfo(0, 0);
      expect(afterFallback.drawIterations).to.equal(cutoff + 1n);
      expect(afterFallback.drawnJurors).to.deep.equal([drawnJuror]);
      expect(await ctx.sortitionModule.getJurorBalance(drawnJuror)).to.deep.equal([ctx.thousandPNK(10), ctx.minStake]);
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
        ctx.gatedDisputeKitIDDAI ?? ctx.gatedDisputeKitID,
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
        ctx.gatedDisputeKitIDDAI ?? ctx.gatedDisputeKitID,
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
      expect(await ctx.sortitionModule.getJurorBalance(ctx.juror1.address)).to.deep.equal([
        ctx.thousandPNK(10), // totalStaked
        ctx.minStake * nbOfJurors, // totalLocked
      ]);
      expect(await ctx.sortitionModule.stakeOf(ctx.juror1.address, Courts.GENERAL)).to.equal(ctx.thousandPNK(10));
      expect((await ctx.sortitionModule.getJurorCourtIDs(ctx.juror1.address)).length).to.equal(1);

      // Ensure that juror2 has no PNK locked
      expect(await ctx.sortitionModule.getJurorBalance(ctx.juror2.address)).to.deep.equal([
        ctx.thousandPNK(10), // totalStaked
        0, // totalLocked
      ]);
      expect(await ctx.sortitionModule.stakeOf(ctx.juror2.address, Courts.GENERAL)).to.equal(ctx.thousandPNK(10));
      expect((await ctx.sortitionModule.getJurorCourtIDs(ctx.juror2.address)).length).to.equal(1);
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
      expect(await ctx.sortitionModule.getJurorBalance(ctx.juror1.address)).to.deep.equal([
        ctx.thousandPNK(10), // totalStaked
        0, // totalLocked
      ]);
      expect(await ctx.sortitionModule.stakeOf(ctx.juror1.address, Courts.GENERAL)).to.equal(ctx.thousandPNK(10));
      expect((await ctx.sortitionModule.getJurorCourtIDs(ctx.juror1.address)).length).to.equal(1);

      // Ensure that juror2 has PNK locked
      expect(await ctx.sortitionModule.getJurorBalance(ctx.juror2.address)).to.deep.equal([
        ctx.thousandPNK(10), // totalStaked
        ctx.minStake * nbOfJurors, // totalLocked
      ]);
      expect(await ctx.sortitionModule.stakeOf(ctx.juror2.address, Courts.GENERAL)).to.equal(ctx.thousandPNK(10));
      expect((await ctx.sortitionModule.getJurorCourtIDs(ctx.juror2.address)).length).to.equal(1);
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
        ctx.gatedDisputeKitIDERC1155 ?? ctx.gatedDisputeKitID,
        ctx.nft1155.target,
        true,
        ctx.TOKEN_ID
      ).then((tx) => tx.wait());

      // Ensure that no juror is drawn
      const drawLogs = tx?.logs.filter((log) => isDrawEventLog(log, ctx.core.target)) || [];
      expect(drawLogs).to.have.length(0);
    });

    it("Should exclude jurors holding a different ERC1155 token ID", async () => {
      const ctx = context();
      const differentTokenID = ctx.TOKEN_ID + 1;
      await ctx.nft1155.mint(ctx.juror2.address, differentTokenID, 1, "0x00");
      expect(await ctx.nft1155.balanceOf(ctx.juror2.address, differentTokenID)).to.equal(1);
      expect(await ctx.nft1155.balanceOf(ctx.juror2.address, ctx.TOKEN_ID)).to.equal(0);

      const nbOfJurors = 15n;
      const tx = await stakeAndDraw(
        ctx,
        Courts.GENERAL,
        nbOfJurors,
        ctx.gatedDisputeKitIDERC1155 ?? ctx.gatedDisputeKitID,
        ctx.nft1155.target,
        true,
        ctx.TOKEN_ID
      ).then((tx) => tx.wait());

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
        ctx.gatedDisputeKitIDERC1155 ?? ctx.gatedDisputeKitID,
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
      expect(await ctx.sortitionModule.getJurorBalance(ctx.juror1.address)).to.deep.equal([
        ctx.thousandPNK(10), // totalStaked
        0, // totalLocked
      ]);
      expect(await ctx.sortitionModule.stakeOf(ctx.juror1.address, Courts.GENERAL)).to.equal(ctx.thousandPNK(10));
      expect((await ctx.sortitionModule.getJurorCourtIDs(ctx.juror1.address)).length).to.equal(1);

      // Ensure that juror2 has PNK locked
      expect(await ctx.sortitionModule.getJurorBalance(ctx.juror2.address)).to.deep.equal([
        ctx.thousandPNK(10), // totalStaked
        ctx.minStake * nbOfJurors, // totalLocked
      ]);
      expect(await ctx.sortitionModule.stakeOf(ctx.juror2.address, Courts.GENERAL)).to.equal(ctx.thousandPNK(10));
      expect((await ctx.sortitionModule.getJurorCourtIDs(ctx.juror2.address)).length).to.equal(1);
    });
  });
}
