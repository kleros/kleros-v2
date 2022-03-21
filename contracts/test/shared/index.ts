import { SignerWithAddress } from "hardhat-deploy-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import type { ContractReceipt } from "ethers";

export const expectEvent = (contractReceipt: ContractReceipt, idx: number = -1) => ({
  named: (eventName: string) => ({
    with(argsToCheck: Record<string, any>) {
      try {
        if (!Array.isArray(contractReceipt.events)) throw new Error();

        let event;
        if (idx >= 0) event = contractReceipt.events[idx].event;
        else {
          for (let i = 0; i < contractReceipt.events.length; i++) {
            event = contractReceipt.events[i];
            if (event.event === eventName) break;
          }
        }

        if (!event || event.event !== eventName) throw new Error();

        for (const arg in argsToCheck) {
          if (!event.args[arg]) throw new Error(arg);
          expect(event.args[arg], `The event '${eventName}' has wrong '${arg}'`).to.equal(argsToCheck[arg]);
        }
      } catch (err: any) {
        if (err.message) expect.fail(`The event '${eventName}' does not have argument '${err.message}'`);
        if (idx === -1) expect.fail(`The event '${eventName}' does not exist`);
        expect.fail(`The event '${eventName}' does not exist on index ${idx}`);
      }
    },
  }),
});

export const getCurrentTimestamp = async () =>
  (await ethers.provider.getBlock(await ethers.provider.getBlockNumber())).timestamp;

export const increaseTime = async (amount: number) =>
  await ethers.provider.send("evm_mine", [(await getCurrentTimestamp()) + amount]);

export const expectGoverned = <C extends Contract, M extends keyof C["functions"]>(contract: C, method: M) => ({
  withRealAndFakeGovernor: (governor: SignerWithAddress, other: SignerWithAddress) => ({
    async args(...args: Parameters<C[M]>) {
      await expect(contract.connect(other)[method as any](...args)).to.be.reverted;
      await expect(contract.connect(governor)[method as any](...args)).to.not.be.reverted;
    },
  }),
});

export const getSortitionSumTreeLibrary = async (deployer: SignerWithAddress) => {
  // Typechain isn't dealing with solidity libraries very nicely...
  const SST_LOCATION = "src/data-structures/SortitionSumTreeFactory.sol:SortitionSumTreeFactory";

  const factory = await ethers.getContractFactory("SortitionSumTreeFactory", deployer);
  const sortitionSumTreeLibrary = await factory.deploy();
  return { [SST_LOCATION]: sortitionSumTreeLibrary.address };
};

export const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min) + min);
