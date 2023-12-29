import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { deployments, ethers, getNamedAccounts, network } from "hardhat";
import { BigNumber, ContractReceipt, ContractTransaction, Wallet } from "ethers";
import {
  PNK,
  KlerosCore,
  ArbitrableExample,
  HomeGateway,
  DisputeKitClassic,
  SortitionModule,
} from "../../typechain-types";
import { expect } from "chai";
import { DrawEvent } from "../../typechain-types/src/kleros-v1/kleros-liquid-xdai/XKlerosLiquidV2";
import { Courts } from "../../deploy/utils";

/* eslint-disable no-unused-vars */
/* eslint-disable no-unused-expressions */ // https://github.com/standard/standard/issues/690#issuecomment-278533482

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
  let sortitionModule;
  let rng;
  let parentCourtMinStake: BigNumber;
  let childCourtMinStake: BigNumber;
  const RANDOM = BigNumber.from("61688911660239508166491237672720926005752254046266901728404745669596507231249");
  const PARENT_COURT = 1;
  const CHILD_COURT = 2;

  beforeEach("Setup", async () => {
    ({ deployer, relayer } = await getNamedAccounts());

    await deployments.fixture(["Arbitration", "VeaMock"], {
      fallbackToGlobal: true,
      keepExistingDeployments: false,
    });
    disputeKit = (await ethers.getContract("DisputeKitClassic")) as DisputeKitClassic;
    pnk = (await ethers.getContract("PNK")) as PNK;
    core = (await ethers.getContract("KlerosCore")) as KlerosCore;
    homeGateway = (await ethers.getContract("HomeGatewayToEthereum")) as HomeGateway;
    arbitrable = (await ethers.getContract("ArbitrableExample")) as ArbitrableExample;
    sortitionModule = (await ethers.getContract("SortitionModule")) as SortitionModule;

    parentCourtMinStake = await core.courts(Courts.GENERAL).then((court) => court.minStake);

    childCourtMinStake = BigNumber.from(10).pow(20).mul(3); // 300 PNK

    // Make the tests more deterministic with this dummy RNG
    rng = await deployments.deploy("IncrementalNG", {
      from: deployer,
      args: [RANDOM],
      log: true,
    });

    await sortitionModule.changeRandomNumberGenerator(rng.address, 20);

    // CourtId 2 = CHILD_COURT
    const minStake = BigNumber.from(10).pow(20).mul(3); // 300 PNK
    const alpha = 10000;
    const feeForJuror = BigNumber.from(10).pow(17);
    await core.createCourt(
      1,
      false,
      minStake,
      alpha,
      feeForJuror,
      256,
      [0, 0, 0, 10], // evidencePeriod, commitPeriod, votePeriod, appealPeriod
      ethers.utils.hexlify(5), // Extra data for sortition module will return the default value of K)
      [1]
    );
  });

  type CountedDraws = { [address: string]: number };
  type SetStake = (wallet: Wallet) => Promise<void>;
  type ExpectFromDraw = (drawTx: Promise<ContractTransaction>) => Promise<void>;

  const draw = async (
    stake: SetStake,
    createDisputeCourtId: number,
    expectFromDraw: ExpectFromDraw,
    unstake: SetStake
  ) => {
    const arbitrationCost = ONE_TENTH_ETH.mul(3);
    const [bridger] = await ethers.getSigners();
    const wallets: Wallet[] = [];

    // Stake some jurors
    for (let i = 0; i < 16; i++) {
      const wallet = ethers.Wallet.createRandom().connect(ethers.provider);
      wallets.push(wallet);

      await bridger.sendTransaction({
        to: wallet.address,
        value: ethers.utils.parseEther("10"),
      });
      expect(await wallet.getBalance()).to.equal(ethers.utils.parseEther("10"));

      await pnk.transfer(wallet.address, ONE_THOUSAND_PNK.mul(10));
      expect(await pnk.balanceOf(wallet.address)).to.equal(ONE_THOUSAND_PNK.mul(10));

      await pnk.connect(wallet).approve(core.address, ONE_THOUSAND_PNK.mul(10), { gasLimit: 300000 });

      await stake(wallet);
    }

    // Create a dispute
    const tx = await arbitrable.functions["createDispute(string)"]("future of france", {
      value: arbitrationCost,
    });
    const trace = await network.provider.send("debug_traceTransaction", [tx.hash]);
    const [disputeId] = ethers.utils.defaultAbiCoder.decode(["uint"], `0x${trace.returnValue}`);
    const lastBlock = await ethers.provider.getBlock(tx.blockNumber - 1);

    // Relayer tx
    const tx2 = await homeGateway
      .connect(await ethers.getSigner(relayer))
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
          extraData: `0x000000000000000000000000000000000000000000000000000000000000000${createDisputeCourtId}0000000000000000000000000000000000000000000000000000000000000003`,
        },
        { value: arbitrationCost }
      );

    await network.provider.send("evm_increaseTime", [2000]); // Wait for minStakingTime
    await network.provider.send("evm_mine");
    await sortitionModule.passPhase(); // Staking -> Generating

    const lookahead = await sortitionModule.rngLookahead();
    for (let index = 0; index < lookahead; index++) {
      await network.provider.send("evm_mine");
    }

    await sortitionModule.passPhase(); // Generating -> Drawing
    await expectFromDraw(core.draw(0, 20, { gasLimit: 1000000 }));

    await network.provider.send("evm_increaseTime", [2000]); // Wait for maxDrawingTime
    await sortitionModule.passPhase(); // Drawing -> Staking
    expect(await sortitionModule.phase()).to.equal(Phase.staking);

    // Unstake jurors
    for (const wallet of wallets) {
      await unstake(wallet);
    }
  };

  const countDraws = async (blockNumber: number) => {
    const draws: Array<DrawEvent> = await core.queryFilter(core.filters.Draw(), blockNumber, blockNumber);
    return draws.reduce((acc: { [address: string]: number }, draw) => {
      const address = draw.args._address;
      acc[address] = acc[address] ? acc[address] + 1 : 1;
      return acc;
    }, {});
  };

  it("Stakes in parent court and should draw jurors in parent court", async () => {
    const stake = async (wallet: Wallet) => {
      await core.connect(wallet).setStake(PARENT_COURT, ONE_THOUSAND_PNK.mul(5), { gasLimit: 5000000 });

      expect(await sortitionModule.getJurorBalance(wallet.address, 1)).to.deep.equal([
        ONE_THOUSAND_PNK.mul(5), // totalStaked
        0, // totalLocked
        ONE_THOUSAND_PNK.mul(5), // stakedInCourt
        PARENT_COURT, // nbOfCourts
      ]);
    };
    let countedDraws: CountedDraws;
    const expectFromDraw = async (drawTx: Promise<ContractTransaction>) => {
      expect(await core.getRoundInfo(0, 0).then((round) => round.drawIterations)).to.equal(3);

      const tx = await (await drawTx).wait();
      expect(tx)
        .to.emit(core, "Draw")
        .withArgs(anyValue, 0, 0, 0)
        .to.emit(core, "Draw")
        .withArgs(anyValue, 0, 0, 1)
        .to.emit(core, "Draw")
        .withArgs(anyValue, 0, 0, 2);

      countedDraws = await countDraws(tx.blockNumber);
      for (const [address, draws] of Object.entries(countedDraws)) {
        expect(await sortitionModule.getJurorBalance(address, PARENT_COURT)).to.deep.equal([
          ONE_THOUSAND_PNK.mul(5), // totalStaked
          parentCourtMinStake.mul(draws), // totalLocked
          ONE_THOUSAND_PNK.mul(5), // stakedInCourt
          1, // nbOfCourts
        ]);
        expect(await sortitionModule.getJurorBalance(address, CHILD_COURT)).to.deep.equal([
          ONE_THOUSAND_PNK.mul(5), // totalStaked
          parentCourtMinStake.mul(draws), // totalLocked
          0, // stakedInCourt
          1, // nbOfCourts
        ]);
      }
    };

    const unstake = async (wallet: Wallet) => {
      await core.connect(wallet).setStake(PARENT_COURT, 0, { gasLimit: 5000000 });
      const locked = parentCourtMinStake.mul(countedDraws[wallet.address] ?? 0);
      expect(
        await sortitionModule.getJurorBalance(wallet.address, PARENT_COURT),
        "Drawn jurors have a locked stake in the parent court"
      ).to.deep.equal([
        0, // totalStaked
        locked, // totalLocked
        0, // stakedInCourt
        0, // nbOfCourts
      ]);
      expect(
        await sortitionModule.getJurorBalance(wallet.address, CHILD_COURT),
        "No locked stake in the child court"
      ).to.deep.equal([
        0, // totalStaked
        locked, // totalLocked
        0, // stakedInCourt
        0, // nbOfCourts
      ]);
    };

    await draw(stake, PARENT_COURT, expectFromDraw, unstake);
  });

  // Warning: we are skipping this during `hardhat coverage` because it fails, although it passes with `hardhat test`
  it("Stakes in parent court and should draw nobody in subcourt [ @skip-on-coverage ]", async () => {
    const stake = async (wallet: Wallet) => {
      await core.connect(wallet).setStake(PARENT_COURT, ONE_THOUSAND_PNK.mul(5), { gasLimit: 5000000 });
    };

    const expectFromDraw = async (drawTx: Promise<ContractTransaction>) => {
      expect(await core.getRoundInfo(0, 0).then((round) => round.drawIterations)).to.equal(20);
      expect(await drawTx).to.not.emit(core, "Draw");
    };

    const unstake = async (wallet: Wallet) => {
      await core.connect(wallet).setStake(PARENT_COURT, 0, { gasLimit: 5000000 });
      expect(
        await sortitionModule.getJurorBalance(wallet.address, PARENT_COURT),
        "No locked stake in the parent court"
      ).to.deep.equal([
        0, // totalStaked
        0, // totalLocked
        0, // stakedInCourt
        0, // nbOfCourts
      ]);
      expect(
        await sortitionModule.getJurorBalance(wallet.address, CHILD_COURT),
        "No locked stake in the child court"
      ).to.deep.equal([
        0, // totalStaked
        0, // totalLocked
        0, // stakedInCourt
        0, // nbOfCourts
      ]);
    };

    await draw(stake, CHILD_COURT, expectFromDraw, unstake);
  });

  it("Stakes in subcourt and should draw jurors in parent court", async () => {
    const stake = async (wallet: Wallet) => {
      await core.connect(wallet).setStake(CHILD_COURT, ONE_THOUSAND_PNK.mul(5), { gasLimit: 5000000 });
    };
    let countedDraws: CountedDraws;
    const expectFromDraw = async (drawTx: Promise<ContractTransaction>) => {
      expect(await core.getRoundInfo(0, 0).then((round) => round.drawIterations)).to.equal(3);

      const tx = await (await drawTx).wait();
      expect(tx)
        .to.emit(core, "Draw")
        .withArgs(anyValue, 0, 0, 0)
        .to.emit(core, "Draw")
        .withArgs(anyValue, 0, 0, 1)
        .to.emit(core, "Draw")
        .withArgs(anyValue, 0, 0, 2);

      countedDraws = await countDraws(tx.blockNumber);
      for (const [address, draws] of Object.entries(countedDraws)) {
        expect(await sortitionModule.getJurorBalance(address, PARENT_COURT)).to.deep.equal([
          ONE_THOUSAND_PNK.mul(5), // totalStaked
          parentCourtMinStake.mul(draws), // totalLocked
          0, // stakedInCourt
          1, // nbOfCourts
        ]);
        expect(await sortitionModule.getJurorBalance(address, CHILD_COURT)).to.deep.equal([
          ONE_THOUSAND_PNK.mul(5), // totalStaked
          parentCourtMinStake.mul(draws), // totalLocked
          ONE_THOUSAND_PNK.mul(5), // stakedInCourt
          1, // nbOfCourts
        ]);
      }
    };

    const unstake = async (wallet: Wallet) => {
      await core.connect(wallet).setStake(CHILD_COURT, 0, { gasLimit: 5000000 });
      const locked = parentCourtMinStake.mul(countedDraws[wallet.address] ?? 0);
      expect(
        await sortitionModule.getJurorBalance(wallet.address, PARENT_COURT),
        "No locked stake in the parent court"
      ).to.deep.equal([
        0, // totalStaked
        locked, // totalLocked
        0, // stakedInCourt
        0, // nbOfCourts
      ]);
      expect(
        await sortitionModule.getJurorBalance(wallet.address, CHILD_COURT),
        "Drawn jurors have a locked stake in the child court"
      ).to.deep.equal([
        0, // totalStaked
        locked, // totalLocked
        0, // stakedInCourt
        0, // nbOfCourts
      ]);
    };

    await draw(stake, PARENT_COURT, expectFromDraw, unstake);
  });

  it("Stakes in subcourt and should draw jurors in subcourt", async () => {
    const stake = async (wallet: Wallet) => {
      await core.connect(wallet).setStake(CHILD_COURT, ONE_THOUSAND_PNK.mul(5), { gasLimit: 5000000 });
    };
    let countedDraws: CountedDraws;
    const expectFromDraw = async (drawTx: Promise<ContractTransaction>) => {
      expect(await core.getRoundInfo(0, 0).then((round) => round.drawIterations)).to.equal(3);

      const tx = await (await drawTx).wait();
      expect(tx)
        .to.emit(core, "Draw")
        .withArgs(anyValue, 0, 0, 0)
        .to.emit(core, "Draw")
        .withArgs(anyValue, 0, 0, 1)
        .to.emit(core, "Draw")
        .withArgs(anyValue, 0, 0, 2);

      countedDraws = await countDraws(tx.blockNumber);
      for (const [address, draws] of Object.entries(countedDraws)) {
        expect(await sortitionModule.getJurorBalance(address, PARENT_COURT)).to.deep.equal([
          ONE_THOUSAND_PNK.mul(5), // totalStaked
          childCourtMinStake.mul(draws), // totalLocked
          0, // stakedInCourt
          1, // nbOfCourts
        ]);
        expect(await sortitionModule.getJurorBalance(address, CHILD_COURT)).to.deep.equal([
          ONE_THOUSAND_PNK.mul(5), // totalStaked
          childCourtMinStake.mul(draws), // totalLocked
          ONE_THOUSAND_PNK.mul(5), // stakedInCourt
          1, // nbOfCourts
        ]);
      }
    };

    const unstake = async (wallet: Wallet) => {
      await core.connect(wallet).setStake(CHILD_COURT, 0, { gasLimit: 5000000 });
      const locked = childCourtMinStake.mul(countedDraws[wallet.address] ?? 0);
      expect(
        await sortitionModule.getJurorBalance(wallet.address, PARENT_COURT),
        "No locked stake in the parent court"
      ).to.deep.equal([
        0, // totalStaked
        locked, // totalLocked
        0, // stakedInCourt
        0, // nbOfCourts
      ]);
      expect(
        await sortitionModule.getJurorBalance(wallet.address, CHILD_COURT),
        "Drawn jurors have a locked stake in the child court"
      ).to.deep.equal([
        0, // totalStaked
        locked, // totalLocked
        0, // stakedInCourt
        0, // nbOfCourts
      ]);
    };

    await draw(stake, CHILD_COURT, expectFromDraw, unstake);
  });
});
