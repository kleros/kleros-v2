import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { deployments, ethers, getNamedAccounts, network } from "hardhat";
import { BigNumber, ContractTransaction, Wallet } from "ethers";
import {
  PNK,
  KlerosCore,
  ArbitrableExample,
  HomeGateway,
  DisputeKitClassic,
  RandomizerRNG,
  RandomizerMock,
  SortitionModule,
} from "../../typechain-types";
import { expect } from "chai";

/* eslint-disable no-unused-vars */
/* eslint-disable no-unused-expressions */ // https://github.com/standard/standard/issues/690#issuecomment-278533482

// FIXME: This test fails on Github actions, cannot figure why, skipping for now.
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
  let randomizer;

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
    rng = (await ethers.getContract("RandomizerRNG")) as RandomizerRNG;
    randomizer = (await ethers.getContract("RandomizerMock")) as RandomizerMock;
    sortitionModule = (await ethers.getContract("SortitionModule")) as SortitionModule;

    // CourtId 2
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

  type SetStake = (wallet: Wallet) => Promise<void>;
  type ExpectFromDraw = (drawTx: Promise<ContractTransaction>) => Promise<void>;

  const draw = async (setStake: SetStake, createDisputeCourtId: string, expectFromDraw: ExpectFromDraw) => {
    const arbitrationCost = ONE_TENTH_ETH.mul(3);
    const [bridger] = await ethers.getSigners();

    // Stake some jurors
    for (let i = 0; i < 16; i++) {
      const wallet = ethers.Wallet.createRandom().connect(ethers.provider);

      await bridger.sendTransaction({
        to: wallet.address,
        value: ethers.utils.parseEther("10"),
      });
      expect(await wallet.getBalance()).to.equal(ethers.utils.parseEther("10"));

      await pnk.transfer(wallet.address, ONE_THOUSAND_PNK.mul(10));
      expect(await pnk.balanceOf(wallet.address)).to.equal(ONE_THOUSAND_PNK.mul(10));

      await pnk.connect(wallet).approve(core.address, ONE_THOUSAND_PNK.mul(10), { gasLimit: 300000 });

      await setStake(wallet);
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

    await randomizer.relay(rng.address, 0, ethers.utils.randomBytes(32));
    await sortitionModule.passPhase(); // Generating -> Drawing

    await expectFromDraw(core.draw(0, 1000, { gasLimit: 1000000 }));
  };

  it("Stakes in parent court and should draw jurors in parent court", async () => {
    const setStake = async (wallet: Wallet) => {
      await core.connect(wallet).setStake(1, ONE_THOUSAND_PNK.mul(5), { gasLimit: 5000000 });
    };

    const expectFromDraw = async (drawTx: Promise<ContractTransaction>) => {
      await expect(drawTx)
        .to.emit(core, "Draw")
        .withArgs(anyValue, 0, 0, 0)
        .to.emit(core, "Draw")
        .withArgs(anyValue, 0, 0, 1)
        .to.emit(core, "Draw")
        .withArgs(anyValue, 0, 0, 2);
    };

    await draw(setStake, "1", expectFromDraw);
  });

  it("Stakes in parent court and should draw nobody in subcourt", async () => {
    const setStake = async (wallet: Wallet) => {
      await core.connect(wallet).setStake(1, ONE_THOUSAND_PNK.mul(5), { gasLimit: 5000000 });
    };

    const expectFromDraw = async (drawTx: Promise<ContractTransaction>) => {
      await expect(drawTx).to.not.emit(core, "Draw");
    };

    await draw(setStake, "2", expectFromDraw);
  });

  it("Stakes in subcourt and should draw jurors in parent court", async () => {
    const setStake = async (wallet: Wallet) => {
      await core.connect(wallet).setStake(2, ONE_THOUSAND_PNK.mul(5), { gasLimit: 5000000 });
    };

    const expectFromDraw = async (drawTx: Promise<ContractTransaction>) => {
      await expect(drawTx)
        .to.emit(core, "Draw")
        .withArgs(anyValue, 0, 0, 0)
        .to.emit(core, "Draw")
        .withArgs(anyValue, 0, 0, 1)
        .to.emit(core, "Draw")
        .withArgs(anyValue, 0, 0, 2);
    };

    await draw(setStake, "1", expectFromDraw);
  });

  it("Stakes in subcourt and should draw jurors in subcourt", async () => {
    const setStake = async (wallet: Wallet) => {
      await core.connect(wallet).setStake(2, ONE_THOUSAND_PNK.mul(5), { gasLimit: 5000000 });
    };

    const expectFromDraw = async (drawTx: Promise<ContractTransaction>) => {
      await expect(drawTx)
        .to.emit(core, "Draw")
        .withArgs(anyValue, 0, 0, 0)
        .to.emit(core, "Draw")
        .withArgs(anyValue, 0, 0, 1)
        .to.emit(core, "Draw")
        .withArgs(anyValue, 0, 0, 2);
    };

    await draw(setStake, "2", expectFromDraw);
  });
});
