import { expect } from "chai";
import { deployments, ethers, getNamedAccounts, network } from "hardhat";
import { BigNumber } from "ethers";
import {
  PNK,
  KlerosCore,
  ForeignGatewayOnEthereum,
  ArbitrableExample,
  HomeGatewayToEthereum,
  VeaMock,
  DisputeKitClassic,
  RandomizerRNG,
  RandomizerMock,
} from "../../typechain-types";

/* eslint-disable no-unused-vars */
/* eslint-disable no-unused-expressions */ // https://github.com/standard/standard/issues/690#issuecomment-278533482

describe("Integration tests", async () => {
  const ONE_TENTH_ETH = BigNumber.from(10).pow(17);
  const ONE_ETH = BigNumber.from(10).pow(18);
  const ONE_HUNDRED_PNK = BigNumber.from(10).pow(20);
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
  let rng, randomizer, disputeKit, pnk, core, vea, foreignGateway, arbitrable, homeGateway;

  beforeEach("Setup", async () => {
    ({ deployer } = await getNamedAccounts());

    console.log("deployer:%s", deployer);
    console.log("named accounts: %O", await getNamedAccounts());

    await deployments.fixture(["Arbitration", "VeaMock"], {
      fallbackToGlobal: true,
      keepExistingDeployments: false,
    });
    rng = (await ethers.getContract("RandomizerRNG")) as RandomizerRNG;
    randomizer = (await ethers.getContract("RandomizerMock")) as RandomizerMock;
    disputeKit = (await ethers.getContract("DisputeKitClassic")) as DisputeKitClassic;
    pnk = (await ethers.getContract("PNK")) as PNK;
    core = (await ethers.getContract("KlerosCore")) as KlerosCore;
    vea = (await ethers.getContract("VeaMock")) as VeaMock;
    foreignGateway = (await ethers.getContract("ForeignGatewayOnEthereum")) as ForeignGatewayOnEthereum;
    arbitrable = (await ethers.getContract("ArbitrableExample")) as ArbitrableExample;
    homeGateway = (await ethers.getContract("HomeGatewayToEthereum")) as HomeGatewayToEthereum;
  });

  it("Honest Claim - No Challenge - Bridger paid", async () => {
    const arbitrationCost = ONE_TENTH_ETH.mul(3);
    const [bridger, challenger, relayer] = await ethers.getSigners();

    await pnk.approve(core.address, ONE_THOUSAND_PNK.mul(100));

    await core.setStake(1, ONE_THOUSAND_PNK);
    await core.getJurorBalance(deployer, 1).then((result) => {
      expect(result.staked).to.equal(ONE_THOUSAND_PNK);
      expect(result.locked).to.equal(0);
      logJurorBalance(result);
    });

    await core.setStake(1, ONE_HUNDRED_PNK.mul(5));
    await core.getJurorBalance(deployer, 1).then((result) => {
      expect(result.staked).to.equal(ONE_HUNDRED_PNK.mul(5));
      expect(result.locked).to.equal(0);
      logJurorBalance(result);
    });

    await core.setStake(1, 0);
    await core.getJurorBalance(deployer, 1).then((result) => {
      expect(result.staked).to.equal(0);
      expect(result.locked).to.equal(0);
      logJurorBalance(result);
    });

    await core.setStake(1, ONE_THOUSAND_PNK.mul(4));
    await core.getJurorBalance(deployer, 1).then((result) => {
      expect(result.staked).to.equal(ONE_THOUSAND_PNK.mul(4));
      expect(result.locked).to.equal(0);
      logJurorBalance(result);
    });
    const tx = await arbitrable.createDispute(2, "0x00", 0, { value: arbitrationCost });
    const trace = await network.provider.send("debug_traceTransaction", [tx.hash]);
    const [disputeId] = ethers.utils.defaultAbiCoder.decode(["uint"], `0x${trace.returnValue}`); // get returned value from createDispute()
    console.log("Dispute Created");
    expect(tx).to.emit(foreignGateway, "DisputeCreation");
    expect(tx).to.emit(foreignGateway, "OutgoingDispute");
    console.log(`disputeId: ${disputeId}`);

    const lastBlock = await ethers.provider.getBlock(tx.blockNumber - 1);
    const disputeHash = ethers.utils.solidityKeccak256(
      ["uint", "bytes", "bytes", "uint", "uint", "bytes", "address"],
      [31337, lastBlock.hash, ethers.utils.toUtf8Bytes("createDispute"), disputeId, 2, "0x00", arbitrable.address]
    );

    const events = (await tx.wait()).events;

    // Relayer tx
    const tx2 = await homeGateway
      .connect(relayer)
      .relayCreateDispute(31337, lastBlock.hash, disputeId, 2, "0x00", arbitrable.address, {
        value: arbitrationCost,
      });
    expect(tx2).to.emit(homeGateway, "Dispute");
    const events2 = (await tx2.wait()).events;

    await network.provider.send("evm_increaseTime", [2000]); // Wait for minStakingTime
    await network.provider.send("evm_mine");

    expect(await core.phase()).to.equal(Phase.staking);
    expect(await disputeKit.phase()).to.equal(DisputeKitPhase.resolving);
    expect(await disputeKit.disputesWithoutJurors()).to.equal(1);
    expect(await disputeKit.isResolving()).to.equal(true);
    console.log("KC phase: %d, DK phase: ", await core.phase(), await disputeKit.phase());

    const disputesKitIDsThatNeedFreezing = await core.getDisputesKitIDsThatNeedFreezing();
    expect(disputesKitIDsThatNeedFreezing).to.be.deep.equal([BigNumber.from("1")]);
    await core.passPhase(); // Staking -> Freezing
    expect(await core.phase()).to.equal(Phase.freezing);
    console.log("KC phase: %d, DK phase: ", await core.phase(), await disputeKit.phase());

    await mineBlocks(await disputeKit.rngLookahead());
    await disputeKit.passPhase(); // Resolving -> Generating
    expect(await disputeKit.phase()).to.equal(DisputeKitPhase.generating);
    console.log("KC phase: %d, DK phase: ", await core.phase(), await disputeKit.phase());

    await mineBlocks(await disputeKit.rngLookahead());
    await randomizer.relay(rng.address, 0, ethers.utils.randomBytes(32));
    await disputeKit.passPhase(); // Generating -> Drawing
    expect(await disputeKit.phase()).to.equal(DisputeKitPhase.drawing);
    console.log("KC phase: %d, DK phase: ", await core.phase(), await disputeKit.phase());

    const tx3 = await core.draw(0, 1000);
    console.log("draw successful");
    const events3 = (await tx3.wait()).events;

    const roundInfo = await core.getRoundInfo(0, 0);
    expect(roundInfo.drawnJurors).deep.equal([deployer, deployer, deployer]);
    expect(roundInfo.tokensAtStakePerJuror).to.equal(ONE_HUNDRED_PNK.mul(2));
    expect(roundInfo.totalFeesForJurors).to.equal(arbitrationCost);

    expect((await core.disputes(0)).period).to.equal(Period.evidence);

    await core.passPeriod(0);
    expect((await core.disputes(0)).period).to.equal(Period.vote);
    await disputeKit.connect(await ethers.getSigner(deployer)).castVote(0, [0, 1, 2], 0, 0, "");
    await core.passPeriod(0);
    await core.passPeriod(0);
    expect((await core.disputes(0)).period).to.equal(Period.execution);
    expect(await core.execute(0, 0, 1000)).to.emit(core, "TokenAndETHShift");

    const tx4 = await core.executeRuling(0);
    console.log("Ruling executed on KlerosCore");
    expect(tx4).to.emit(arbitrable, "Ruling").withArgs(foreignGateway.address, 1, 0);
  });

  async function mineBlocks(n) {
    for (let index = 0; index < n; index++) {
      await network.provider.send("evm_mine");
    }
  }
});

const logJurorBalance = async (result) => {
  console.log("staked=%s, locked=%s", ethers.utils.formatUnits(result.staked), ethers.utils.formatUnits(result.locked));
};
