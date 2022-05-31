import { expect } from "chai";
import { deployments, ethers, getNamedAccounts, network } from "hardhat";
import { BigNumber, utils } from "ethers";
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
  InboxMock,
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
  let ng, disputeKit, pnk, core, fastBridgeReceiver, foreignGateway, arbitrable, fastBridgeSender, homeGateway, inbox;

  beforeEach("Setup", async () => {
    deployer = (await getNamedAccounts()).deployer;
    relayer = (await getNamedAccounts()).relayer;

    console.log("deployer:%s", deployer);
    console.log("named accounts: %O", await getNamedAccounts());

    await deployments.fixture(["Arbitration", "ForeignGateway", "HomeGateway"], {
      fallbackToGlobal: true,
      keepExistingDeployments: false,
    });
    ng = <IncrementalNG>await ethers.getContract("IncrementalNG");
    disputeKit = <DisputeKitClassic>await ethers.getContract("DisputeKitClassic");
    pnk = <PNK>await ethers.getContract("PNK");
    core = <KlerosCore>await ethers.getContract("KlerosCore");
    fastBridgeReceiver = <FastBridgeReceiverOnEthereum>await ethers.getContract("FastBridgeReceiverOnEthereum");
    foreignGateway = <ForeignGatewayOnEthereum>await ethers.getContract("ForeignGatewayOnEthereum");
    arbitrable = <ArbitrableExample>await ethers.getContract("ArbitrableExample");
    fastBridgeSender = <FastBridgeSenderToEthereum>await ethers.getContract("FastBridgeSenderToEthereumMock");
    homeGateway = <HomeGatewayToEthereum>await ethers.getContract("HomeGatewayToEthereum");
    inbox = <InboxMock>await ethers.getContract("InboxMock");
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

  it("Demo - Honest Claim - No Challenge - Bridger paid", async () => {
    const arbitrationCost = ONE_TENTH_ETH.mul(3);
    const [bridger, challenger] = await ethers.getSigners();

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
    const tx = await arbitrable.createDispute(2, "0x00", 0, { value: arbitrationCost });
    const trace = await network.provider.send("debug_traceTransaction", [tx.hash]);
    const [disputeId] = ethers.utils.defaultAbiCoder.decode(["uint"], `0x${trace.returnValue}`);
    console.log("Dispute Created");
    expect(tx).to.emit(foreignGateway, "DisputeCreation"); //.withArgs(disputeId, deployer.address);
    expect(tx).to.emit(foreignGateway, "OutgoingDispute"); //.withArgs(disputeId, deployer.address);
    console.log(`disputeId: ${disputeId}`);

    const lastBlock = await ethers.provider.getBlock(tx.blockNumber - 1);
    const disputeHash = ethers.utils.solidityKeccak256(
      ["uint", "bytes", "bytes", "uint", "uint", "bytes", "address"],
      [31337, lastBlock.hash, ethers.utils.toUtf8Bytes("createDispute"), disputeId, 2, "0x00", arbitrable.address]
    );

    const events = (await tx.wait()).events;

    // Relayer tx
    const tx2 = await homeGateway
      .connect(await ethers.getSigner(relayer))
      .relayCreateDispute(31337, lastBlock.hash, disputeId, 2, "0x00", arbitrable.address, {
        value: arbitrationCost,
      });
    expect(tx2).to.emit(homeGateway, "Dispute");
    const events2 = (await tx2.wait()).events;

    await network.provider.send("evm_increaseTime", [130]); // Wait for minStakingTime
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

    const roundInfo = await core.getRoundInfo(0, 0);
    expect(roundInfo.drawnJurors).deep.equal([deployer, deployer, deployer]);
    expect(roundInfo.tokensAtStakePerJuror).to.equal(ONE_HUNDRED_PNK.mul(2));
    expect(roundInfo.totalFeesForJurors).to.equal(arbitrationCost);

    expect((await core.disputes(0)).period).to.equal(Period.evidence);

    await core.passPeriod(0);
    expect((await core.disputes(0)).period).to.equal(Period.vote);
    await disputeKit.connect(await ethers.getSigner(deployer)).castVote(0, [0, 1, 2], 0, 0);
    await core.passPeriod(0);
    await core.passPeriod(0);
    expect((await core.disputes(0)).period).to.equal(Period.execution);
    await core.execute(0, 0, 1000);
    const tx4 = await core.executeRuling(0);

    console.log("Executed ruling");


    expect(tx4).to.emit(fastBridgeSender, "MessageReceived");

    const MessageReceived = fastBridgeSender.filters.MessageReceived();
    const event5 = await fastBridgeSender.queryFilter(MessageReceived);


    const nonce = event5[0].args.nonce;
    const fastMessage = event5[0].args.fastMessage;    
    const currentBatchID = event5[0].args.currentBatchID;

    const tx4a = await fastBridgeSender.connect(bridger).sendBatch();
    expect(tx4a).to.emit(fastBridgeSender, "SendBatch");

    const SendBatch = fastBridgeSender.filters.SendBatch();
    const event5a = await fastBridgeSender.queryFilter(SendBatch);
    const batchID = event5a[0].args.batchID;
    const batchMerkleRoot = event5a[0].args.batchMerkleRoot;

    // bridger tx starts - Honest Bridger 
    const tx5 = await fastBridgeReceiver.connect(bridger).claim(batchID, batchMerkleRoot, { value: ONE_TENTH_ETH });

    expect(tx5).to.emit(fastBridgeReceiver, "ClaimReceived").withArgs(batchID, batchMerkleRoot);

    // wait for challenge period (and epoch) to pass
    await network.provider.send("evm_increaseTime", [86400]);
    await network.provider.send("evm_mine");

    const tx7a = await fastBridgeReceiver.connect(bridger).verify(batchID);
    const tx7 = await fastBridgeReceiver.connect(await ethers.getSigner(relayer)).verifyAndRelay(batchID, [], fastMessage, nonce);

    const tx8 = await fastBridgeReceiver.withdrawClaimDeposit(batchID);

    expect(tx7).to.emit(arbitrable, "Ruling");
    
  });

  it("Demo - Honest Claim - Challenged - Bridger Paid, Challenger deposit forfeited", async () => {
    const arbitrationCost = ONE_TENTH_ETH.mul(3);
    const [bridger, challenger] = await ethers.getSigners();

    await pnk.approve(core.address, ONE_THOUSAND_PNK.mul(100));

    console.log("KC phase: %d, DK phase: ", await core.phase(), await disputeKit.phase());

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
    const tx = await arbitrable.createDispute(2, "0x00", 0, { value: arbitrationCost });
    const trace = await network.provider.send("debug_traceTransaction", [tx.hash]);
    const [disputeId] = ethers.utils.defaultAbiCoder.decode(["uint"], `0x${trace.returnValue}`);
    console.log("Dispute Created");
    expect(tx).to.emit(foreignGateway, "DisputeCreation"); //.withArgs(disputeId, deployer.address);
    expect(tx).to.emit(foreignGateway, "OutgoingDispute"); //.withArgs(disputeId, deployer.address);
    console.log(`disputeId: ${disputeId}`);

    const eventOutgoingDispute = foreignGateway.filters.OutgoingDispute();
    const events = await foreignGateway.queryFilter(eventOutgoingDispute, "latest");
    const eventDisputeCreation = foreignGateway.filters.DisputeCreation();
    const events2 = await foreignGateway.queryFilter(eventDisputeCreation, "latest");

    const lastBlock = await ethers.provider.getBlock(tx.blockNumber - 1);
    const disputeHash = ethers.utils.solidityKeccak256(
      ["uint", "bytes", "bytes", "uint", "uint", "bytes", "address"],
      [31337, lastBlock.hash, ethers.utils.toUtf8Bytes("createDispute"), disputeId, 2, "0x00", arbitrable.address]
    );

    expect(events[0].event).to.equal("OutgoingDispute");
    expect(events[0].args.disputeHash).to.equal(disputeHash);
    expect(events[0].args.blockhash).to.equal(lastBlock.hash);
    expect(events[0].args.localDisputeID).to.equal(disputeId);
    expect(events[0].args._choices).to.equal(2);
    expect(events[0].args._extraData).to.equal("0x00");
    expect(events[0].args.arbitrable).to.equal(arbitrable.address);

    expect(events2[0].event).to.equal("DisputeCreation");
    expect(events2[0].args._arbitrable).to.equal(arbitrable.address);
    expect(events2[0].args._disputeID).to.equal(disputeId);
    // Relayer tx
    const tx2 = await homeGateway
      .connect(await ethers.getSigner(relayer))
      .relayCreateDispute(31337, lastBlock.hash, disputeId, 2, "0x00", arbitrable.address, {
        value: arbitrationCost,
      });

    expect(tx2).to.emit(homeGateway, "Dispute");

    await network.provider.send("evm_increaseTime", [130]); // Wait for minStakingTime
    await network.provider.send("evm_mine");

    expect(await core.phase()).to.equal(Phase.staking);
    expect(await disputeKit.phase()).to.equal(DisputeKitPhase.resolving);
    expect(await disputeKit.disputesWithoutJurors()).to.equal(1);
    expect(await disputeKit.isResolving()).to.equal(true);
    console.log("KC phase: %d, DK phase: ", await core.phase(), await disputeKit.phase());

    let disputesKitIDsThatNeedFreezing = await core.getDisputesKitIDsThatNeedFreezing();
    expect(disputesKitIDsThatNeedFreezing).to.be.deep.equal([BigNumber.from("1")]);
    await core.passPhase(); // Staking -> Freezing
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
    expect(await disputeKit.isResolving()).to.equal(true);

    disputesKitIDsThatNeedFreezing = await core.getDisputesKitIDsThatNeedFreezing();
    expect(disputesKitIDsThatNeedFreezing).to.be.deep.equal([BigNumber.from("1")]);
    await core.passPhase(); // Freezing -> Staking
    expect(await core.phase()).to.equal(Phase.staking);

    console.log("KC phase: %d, DK phase: ", await core.phase(), await disputeKit.phase());

    await disputeKit.connect(await ethers.getSigner(deployer)).castVote(0, [0, 1, 2], 0, 0);
    await core.passPeriod(0);
    await core.passPeriod(0);
    expect((await core.disputes(0)).period).to.equal(Period.execution);
    await core.execute(0, 0, 1000);

    const tx4 = await core.executeRuling(0);
    console.log("Executed ruling");

    expect(tx4).to.emit(fastBridgeSender, "MessageReceived");

    const MessageReceived = fastBridgeSender.filters.MessageReceived();
    const event4 = await fastBridgeSender.queryFilter(MessageReceived);

    const nonce = event4[0].args.nonce;
    const fastMessage = event4[0].args.fastMessage;
    const currentBatchID = event4[0].args.currentBatchID;


  const tx4a = await fastBridgeSender.connect(bridger).sendBatch();
  expect(tx4a).to.emit(fastBridgeSender, "SendBatch");

  const SendBatch = fastBridgeSender.filters.SendBatch();
  const event4a = await fastBridgeSender.queryFilter(SendBatch);
  const batchID = event4a[0].args.batchID;
  const batchMerkleRoot = event4a[0].args.batchMerkleRoot;

  // bridger tx starts - Honest Bridger 

    console.log("Executed ruling");

    // bridger tx starts
    const tx5 = await fastBridgeReceiver.connect(bridger).claim(batchID, batchMerkleRoot, { value: ONE_TENTH_ETH });

    expect(tx5).to.emit(fastBridgeReceiver, "ClaimReceived").withArgs(batchID, batchMerkleRoot);

    // Challenger tx starts
    const tx6 = await fastBridgeReceiver.connect(challenger).challenge(batchID, { value: ONE_TENTH_ETH });
    expect(tx6).to.emit(fastBridgeReceiver, "ClaimChallenged").withArgs(batchID);

    // wait for challenge period (and epoch) to pass
    await network.provider.send("evm_increaseTime", [86400]);
    await network.provider.send("evm_mine");

    await expect(
      fastBridgeReceiver.connect(await ethers.getSigner(relayer)).verifyAndRelay(batchID, [], fastMessage, nonce)
    ).to.be.revertedWith("Invalid epoch.");

    const tx7 = await fastBridgeSender
      .connect(bridger)
      .sendSafeFallback(batchID, { gasLimit: 1000000 });
    expect(tx7).to.emit(fastBridgeSender, "L2ToL1TxCreated");

    const tx8 = await fastBridgeReceiver.connect(await ethers.getSigner(relayer)).verifyAndRelay(batchID, [], fastMessage, nonce);

    expect(tx8).to.emit(arbitrable, "Ruling");

    await expect(fastBridgeReceiver.withdrawChallengeDeposit(batchID)).to.be.revertedWith(
      "Challenge not verified."
    );
  });

  it("Demo - Dishonest Claim - Challenged - Bridger deposit forfeited, Challenger paid", async () => {
    const arbitrationCost = ONE_TENTH_ETH.mul(3);
    const [bridger, challenger] = await ethers.getSigners();

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
    const tx = await arbitrable.createDispute(2, "0x00", 0, { value: arbitrationCost });
    const trace = await network.provider.send("debug_traceTransaction", [tx.hash]);
    const [disputeId] = ethers.utils.defaultAbiCoder.decode(["uint"], `0x${trace.returnValue}`);
    console.log("Dispute Created");
    expect(tx).to.emit(foreignGateway, "DisputeCreation"); //.withArgs(disputeId, deployer.address);
    expect(tx).to.emit(foreignGateway, "OutgoingDispute"); //.withArgs(disputeId, deployer.address);
    console.log(`disputeId: ${disputeId}`);
    const coreId = disputeId - 1;
    // let events = await foreignGateway.queryFilter(OutgoingMessage);

    const lastBlock = await ethers.provider.getBlock(tx.blockNumber - 1);
    const disputeHash = ethers.utils.solidityKeccak256(
      ["uint", "bytes", "bytes", "uint", "uint", "bytes", "address"],
      [31337, lastBlock.hash, ethers.utils.toUtf8Bytes("createDispute"), disputeId, 2, "0x00", arbitrable.address]
    );

    // Relayer tx
    const tx2 = await homeGateway
      .connect(await ethers.getSigner(relayer))
      .relayCreateDispute(31337, lastBlock.hash, disputeId, 2, "0x00", arbitrable.address, {
        value: arbitrationCost,
      });
    expect(tx2).to.emit(homeGateway, "Dispute");

    await network.provider.send("evm_increaseTime", [130]); // Wait for minStakingTime
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

    const roundInfo = await core.getRoundInfo(coreId, 0);
    expect(roundInfo.drawnJurors).deep.equal([deployer, deployer, deployer]);
    expect(roundInfo.tokensAtStakePerJuror).to.equal(ONE_HUNDRED_PNK.mul(2));
    expect(roundInfo.totalFeesForJurors).to.equal(arbitrationCost);

    expect((await core.disputes(coreId)).period).to.equal(Period.evidence);
    await core.passPeriod(coreId);
    expect((await core.disputes(coreId)).period).to.equal(Period.vote);

    await disputeKit.connect(await ethers.getSigner(deployer)).castVote(coreId, [0, 1, 2], 0, 0);
    await core.passPeriod(coreId);
    await core.passPeriod(coreId);
    expect((await core.disputes(coreId)).period).to.equal(Period.execution);
    await core.execute(coreId, 0, 1000);


    const tx4 = await core.executeRuling(coreId);

    console.log("Executed ruling");

    expect(tx4).to.emit(fastBridgeSender, "MessageReceived");

    const MessageReceived = fastBridgeSender.filters.MessageReceived();
    const event4 = await fastBridgeSender.queryFilter(MessageReceived);

    const nonce = event4[0].args.nonce;
    const fastMessage = event4[0].args.fastMessage;
    const currentBatchID = event4[0].args.currentBatchID;

    const tx4a = await fastBridgeSender.connect(bridger).sendBatch();
    expect(tx4a).to.emit(fastBridgeSender, "SendBatch");

    const SendBatch = fastBridgeSender.filters.SendBatch();
    const event4a = await fastBridgeSender.queryFilter(SendBatch);
    const batchID = event4a[0].args.batchID;
    const batchMerkleRoot = event4a[0].args.batchMerkleRoot;

    // bridger tx starts - bridger creates fakeData & fakeHash for dishonest ruling

    const fakeData = "KlerosToTheMoon";
    const fakeHash = utils.keccak256(utils.defaultAbiCoder.encode(["string"],[fakeData]));
    const tx5 = await fastBridgeReceiver.connect(bridger).claim(batchID, fakeHash, { value: ONE_TENTH_ETH });
    // Challenger tx starts
    const tx6 = await fastBridgeReceiver.connect(challenger).challenge(batchID, { value: ONE_TENTH_ETH });
    expect(tx6).to.emit(fastBridgeReceiver, "ClaimChallenged").withArgs(batchID);

    const tx7 = await fastBridgeSender
    .connect(bridger)
    .sendSafeFallback(batchID, { gasLimit: 1000000 });
    expect(tx7).to.emit(fastBridgeSender, "L2ToL1TxCreated");

    const tx8 = await fastBridgeReceiver.connect(await ethers.getSigner(relayer)).verifyAndRelay(batchID, [], fastMessage, nonce);

    expect(tx8).to.emit(arbitrable, "Ruling");
    await fastBridgeReceiver.withdrawChallengeDeposit(batchID);
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
