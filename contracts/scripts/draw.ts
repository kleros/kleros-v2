import { expect } from "chai";
import { deployments, ethers, getNamedAccounts, network } from "hardhat";
import { BigNumber } from "ethers";
import {
  PNK,
  KlerosCore,
  ArbitrableExample,
  HomeGatewayToEthereum,
  DisputeKitClassic,
} from "../../typechain-types";

/* eslint-disable no-unused-vars */
/* eslint-disable no-unused-expressions */ // https://github.com/standard/standard/issues/690#issuecomment-278533482

//describe.only("Draw Benchmark", function () { // To run benchmark in isolation.
describe("Draw Benchmark", function () {
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

  let deployer, relayer;
  let ng, disputeKit, pnk, core, arbitrable, homeGateway;

  beforeEach("Setup", async () => {
    deployer = (await getNamedAccounts()).deployer;
    relayer = (await getNamedAccounts()).relayer;

    console.log("deployer:%s", deployer);
    console.log("named accounts: %O", await getNamedAccounts());

    await deployments.fixture(["Arbitration", "ForeignGateway", "HomeGateway"], {
      fallbackToGlobal: true,
      keepExistingDeployments: false,
    });
    disputeKit = <DisputeKitClassic>await ethers.getContract("DisputeKitClassic");
    pnk = <PNK>await ethers.getContract("PNK");
    core = <KlerosCore>await ethers.getContract("KlerosCore");
    homeGateway = <HomeGatewayToEthereum>await ethers.getContract("HomeGatewayToEthereum");
    arbitrable = <ArbitrableExample>await ethers.getContract("ArbitrableExample");
  });


  it("Draw Benchmark", async () => {
    const arbitrationCost = ONE_TENTH_ETH.mul(3);
    const [bridger] = await ethers.getSigners();

    for (let i = 0; i < 16; i++) {
      let wallet = ethers.Wallet.createRandom()
      wallet =  wallet.connect(ethers.provider);
      await bridger.sendTransaction({to: wallet.address, value: ethers.utils.parseEther("1")});
      //await pnk.transfer(wallet.address, ONE_THOUSAND_PNK)
      //await pnk.connect(wallet).approve(core.address, ONE_THOUSAND_PNK);
      //await core.connect(wallet).setStake(0, ONE_THOUSAND_PNK);
    }

    
    // create a dispute
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

    await network.provider.send("evm_increaseTime", [130]); // Wait for minStakingTime
    await network.provider.send("evm_mine");
    await core.passPhase(); // Staking -> Freezing
    await mineNBlocks(20); // Wait for 20 blocks finality
    await disputeKit.passPhase(); // Resolving -> Generating
    await disputeKit.passPhase(); // Generating -> Drawing

    const tx3 = await core.draw(0, 1000);
  });

  async function mineNBlocks(n) {
    for (let index = 0; index < n; index++) {
      await network.provider.send("evm_mine");
    }
  }
});

const logJurorBalance = function (result) {
  console.log("staked=%s, locked=%s", ethers.utils.formatUnits(result.staked), ethers.utils.formatUnits(result.locked));
};
