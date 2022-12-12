import { expect } from "chai";
import { ethers, network } from "hardhat";
import { BigNumber } from "ethers";
import { IncrementalNG, BlockHashRNG } from "../../typechain-types";

let rng, rngFactory;
const initialNg = 424242;

describe("IncrementalNG", async () => {
  beforeEach("Setup", async () => {
    rngFactory = await ethers.getContractFactory("IncrementalNG");
    rng = (await rngFactory.deploy(initialNg)) as IncrementalNG;
    await rng.deployed();
  });

  it("Should return a number incrementing each time", async () => {
    expect(await rng.callStatic.receiveRandomness(689376)).to.equal(initialNg);
    await rng.receiveRandomness(29543);
    expect(await rng.callStatic.receiveRandomness(5894382)).to.equal(initialNg + 1);
    await rng.receiveRandomness(0);
    expect(await rng.callStatic.receiveRandomness(3465)).to.equal(initialNg + 2);
    await rng.receiveRandomness(BigNumber.from(2).pow(255));
    expect(await rng.callStatic.receiveRandomness(0)).to.equal(initialNg + 3);
  });
});

describe("BlockHashRNG", async () => {
  beforeEach("Setup", async () => {
    rngFactory = await ethers.getContractFactory("BlockHashRNG");
    rng = (await rngFactory.deploy()) as BlockHashRNG;
    await rng.deployed();
  });

  it("Should return a non-zero number for a block number in the past", async () => {
    const tx = await rng.receiveRandomness(9876543210);
    const trace = await network.provider.send("debug_traceTransaction", [tx.hash]);
    const [rn] = ethers.utils.defaultAbiCoder.decode(["uint"], `0x${trace.returnValue}`);
    expect(rn).to.equal(0);
  });

  it("Should return zero for a block number in the future", async () => {
    const tx = await rng.receiveRandomness(5);
    const trace = await network.provider.send("debug_traceTransaction", [tx.hash]);
    const [rn] = ethers.utils.defaultAbiCoder.decode(["uint"], `0x${trace.returnValue}`);
    expect(rn).to.not.equal(0);
  });
});
