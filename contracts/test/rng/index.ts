import { expect } from "chai";
import { ethers } from "hardhat";

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
