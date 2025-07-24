import { expect } from "chai";
import { deployments, ethers, network } from "hardhat";
import { IncrementalNG, BlockHashRNG, ChainlinkRNG, ChainlinkVRFCoordinatorV2Mock } from "../../typechain-types";

const initialNg = 424242;

describe("IncrementalNG", async () => {
  let rng: IncrementalNG;

  beforeEach("Setup", async () => {
    const rngFactory = await ethers.getContractFactory("IncrementalNG");
    rng = (await rngFactory.deploy(initialNg)) as IncrementalNG;
  });

  it("Should return a number incrementing each time", async () => {
    expect(await rng.receiveRandomness.staticCall()).to.equal(initialNg);
    await rng.receiveRandomness();
    expect(await rng.receiveRandomness.staticCall()).to.equal(initialNg + 1);
    await rng.receiveRandomness();
    expect(await rng.receiveRandomness.staticCall()).to.equal(initialNg + 2);
    await rng.receiveRandomness();
    expect(await rng.receiveRandomness.staticCall()).to.equal(initialNg + 3);
  });
});

describe("BlockHashRNG", async () => {
  let rng: BlockHashRNG;

  beforeEach("Setup", async () => {
    const [deployer] = await ethers.getSigners();
    await deployments.delete("BlockHashRNG");
    await deployments.deploy("BlockHashRNG", {
      from: deployer.address,
      args: [deployer.address, deployer.address, 10], // governor, consumer, lookaheadTime (seconds)
    });
    rng = await ethers.getContract<BlockHashRNG>("BlockHashRNG");
  });

  it("Should return a non-zero number after requesting and waiting", async () => {
    // First request randomness
    await rng.requestRandomness();

    // Check that it's not ready yet
    expect(await rng.isRandomnessReady()).to.be.false;

    // Advance time by 10 seconds (the lookahead time)
    await network.provider.send("evm_increaseTime", [10]);
    await network.provider.send("evm_mine");

    // Now it should be ready
    expect(await rng.isRandomnessReady()).to.be.true;

    // Get the random number
    const randomNumber = await rng.receiveRandomness.staticCall();
    expect(randomNumber).to.not.equal(0);
  });

  it("Should return 0 if randomness not requested", async () => {
    const randomNumber = await rng.receiveRandomness.staticCall();
    expect(randomNumber).to.equal(0);
  });

  it("Should return 0 if not enough time has passed", async () => {
    await rng.requestRandomness();

    // Don't advance time enough
    await network.provider.send("evm_increaseTime", [5]); // Only 5 seconds
    await network.provider.send("evm_mine");

    const randomNumber = await rng.receiveRandomness.staticCall();
    expect(randomNumber).to.equal(0);
  });
});

describe("ChainlinkRNG", async () => {
  let rng: ChainlinkRNG;
  let vrfCoordinator: ChainlinkVRFCoordinatorV2Mock;

  beforeEach("Setup", async () => {
    await deployments.fixture(["ChainlinkRNG"], {
      fallbackToGlobal: true,
      keepExistingDeployments: false,
    });
    rng = (await ethers.getContract("ChainlinkRNG")) as ChainlinkRNG;
    vrfCoordinator = (await ethers.getContract("ChainlinkVRFCoordinator")) as ChainlinkVRFCoordinatorV2Mock;
  });

  it("Should return a non-zero random number", async () => {
    const requestId = 1;
    const expectedRn = BigInt(
      ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(["uint256", "uint256"], [requestId, 0]))
    );

    let tx = await rng.requestRandomness();
    await expect(tx).to.emit(rng, "RequestSent").withArgs(requestId);

    tx = await vrfCoordinator.fulfillRandomWords(requestId, rng.target, []);
    await expect(tx).to.emit(rng, "RequestFulfilled").withArgs(requestId, expectedRn);

    const rn = await rng.receiveRandomness();
    expect(rn).to.equal(expectedRn);
  });
});
