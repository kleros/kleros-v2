import { expect } from "chai";
import { deployments, ethers, getNamedAccounts, network } from "hardhat";
import { BigNumber } from "ethers";
import {
  ConstantNG,
  PNK,
  KlerosCore,
  FastBridgeReceiver,
  ForeignGateway,
  ArbitrableExample,
  SafeBridgeArbitrum,
  FastBridgeSender,
  HomeGateway,
} from "../../typechain";

describe("Demo pre-alpha1", function () {
  const ONE_TENTH_ETH = BigNumber.from(10).pow(17);
  const ONE_ETH = BigNumber.from(10).pow(18);
  const ONE_HUNDRED_PNK = BigNumber.from(10).pow(20);
  const ONE_THOUSAND_PNK = BigNumber.from(10).pow(21);

  // eslint-disable-next-line no-unused-vars
  const enum Period {
    evidence,
    commit,
    vote,
    appeal,
    execution,
  }

  // eslint-disable-next-line no-unused-vars
  let deployer,
    relayer, 
    supporter, 
    challenger, 
    innocentBystander;
  // eslint-disable-next-line no-unused-vars
  let ng,
    disputeKit,
    pnk,
    core,
    fastBridgeReceiver,
    foreignGateway,
    arbitrable,
    safeBridgeArbitrum,
    fastBridgeSender,
    homeGateway;

  before("Setup", async () => {
    deployer = (await getNamedAccounts()).deployer;
    relayer = (await getNamedAccounts()).relayer;
    console.log("named accounts: %O", await getNamedAccounts());

    await deployments.fixture(["Arbitration", "ForeignGateway", "HomeGateway"], {
      fallbackToGlobal: true,
      keepExistingDeployments: true,
    });
    ng = <ConstantNG>await ethers.getContract("ConstantNG");
    disputeKit = <KlerosCore>await ethers.getContract("DisputeKitClassic");
    pnk = <PNK>await ethers.getContract("PNK");
    core = <KlerosCore>await ethers.getContract("KlerosCore");
    fastBridgeReceiver = <FastBridgeReceiver>await ethers.getContract("FastBridgeReceiver");
    foreignGateway = <ForeignGateway>await ethers.getContract("ForeignGateway");
    arbitrable = <ArbitrableExample>await ethers.getContract("ArbitrableExample");
    safeBridgeArbitrum = <SafeBridgeArbitrum>await ethers.getContract("SafeBridgeArbitrum");
    fastBridgeSender = <FastBridgeSender>await ethers.getContract("FastBridgeSender");
    homeGateway = <HomeGateway>await ethers.getContract("HomeGateway");
  });

  it("Demo", async () => {
    console.log("deployer:%s", deployer);
    console.log("address:%s", ng.address);
    console.log("rn=%d", await ng.getRN(2));

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

    await core.draw(0, 1000);

    const roundInfo = await core.getRoundInfo(0, 0);
    expect(roundInfo.drawnJurors).deep.equal([deployer, deployer, deployer]);
    expect(roundInfo.tokensAtStakePerJuror).to.equal(ONE_HUNDRED_PNK.mul(2));
    expect(roundInfo.totalFeesForJurors).to.equal(arbitrationCost);

    expect((await core.disputes(0)).period).to.equal(Period.evidence);
    await core.passPeriod(0);
    expect((await core.disputes(0)).period).to.equal(Period.vote);
  });
});

const logJurorBalance = function (result) {
  console.log("staked=%s, locked=%s", ethers.utils.formatUnits(result.staked), ethers.utils.formatUnits(result.locked));
};
