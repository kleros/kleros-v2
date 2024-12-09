import { expect } from "chai";
import { deployments, ethers, network } from "hardhat";
import { IncrementalNG, BlockHashRNG, ChainlinkRNG, ChainlinkVRFCoordinatorV2Mock } from "../../typechain-types";

const initialNg = 424242;
const abiCoder = ethers.AbiCoder.defaultAbiCoder();

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
    const rngFactory = await ethers.getContractFactory("BlockHashRNG");
    rng = (await rngFactory.deploy(1)) as BlockHashRNG;
  });

  it("Should return a non-zero number for a block number", async () => {
    const tx = await rng.receiveRandomness();
    const trace = await network.provider.send("debug_traceTransaction", [tx.hash]);
    const [rn] = abiCoder.decode(["uint"], ethers.getBytes(`${trace.returnValue}`));
    expect(rn).to.not.equal(0);
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
