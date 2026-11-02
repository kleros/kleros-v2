import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { deployments, ethers, getNamedAccounts, network } from "hardhat";
import { toBigInt, ContractTransactionResponse, HDNodeWallet } from "ethers";
import { PNK, KlerosCore, ArbitrableExample, HomeGateway, SortitionModule, IncrementalNG } from "../../typechain-types";
import { expect } from "chai";
import { Courts, NULL_ELIGIBILITY_REQUIREMENT } from "../../deploy/utils";

// https://github.com/standard/standard/issues/690#issuecomment-278533482

describe("Draw Benchmark", async () => {
  const ONE_TENTH_ETH = 10n ** 17n;
  const ONE_THOUSAND_PNK = 10n ** 21n;

  const enum Phase {
    staking, // Stake can be updated during this phase.
    // Phase during which the dispute kits can undergo the drawing process. Staking is not allowed during this phase.
    freezing,
  }

  let deployer: string;
  let relayer: string;
  let pnk: PNK;
  let core: KlerosCore;
  let arbitrable: ArbitrableExample;
  let homeGateway: HomeGateway;
  let sortitionModule: SortitionModule;
  let rng: IncrementalNG;
  let parentCourtMinStake: bigint;
  let childCourtMinStake: bigint;
  const RANDOM = 61688911660239508166491237672720926005752254046266901728404745669596507231249n;
  const PARENT_COURT = 1;
  const CHILD_COURT = 2;
  const abiCoder = ethers.AbiCoder.defaultAbiCoder();

  beforeEach("Setup", async () => {
    ({ deployer, relayer } = await getNamedAccounts());

    await deployments.fixture(["Arbitration", "VeaMock"], {
      fallbackToGlobal: true,
      keepExistingDeployments: false,
    });
    pnk = await ethers.getContract<PNK>("PNK");
    core = await ethers.getContract<KlerosCore>("KlerosCore");
    homeGateway = await ethers.getContract<HomeGateway>("HomeGatewayToEthereum");
    arbitrable = await ethers.getContract<ArbitrableExample>("ArbitrableExample");
    sortitionModule = await ethers.getContract<SortitionModule>("SortitionModule");

    parentCourtMinStake = await core.courts(Courts.GENERAL).then((court) => court.minStake);

    childCourtMinStake = 3n * 10n ** 20n; // 300 PNK

    // Make the tests more deterministic with this dummy RNG
    await deployments.deploy("IncrementalNG", {
      from: deployer,
      args: [RANDOM],
      log: true,
    });
    rng = await ethers.getContract<IncrementalNG>("IncrementalNG");

    await sortitionModule.changeRandomNumberGenerator(rng.target).then((tx) => tx.wait());

    // CourtId 2 = CHILD_COURT
    const minStake = 3n * 10n ** 20n; // 300 PNK
    const alpha = 10000n;
    const feeForJuror = ONE_TENTH_ETH;
    await core
      .createCourt(
        1,
        false,
        minStake,
        alpha,
        feeForJuror,
        256,
        [0, 0, 0, 10], // evidencePeriod, commitPeriod, votePeriod, appealPeriod
        [1],
        NULL_ELIGIBILITY_REQUIREMENT
      )
      .then((tx) => tx.wait());
  });

  type CountedDraws = { [address: string]: number };
  type SetStake = (wallet: HDNodeWallet) => Promise<void>;
  type ExpectFromDraw = (drawTx: Promise<ContractTransactionResponse>) => Promise<void>;

  const draw = async (
    stake: SetStake,
    stakeCourtId: number,
    createDisputeCourtId: number,
    expectFromDraw: ExpectFromDraw,
    unstake: SetStake
  ) => {
    const arbitrationCost = ONE_TENTH_ETH * 3n;
    const [bridger] = await ethers.getSigners();
    const wallets: HDNodeWallet[] = [];

    // Stake some jurors
    for (let i = 0; i < 16; i++) {
      const wallet = ethers.Wallet.createRandom().connect(ethers.provider);
      wallets.push(wallet);

      await bridger
        .sendTransaction({
          to: wallet.address,
          value: ethers.parseEther("10"),
        })
        .then((tx) => tx.wait());
      expect(await ethers.provider.getBalance(wallet)).to.equal(ethers.parseEther("10"));

      await pnk.transfer(wallet.address, ONE_THOUSAND_PNK * 10n).then((tx) => tx.wait());
      expect(await pnk.balanceOf(wallet.address)).to.equal(ONE_THOUSAND_PNK * 10n);

      await pnk
        .connect(wallet)
        .approve(core.target, ONE_THOUSAND_PNK * 10n, { gasLimit: 300000 })
        .then((tx) => tx.wait());

      await core
        .connect(wallet)
        .depositTokens(ONE_THOUSAND_PNK * 10n)
        .then((tx) => tx.wait());

      await stake(wallet);
    }

    await network.provider.send("evm_increaseTime", [Number(await sortitionModule.stakingDelay())]);
    await network.provider.send("evm_mine");
    await sortitionModule
      .executeDelayedStakes(
        wallets.map((wallet) => wallet.address),
        wallets.map(() => stakeCourtId)
      )
      .then((tx) => tx.wait());
    for (const wallet of wallets) {
      expect(await sortitionModule.stakeOf(wallet.address, stakeCourtId)).to.equal(ONE_THOUSAND_PNK * 5n);
    }

    // Create a dispute
    const tx = await arbitrable.createDispute("future of france", {
      value: arbitrationCost,
    });
    await tx.wait();
    if (tx.blockNumber === null) throw new Error("tx.blockNumber is null");
    const trace = await network.provider.send("debug_traceTransaction", [tx.hash]);
    const [disputeId] = abiCoder.decode(["uint"], ethers.getBytes(`${trace.returnValue}`));
    const lastBlock = await ethers.provider.getBlock(tx.blockNumber - 1);
    if (lastBlock?.hash === null || lastBlock?.hash === undefined) throw new Error("lastBlock is null || undefined");

    // Relayer tx
    await homeGateway
      .connect(await ethers.getSigner(relayer))
      .relayCreateDispute(
        {
          foreignBlockHash: lastBlock?.hash,
          foreignChainID: 31337,
          foreignArbitrable: arbitrable.target,
          foreignDisputeID: disputeId,
          templateId: 0,
          choices: 2,
          // eslint-disable-next-line max-len
          extraData: `0x000000000000000000000000000000000000000000000000000000000000000${createDisputeCourtId}0000000000000000000000000000000000000000000000000000000000000003`,
        },
        { value: arbitrationCost }
      )
      .then((tx) => tx.wait());

    await network.provider.send("evm_increaseTime", [2000]); // Wait for minStakingTime
    await network.provider.send("evm_mine");
    await sortitionModule.passPhase().then((tx) => tx.wait()); // Staking -> Generating

    await sortitionModule.passPhase().then((tx) => tx.wait()); // Generating -> Drawing
    await expectFromDraw(core.draw(0, 20, { gasLimit: 1000000 }));

    await network.provider.send("evm_increaseTime", [2000]); // Wait for maxDrawingTime
    await sortitionModule.passPhase().then((tx) => tx.wait()); // Drawing -> Staking
    expect(await sortitionModule.phase()).to.equal(Phase.staking);

    // Unstake jurors
    for (const wallet of wallets) {
      await core
        .connect(wallet)
        .setStake(stakeCourtId, 0, { gasLimit: 5000000 })
        .then((tx) => tx.wait());
    }
    await network.provider.send("evm_increaseTime", [Number(await sortitionModule.stakingDelay())]);
    await network.provider.send("evm_mine");
    await sortitionModule
      .executeDelayedStakes(
        wallets.map((wallet) => wallet.address),
        wallets.map(() => stakeCourtId)
      )
      .then((tx) => tx.wait());
    for (const wallet of wallets) {
      await unstake(wallet);
    }
  };

  const countDraws = async (blockNumber: number) => {
    const draws = await core.queryFilter(core.filters.Draw(), blockNumber, blockNumber);
    return draws.reduce((acc: { [address: string]: number }, draw) => {
      const address = draw.args._address;
      acc[address] = acc[address] ? acc[address] + 1 : 1;
      return acc;
    }, {});
  };

  it("Stakes in parent court and should draw jurors in parent court", async () => {
    const stake = async (wallet: HDNodeWallet) => {
      await core
        .connect(wallet)
        .setStake(PARENT_COURT, ONE_THOUSAND_PNK * 5n, { gasLimit: 5000000 })
        .then((tx) => tx.wait());

      const delayedStake = await sortitionModule.delayedStakes(wallet.address, PARENT_COURT);
      expect(delayedStake.stake).to.equal(ONE_THOUSAND_PNK * 5n);
      expect(delayedStake.pending).to.equal(true);
    };
    let countedDraws: CountedDraws;
    const expectFromDraw = async (drawTx: Promise<ContractTransactionResponse>) => {
      const response = await drawTx;
      const tx = await response.wait();
      if (!tx) throw new Error("Failed to get transaction receipt");
      await expect(response).to.emit(core, "Draw").withArgs(anyValue, 0, 0, 0);
      await expect(response).to.emit(core, "Draw").withArgs(anyValue, 0, 0, 1);
      await expect(response).to.emit(core, "Draw").withArgs(anyValue, 0, 0, 2);
      if (tx?.blockNumber === undefined) throw new Error("txBlockNumber is null");
      countedDraws = await countDraws(tx.blockNumber);
      for (const [address, draws] of Object.entries(countedDraws)) {
        expect(await sortitionModule.getJurorBalance(address)).to.deep.equal([
          ONE_THOUSAND_PNK * 5n, // totalStaked
          parentCourtMinStake * toBigInt(draws), // totalLocked
        ]);
        expect(await sortitionModule.stakeOf(address, PARENT_COURT)).to.equal(ONE_THOUSAND_PNK * 5n);
        expect(await sortitionModule.stakeOf(address, CHILD_COURT)).to.equal(0n);
        expect((await sortitionModule.getJurorCourtIDs(address)).length).to.equal(1);
      }
      expect(await core.getRoundInfo(0, 0).then((round) => round.drawIterations)).to.equal(3);
    };

    const unstake = async (wallet: HDNodeWallet) => {
      const locked = parentCourtMinStake * toBigInt(countedDraws[wallet.address] ?? 0);
      expect(await sortitionModule.getJurorBalance(wallet.address)).to.deep.equal([0n, locked]);
      expect(await sortitionModule.stakeOf(wallet.address, PARENT_COURT)).to.equal(0n);
      expect(await sortitionModule.stakeOf(wallet.address, CHILD_COURT)).to.equal(0n);
      expect((await sortitionModule.getJurorCourtIDs(wallet.address)).length).to.equal(0);
    };

    await draw(stake, PARENT_COURT, PARENT_COURT, expectFromDraw, unstake);
  });

  it("Stakes in parent court and should draw nobody in subcourt [ @skip-on-coverage ]", async () => {
    const stake = async (wallet: HDNodeWallet) => {
      await core
        .connect(wallet)
        .setStake(PARENT_COURT, ONE_THOUSAND_PNK * 5n, { gasLimit: 5000000 })
        .then((tx) => tx.wait());
    };

    const expectFromDraw = async (drawTx: Promise<ContractTransactionResponse>) => {
      await expect(await drawTx).to.not.emit(core, "Draw");
      expect(await core.getRoundInfo(0, 0).then((round) => round.drawIterations)).to.equal(20);
    };

    const unstake = async (wallet: HDNodeWallet) => {
      expect(await sortitionModule.getJurorBalance(wallet.address)).to.deep.equal([0n, 0n]);
      expect(await sortitionModule.stakeOf(wallet.address, PARENT_COURT)).to.equal(0n);
      expect(await sortitionModule.stakeOf(wallet.address, CHILD_COURT)).to.equal(0n);
      expect((await sortitionModule.getJurorCourtIDs(wallet.address)).length).to.equal(0);
    };

    await draw(stake, PARENT_COURT, CHILD_COURT, expectFromDraw, unstake);
  });

  it("Stakes in subcourt and should draw jurors in parent court", async () => {
    const stake = async (wallet: HDNodeWallet) => {
      await core
        .connect(wallet)
        .setStake(CHILD_COURT, ONE_THOUSAND_PNK * 5n, { gasLimit: 5000000 })
        .then((tx) => tx.wait());
    };
    let countedDraws: CountedDraws;
    const expectFromDraw = async (drawTx: Promise<ContractTransactionResponse>) => {
      const response = await drawTx;
      const tx = await response.wait();
      if (!tx) throw new Error("Failed to get transaction receipt");
      await expect(response).to.emit(core, "Draw").withArgs(anyValue, 0, 0, 0);
      await expect(response).to.emit(core, "Draw").withArgs(anyValue, 0, 0, 1);
      await expect(response).to.emit(core, "Draw").withArgs(anyValue, 0, 0, 2);

      countedDraws = await countDraws(tx.blockNumber);
      for (const [address, draws] of Object.entries(countedDraws)) {
        expect(await sortitionModule.getJurorBalance(address)).to.deep.equal([
          ONE_THOUSAND_PNK * 5n, // totalStaked
          parentCourtMinStake * toBigInt(draws), // totalLocked
        ]);
        expect(await sortitionModule.stakeOf(address, PARENT_COURT)).to.equal(0n);
        expect(await sortitionModule.stakeOf(address, CHILD_COURT)).to.equal(ONE_THOUSAND_PNK * 5n);
        expect((await sortitionModule.getJurorCourtIDs(address)).length).to.equal(1);
      }
      expect(await core.getRoundInfo(0, 0).then((round) => round.drawIterations)).to.equal(3);
    };

    const unstake = async (wallet: HDNodeWallet) => {
      const locked = parentCourtMinStake * toBigInt(countedDraws[wallet.address] ?? 0);
      expect(await sortitionModule.getJurorBalance(wallet.address)).to.deep.equal([0n, locked]);
      expect(await sortitionModule.stakeOf(wallet.address, PARENT_COURT)).to.equal(0n);
      expect(await sortitionModule.stakeOf(wallet.address, CHILD_COURT)).to.equal(0n);
      expect((await sortitionModule.getJurorCourtIDs(wallet.address)).length).to.equal(0);
    };

    await draw(stake, CHILD_COURT, PARENT_COURT, expectFromDraw, unstake);
  });

  it("Stakes in subcourt and should draw jurors in subcourt", async () => {
    const stake = async (wallet: HDNodeWallet) => {
      await core
        .connect(wallet)
        .setStake(CHILD_COURT, ONE_THOUSAND_PNK * 5n, { gasLimit: 5000000 })
        .then((tx) => tx.wait());
    };
    let countedDraws: CountedDraws;
    const expectFromDraw = async (drawTx: Promise<ContractTransactionResponse>) => {
      const response = await drawTx;
      const tx = await response.wait();
      if (!tx) throw new Error("Failed to get transaction receipt");
      await expect(response).to.emit(core, "Draw").withArgs(anyValue, 0, 0, 0);
      await expect(response).to.emit(core, "Draw").withArgs(anyValue, 0, 0, 1);
      await expect(response).to.emit(core, "Draw").withArgs(anyValue, 0, 0, 2);

      countedDraws = await countDraws(tx.blockNumber);
      for (const [address, draws] of Object.entries(countedDraws)) {
        expect(await sortitionModule.getJurorBalance(address)).to.deep.equal([
          ONE_THOUSAND_PNK * 5n, // totalStaked
          childCourtMinStake * toBigInt(draws), // totalLocked
        ]);
        expect(await sortitionModule.stakeOf(address, PARENT_COURT)).to.equal(0n);
        expect(await sortitionModule.stakeOf(address, CHILD_COURT)).to.equal(ONE_THOUSAND_PNK * 5n);
        expect((await sortitionModule.getJurorCourtIDs(address)).length).to.equal(1);
      }
      expect(await core.getRoundInfo(0, 0).then((round) => round.drawIterations)).to.equal(3);
    };

    const unstake = async (wallet: HDNodeWallet) => {
      const locked = childCourtMinStake * toBigInt(countedDraws[wallet.address] ?? 0);
      expect(await sortitionModule.getJurorBalance(wallet.address)).to.deep.equal([0n, locked]);
      expect(await sortitionModule.stakeOf(wallet.address, PARENT_COURT)).to.equal(0n);
      expect(await sortitionModule.stakeOf(wallet.address, CHILD_COURT)).to.equal(0n);
      expect((await sortitionModule.getJurorCourtIDs(wallet.address)).length).to.equal(0);
    };

    await draw(stake, CHILD_COURT, CHILD_COURT, expectFromDraw, unstake);
  });
});
