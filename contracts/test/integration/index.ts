import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { deployments, ethers, getNamedAccounts, network } from "hardhat";
import {
  PNK,
  KlerosCore,
  ForeignGateway,
  ArbitrableExample,
  HomeGateway,
  VeaMock,
  DisputeKitClassic,
  RandomizerRNG,
  RandomizerMock,
  SortitionModule,
  ChainlinkRNG,
  ChainlinkVRFCoordinatorV2Mock,
} from "../../typechain-types";

/* eslint-disable no-unused-vars */
/* eslint-disable no-unused-expressions */ // https://github.com/standard/standard/issues/690#issuecomment-278533482

describe("Integration tests", async () => {
  const ONE_TENTH_ETH = 10n ** 17n;
  const ONE_ETH = 10n ** 18n;
  const ONE_HUNDRED_PNK = 10n ** 20n;
  const ONE_THOUSAND_PNK = 10n ** 21n;
  const abiCoder = ethers.AbiCoder.defaultAbiCoder();

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
  let vea: VeaMock;
  let foreignGateway: ForeignGateway;
  let arbitrable: ArbitrableExample;
  let homeGateway: HomeGateway;
  let sortitionModule: SortitionModule;

  beforeEach("Setup", async () => {
    ({ deployer } = await getNamedAccounts());
    await deployments.fixture(["Arbitration", "VeaMock"], {
      fallbackToGlobal: true,
      keepExistingDeployments: false,
    });
    rng = (await ethers.getContract("ChainlinkRNG")) as ChainlinkRNG;
    vrfCoordinator = (await ethers.getContract("ChainlinkVRFCoordinator")) as ChainlinkVRFCoordinatorV2Mock;
    disputeKit = (await ethers.getContract("DisputeKitClassic")) as DisputeKitClassic;
    pnk = (await ethers.getContract("PNK")) as PNK;
    core = (await ethers.getContract("KlerosCore")) as KlerosCore;
    vea = (await ethers.getContract("VeaMock")) as VeaMock;
    foreignGateway = (await ethers.getContract("ForeignGatewayOnEthereum")) as ForeignGateway;
    arbitrable = (await ethers.getContract("ArbitrableExample")) as ArbitrableExample;
    homeGateway = (await ethers.getContract("HomeGatewayToEthereum")) as HomeGateway;
    sortitionModule = (await ethers.getContract("SortitionModule")) as SortitionModule;
  });

  it("Resolves a dispute on the home chain with no appeal", async () => {
    const arbitrationCost = ONE_TENTH_ETH * 3n;
    const [, , relayer] = await ethers.getSigners();

    await pnk.approve(core.target, ONE_THOUSAND_PNK * 100n);

    await core.setStake(1, ONE_THOUSAND_PNK);
    await sortitionModule.getJurorBalance(deployer, 1).then((result) => {
      expect(result.totalStaked).to.equal(ONE_THOUSAND_PNK);
      expect(result.totalLocked).to.equal(0);
      logJurorBalance(result);
    });

    await core.setStake(1, ONE_HUNDRED_PNK * 5n);
    await sortitionModule.getJurorBalance(deployer, 1).then((result) => {
      expect(result.totalStaked).to.equal(ONE_HUNDRED_PNK * 5n);
      expect(result.totalLocked).to.equal(0);
      logJurorBalance(result);
    });

    await core.setStake(1, 0);
    await sortitionModule.getJurorBalance(deployer, 1).then((result) => {
      expect(result.totalStaked).to.equal(0);
      expect(result.totalLocked).to.equal(0);
      logJurorBalance(result);
    });

    await core.setStake(1, ONE_THOUSAND_PNK * 4n);
    await sortitionModule.getJurorBalance(deployer, 1).then((result) => {
      expect(result.totalStaked).to.equal(ONE_THOUSAND_PNK * 4n);
      expect(result.totalLocked).to.equal(0);
      logJurorBalance(result);
    });
    const tx = await arbitrable["createDispute(string)"]("future of france", {
      value: arbitrationCost,
    });

    const trace = await network.provider.send("debug_traceTransaction", [tx.hash]);
    const [disputeId] = abiCoder.decode(["uint"], ethers.getBytes(`${trace.returnValue}`)); // get returned value from createDispute()
    console.log("Dispute Created with disputeId: %d", disputeId);
    await expect(tx)
      .to.emit(foreignGateway, "CrossChainDisputeOutgoing")
      .withArgs(anyValue, arbitrable.target, 1, 2, "0x00");
    await expect(tx)
      .to.emit(arbitrable, "DisputeRequest")
      .withArgs(
        foreignGateway.target,
        1,
        46619385602526556702049273755915206310773794210139929511467397410441395547901n,
        0,
        ""
      );
    if (tx.blockNumber === null) throw new Error("tx.blockNumber is null");
    const lastBlock = await ethers.provider.getBlock(tx.blockNumber - 1);
    if (lastBlock === null) throw new Error("lastBlock is null");
    const disputeHash = ethers.solidityPackedKeccak256(
      ["bytes", "bytes32", "uint256", "address", "uint256", "uint256", "bytes"],
      [ethers.toUtf8Bytes("createDispute"), lastBlock.hash, 31337, arbitrable.target, disputeId, 2, "0x00"]
    );
    console.log("dispute hash: ", disputeHash);
    if (lastBlock.hash === null) {
      throw new Error("Block hash is null - cannot calculate dispute hash");
    }
    // Relayer tx
    const tx2 = await homeGateway
      .connect(relayer)
      ["relayCreateDispute((bytes32,uint256,address,uint256,uint256,uint256,string,uint256,bytes))"](
        {
          foreignBlockHash: ethers.toBeHex(lastBlock.hash),
          foreignChainID: 31337,
          foreignArbitrable: arbitrable.target,
          foreignDisputeID: disputeId,
          externalDisputeID: ethers.keccak256(ethers.toUtf8Bytes("future of france")),
          templateId: 0,
          templateUri: "",
          choices: 2,
          extraData: "0x00",
        },
        { value: arbitrationCost }
      );
    expect(tx2).to.emit(homeGateway, "DisputeRequest");
    await tx2.wait();

    await network.provider.send("evm_increaseTime", [2000]); // Wait for minStakingTime
    await network.provider.send("evm_mine");

    expect(await sortitionModule.phase()).to.equal(Phase.staking);
    expect(await sortitionModule.disputesWithoutJurors()).to.equal(1);
    console.log("KC phase: %d", await sortitionModule.phase());

    await sortitionModule.passPhase(); // Staking -> Generating
    await mineBlocks(ethers.getNumber(await sortitionModule.rngLookahead())); // Wait for finality
    expect(await sortitionModule.phase()).to.equal(Phase.generating);
    console.log("KC phase: %d", await sortitionModule.phase());
    await vrfCoordinator.fulfillRandomWords(1, rng.target, []);
    await sortitionModule.passPhase(); // Generating -> Drawing
    expect(await sortitionModule.phase()).to.equal(Phase.drawing);
    console.log("KC phase: %d", await sortitionModule.phase());

    const tx3 = await core.draw(0, 1000);
    console.log("draw successful");
    await tx3.wait();

    const roundInfo = await core.getRoundInfo(0, 0);
    expect(roundInfo.drawnJurors).deep.equal([deployer, deployer, deployer]);
    expect(roundInfo.pnkAtStakePerJuror).to.equal(ONE_HUNDRED_PNK * 2n);
    expect(roundInfo.totalFeesForJurors).to.equal(arbitrationCost);
    expect(roundInfo.feeToken).to.equal(ethers.ZeroAddress);

    expect((await core.disputes(0)).period).to.equal(Period.evidence);

    await core.passPeriod(0);
    expect((await core.disputes(0)).period).to.equal(Period.vote);
    await disputeKit.connect(await ethers.getSigner(deployer)).castVote(0, [0, 1, 2], 0, 0, "");
    await core.passPeriod(0);

    await network.provider.send("evm_increaseTime", [100]); // Wait for the appeal period
    await network.provider.send("evm_mine");

    await core.passPeriod(0);
    expect((await core.disputes(0)).period).to.equal(Period.execution);
    expect(await core.execute(0, 0, 1000)).to.emit(core, "TokenAndETHShift");

    const tx4 = await core.executeRuling(0, { gasLimit: 10000000, gasPrice: 5000000000 });
    console.log("Ruling executed on KlerosCore");
    expect(tx4).to.emit(core, "Ruling").withArgs(homeGateway.target, 0, 0);
    expect(tx4).to.emit(arbitrable, "Ruling").withArgs(foreignGateway.target, 1, 0); // The ForeignGateway starts counting disputeID from 1.
  });

  const mineBlocks = async (n: number) => {
    for (let index = 0; index < n; index++) {
      await network.provider.send("evm_mine");
    }
  };
});

const logJurorBalance = async (result) => {
  console.log("staked=%s, locked=%s", ethers.formatUnits(result.totalStaked), ethers.formatUnits(result.totalLocked));
};
