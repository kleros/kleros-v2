import { expect } from "chai";
import { deployments, ethers, network } from "hardhat";
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

describe("IncrementalNG", async () => {
  let rng: IncrementalNG;

  beforeEach("Setup", async () => {
    const rngFactory = await ethers.getContractFactory("IncrementalNG");
    rng = (await rngFactory.deploy(initialNg)) as IncrementalNG;
  });

  it("Should return a number incrementing each time", async () => {
    expect(await rng.receiveRandomness.staticCall(689376)).to.equal(initialNg);
    await rng.receiveRandomness(29543);
    expect(await rng.receiveRandomness.staticCall(5894382)).to.equal(initialNg + 1);
    await rng.receiveRandomness(0);
    expect(await rng.receiveRandomness.staticCall(3465)).to.equal(initialNg + 2);
    await rng.receiveRandomness(2n ** 255n);
    expect(await rng.receiveRandomness.staticCall(0)).to.equal(initialNg + 3);
  });
});

describe("BlockHashRNG", async () => {
  let rng: BlockHashRNG;

  beforeEach("Setup", async () => {
    const rngFactory = await ethers.getContractFactory("BlockHashRNG");
    rng = (await rngFactory.deploy()) as BlockHashRNG;
  });

  it("Should return a non-zero number for a block number in the past", async () => {
    const tx = await rng.receiveRandomness(5);
    const trace = await network.provider.send("debug_traceTransaction", [tx.hash]);
    const [rn] = abiCoder.decode(["uint"], ethers.getBytes(`${trace.returnValue}`));
    expect(rn).to.not.equal(0);
  });

  it("Should return zero for a block number in the future", async () => {
    const tx = await rng.receiveRandomness(9876543210);
    const trace = await network.provider.send("debug_traceTransaction", [tx.hash]);
    const [rn] = abiCoder.decode(["uint"], ethers.getBytes(`${trace.returnValue}`));
    expect(rn).to.equal(0);
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

    let tx = await rng.requestRandomness(0);
    await expect(tx).to.emit(rng, "RequestSent").withArgs(requestId);

    tx = await vrfCoordinator.fulfillRandomWords(requestId, rng.target, []);
    await expect(tx).to.emit(rng, "RequestFulfilled").withArgs(requestId, expectedRn);

    const rn = await rng.receiveRandomness(0);
    expect(rn).to.equal(expectedRn);
  });

  it("Should return only the last random number when multiple requests are made", async () => {
    // First request
    let tx = await rng.requestRandomness(0);
    const requestId1 = 1;
    await expect(tx).to.emit(rng, "RequestSent").withArgs(requestId1);

    // Second request
    tx = await rng.requestRandomness(0);
    const requestId2 = 2;
    await expect(tx).to.emit(rng, "RequestSent").withArgs(requestId2);

    // Generate expected random numbers
    const expectedRn1 = BigInt(
      ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(["uint256", "uint256"], [requestId1, 0]))
    );
    const expectedRn2 = BigInt(
      ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(["uint256", "uint256"], [requestId2, 0]))
    );
    expect(expectedRn1).to.not.equal(expectedRn2, "Random numbers should be different");

    // Fulfill first request
    tx = await vrfCoordinator.fulfillRandomWords(requestId1, rng.target, []);
    await expect(tx).to.emit(rng, "RequestFulfilled").withArgs(requestId1, expectedRn1);

    // Fulfill second request
    tx = await vrfCoordinator.fulfillRandomWords(requestId2, rng.target, []);
    await expect(tx).to.emit(rng, "RequestFulfilled").withArgs(requestId2, expectedRn2);

    // Should return only the last random number
    const rn = await rng.receiveRandomness(0);
    expect(rn).to.equal(expectedRn2);
  });
});

describe("RandomizerRNG", async () => {
  let rng: RandomizerRNG;
  let randomizer: RandomizerMock;

  beforeEach("Setup", async () => {
    await deployments.fixture(["RandomizerRNG"], {
      fallbackToGlobal: true,
      keepExistingDeployments: false,
    });
    rng = (await ethers.getContract("RandomizerRNG")) as RandomizerRNG;
    randomizer = (await ethers.getContract("RandomizerOracle")) as RandomizerMock;
  });

  it("Should return a non-zero random number", async () => {
    const randomBytes = ethers.randomBytes(32);
    const expectedRn = BigInt(ethers.hexlify(randomBytes));
    const requestId = 1;

    let tx = await rng.requestRandomness(0);
    await expect(tx).to.emit(rng, "RequestSent").withArgs(requestId);

    tx = await randomizer.relay(rng.target, requestId, randomBytes);
    await expect(tx).to.emit(rng, "RequestFulfilled").withArgs(requestId, expectedRn);

    const rn = await rng.receiveRandomness(0);
    expect(rn).to.equal(expectedRn);
  });

  it("Should return only the last random number when multiple requests are made", async () => {
    // First request
    let tx = await rng.requestRandomness(0);
    const requestId1 = 1;
    await expect(tx).to.emit(rng, "RequestSent").withArgs(requestId1);

    // Second request
    tx = await rng.requestRandomness(0);
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
    const rn = await rng.receiveRandomness(0);
    expect(rn).to.equal(expectedRn2);
  });
});
