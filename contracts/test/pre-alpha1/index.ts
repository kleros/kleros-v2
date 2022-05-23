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
  InboxMock,
} from "../../typechain-types";
import { OutgoingMessage } from "http";

/* eslint-disable no-unused-vars */

describe("Demo pre-alpha1", function () {
  const ONE_TENTH_ETH = BigNumber.from(10).pow(17);
  const ONE_ETH = BigNumber.from(10).pow(18);
  const ONE_HUNDRED_PNK = BigNumber.from(10).pow(20);
  const ONE_THOUSAND_PNK = BigNumber.from(10).pow(21);

  const enum Period {
    evidence,
    commit,
    vote,
    appeal,
    execution,
  }

  let deployer, relayer, bridger, challenger, innocentBystander;
  let ng, disputeKit, pnk, core, fastBridgeReceiver, foreignGateway, arbitrable, fastBridgeSender, homeGateway, inbox;

  before("Setup", async () => {
    deployer = (await getNamedAccounts()).deployer;
    relayer = (await getNamedAccounts()).relayer;

    console.log("deployer:%s", deployer);
    console.log("named accounts: %O", await getNamedAccounts());


    await deployments.fixture(["Arbitration", "ForeignGateway", "HomeGateway"], {
      fallbackToGlobal: true,
      keepExistingDeployments: false,
    });
    ng = <IncrementalNG>await ethers.getContract("IncrementalNG");
    disputeKit = <KlerosCore>await ethers.getContract("DisputeKitClassic");
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

    const tx3 = await core.draw(0, 1000);
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
    const ticket1 = await fastBridgeSender.currentTicketID();
    expect(ticket1).to.equal(1);

    const tx4 = await core.executeRuling(0);
    expect(tx4).to.emit(fastBridgeSender, "OutgoingMessage");

    const event5 = await fastBridgeSender.queryFilter(OutgoingMessage);
    console.log("Executed ruling");

    const ticket2 = await fastBridgeSender.currentTicketID();
    expect(ticket2).to.equal(2);

    const ticketID = event5[0].args.ticketID;
    const messageHash = event5[0].args.messageHash;
    const blockNumber = event5[0].args.blockNumber;
    const messageData = event5[0].args.message;

    const bridgerBalance = await ethers.provider.getBalance(bridger.address);
    // bridger tx starts - Honest Bridger 
    const tx5 = await fastBridgeReceiver.connect(bridger).claim(ticketID, messageHash, { value: ONE_TENTH_ETH });
    const blockNumBefore = await ethers.provider.getBlockNumber();
    const blockBefore = await ethers.provider.getBlock(blockNumBefore);
    const timestampBefore = blockBefore.timestamp;
    expect(tx5).to.emit(fastBridgeReceiver, "ClaimReceived").withArgs(ticketID, messageHash, timestampBefore);

    // wait for challenge period to pass
    await network.provider.send("evm_increaseTime", [300]);
    await network.provider.send("evm_mine");

    const tx7 = await fastBridgeReceiver.connect(bridger).verifyAndRelay(ticketID, blockNumber, messageData);
    expect(tx7).to.emit(arbitrable, "Ruling");

    const tx8 = await fastBridgeReceiver.withdrawClaimDeposit(ticketID);
  });

  it("Demo - Honest Claim - Challenged - Bridger Paid, Challenger deposit forfeited", async () => {
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

    const tx3 = await core.draw(1, 1000);
    const events3 = (await tx3.wait()).events;

    const roundInfo = await core.getRoundInfo(1, 0);
    expect(roundInfo.drawnJurors).deep.equal([deployer, deployer, deployer]);
    expect(roundInfo.tokensAtStakePerJuror).to.equal(ONE_HUNDRED_PNK.mul(2));
    expect(roundInfo.totalFeesForJurors).to.equal(arbitrationCost);

    expect((await core.disputes(1)).period).to.equal(Period.evidence);
    await core.passPeriod(1);
    expect((await core.disputes(1)).period).to.equal(Period.vote);

    await disputeKit.connect(await ethers.getSigner(deployer)).castVote(1, [0, 1, 2], 0, 0);
    await core.passPeriod(1);
    await core.passPeriod(1);
    expect((await core.disputes(1)).period).to.equal(Period.execution);
    await core.execute(1, 0, 1000);
    const ticket1 = await fastBridgeSender.currentTicketID();
    expect(ticket1).to.equal(2);

    const tx4 = await core.executeRuling(1);

    expect(tx4).to.emit(fastBridgeSender, "OutgoingMessage");

    console.log("Executed ruling");

    const ticket2 = await fastBridgeSender.currentTicketID();
    expect(ticket2).to.equal(3);
    const eventFilter = fastBridgeSender.filters.OutgoingMessage();
    const event5 = await fastBridgeSender.queryFilter(eventFilter, "latest");
    const event6 = await ethers.provider.getLogs(eventFilter);

    const ticketID = event5[0].args.ticketID.toNumber();
    const messageHash = event5[0].args.messageHash;
    const blockNumber = event5[0].args.blockNumber;
    const messageData = event5[0].args.message;
    console.log("TicketID: %d", ticketID);
    console.log("Block: %d", blockNumber);
    console.log("Message Data: %s", messageData);
    console.log("Message Hash: %s", messageHash);
    const expectedHash = utils.keccak256(
      utils.defaultAbiCoder.encode(["uint256", "uint256", "bytes"], [ticketID, blockNumber, messageData])
    );
    expect(messageHash).to.equal(expectedHash);

    const currentID = await fastBridgeSender.currentTicketID();
    expect(currentID).to.equal(3);

    // bridger tx starts
    const tx5 = await fastBridgeReceiver.connect(bridger).claim(ticketID, messageHash, { value: ONE_TENTH_ETH });
    let blockNumBefore = await ethers.provider.getBlockNumber();
    let blockBefore = await ethers.provider.getBlock(blockNumBefore);
    let timestampBefore = blockBefore.timestamp;
    expect(tx5).to.emit(fastBridgeReceiver, "ClaimReceived").withArgs(ticketID, messageHash, timestampBefore);

    // Challenger tx starts
    const tx6 = await fastBridgeReceiver.connect(challenger).challenge(ticketID, { value: ONE_TENTH_ETH });
    blockNumBefore = await ethers.provider.getBlockNumber();
    blockBefore = await ethers.provider.getBlock(blockNumBefore);
    timestampBefore = blockBefore.timestamp;
    console.log("Block: %d", blockNumBefore);
    expect(tx6).to.emit(fastBridgeReceiver, "ClaimChallenged").withArgs(ticketID, timestampBefore);

    // wait for challenge period to pass
    await network.provider.send("evm_increaseTime", [300]);
    await network.provider.send("evm_mine");

    await expect(
      fastBridgeReceiver.connect(bridger).verifyAndRelay(ticketID, blockNumber, messageData)
    ).to.be.revertedWith("Claim is challenged");

    const data = await ethers.utils.defaultAbiCoder.decode(["address", "bytes"], messageData);
    const tx7 = await fastBridgeSender
      .connect(bridger)
      .sendSafeFallbackMock(ticketID, foreignGateway.address, data[1], { gasLimit: 1000000 });
    expect(tx7).to.emit(fastBridgeSender, "L2ToL1TxCreated");
    expect(tx7).to.emit(arbitrable, "Ruling");

    await expect(fastBridgeReceiver.withdrawChallengeDeposit(ticketID)).to.be.revertedWith(
      "Claim verified: deposit forfeited"
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

    const tx3 = await core.draw(coreId, 1000);
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
    const ticket1 = await fastBridgeSender.currentTicketID();
    expect(ticket1).to.equal(3);

    const tx4 = await core.executeRuling(coreId);

    expect(tx4).to.emit(fastBridgeSender, "OutgoingMessage");

    console.log("Executed ruling");

    const ticket2 = await fastBridgeSender.currentTicketID();
    expect(ticket2).to.equal(4);
    const eventFilter = fastBridgeSender.filters.OutgoingMessage();
    const event5 = await fastBridgeSender.queryFilter(eventFilter, "latest");
    const event6 = await ethers.provider.getLogs(eventFilter);

    const ticketID = event5[0].args.ticketID.toNumber();
    const messageHash = event5[0].args.messageHash;
    const blockNumber = event5[0].args.blockNumber;
    const messageData = event5[0].args.message;
    console.log("TicketID: %d", ticketID);
    console.log("Block: %d", blockNumber);
    console.log("Message Data: %s", messageData);
    console.log("Message Hash: %s", messageHash);
    const expectedHash = utils.keccak256(
      utils.defaultAbiCoder.encode(["uint256", "uint256", "bytes"], [ticketID, blockNumber, messageData])
    );
    expect(messageHash).to.equal(expectedHash);

    const currentID = await fastBridgeSender.currentTicketID();
    expect(currentID).to.equal(4);

    // bridger tx starts - bridger creates fakeData & fakeHash for dishonest ruling
    const fakeData = "0x0000000000000000000000009a9f2ccfde556a7e9ff0848998aa4a0cfd8863ae000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000643496987923bd6a8aa2bdce6c5b15551665079e7acfb1b4d2149ac7e2f72260417d541b7f000000000000000000000000000000000000000000000000000000000000000100000000000000000000000070997970c51812dc3a010c7d01b50e0d17dc79c800000000000000000000000000000000000000000000000000000000";
    const fakeHash = utils.keccak256(
      utils.defaultAbiCoder.encode(["uint256", "uint256", "bytes"], [ticketID, blockNumber, fakeData])
    );

    const tx5 = await fastBridgeReceiver.connect(bridger).claim(ticketID, fakeHash, { value: ONE_TENTH_ETH });
    let blockNumBefore = await ethers.provider.getBlockNumber();
    let blockBefore = await ethers.provider.getBlock(blockNumBefore);
    let timestampBefore = blockBefore.timestamp;
    console.log("Block: %d", blockNumBefore);
    expect(tx5).to.emit(fastBridgeReceiver, "ClaimReceived").withArgs(ticketID, fakeHash, timestampBefore);

    // Challenger tx starts
    const tx6 = await fastBridgeReceiver.connect(challenger).challenge(ticketID, { value: ONE_TENTH_ETH });
    blockNumBefore = await ethers.provider.getBlockNumber();
    blockBefore = await ethers.provider.getBlock(blockNumBefore);
    timestampBefore = blockBefore.timestamp;
    console.log("Block: %d", blockNumBefore);
    expect(tx6).to.emit(fastBridgeReceiver, "ClaimChallenged").withArgs(ticketID, timestampBefore);

    // wait for challenge period to pass
    await network.provider.send("evm_increaseTime", [300]);
    await network.provider.send("evm_mine");

    await expect(
      fastBridgeReceiver.connect(bridger).verifyAndRelay(ticketID, blockNumber, fakeData)
    ).to.be.revertedWith("Claim is challenged");

    let data = await ethers.utils.defaultAbiCoder.decode(["address", "bytes"], fakeData);

    await expect(
      fastBridgeSender
        .connect(bridger)
        .sendSafeFallbackMock(ticketID, foreignGateway.address, data[1], { gasLimit: 1000000 })
    ).to.be.revertedWith("Invalid message for ticketID.");

    data = await ethers.utils.defaultAbiCoder.decode(["address", "bytes"], messageData);
    const tx8 = await fastBridgeSender
      .connect(bridger)
      .sendSafeFallbackMock(ticketID, foreignGateway.address, data[1], { gasLimit: 1000000 });
    expect(tx8).to.emit(fastBridgeSender, "L2ToL1TxCreated");
    expect(tx8).to.emit(arbitrable, "Ruling");

    await expect(fastBridgeReceiver.withdrawClaimDeposit(ticketID)).to.be.revertedWith(
      "Claim not verified: deposit forfeited"
    );
    await fastBridgeReceiver.withdrawChallengeDeposit(ticketID);
  });
});

const logJurorBalance = function (result) {
  console.log("staked=%s, locked=%s", ethers.utils.formatUnits(result.staked), ethers.utils.formatUnits(result.locked));
};
