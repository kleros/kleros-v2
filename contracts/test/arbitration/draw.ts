import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { deployments, ethers, getNamedAccounts, network } from "hardhat";
import { BigNumber } from "ethers";
import {
  PNK,
  KlerosCore,
  ArbitrableExample,
  HomeGatewayToEthereum,
  DisputeKitClassic,
  RandomizerRNG,
  RandomizerMock,
} from "../../typechain-types";
import { expect } from "chai";

/* eslint-disable no-unused-vars */
/* eslint-disable no-unused-expressions */ // https://github.com/standard/standard/issues/690#issuecomment-278533482

// FIXME: This test fails on Github actions, cannot figure why, skipping for now.
describe("Draw Benchmark", async () => {
  const ONE_TENTH_ETH = BigNumber.from(10).pow(17);
  const ONE_THOUSAND_PNK = BigNumber.from(10).pow(21);

  const enum Period {
    evidence, // Evidence can be submitted. This is also when drawing has to take place.
    commit, // Jurors commit a hashed vote. This is skipped for courts without hidden votes.
    vote, // Jurors reveal/cast their vote depending on whether the court has hidden votes or not.
    appeal, // The dispute can be appealed.
    execution, // Tokens are redistributed and the ruling is executed.
  }

  const enum Phase {
    staking, // Stake can be updated during this phase.
    freezing, // Phase during which the dispute kits can undergo the drawing process. Staking is not allowed during this phase.
  }

  const enum DisputeKitPhase {
    resolving, // No disputes that need drawing.
    generating, // Waiting for a random number. Pass as soon as it is ready.
    drawing, // Jurors can be drawn.
  }

  let deployer;
  let relayer;
  let disputeKit;
  let pnk;
  let core;
  let arbitrable;
  let homeGateway;
  let rng;
  let randomizer;

  beforeEach("Setup", async () => {
    deployer = (await getNamedAccounts()).deployer;
    relayer = (await getNamedAccounts()).relayer;

    console.log("deployer:%s", deployer);
    console.log("named accounts: %O", await getNamedAccounts());

    await deployments.fixture(["Arbitration", "VeaMock"], {
      fallbackToGlobal: true,
      keepExistingDeployments: false,
    });
    disputeKit = (await ethers.getContract("DisputeKitClassic")) as DisputeKitClassic;
    pnk = (await ethers.getContract("PNK")) as PNK;
    core = (await ethers.getContract("KlerosCore")) as KlerosCore;
    homeGateway = (await ethers.getContract("HomeGatewayToEthereum")) as HomeGatewayToEthereum;
    arbitrable = (await ethers.getContract("ArbitrableExample")) as ArbitrableExample;
    rng = (await ethers.getContract("RandomizerRNG")) as RandomizerRNG;
    randomizer = (await ethers.getContract("RandomizerMock")) as RandomizerMock;
  });

  it("Draw Benchmark", async () => {
    const arbitrationCost = ONE_TENTH_ETH.mul(3);
    const [bridger] = await ethers.getSigners();

    // Stake some jurors
    for (let i = 0; i < 16; i++) {
      const wallet = ethers.Wallet.createRandom().connect(ethers.provider);

      await bridger.sendTransaction({ to: wallet.address, value: ethers.utils.parseEther("10") });
      expect(await wallet.getBalance()).to.equal(ethers.utils.parseEther("10"));

      await pnk.transfer(wallet.address, ONE_THOUSAND_PNK.mul(10));
      expect(await pnk.balanceOf(wallet.address)).to.equal(ONE_THOUSAND_PNK.mul(10));

      await pnk.connect(wallet).approve(core.address, ONE_THOUSAND_PNK.mul(10), { gasLimit: 300000 });
      await core.connect(wallet).setStake(1, ONE_THOUSAND_PNK.mul(10), { gasLimit: 5000000 });
    }

    // Create a dispute
    const tx = await arbitrable.createDispute(2, "0x00", 0, { value: arbitrationCost });
    const trace = await network.provider.send("debug_traceTransaction", [tx.hash]);
    const [disputeId] = ethers.utils.defaultAbiCoder.decode(["uint"], `0x${trace.returnValue}`);
    const lastBlock = await ethers.provider.getBlock(tx.blockNumber - 1);

    // Relayer tx
    const tx2 = await homeGateway
      .connect(await ethers.getSigner(relayer))
      .relayCreateDispute(31337, lastBlock.hash, disputeId, 2, "0x00", arbitrable.address, {
        value: arbitrationCost,
      });

    await network.provider.send("evm_increaseTime", [2000]); // Wait for minStakingTime
    await network.provider.send("evm_mine");
    await core.passPhase(); // Staking -> Freezing

    const lookahead = await disputeKit.rngLookahead();
    for (let index = 0; index < lookahead; index++) {
      await network.provider.send("evm_mine");
    }
    await disputeKit.passPhase(); // Resolving -> Generating
    for (let index = 0; index < lookahead; index++) {
      await network.provider.send("evm_mine");
    }
    await randomizer.relay(rng.address, 0, ethers.utils.randomBytes(32));
    await disputeKit.passPhase(); // Generating -> Drawing

    await expect(core.draw(0, 1000, { gasLimit: 1000000 }))
      .to.emit(core, "Draw")
      .withArgs(anyValue, 0, 0, 0)
      .to.emit(core, "Draw")
      .withArgs(anyValue, 0, 0, 1)
      .to.emit(core, "Draw")
      .withArgs(anyValue, 0, 0, 2);
  });
});
