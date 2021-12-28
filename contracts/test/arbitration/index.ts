import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber } from "ethers";

const ONE_ETH = BigNumber.from(10).pow(18);
const WINNER_STAKE_MULTIPLIER = 3000;
const LOSER_STAKE_MULTIPLIER = 7000;
const MULTIPLIER_DENOMINATOR = 10000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe("DisputeKitPlurality", function () {
  // eslint-disable-next-line no-unused-vars
  let deployer, claimant, supporter, challenger, innocentBystander; 
  let core, disputeKit, arbitrable;

  before("Deploying", async () => {
    [deployer, claimant, supporter, challenger, innocentBystander] = await ethers.getSigners();
    [core, disputeKit, arbitrable] = await deployContracts(deployer);

    // To wait for eth gas reporter to fetch data. Remove this line when the issue is fixed. https://github.com/cgewecke/hardhat-gas-reporter/issues/72
    // await sleep(9000); 
  });

  it("Should create a dispute", async function () {
    await expect(disputeKit.connect(deployer).createDispute(0, 0, 0, 0, 0, 0, "0x00"))
      .to.be.revertedWith("Not allowed: sender is not core");

    await expect(core.connect(deployer).createDispute(2, "0x00", { value: 1000 }))
      .to.emit(core, "DisputeCreation")
      .withArgs(0, deployer.address);

    console.log(await disputeKit.disputes(0));
    console.log(`votes=${await disputeKit.getVotes(0)}`);
    console.log(`votes=${await disputeKit.getVotesLength(0)}`);
    console.log(`voteCounter=${await disputeKit.getVoteCounter(0)}`);
  });
});


async function deployContracts(deployer) {
  const MockKlerosCoreFactory = await ethers.getContractFactory("MockKlerosCore", deployer);
  const core = await MockKlerosCoreFactory.deploy();
  await core.deployed();

  const ConstantNGFactory = await ethers.getContractFactory("ConstantNG", deployer);
  const rng = await ConstantNGFactory.deploy(42);
  await rng.deployed();

  const disputeKitFactory = await ethers.getContractFactory("DisputeKitPlurality", deployer);
  const disputeKit = await disputeKitFactory.deploy(core.address, rng.address);
  await disputeKit.deployed();

  await core.registerDisputeKit(disputeKit.address);

  const ArbitrableFactory = await ethers.getContractFactory("ArbitrableExample", deployer);
  const arbitrable = await ArbitrableFactory.deploy(core.address);
  await arbitrable.deployed();

  return [core, disputeKit, arbitrable];
}
