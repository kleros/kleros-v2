import { expect } from "chai";
import { ethers, network } from "hardhat";
import { toBigInt } from "ethers";
import { IncrementalNG, BlockHashRNG } from "../../typechain-types";

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
    await rng.receiveRandomness(toBigInt(2) ** toBigInt(255));
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
    const tx = await rng.receiveRandomness(9876543210);
    const trace = await network.provider.send("debug_traceTransaction", [tx.hash]);
    const [rn] = abiCoder.decode(["uint"], ethers.getBytes(`${trace.returnValue}`));
    expect(rn).to.equal(0);
  });

  it("Should return zero for a block number in the future", async () => {
    const tx = await rng.receiveRandomness(5);
    const trace = await network.provider.send("debug_traceTransaction", [tx.hash]);
    const [rn] = abiCoder.decode(["uint"], ethers.getBytes(`${trace.returnValue}`));
    expect(rn).to.not.equal(0);
  });
});
