import { expect } from "chai";
import { deployments, ethers, getNamedAccounts, network } from "hardhat";
import { BigNumber } from "ethers";
import {
  IncrementalNG,
  PNK,
  KlerosCore,
  FastBridgeReceiverOnEthereum,
  ForeignGatewayOnEthereum,
  ArbitrableExample,
  FastBridgeSenderToEthereum,
  HomeGatewayToEthereum,
  DisputeKitClassic,
} from "../../typechain-types";

/* eslint-disable no-unused-vars */
/* eslint-disable no-unused-expressions */ // https://github.com/standard/standard/issues/690#issuecomment-278533482

describe("Demo pre-alpha1", function () {
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

  let deployer, relayer, bridger, challenger, innocentBystander;
  let ng, disputeKit, pnk, core, fastBridgeReceiver, foreignGateway, arbitrable, fastBridgeSender, homeGateway;

  before("Setup", async () => {
    deployer = (await getNamedAccounts()).deployer;
    relayer = (await getNamedAccounts()).relayer;
    console.log("deployer:%s", deployer);
    console.log("named accounts: %O", await getNamedAccounts());

    await deployments.fixture(["Arbitration", "ForeignGateway", "HomeGateway"], {
      fallbackToGlobal: true,
      keepExistingDeployments: true,
    });
    ng = <IncrementalNG>await ethers.getContract("IncrementalNG");
    disputeKit = <DisputeKitClassic>await ethers.getContract("DisputeKitClassic");
    pnk = <PNK>await ethers.getContract("PNK");
    core = <KlerosCore>await ethers.getContract("KlerosCore");
    fastBridgeReceiver = <FastBridgeReceiverOnEthereum>await ethers.getContract("FastBridgeReceiverOnEthereum");
    foreignGateway = <ForeignGatewayOnEthereum>await ethers.getContract("ForeignGatewayOnEthereum");
    arbitrable = <ArbitrableExample>await ethers.getContract("ArbitrableExample");
    fastBridgeSender = <FastBridgeSenderToEthereum>await ethers.getContract("FastBridgeSenderToEthereum");
    homeGateway = <HomeGatewayToEthereum>await ethers.getContract("HomeGatewayToEthereum");
  });

  it("RNG", async () => {
    const rnOld = await ng.number();
    let tx = await ng.getRN(9876543210);
    let trace = await network.provider.send("debug_traceTransaction", [tx.hash]);
    let [rn] = ethers.utils.defaultAbiCoder.decode(["uint"], `0x${trace.returnValue}`);
    expect(rn).to.equal(rnOld);

    tx = await ng.getRN(9876543210);
    trace = await network.provider.send("debug_traceTransaction", [tx.hash]);
    [rn] = ethers.utils.defaultAbiCoder.decode(["uint"], `0x${trace.returnValue}`);
    expect(rn).to.equal(rnOld.add(1));
  });

  it("Demo", async () => {
    const arbitrationCost = ONE_TENTH_ETH.mul(3);

    await pnk.approve(core.address, ONE_THOUSAND_PNK.mul(100));

    await core.setStake(0, ONE_THOUSAND_PNK);
    await core.getJurorBalance(deployer, 0).then((result) => {
      expect(result.staked).to.equal(ONE_THOUSAND_PNK);
      expect(result.locked).to.equal(0);
      logJurorBalance(result);
    });

    await core.setStake(0, ONE_HUNDRED_PNK.mul(5));
    await core.getJurorBalance(deployer, 0).then((result) => {
      expect(result.staked).to.equal(ONE_HUNDRED_PNK.mul(5));
      expect(result.locked).to.equal(0);
      logJurorBalance(result);
    });

    await core.setStake(0, 0);
    await core.getJurorBalance(deployer, 0).then((result) => {
      expect(result.staked).to.equal(0);
      expect(result.locked).to.equal(0);
      logJurorBalance(result);
    });

    await core.setStake(0, ONE_THOUSAND_PNK.mul(4));
    await core.getJurorBalance(deployer, 0).then((result) => {
      expect(result.staked).to.equal(ONE_THOUSAND_PNK.mul(4));
      expect(result.locked).to.equal(0);
      logJurorBalance(result);
    });

    const tx = await foreignGateway.createDispute(2, "0x00", { value: arbitrationCost });
    const trace = await network.provider.send("debug_traceTransaction", [tx.hash]);
    const [disputeId] = ethers.utils.defaultAbiCoder.decode(["uint"], `0x${trace.returnValue}`);
    expect(tx).to.emit(foreignGateway, "DisputeCreation"); //.withArgs(disputeId, deployer.address);
    expect(tx).to.emit(foreignGateway, "OutgoingDispute"); //.withArgs(disputeId, deployer.address);
    console.log(`disputeId: ${disputeId}`);

    const events = (await tx.wait()).events;
    const lastBlock = await ethers.provider.getBlock(tx.blockNumber - 1);
    const disputeHash = ethers.utils.solidityKeccak256(
      ["uint", "bytes", "bytes", "uint", "uint", "bytes", "address"],
      [31337, lastBlock.hash, ethers.utils.toUtf8Bytes("createDispute"), disputeId, 2, "0x00", deployer]
    );

    expect(events[0].event).to.equal("OutgoingDispute");
    expect(events[0].args.disputeHash).to.equal(disputeHash);
    expect(events[0].args.blockhash).to.equal(lastBlock.hash);
    expect(events[0].args.localDisputeID).to.equal(disputeId);
    expect(events[0].args._choices).to.equal(2);
    expect(events[0].args._extraData).to.equal("0x00");
    expect(events[0].args.arbitrable).to.equal(deployer);

    expect(events[1].event).to.equal("DisputeCreation");
    expect(events[1].args._arbitrable).to.equal(deployer);
    expect(events[1].args._disputeID).to.equal(disputeId);

    // Relayer tx
    const tx2 = await homeGateway
      .connect(await ethers.getSigner(relayer))
      .relayCreateDispute(31337, lastBlock.hash, disputeId, 2, "0x00", deployer, {
        value: arbitrationCost,
      });
    expect(tx2).to.emit(homeGateway, "Dispute");
    const events2 = (await tx2.wait()).events;
    // console.log("event=%O", events2);

    await network.provider.send("evm_increaseTime", [130]); // Wait for minStakingTime
    await network.provider.send("evm_mine");

    expect(await core.phase()).to.equal(Phase.staking);
    expect(await disputeKit.phase()).to.equal(DisputeKitPhase.resolving);
    expect(await disputeKit.disputesWithoutJurors()).to.equal(1);
    expect(await disputeKit.readyForStakingPhase()).to.equal(true); // TODO: rename this function to isResolving(), it's misleading currently

    console.log("KC phase: %d, DK phase: ", await core.phase(), await disputeKit.phase());

    let disputeKitsWithFreezingNeeded = await core.getDisputeKitsWithFreezingNeeded();
    expect(disputeKitsWithFreezingNeeded).to.be.deep.equal([BigNumber.from("1")]);
    let disputeKitsReadyForStaking = await core.getDisputeKitsReadyForStaking();
    expect(disputeKitsReadyForStaking).to.be.empty;
    console.log("disputeKitsReadyForStaking: %O", disputeKitsReadyForStaking);
    await core.passPhase(disputeKitsWithFreezingNeeded, disputeKitsReadyForStaking); // Staking -> Freezing
    expect(await core.phase()).to.equal(Phase.freezing);
    console.log("KC phase: %d, DK phase: ", await core.phase(), await disputeKit.phase());

    await mineNBlocks(20); // Wait for 20 blocks finality
    await disputeKit.passPhase(); // Resolving -> Generating
    expect(await disputeKit.phase()).to.equal(DisputeKitPhase.generating);
    console.log("KC phase: %d, DK phase: ", await core.phase(), await disputeKit.phase());

    await disputeKit.passPhase(); // Generating -> Drawing
    expect(await disputeKit.phase()).to.equal(DisputeKitPhase.drawing);
    console.log("KC phase: %d, DK phase: ", await core.phase(), await disputeKit.phase());

    const tx3 = await core.draw(0, 1000);
    console.log("draw successful");
    const events3 = (await tx3.wait()).events;
    console.log("event=%O", events3[0].args);
    console.log("event=%O", events3[1].args);
    console.log("event=%O", events3[2].args);

    const roundInfo = await core.getRoundInfo(0, 0);
    expect(roundInfo.drawnJurors).deep.equal([deployer, deployer, deployer]);
    expect(roundInfo.tokensAtStakePerJuror).to.equal(ONE_HUNDRED_PNK.mul(2));
    expect(roundInfo.totalFeesForJurors).to.equal(arbitrationCost);

    expect((await core.disputes(0)).period).to.equal(Period.evidence);
    await core.passPeriod(0);
    expect((await core.disputes(0)).period).to.equal(Period.vote);

    console.log("KC phase: %d, DK phase: ", await core.phase(), await disputeKit.phase());

    await disputeKit.passPhase(); // Drawing -> Resolving
    expect(await disputeKit.phase()).to.equal(DisputeKitPhase.resolving);
    expect(await disputeKit.disputesWithoutJurors()).to.equal(0);
    expect(await disputeKit.readyForStakingPhase()).to.equal(true);

    disputeKitsWithFreezingNeeded = await core.getDisputeKitsWithFreezingNeeded();
    expect(disputeKitsWithFreezingNeeded).to.be.empty;
    disputeKitsReadyForStaking = await core.getDisputeKitsReadyForStaking();
    expect(disputeKitsReadyForStaking).to.be.deep.equal([BigNumber.from("1")]);
    await core.passPhase(disputeKitsWithFreezingNeeded, disputeKitsReadyForStaking); // Freezing -> Staking
    expect(await core.phase()).to.equal(Phase.staking);

    console.log("KC phase: %d, DK phase: ", await core.phase(), await disputeKit.phase());
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
