import { expect } from "chai";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { deployments, ethers, getNamedAccounts, network } from "hardhat";
import {
  PNK,
  KlerosCore,
  AdapterMock,
  ForeignGateway,
  HomeGateway,
  GatewayLightbulb,
  DisputeKitClassic,
  SortitionModule,
  ChainlinkRNG,
  ChainlinkVRFCoordinatorV2Mock,
  YahoMock,
  YaruMock,
} from "../../typechain-types";
import { relayMessages } from "../utils/veashi";

/* eslint-disable no-unused-vars */
/* eslint-disable no-unused-expressions */ // https://github.com/standard/standard/issues/690#issuecomment-278533482

// A dispute and its ruling through both Veashi gateways (deploy/03-veashi-mock.ts):
// GatewayLightbulb → ForeignGateway createDispute + relayDispute → ForeignYaho → reporters → home adapters →
// HomeYaru → HomeGateway → KlerosCore, then KlerosCore executeRuling → HomeGateway rule → HomeYaho → reporters →
// foreign adapters → ForeignYaru → ForeignGateway → GatewayLightbulb.
describe("Integration tests", async () => {
  const ONE_THOUSAND_PNK = 10n ** 21n;
  const ONE_HUNDRED_PNK = 10n ** 20n;
  const CHAIN_ID = 31337;
  const RULING_ON = 1;

  const enum Period {
    evidence, // Evidence can be submitted. This is also when drawing has to take place.
    commit, // Jurors commit a hashed vote. This is skipped for courts without hidden votes.
    vote, // Jurors reveal/cast their vote depending on whether the court has hidden votes or not.
    appeal, // The dispute can be appealed.
    execution, // Tokens are redistributed and the ruling is executed.
  }

  const enum Phase {
    staking, // No disputes that need drawing.
    generating, // Waiting for a random number. Pass as soon as it is ready.
    drawing, // Jurors can be drawn.
  }

  let deployer: string;
  let rng: ChainlinkRNG;
  let vrfCoordinator: ChainlinkVRFCoordinatorV2Mock;
  let disputeKit: DisputeKitClassic;
  let pnk: PNK;
  let core: KlerosCore;
  let sortitionModule: SortitionModule;
  let foreignGateway: ForeignGateway;
  let homeGateway: HomeGateway;
  let lightbulb: GatewayLightbulb;
  let foreignYaho: YahoMock;
  let homeYaho: YahoMock;
  let foreignYaru: YaruMock;
  let homeYaru: YaruMock;

  beforeEach("Setup", async () => {
    ({ deployer } = await getNamedAccounts());
    await deployments.fixture(["Arbitration", "VeashiMock"], {
      fallbackToGlobal: true,
      keepExistingDeployments: false,
    });
    rng = await ethers.getContract<ChainlinkRNG>("ChainlinkRNG");
    vrfCoordinator = await ethers.getContract<ChainlinkVRFCoordinatorV2Mock>("ChainlinkVRFCoordinator");
    disputeKit = await ethers.getContract<DisputeKitClassic>("DisputeKitClassic");
    pnk = await ethers.getContract<PNK>("PNK");
    core = await ethers.getContract<KlerosCore>("KlerosCore");
    sortitionModule = await ethers.getContract<SortitionModule>("SortitionModule");
    foreignGateway = await ethers.getContract<ForeignGateway>("VeashiForeignGateway");
    homeGateway = await ethers.getContract<HomeGateway>("VeashiHomeGateway");
    lightbulb = await ethers.getContract<GatewayLightbulb>("VeashiGatewayLightbulb");
    foreignYaho = await ethers.getContract<YahoMock>("ForeignYaho");
    homeYaho = await ethers.getContract<YahoMock>("HomeYaho");
    foreignYaru = await ethers.getContract<YaruMock>("ForeignYaru");
    homeYaru = await ethers.getContract<YaruMock>("HomeYaru");
  });

  it("Resolves a dispute on the home chain with no appeal and rules it on the foreign chain", async () => {
    const extraData = await lightbulb.arbitratorExtraData();
    const arbitrationCost = await core["arbitrationCost(bytes)"](extraData);
    expect(await foreignGateway["arbitrationCost(bytes)"](extraData)).to.equal(arbitrationCost); // No bridging cost set.
    await stake(ONE_THOUSAND_PNK * 4n);

    // Foreign chain: the lightbulb opens the dispute and relays it over the default oracles.
    const requestTx = await lightbulb["requestSwitch()"]({ value: arbitrationCost });
    const foreignDisputeID = 1n; // The ForeignGateway counts from 1.
    const disputeHash = computeDisputeHash(foreignDisputeID, extraData);
    await expect(requestTx)
      .to.emit(foreignGateway, "CrossChainDisputeOutgoing")
      .withArgs(lightbulb.target, foreignDisputeID, 2, extraData);
    await expect(requestTx).to.emit(foreignGateway, "DisputeRelayed");
    await expect(requestTx)
      .to.emit(lightbulb, "DisputeRequest")
      .withArgs(foreignGateway.target, foreignDisputeID, foreignDisputeID, 0, "");
    const { oracleIDs, threshold } = await foreignGateway.getDefaultOracles();
    expect(oracleIDs).to.deep.equal([0n, 1n]);
    expect(threshold).to.equal(2);

    // Home chain: Yaru executes the dispute message, the HomeGateway pays KlerosCore and records the dispute.
    const homeBalance = await ethers.provider.getBalance(homeGateway.target);
    const deliveryTx = await relayMessages(requestTx, foreignYaho, homeYaru);
    await expect(deliveryTx).to.emit(core, "DisputeCreation").withArgs(0, homeGateway.target);
    await expect(deliveryTx)
      .to.emit(homeGateway, "CrossChainDisputeIncoming")
      .withArgs(core.target, CHAIN_ID, lightbulb.target, foreignDisputeID, 0, foreignDisputeID, 0, "");
    expect(await ethers.provider.getBalance(homeGateway.target)).to.equal(homeBalance - arbitrationCost);
    expect(await homeGateway.disputeIDtoHash(0)).to.equal(disputeHash);
    const received = await homeGateway.getReceivedDispute(disputeHash);
    expect(received.received).to.be.true;
    expect(received.oracleIDs).to.deep.equal(oracleIDs);
    expect(received.threshold).to.equal(threshold);

    await resolveOnCore(0, RULING_ON);
    const roundInfo = await core.getRoundInfo(0, 0);
    expect(roundInfo.drawnJurors).deep.equal([deployer, deployer, deployer]);
    expect(roundInfo.pnkAtStakePerJuror).to.equal(ONE_HUNDRED_PNK * 2n);
    expect(roundInfo.totalFeesForJurors).to.equal(arbitrationCost);
    expect(roundInfo.feeToken).to.equal(ethers.ZeroAddress);

    // Ruling leg: KlerosCore rules, the HomeGateway dispatches the ruling over the same oracles.
    const rulingTx = await core.executeRuling(0);
    await expect(rulingTx).to.emit(core, "Ruling").withArgs(homeGateway.target, 0, RULING_ON);
    await expect(rulingTx).to.emit(homeGateway, "RulingDispatched");

    // Foreign chain: Yaru executes the ruling message, the ForeignGateway rules the lightbulb.
    const rulingDeliveryTx = await relayMessages(rulingTx, homeYaho, foreignYaru);
    await expect(rulingDeliveryTx)
      .to.emit(foreignGateway, "Ruling")
      .withArgs(lightbulb.target, foreignDisputeID, RULING_ON);
    await expect(rulingDeliveryTx).to.emit(lightbulb, "LightbulbSwitched").withArgs(deployer, foreignDisputeID, true);
    expect(await lightbulb.lightbulbIsOn(deployer)).to.be.true;
    expect((await foreignGateway.disputeHashtoDisputeData(disputeHash)).ruled).to.be.true;
  });

  it("Charges and carries a dispute over the oracles the arbitrable selects", async () => {
    const extraData = await lightbulb.arbitratorExtraData();
    const bridgingCost = ethers.parseEther("0.01");
    await foreignGateway.setOracleBridgingCost(1, bridgingCost);
    const jurorFees = await core["arbitrationCost(bytes)"](extraData);
    const cost = await foreignGateway["arbitrationCost(bytes,uint256[])"](extraData, [1]);
    expect(cost).to.equal(jurorFees + bridgingCost);
    await stake(ONE_THOUSAND_PNK * 4n);

    const requestTx = await lightbulb["requestSwitch(uint256[],uint256)"]([1], 1, { value: cost });
    const disputeHash = computeDisputeHash(1n, extraData);
    const dispute = await foreignGateway.disputeHashtoDisputeData(disputeHash);
    expect(dispute.feesForJurors).to.equal(jurorFees);
    expect(dispute.feesForBridging).to.equal(bridgingCost);
    expect((await foreignGateway.getDisputeOracles(disputeHash)).oracleIDs).to.deep.equal([1n]);

    // Only oracle 1 reported the dispute, and its threshold of 1 is met.
    const homeAdapter0 = await ethers.getContract<AdapterMock>("HomeAdapter0");
    const homeAdapter1 = await ethers.getContract<AdapterMock>("HomeAdapter1");
    await relayMessages(requestTx, foreignYaho, homeYaru);
    expect(await homeGateway.disputeHashToHomeID(disputeHash)).to.equal(0);
    expect((await homeGateway.getReceivedDispute(disputeHash)).oracleIDs).to.deep.equal([1n]);
    const messageId = (await requestTx.wait())!.logs
      .filter((log) => log.address === foreignGateway.target)
      .map((log) => foreignGateway.interface.parseLog(log))
      .find((event) => event?.name === "DisputeRelayed")!.args._messageId;
    expect(await homeAdapter1.getHash(CHAIN_ID, messageId)).to.not.equal(ethers.ZeroHash);
    expect(await homeAdapter0.getHash(CHAIN_ID, messageId)).to.equal(ethers.ZeroHash);

    await resolveOnCore(0, RULING_ON);
    const rulingTx = await core.executeRuling(0);
    await expect(relayMessages(rulingTx, homeYaho, foreignYaru))
      .to.emit(lightbulb, "LightbulbSwitched")
      .withArgs(deployer, 1, true);
  });

  it("Executes a dispute only once enough of its oracles reported it", async () => {
    // Mute oracle 1's dispute-leg reporter: Yaho skips it, so only one of the two adapters gets the hash.
    await foreignGateway.setOracleReporter(1, ethers.ZeroAddress);
    const extraData = await lightbulb.arbitratorExtraData();
    const requestTx = await lightbulb["requestSwitch()"]({
      value: await foreignGateway["arbitrationCost(bytes)"](extraData),
    });
    await expect(relayMessages(requestTx, foreignYaho, homeYaru)).to.be.revertedWithCustomError(
      homeYaru,
      "ThresholdNotMet"
    );
  });

  it("Executes a message once", async () => {
    const extraData = await lightbulb.arbitratorExtraData();
    const requestTx = await lightbulb["requestSwitch()"]({
      value: await foreignGateway["arbitrationCost(bytes)"](extraData),
    });
    await relayMessages(requestTx, foreignYaho, homeYaru);
    await expect(relayMessages(requestTx, foreignYaho, homeYaru)).to.be.revertedWithCustomError(
      homeYaru,
      "MessageIdAlreadyExecuted"
    );
  });

  it("Sends back a dispute the home chain cannot create and refunds its juror fees", async () => {
    const extraData = await lightbulb.arbitratorExtraData();
    const requestTx = await lightbulb["requestSwitch()"]({
      value: await foreignGateway["arbitrationCost(bytes)"](extraData),
    });
    const foreignDisputeID = 1n;
    const disputeHash = computeDisputeHash(foreignDisputeID, extraData);

    // Home chain: the HomeGateway cannot pay KlerosCore and dispatches the failure in the same delivery.
    await homeGateway.withdraw(deployer, await ethers.provider.getBalance(homeGateway.target));
    const deliveryTx = await relayMessages(requestTx, foreignYaho, homeYaru);
    const insufficientFunds = homeGateway.interface.encodeErrorResult("InsufficientFunds", [
      await core["arbitrationCost(bytes)"](extraData),
      0,
    ]);
    await expect(deliveryTx)
      .to.emit(homeGateway, "DisputeCreationFailed")
      .withArgs(disputeHash, insufficientFunds, anyValue);
    await expect(deliveryTx).to.not.emit(core, "DisputeCreation");
    expect((await homeGateway.getReceivedDispute(disputeHash)).creationFailed).to.be.true;

    // Foreign chain: Yaru executes the failure, the ForeignGateway closes the dispute and calls the lightbulb back.
    const { feesForJurors } = await foreignGateway.disputeHashtoDisputeData(disputeHash);
    const failureDeliveryTx = await relayMessages(deliveryTx, homeYaho, foreignYaru);
    await expect(failureDeliveryTx)
      .to.emit(foreignGateway, "DisputeCreationFailed")
      .withArgs(lightbulb.target, foreignDisputeID, disputeHash, ethers.ZeroAddress, feesForJurors);
    await expect(failureDeliveryTx).to.emit(lightbulb, "LightbulbRequestFailed").withArgs(deployer, foreignDisputeID);
    expect(await lightbulb.lightbulbIsOn(deployer)).to.be.false;

    // The owner gets the juror fees back.
    await expect(lightbulb.claimRefund(foreignDisputeID)).to.changeEtherBalances(
      [deployer, foreignGateway],
      [feesForJurors, -feesForJurors]
    );
  });

  const computeDisputeHash = (foreignDisputeID: bigint, extraData: string) =>
    ethers.solidityPackedKeccak256(
      ["string", "uint256", "address", "address", "uint256", "uint256", "bytes"],
      ["createDispute", CHAIN_ID, foreignGateway.target, lightbulb.target, foreignDisputeID, 2, extraData]
    );

  const stake = async (amount: bigint) => {
    await pnk.approve(core.target, amount);
    await core.setStake(1, amount);
    const balance = await sortitionModule.getJurorBalance(deployer, 1);
    expect(balance.totalStaked).to.equal(amount);
    expect(balance.totalLocked).to.equal(0);
  };

  // Draws the deployer three times, votes `ruling` and brings the dispute to execution.
  const resolveOnCore = async (disputeID: number, ruling: number) => {
    await network.provider.send("evm_increaseTime", [2000]); // Wait for minStakingTime
    await network.provider.send("evm_mine");

    expect(await sortitionModule.phase()).to.equal(Phase.staking);
    expect(await sortitionModule.disputesWithoutJurors()).to.equal(1);
    await sortitionModule.passPhase(); // Staking -> Generating
    expect(await sortitionModule.phase()).to.equal(Phase.generating);
    await vrfCoordinator.fulfillRandomWords(1, rng.target, []);
    await sortitionModule.passPhase(); // Generating -> Drawing
    expect(await sortitionModule.phase()).to.equal(Phase.drawing);
    await core.draw(disputeID, 1000);

    expect((await core.disputes(disputeID)).period).to.equal(Period.evidence);
    await core.passPeriod(disputeID);
    expect((await core.disputes(disputeID)).period).to.equal(Period.vote);
    await disputeKit.connect(await ethers.getSigner(deployer)).castVote(disputeID, [0, 1, 2], ruling, 0, "");
    await core.passPeriod(disputeID);

    await network.provider.send("evm_increaseTime", [100]); // Wait for the appeal period
    await network.provider.send("evm_mine");

    await core.passPeriod(disputeID);
    expect((await core.disputes(disputeID)).period).to.equal(Period.execution);
    await core.execute(disputeID, 0, 1000);
  };
});
