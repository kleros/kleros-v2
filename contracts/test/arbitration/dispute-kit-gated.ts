import { deployments, ethers, getNamedAccounts, network } from "hardhat";
import { toBigInt, BigNumberish, Addressable } from "ethers";
import {
  PNK,
  KlerosCore,
  SortitionModule,
  IncrementalNG,
  DisputeKitGatedMock,
  TestERC20,
  TestERC721,
  TestERC1155,
} from "../../typechain-types";
import { expect } from "chai";
import { Courts } from "../../deploy/utils";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { deployERC1155, deployERC721 } from "../../deploy/utils/deployTokens";
import { deployUpgradable } from "../../deploy/utils/deployUpgradable";

/* eslint-disable no-unused-vars */
/* eslint-disable no-unused-expressions */ // https://github.com/standard/standard/issues/690#issuecomment-278533482

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
  // Constants for token amounts
  const ONE_THOUSAND_PNK = 10n ** 21n;
  const thousandPNK = (amount: BigNumberish) => toBigInt(amount) * ONE_THOUSAND_PNK;
  const PNK = (amount: BigNumberish) => toBigInt(amount) * 10n ** 18n;

  let deployer: string;
  let juror1: HardhatEthersSigner;
  let juror2: HardhatEthersSigner;
  let disputeKitGated: DisputeKitGatedMock;
  let pnk: PNK;
  let dai: TestERC20;
  let core: KlerosCore;
  let sortitionModule: SortitionModule;
  let rng: IncrementalNG;
  let nft721: TestERC721;
  let nft1155: TestERC1155;
  let gatedDisputeKitID: number;
  const RANDOM = 424242n;
  const TOKEN_ID = 888;
  const minStake = PNK(200);

  beforeEach("Setup", async () => {
    ({ deployer } = await getNamedAccounts());
    [, juror1, juror2] = await ethers.getSigners();

    await deployments.fixture(["Arbitration", "VeaMock"], {
      fallbackToGlobal: true,
      keepExistingDeployments: false,
    });

    pnk = await ethers.getContract<PNK>("PNK");
    dai = await ethers.getContract<TestERC20>("DAI");
    const weth = await ethers.getContract<TestERC20>("WETH");
    core = await ethers.getContract<KlerosCore>("KlerosCore");
    sortitionModule = await ethers.getContract<SortitionModule>("SortitionModule");

    const deploymentResult = await deployUpgradable(deployments, "DisputeKitGatedMock", {
      from: deployer,
      proxyAlias: "UUPSProxy",
      args: [deployer, core.target, weth.target, 1],
      log: true,
    });
    await core.addNewDisputeKit(deploymentResult.address);
    gatedDisputeKitID = Number((await core.getDisputeKitsLength()) - 1n);
    await core.enableDisputeKits(Courts.GENERAL, [gatedDisputeKitID], true); // enable disputeKitGated on the General Court

    disputeKitGated = await ethers.getContract<DisputeKitGatedMock>("DisputeKitGatedMock");

    // Make the tests more deterministic with this dummy RNG
    await deployments.deploy("IncrementalNG", {
      from: deployer,
      args: [RANDOM],
      log: true,
    });
    rng = await ethers.getContract<IncrementalNG>("IncrementalNG");

    await sortitionModule.changeRandomNumberGenerator(rng.target).then((tx) => tx.wait());

    const hre = require("hardhat");
    await deployERC721(hre, deployer, "TestERC721", "Nft721");
    nft721 = await ethers.getContract<TestERC721>("Nft721");

    await deployERC1155(hre, deployer, "TestERC1155", "Nft1155");
    nft1155 = await ethers.getContract<TestERC1155>("Nft1155");
    await nft1155.mint(deployer, TOKEN_ID, 1, "0x00");

    // Whitelist all tokens by default to make existing tests work
    await whitelistTokens([dai.target, nft721.target, nft1155.target], true);
  });

  // Helper Functions

  /** Encodes extra data for dispute creation with token gating parameters */
  const encodeExtraData = (
    courtId: number,
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

  /** Adds or removes tokens from the whitelist */
  const whitelistTokens = async (tokens: (string | Addressable)[], supported: boolean = true) => {
    const tokenAddresses = tokens.map((token) => (typeof token === "string" ? token : token.toString()));
    return disputeKitGated.changeSupportedTokens(tokenAddresses, supported);
  };

  /** Creates a dispute with the specified token gate */
  const createDisputeWithToken = async (
    token: string | Addressable,
    isERC1155: boolean = false,
    tokenId: BigNumberish = 0
  ) => {
    const extraData = encodeExtraData(Courts.GENERAL, 3, gatedDisputeKitID, token, isERC1155, tokenId);
    const arbitrationCost = await core["arbitrationCost(bytes)"](extraData);
    return core["createDispute(uint256,bytes)"](2, extraData, { value: arbitrationCost });
  };

  /** Asserts whether a token is supported or not */
  const expectTokenSupported = async (token: string | Addressable, supported: boolean) => {
    const tokenAddress = typeof token === "string" ? token : token.toString();
    expect(await disputeKitGated.supportedTokens(tokenAddress)).to.equal(supported);
  };

  const stakeAndDraw = async (
    courtId: number,
    minJurors: BigNumberish,
    disputeKitId: number,
    tokenGate: string | Addressable,
    isERC1155: boolean,
    tokenId: BigNumberish
  ) => {
    // Stake jurors
    for (const juror of [juror1, juror2]) {
      await pnk.transfer(juror.address, thousandPNK(10)).then((tx) => tx.wait());
      expect(await pnk.balanceOf(juror.address)).to.equal(thousandPNK(10));

      await pnk
        .connect(juror)
        .approve(core.target, thousandPNK(10), { gasLimit: 300000 })
        .then((tx) => tx.wait());

      await core
        .connect(juror)
        .setStake(Courts.GENERAL, thousandPNK(10), { gasLimit: 500000 })
        .then((tx) => tx.wait());

      expect(await sortitionModule.getJurorBalance(juror.address, 1)).to.deep.equal([
        thousandPNK(10), // totalStaked
        0, // totalLocked
        thousandPNK(10), // stakedInCourt
        1, // nbOfCourts
      ]);
    }

    const extraData = encodeExtraData(courtId, minJurors, disputeKitId, tokenGate, isERC1155, tokenId);
    // console.log("extraData", extraData);

    const tokenInfo = await disputeKitGated.extraDataToTokenInfo(extraData);
    expect(tokenInfo[0]).to.equal(tokenGate);
    expect(tokenInfo[1]).to.equal(isERC1155);
    expect(tokenInfo[2]).to.equal(tokenId);

    const arbitrationCost = await core["arbitrationCost(bytes)"](extraData);

    // Warning: this dispute cannot be executed, in reality it should be created by an arbitrable contract, not an EOA.
    const tx = await core["createDispute(uint256,bytes)"](2, extraData, { value: arbitrationCost }).then((tx) =>
      tx.wait()
    );
    const disputeId = 0;
    // console.log(tx?.logs);

    await network.provider.send("evm_increaseTime", [2000]); // Wait for minStakingTime
    await network.provider.send("evm_mine");
    await sortitionModule.passPhase().then((tx) => tx.wait()); // Staking -> Generating

    await sortitionModule.passPhase().then((tx) => tx.wait()); // Generating -> Drawing
    return core.draw(disputeId, 70, { gasLimit: 10000000 });
  };

  describe("Token Whitelist Management", async () => {
    describe("changeSupportedTokens function", async () => {
      it("Should allow owner to whitelist single token", async () => {
        await whitelistTokens([dai.target], true);
        await expectTokenSupported(dai.target, true);
      });

      it("Should allow owner to whitelist multiple tokens", async () => {
        await whitelistTokens([dai.target, nft721.target, nft1155.target], true);
        await expectTokenSupported(dai.target, true);
        await expectTokenSupported(nft721.target, true);
        await expectTokenSupported(nft1155.target, true);
      });

      it("Should allow owner to remove single token from whitelist", async () => {
        await whitelistTokens([dai.target], true);
        await expectTokenSupported(dai.target, true);

        await whitelistTokens([dai.target], false);
        await expectTokenSupported(dai.target, false);
      });

      it("Should allow owner to remove multiple tokens from whitelist", async () => {
        await whitelistTokens([dai.target, nft721.target], true);
        await expectTokenSupported(dai.target, true);
        await expectTokenSupported(nft721.target, true);

        await whitelistTokens([dai.target, nft721.target], false);
        await expectTokenSupported(dai.target, false);
        await expectTokenSupported(nft721.target, false);
      });

      it("Should handle mixed operations (add some, remove some)", async () => {
        await whitelistTokens([dai.target, nft721.target], true);
        await expectTokenSupported(dai.target, true);
        await expectTokenSupported(nft721.target, true);

        await whitelistTokens([dai.target], false);
        await whitelistTokens([nft1155.target], true);

        await expectTokenSupported(dai.target, false);
        await expectTokenSupported(nft721.target, true);
        await expectTokenSupported(nft1155.target, true);
      });

      it("Should handle duplicate operations correctly", async () => {
        // Whitelist token twice - should not revert
        await whitelistTokens([dai.target], true);
        await whitelistTokens([dai.target], true);
        await expectTokenSupported(dai.target, true);

        // Remove token twice - should not revert
        await whitelistTokens([dai.target], false);
        await whitelistTokens([dai.target], false);
        await expectTokenSupported(dai.target, false);
      });
    });

    describe("Access Control", async () => {
      it("Should revert when non-owner tries to change supported tokens", async () => {
        await expect(disputeKitGated.connect(juror1).changeSupportedTokens([dai.target], true)).to.be.reverted;
      });

      it("Should revert when non-owner tries to remove supported tokens", async () => {
        // First whitelist as owner
        await whitelistTokens([dai.target], true);

        // Then try to remove as non-owner
        await expect(disputeKitGated.connect(juror1).changeSupportedTokens([dai.target], false)).to.be.reverted;
      });
    });
  });

  describe("Error Handling - Unsupported Tokens", async () => {
    it("Should revert with TokenNotSupported when creating dispute with unsupported ERC20", async () => {
      await whitelistTokens([dai.target], false);

      await expect(createDisputeWithToken(dai.target))
        .to.be.revertedWithCustomError(disputeKitGated, "TokenNotSupported")
        .withArgs(dai.target);
    });

    it("Should revert with TokenNotSupported when creating dispute with unsupported ERC721", async () => {
      await whitelistTokens([nft721.target], false);

      await expect(createDisputeWithToken(nft721.target))
        .to.be.revertedWithCustomError(disputeKitGated, "TokenNotSupported")
        .withArgs(nft721.target);
    });

    it("Should revert with TokenNotSupported when creating dispute with unsupported ERC1155", async () => {
      await whitelistTokens([nft1155.target], false);

      await expect(createDisputeWithToken(nft1155.target, true, TOKEN_ID))
        .to.be.revertedWithCustomError(disputeKitGated, "TokenNotSupported")
        .withArgs(nft1155.target);
    });

    it("Should allow dispute creation after token is whitelisted", async () => {
      await whitelistTokens([dai.target], false);

      await expect(createDisputeWithToken(dai.target)).to.be.revertedWithCustomError(
        disputeKitGated,
        "TokenNotSupported"
      );

      await whitelistTokens([dai.target], true);

      await expect(createDisputeWithToken(dai.target)).to.not.be.reverted;
    });
  });

  describe("When gating with DAI token", async () => {
    it("Should draw no juror if they don't have any DAI balance", async () => {
      const nbOfJurors = 15n;
      const tx = await stakeAndDraw(Courts.GENERAL, nbOfJurors, gatedDisputeKitID, dai.target, false, 0).then((tx) =>
        tx.wait()
      );

      // Ensure that no juror is drawn
      const drawLogs =
        tx?.logs.filter((log: any) => log.fragment?.name === "Draw" && log.address === core.target) || [];
      expect(drawLogs).to.have.length(0);
    });

    it("Should draw only the jurors who have some DAI balance", async () => {
      dai.transfer(juror1.address, 1);

      const nbOfJurors = 15n;
      const tx = await stakeAndDraw(Courts.GENERAL, nbOfJurors, gatedDisputeKitID, dai.target, false, 0).then((tx) =>
        tx.wait()
      );

      // Ensure that only juror1 is drawn
      const drawLogs =
        tx?.logs.filter((log: any) => log.fragment?.name === "Draw" && log.address === core.target) || [];
      expect(drawLogs).to.have.length(nbOfJurors);
      drawLogs.forEach((log: any) => {
        expect(log.args[0]).to.equal(juror1.address);
      });

      // Ensure that juror1 has PNK locked
      expect(await sortitionModule.getJurorBalance(juror1.address, Courts.GENERAL)).to.deep.equal([
        thousandPNK(10), // totalStaked
        minStake * nbOfJurors, // totalLocked
        thousandPNK(10), // stakedInCourt
        1, // nbOfCourts
      ]);

      // Ensure that juror2 has no PNK locked
      expect(await sortitionModule.getJurorBalance(juror2.address, Courts.GENERAL)).to.deep.equal([
        thousandPNK(10), // totalStaked
        0, // totalLocked
        thousandPNK(10), // stakedInCourt
        1, // nbOfCourts
      ]);
    });
  });

  describe("When gating with ERC721 token", async () => {
    it("Should draw no juror if they don't own the ERC721 token", async () => {
      const nbOfJurors = 15n;
      const tx = await stakeAndDraw(Courts.GENERAL, nbOfJurors, gatedDisputeKitID, nft721.target, false, 0).then((tx) =>
        tx.wait()
      );

      // Ensure that no juror is drawn
      const drawLogs =
        tx?.logs.filter((log: any) => log.fragment?.name === "Draw" && log.address === core.target) || [];
      expect(drawLogs).to.have.length(0);
    });

    it("Should draw only the jurors owning the ERC721 token", async () => {
      await nft721.safeMint(juror2.address);

      const nbOfJurors = 15n;
      const tx = await stakeAndDraw(Courts.GENERAL, nbOfJurors, gatedDisputeKitID, nft721.target, false, 0).then((tx) =>
        tx.wait()
      );

      // Ensure that only juror2 is drawn
      const drawLogs =
        tx?.logs.filter((log: any) => log.fragment?.name === "Draw" && log.address === core.target) || [];
      expect(drawLogs).to.have.length(nbOfJurors);
      drawLogs.forEach((log: any) => {
        expect(log.args[0]).to.equal(juror2.address);
      });

      // Ensure that juror1 is has no PNK locked
      expect(await sortitionModule.getJurorBalance(juror1.address, Courts.GENERAL)).to.deep.equal([
        thousandPNK(10), // totalStaked
        0, // totalLocked
        thousandPNK(10), // stakedInCourt
        1, // nbOfCourts
      ]);

      // Ensure that juror2 has PNK locked
      expect(await sortitionModule.getJurorBalance(juror2.address, Courts.GENERAL)).to.deep.equal([
        thousandPNK(10), // totalStaked
        minStake * nbOfJurors, // totalLocked
        thousandPNK(10), // stakedInCourt
        1, // nbOfCourts
      ]);
    });
  });

  describe("When gating with ERC1155 token", async () => {
    it("Should draw no juror if they don't own the ERC1155 token", async () => {
      const nbOfJurors = 15n;
      const tx = await stakeAndDraw(Courts.GENERAL, nbOfJurors, gatedDisputeKitID, nft1155.target, true, TOKEN_ID).then(
        (tx) => tx.wait()
      );

      // Ensure that no juror is drawn
      const drawLogs =
        tx?.logs.filter((log: any) => log.fragment?.name === "Draw" && log.address === core.target) || [];
      expect(drawLogs).to.have.length(0);
    });

    it("Should draw only the jurors owning the ERC1155 token", async () => {
      await nft1155.mint(juror2.address, TOKEN_ID, 1, "0x00");

      const nbOfJurors = 15n;
      const tx = await stakeAndDraw(Courts.GENERAL, nbOfJurors, gatedDisputeKitID, nft1155.target, true, TOKEN_ID).then(
        (tx) => tx.wait()
      );

      // Ensure that only juror2 is drawn
      const drawLogs =
        tx?.logs.filter((log: any) => log.fragment?.name === "Draw" && log.address === core.target) || [];
      expect(drawLogs).to.have.length(nbOfJurors);
      drawLogs.forEach((log: any) => {
        expect(log.args[0]).to.equal(juror2.address);
      });

      // Ensure that juror1 is has no PNK locked
      expect(await sortitionModule.getJurorBalance(juror1.address, Courts.GENERAL)).to.deep.equal([
        thousandPNK(10), // totalStaked
        0, // totalLocked
        thousandPNK(10), // stakedInCourt
        1, // nbOfCourts
      ]);

      // Ensure that juror2 has PNK locked
      expect(await sortitionModule.getJurorBalance(juror2.address, Courts.GENERAL)).to.deep.equal([
        thousandPNK(10), // totalStaked
        minStake * nbOfJurors, // totalLocked
        thousandPNK(10), // stakedInCourt
        1, // nbOfCourts
      ]);
    });
  });

  describe("Whitelist Integration Tests", async () => {
    it("Should allow new disputes after whitelisting a token", async () => {
      // Whitelist DAI token
      await whitelistTokens([dai.target], true);

      // Transfer DAI to juror1 for token gating
      await dai.transfer(juror1.address, 1);

      const nbOfJurors = 3n;
      const tx = await stakeAndDraw(Courts.GENERAL, nbOfJurors, gatedDisputeKitID, dai.target, false, 0).then((tx) =>
        tx.wait()
      );

      // Verify dispute was created and juror drawn
      const drawLogs =
        tx?.logs.filter((log: any) => log.fragment?.name === "Draw" && log.address === core.target) || [];
      expect(drawLogs).to.have.length(nbOfJurors);
    });

    it("Should prevent new disputes after removing token from whitelist", async () => {
      await whitelistTokens([dai.target], true);
      await dai.transfer(juror1.address, 1);

      // Create first dispute (should work)
      await expect(createDisputeWithToken(dai.target)).to.not.be.reverted;

      // Remove token from whitelist
      await whitelistTokens([dai.target], false);

      // Try to create another dispute (should fail)
      await expect(createDisputeWithToken(dai.target))
        .to.be.revertedWithCustomError(disputeKitGated, "TokenNotSupported")
        .withArgs(dai.target);
    });

    it("Should maintain whitelist state correctly across multiple operations", async () => {
      const tokens = [dai.target, nft721.target, nft1155.target];

      // All tokens should already be supported from the main setup
      for (const token of tokens) {
        await expectTokenSupported(token, true);
      }

      // Remove middle token
      await whitelistTokens([nft721.target], false);
      await expectTokenSupported(dai.target, true);
      await expectTokenSupported(nft721.target, false);
      await expectTokenSupported(nft1155.target, true);

      // Re-add middle token
      await whitelistTokens([nft721.target], true);
      for (const token of tokens) {
        await expectTokenSupported(token, true);
      }
    });
  });
});
