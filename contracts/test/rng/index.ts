import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber } from "ethers";

describe("ConstantNG", async () => {
  it("Should return always the same number", async () => {
    const ConstantRNG = await ethers.getContractFactory("ConstantNG");
    const constantRNG = await ConstantRNG.deploy(42);
    await constantRNG.deployed();

    expect(await constantRNG.getRN(0)).to.equal(42);
    expect(await constantRNG.getRN(0)).to.equal(42);
    expect(await constantRNG.getRN(437280)).to.equal(42);
    expect(await constantRNG.getRN(437280)).to.equal(42);
  });
});

describe("IncrementalNG", async () => {
  it("Should return a number incrementing each time", async () => {
    const IncrementalNG = await ethers.getContractFactory("IncrementalNG");
    const initialNg = 424242;
    const incrementalNG = await IncrementalNG.deploy(initialNg);
    await incrementalNG.deployed();

    expect(await incrementalNG.callStatic.getRN(689376)).to.equal(initialNg);
    await incrementalNG.getRN(29543);
    expect(await incrementalNG.callStatic.getRN(5894382)).to.equal(initialNg + 1);
    await incrementalNG.getRN(0);
    expect(await incrementalNG.callStatic.getRN(3465)).to.equal(initialNg + 2);
    await incrementalNG.getRN(BigNumber.from(2).pow(255));
    expect(await incrementalNG.callStatic.getRN(0)).to.equal(initialNg + 3);
  });
});
