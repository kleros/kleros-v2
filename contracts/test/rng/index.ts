import { expect } from "chai";
import { deployments, ethers, getNamedAccounts, network } from "hardhat";
import {
  IncrementalNG,
  BlockHashRNG,
  ChainlinkRNG,
  ChainlinkVRFCoordinatorV2Mock,
  RandomizerRNG,
  RandomizerMock,
} from "../../typechain-types";

const initialNg = 424242;
const abiCoder = ethers.AbiCoder.defaultAbiCoder();
let deployer: string;

describe("IncrementalNG", async () => {
  let rng: IncrementalNG;

  beforeEach("Setup", async () => {
    const rngFactory = await ethers.getContractFactory("IncrementalNG");
    rng = (await rngFactory.deploy(initialNg)) as IncrementalNG;
  });

  it("Should return a number incrementing each time", async () => {
    expect(await rng.receiveRandomness.staticCall()).to.equal(initialNg);
    await rng.receiveRandomness().then((tx) => tx.wait());
    expect(await rng.receiveRandomness.staticCall()).to.equal(initialNg + 1);
    await rng.receiveRandomness().then((tx) => tx.wait());
    expect(await rng.receiveRandomness.staticCall()).to.equal(initialNg + 2);
    await rng.receiveRandomness().then((tx) => tx.wait());
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
    ({ deployer } = await getNamedAccounts());

    await deployments.fixture(["ChainlinkRNG"], {
      fallbackToGlobal: true,
      keepExistingDeployments: false,
    });
    rng = (await ethers.getContract("ChainlinkRNG")) as ChainlinkRNG;
    vrfCoordinator = (await ethers.getContract("ChainlinkVRFCoordinator")) as ChainlinkVRFCoordinatorV2Mock;

    await rng.changeConsumer(deployer);
  });

  it("Should return a non-zero random number", async () => {
    const requestId = 1;
    const expectedRn = BigInt(ethers.keccak256(abiCoder.encode(["uint256", "uint256"], [requestId, 0])));

    let tx = await rng.requestRandomness();
    await expect(tx).to.emit(rng, "RequestSent").withArgs(requestId);

    tx = await vrfCoordinator.fulfillRandomWords(requestId, rng.target, []);
    await expect(tx).to.emit(rng, "RequestFulfilled").withArgs(requestId, expectedRn);

    const rn = await rng.receiveRandomness();
    expect(rn).to.equal(expectedRn);
    await tx.wait();
  });

  it("Should return only the last random number when multiple requests are made", async () => {
    // First request
    let tx = await rng.requestRandomness();
    const requestId1 = 1;
    await expect(tx).to.emit(rng, "RequestSent").withArgs(requestId1);

    // Second request
    tx = await rng.requestRandomness();
    const requestId2 = 2;
    await expect(tx).to.emit(rng, "RequestSent").withArgs(requestId2);

    // Generate expected random numbers
    const expectedRn1 = BigInt(ethers.keccak256(abiCoder.encode(["uint256", "uint256"], [requestId1, 0])));
    const expectedRn2 = BigInt(ethers.keccak256(abiCoder.encode(["uint256", "uint256"], [requestId2, 0])));
    expect(expectedRn1).to.not.equal(expectedRn2, "Random numbers should be different");

    // Fulfill first request
    tx = await vrfCoordinator.fulfillRandomWords(requestId1, rng.target, []);
    await expect(tx).to.emit(rng, "RequestFulfilled").withArgs(requestId1, expectedRn1);

    // Fulfill second request
    tx = await vrfCoordinator.fulfillRandomWords(requestId2, rng.target, []);
    await expect(tx).to.emit(rng, "RequestFulfilled").withArgs(requestId2, expectedRn2);

    // Should return only the last random number
    const rn = await rng.receiveRandomness();
    expect(rn).to.equal(expectedRn2);
    await tx.wait();
  });
});

describe("RandomizerRNG", async () => {
  let rng: RandomizerRNG;
  let randomizer: RandomizerMock;

  beforeEach("Setup", async () => {
    ({ deployer } = await getNamedAccounts());

    await deployments.fixture(["RandomizerRNG"], {
      fallbackToGlobal: true,
      keepExistingDeployments: false,
    });
    rng = (await ethers.getContract("RandomizerRNG")) as RandomizerRNG;
    randomizer = (await ethers.getContract("RandomizerOracle")) as RandomizerMock;

    await rng.changeConsumer(deployer);
  });

  it("Should return a non-zero random number", async () => {
    const randomBytes = ethers.randomBytes(32);
    const expectedRn = BigInt(ethers.hexlify(randomBytes));
    const requestId = 1;

    let tx = await rng.requestRandomness();
    await expect(tx).to.emit(rng, "RequestSent").withArgs(requestId);

    tx = await randomizer.relay(rng.target, requestId, randomBytes);
    await expect(tx).to.emit(rng, "RequestFulfilled").withArgs(requestId, expectedRn);

    const rn = await rng.receiveRandomness();
    expect(rn).to.equal(expectedRn);
    await tx.wait();
  });

  it("Should return only the last random number when multiple requests are made", async () => {
    // First request
    let tx = await rng.requestRandomness();
    const requestId1 = 1;
    await expect(tx).to.emit(rng, "RequestSent").withArgs(requestId1);

    // Second request
    tx = await rng.requestRandomness();
    const requestId2 = 2;
    await expect(tx).to.emit(rng, "RequestSent").withArgs(requestId2);

    // Generate random bytes and expected numbers for both requests
    const randomBytes1 = ethers.randomBytes(32);
    const randomBytes2 = ethers.randomBytes(32);
    const expectedRn1 = BigInt(ethers.hexlify(randomBytes1));
    const expectedRn2 = BigInt(ethers.hexlify(randomBytes2));

    expect(expectedRn1).to.not.equal(expectedRn2, "Random numbers should be different");

    // Fulfill first request
    tx = await randomizer.relay(rng.target, requestId1, randomBytes1);
    await expect(tx).to.emit(rng, "RequestFulfilled").withArgs(requestId1, expectedRn1);

    // Fulfill second request
    tx = await randomizer.relay(rng.target, requestId2, randomBytes2);
    await expect(tx).to.emit(rng, "RequestFulfilled").withArgs(requestId2, expectedRn2);

    // Should return only the last random number
    const rn = await rng.receiveRandomness();
    expect(rn).to.equal(expectedRn2);
    await tx.wait();
  });
});
