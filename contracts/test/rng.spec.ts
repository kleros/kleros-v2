import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { ConstantNG__factory, IncrementalNG__factory } from "../typechain-types";

describe("Number Generators", () => {
  describe("ConstantNG", function () {
    it("Should return always the same number", async function () {
      const [deployer] = await ethers.getSigners();
      const constantRNG = await new ConstantNG__factory(deployer).deploy(42);

      expect(await constantRNG.getRN(0)).to.equal(42);
      expect(await constantRNG.getRN(0)).to.equal(42);
      expect(await constantRNG.getRN(437280)).to.equal(42);
      expect(await constantRNG.getRN(437280)).to.equal(42);
    });
  });

  describe("IncrementalNG", function () {
    it("Should return a number incrementing each time", async function () {
      const [deployer] = await ethers.getSigners();
      const incrementalNG = await new IncrementalNG__factory(deployer).deploy();

      expect(await incrementalNG.callStatic.getRN(689376)).to.equal(0);
      await incrementalNG.getRN(29543);
      expect(await incrementalNG.callStatic.getRN(5894382)).to.equal(1);
      await incrementalNG.getRN(0);
      expect(await incrementalNG.callStatic.getRN(3465)).to.equal(2);
      await incrementalNG.getRN(BigNumber.from(2).pow(255));
      expect(await incrementalNG.callStatic.getRN(0)).to.equal(3);
    });
  });
});
