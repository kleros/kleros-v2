import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber } from "ethers";

const ONE_ETH = BigNumber.from(10).pow(18);
const WINNER_STAKE_MULTIPLIER = 3000;
const LOSER_STAKE_MULTIPLIER = 7000;
const MULTIPLIER_DENOMINATOR = 10000;

describe("DisputeKitClassic", async () => {
  // eslint-disable-next-line no-unused-vars
  let deployer, claimant, supporter, challenger, innocentBystander;
  let core, disputeKit, arbitrable;

  before("Deploying", async () => {
    [deployer, claimant, supporter, challenger, innocentBystander] = await ethers.getSigners();
    [core, disputeKit, arbitrable] = await deployContracts(deployer);
  });

  it("Should create a dispute", async () => {
    await expect(disputeKit.connect(deployer).createDispute(0, 0, 3, "0x00")).to.be.revertedWith(
      "Access not allowed: KlerosCore only."
    );

    await expect(core.connect(deployer).createDispute(2, "0x00", { value: 1000 }))
      .to.emit(core, "DisputeCreation")
      .withArgs(0, deployer.address);

    await disputeKit.disputes(0).then((disputes) => {
      expect(BigNumber.from(Object.values(disputes)[0])).to.equal(2);
    });

    console.log(`choice 0: ${await disputeKit.getRoundInfo(0, 0, 0)}`);
    console.log(`choice 1: ${await disputeKit.getRoundInfo(0, 0, 1)}`);
    console.log(`choice 2: ${await disputeKit.getRoundInfo(0, 0, 2)}`);
  });
});

async function deployContracts(deployer) {
  const constantNGFactory = await ethers.getContractFactory("ConstantNG", deployer);
  const rng = await constantNGFactory.deploy(42);
  await rng.deployed();

  const disputeKitFactory = await ethers.getContractFactory("DisputeKitClassic", deployer);
  const disputeKit = await disputeKitFactory.deploy(
    deployer.address,
    ethers.constants.AddressZero, // KlerosCore is set later once it is deployed
    rng.address
  );
  await disputeKit.deployed();

  const sortitionSumTreeLibraryFactory = await ethers.getContractFactory("SortitionSumTreeFactory", deployer);
  const library = await sortitionSumTreeLibraryFactory.deploy();

  const klerosCoreFactory = await ethers.getContractFactory("KlerosCore", {
    signer: deployer,
    libraries: {
      SortitionSumTreeFactory: library.address,
    },
  });
  const core = await klerosCoreFactory.deploy(
    deployer.address,
    ethers.constants.AddressZero, // should be an ERC20
    ethers.constants.AddressZero, // should be a Juror Prosecution module
    disputeKit.address,
    [120, 120], // minStakingTime, maxFreezingTime
    false,
    [200, 10000, 100, 3],
    [0, 0, 0, 0],
    3
  );
  await core.deployed();

  await disputeKit.changeCore(core.address);

  const ArbitrableFactory = await ethers.getContractFactory("ArbitrableExample", deployer);
  const arbitrable = await ArbitrableFactory.deploy(core.address, "uri://metaevidence.json");
  await arbitrable.deployed();

  return [core, disputeKit, arbitrable];
}
