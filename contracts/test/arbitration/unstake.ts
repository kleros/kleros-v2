import { ethers, getNamedAccounts, network, deployments } from "hardhat";
import { BigNumber } from "ethers";
import {
  PNK,
  KlerosCore,
  DisputeKitClassic,
  SortitionModule,
  RandomizerRNG,
  RandomizerMock,
  VRFConsumerV2,
  VRFCoordinatorV2Mock,
} from "../../typechain-types";
import { expect } from "chai";

/* eslint-disable no-unused-vars */
/* eslint-disable no-unused-expressions */

describe("Unstake juror", async () => {
  const ONE_TENTH_ETH = BigNumber.from(10).pow(17);
  const ONE_THOUSAND_PNK = BigNumber.from(10).pow(21);

  // 2nd court, 3 jurors, 1 dispute kit
  const extraData =
    "0x000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000030000000000000000000000000000000000000000000000000000000000000001";

  let deployer;
  let disputeKit;
  let pnk;
  let core;
  let sortitionModule;
  let rng;
  let randomizer;
  let vrfConsumer;
  let vrfCoordinator;

  beforeEach("Setup", async () => {
    ({ deployer } = await getNamedAccounts());
    await deployments.fixture(["Arbitration"], {
      fallbackToGlobal: true,
      keepExistingDeployments: false,
    });
    disputeKit = (await ethers.getContract("DisputeKitClassic")) as DisputeKitClassic;
    pnk = (await ethers.getContract("PNK")) as PNK;
    core = (await ethers.getContract("KlerosCore")) as KlerosCore;
    sortitionModule = (await ethers.getContract("SortitionModule")) as SortitionModule;
    rng = (await ethers.getContract("RandomizerRNG")) as RandomizerRNG;
    randomizer = (await ethers.getContract("RandomizerMock")) as RandomizerMock;
    vrfConsumer = (await ethers.getContract("VRFConsumerV2")) as VRFConsumerV2;
    vrfCoordinator = (await ethers.getContract("VRFCoordinatorV2Mock")) as VRFCoordinatorV2Mock;
  });

  it("Unstake inactive juror - Randomizer", async () => {
    const arbitrationCost = ONE_TENTH_ETH.mul(3);

    await core.createCourt(1, false, ONE_THOUSAND_PNK, 1000, ONE_TENTH_ETH, 3, [0, 0, 0, 0], 3, [1]); // Parent - general court, Classic dispute kit

    await pnk.approve(core.address, ONE_THOUSAND_PNK.mul(4));
    await core.setStake(1, ONE_THOUSAND_PNK.mul(2));
    await core.setStake(2, ONE_THOUSAND_PNK.mul(2));

    expect(await core.getJurorCourtIDs(deployer)).to.be.deep.equal([BigNumber.from("1"), BigNumber.from("2")]);

    await core.functions["createDispute(uint256,bytes)"](2, extraData, { value: arbitrationCost });

    await network.provider.send("evm_increaseTime", [2000]); // Wait for minStakingTime
    await network.provider.send("evm_mine");

    const lookahead = await sortitionModule.rngLookahead();
    await sortitionModule.passPhase(); // Staking -> Generating
    for (let index = 0; index < lookahead; index++) {
      await network.provider.send("evm_mine");
    }

    await randomizer.relay(rng.address, 0, ethers.utils.randomBytes(32));
    await sortitionModule.passPhase(); // Generating -> Drawing

    await core.draw(0, 5000);

    await core.passPeriod(0); // Evidence -> Voting
    await core.passPeriod(0); // Voting -> Appeal
    await core.passPeriod(0); // Appeal -> Execution

    await sortitionModule.passPhase(); // Freezing -> Staking. Change so we don't deal with delayed stakes

    expect(await core.getJurorCourtIDs(deployer)).to.be.deep.equal([BigNumber.from("1"), BigNumber.from("2")]);

    await core.execute(0, 0, 1); // 1 iteration should unstake from both courts

    expect(await core.getJurorCourtIDs(deployer)).to.be.deep.equal([]);
  });

  it("Unstake inactive juror - Chainlink VRF v2", async () => {
    const arbitrationCost = ONE_TENTH_ETH.mul(3);
    const RNG_LOOKAHEAD = 20;

    await sortitionModule.changeRandomNumberGenerator(vrfConsumer.address, RNG_LOOKAHEAD);

    await core.createCourt(1, false, ONE_THOUSAND_PNK, 1000, ONE_TENTH_ETH, 3, [0, 0, 0, 0], 3, [1]); // Parent - general court, Classic dispute kit

    await pnk.approve(core.address, ONE_THOUSAND_PNK.mul(4));
    await core.setStake(1, ONE_THOUSAND_PNK.mul(2));
    await core.setStake(2, ONE_THOUSAND_PNK.mul(2));

    expect(await core.getJurorCourtIDs(deployer)).to.be.deep.equal([BigNumber.from("1"), BigNumber.from("2")]);

    await core.functions["createDispute(uint256,bytes)"](2, extraData, { value: arbitrationCost });

    await network.provider.send("evm_increaseTime", [2000]); // Wait for minStakingTime
    await network.provider.send("evm_mine");

    const lookahead = await sortitionModule.rngLookahead();
    await sortitionModule.passPhase(); // Staking -> Generating
    for (let index = 0; index < lookahead; index++) {
      await network.provider.send("evm_mine");
    }

    const requestId = await vrfConsumer.lastRequestId(); // Needed as we emulate the vrfCoordinator manually
    await vrfCoordinator.fulfillRandomWords(requestId, vrfConsumer.address); // The callback calls sortitionModule.passPhase(); // Generating -> Drawing

    await core.draw(0, 5000);

    await core.passPeriod(0); // Evidence -> Voting
    await core.passPeriod(0); // Voting -> Appeal
    await core.passPeriod(0); // Appeal -> Execution

    await sortitionModule.passPhase(); // Freezing -> Staking. Change so we don't deal with delayed stakes

    expect(await core.getJurorCourtIDs(deployer)).to.be.deep.equal([BigNumber.from("1"), BigNumber.from("2")]);

    await core.execute(0, 0, 1); // 1 iteration should unstake from both courts

    expect(await core.getJurorCourtIDs(deployer)).to.be.deep.equal([]);
  });
});
