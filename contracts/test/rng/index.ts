import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber } from "ethers";

describe("IncrementalNG", async () => {
  it("Should return a number incrementing each time", async () => {
    const IncrementalNG = await ethers.getContractFactory("IncrementalNG");
    const initialNg = 424242;
    const incrementalNG = await IncrementalNG.deploy(initialNg);
    await incrementalNG.deployed();

    expect(await incrementalNG.callStatic.receiveRandomness(689376)).to.equal(initialNg);
    await incrementalNG.receiveRandomness(29543);
    expect(await incrementalNG.callStatic.receiveRandomness(5894382)).to.equal(initialNg + 1);
    await incrementalNG.receiveRandomness(0);
    expect(await incrementalNG.callStatic.receiveRandomness(3465)).to.equal(initialNg + 2);
    await incrementalNG.receiveRandomness(BigNumber.from(2).pow(255));
    expect(await incrementalNG.callStatic.receiveRandomness(0)).to.equal(initialNg + 3);
  });
});
