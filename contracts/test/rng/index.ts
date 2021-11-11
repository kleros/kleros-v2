import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber } from "ethers";

describe("ConstantNG", function () {
  it("Should return always the same number", async function () {
    const ConstantRNG = await ethers.getContractFactory("ConstantNG");
    const constantRNG = await ConstantRNG.deploy(42);
    await constantRNG.deployed();

    expect(await constantRNG.getRN(0)).to.equal(42);
    expect(await constantRNG.getRN(0)).to.equal(42);
    expect(await constantRNG.getRN(437280)).to.equal(42);
    expect(await constantRNG.getRN(437280)).to.equal(42);
  });
});

describe("IncrementalNG", function () {
  it("Should return a number incrementing each time", async function () {
    const IncrementalNG = await ethers.getContractFactory("IncrementalNG");
    const incrementalNG = await IncrementalNG.deploy();
    await incrementalNG.deployed();

    expect(await incrementalNG.callStatic.getRN(689376)).to.equal(0);
    await incrementalNG.getRN(29543);
    expect(await incrementalNG.callStatic.getRN(5894382)).to.equal(1);
    await incrementalNG.getRN(0);
    expect(await incrementalNG.callStatic.getRN(3465)).to.equal(2);
    await incrementalNG.getRN(BigNumber.from(2).pow(255));
    expect(await incrementalNG.callStatic.getRN(0)).to.equal(3);
  });
});
