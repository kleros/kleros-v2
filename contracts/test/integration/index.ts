import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { deployments, ethers, getNamedAccounts, network } from "hardhat";
import { BigNumber } from "ethers";
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
    staking, // No disputes that need drawing.
    generating, // Waiting for a random number. Pass as soon as it is ready.
    drawing, // Jurors can be drawn.
  }

  let deployer;
  let rng, randomizer, disputeKit, pnk, core, vea, foreignGateway, arbitrable, homeGateway, sortitionModule;

  beforeEach("Setup", async () => {
    ({ deployer } = await getNamedAccounts());
    await deployments.fixture(["Arbitration", "VeaMock"], {
      fallbackToGlobal: true,
      keepExistingDeployments: false,
    });
    rng = (await ethers.getContract("RandomizerRNG")) as RandomizerRNG;
    randomizer = (await ethers.getContract("RandomizerOracle")) as RandomizerMock;
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
    const arbitrationCost = ONE_TENTH_ETH.mul(3);
    const [, , relayer] = await ethers.getSigners();

    await pnk.approve(core.address, ONE_THOUSAND_PNK.mul(100));

    await core.setStake(1, ONE_THOUSAND_PNK);
    await sortitionModule.getJurorBalance(deployer, 1).then((result) => {
      expect(result.totalStaked).to.equal(ONE_THOUSAND_PNK);
      expect(result.totalLocked).to.equal(0);
      logJurorBalance(result);
    });

    await core.setStake(1, ONE_HUNDRED_PNK.mul(5));
    await sortitionModule.getJurorBalance(deployer, 1).then((result) => {
      expect(result.totalStaked).to.equal(ONE_HUNDRED_PNK.mul(5));
      expect(result.totalLocked).to.equal(0);
      logJurorBalance(result);
    });

    await core.setStake(1, 0);
    await sortitionModule.getJurorBalance(deployer, 1).then((result) => {
      expect(result.totalStaked).to.equal(0);
      expect(result.totalLocked).to.equal(0);
      logJurorBalance(result);
    });

    await core.setStake(1, ONE_THOUSAND_PNK.mul(4));
    await sortitionModule.getJurorBalance(deployer, 1).then((result) => {
      expect(result.totalStaked).to.equal(ONE_THOUSAND_PNK.mul(4));
      expect(result.totalLocked).to.equal(0);
      logJurorBalance(result);
    });
    const tx = await arbitrable.functions["createDispute(string)"]("future of france", {
      value: arbitrationCost,
    });
    const trace = await network.provider.send("debug_traceTransaction", [tx.hash]);
    const [disputeId] = ethers.utils.defaultAbiCoder.decode(["uint"], `0x${trace.returnValue}`); // get returned value from createDispute()
    console.log("Dispute Created with disputeId: %d", disputeId);
    await expect(tx)
      .to.emit(foreignGateway, "CrossChainDisputeOutgoing")
      .withArgs(anyValue, arbitrable.address, 1, 2, "0x00");
    await expect(tx)
      .to.emit(arbitrable, "DisputeRequest")
      .withArgs(
        foreignGateway.address,
        1,
        BigNumber.from("46619385602526556702049273755915206310773794210139929511467397410441395547901"),
        0,
        ""
      );

    const lastBlock = await ethers.provider.getBlock(tx.blockNumber - 1);
    const disputeHash = ethers.utils.solidityKeccak256(
      ["bytes", "bytes32", "uint256", "address", "uint256", "uint256", "bytes"],
      [ethers.utils.toUtf8Bytes("createDispute"), lastBlock.hash, 31337, arbitrable.address, disputeId, 2, "0x00"]
    );
    console.log("dispute hash: ", disputeHash);

    // Relayer tx
    const tx2 = await homeGateway
      .connect(relayer)
      .functions["relayCreateDispute((bytes32,uint256,address,uint256,uint256,uint256,string,uint256,bytes))"](
        {
          foreignBlockHash: lastBlock.hash,
          foreignChainID: 31337,
          foreignArbitrable: arbitrable.address,
          foreignDisputeID: disputeId,
          externalDisputeID: ethers.utils.keccak256(ethers.utils.toUtf8Bytes("future of france")),
          templateId: 0,
          templateUri: "",
          choices: 2,
          extraData: "0x00",
        },
        { value: arbitrationCost }
      );
    expect(tx2).to.emit(homeGateway, "Dispute");
    const events2 = (await tx2.wait()).events;

    await network.provider.send("evm_increaseTime", [2000]); // Wait for minStakingTime
    await network.provider.send("evm_mine");

    expect(await sortitionModule.phase()).to.equal(Phase.staking);
    expect(await sortitionModule.disputesWithoutJurors()).to.equal(1);
    console.log("KC phase: %d", await sortitionModule.phase());

    await sortitionModule.passPhase(); // Staking -> Generating
    await mineBlocks(await sortitionModule.rngLookahead()); // Wait for finality
    expect(await sortitionModule.phase()).to.equal(Phase.generating);
    console.log("KC phase: %d", await sortitionModule.phase());
    await randomizer.relay(rng.address, 0, ethers.utils.randomBytes(32));
    await sortitionModule.passPhase(); // Generating -> Drawing
    expect(await sortitionModule.phase()).to.equal(Phase.drawing);
    console.log("KC phase: %d", await sortitionModule.phase());

    const tx3 = await core.draw(0, 1000);
    console.log("draw successful");
    const events3 = (await tx3.wait()).events;

    const roundInfo = await core.getRoundInfo(0, 0);
    expect(roundInfo.drawnJurors).deep.equal([deployer, deployer, deployer]);
    expect(roundInfo.pnkAtStakePerJuror).to.equal(ONE_HUNDRED_PNK.mul(2));
    expect(roundInfo.totalFeesForJurors).to.equal(arbitrationCost);
    expect(roundInfo.feeToken).to.equal(ethers.constants.AddressZero);

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
    expect(tx4).to.emit(core, "Ruling").withArgs(homeGateway.address, 0, 0);
    expect(tx4).to.emit(arbitrable, "Ruling").withArgs(foreignGateway.address, 1, 0); // The ForeignGateway starts counting disputeID from 1.
  });

  const mineBlocks = async (n: number) => {
    for (let index = 0; index < n; index++) {
      await network.provider.send("evm_mine");
    }
  };
});

const logJurorBalance = async (result) => {
  console.log(
    "staked=%s, locked=%s",
    ethers.utils.formatUnits(result.totalStaked),
    ethers.utils.formatUnits(result.totalLocked)
  );
};
