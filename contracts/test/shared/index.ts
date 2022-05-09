import { SignerWithAddress } from "hardhat-deploy-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import type { ContractReceipt } from "ethers";
import { keccak256, randomBytes } from "ethers/lib/utils";

export const checkContract = <C extends Contract, F extends keyof C["callStatic"]>(
  contract: C,
  method: F,
  ...args: Parameters<C[F]>
) => ({
  async for(argsToCheck: Partial<Awaited<ReturnType<C[F]>>>) {
    const entity = await contract[method](...args);
    for (const arg in argsToCheck) {
      if (Array.isArray(entity[arg]))
        expect(entity[arg], `Calling '${method}' returned incorrect '${arg}' parameter`).to.eql(argsToCheck[arg]);
      else expect(entity[arg], `Calling '${method}' returned incorrect '${arg}' parameter`).to.equal(argsToCheck[arg]);
    }
  },
});

export const expectEvent = (contractReceipt: ContractReceipt, idx: number = -1) => ({
  named: (eventName: string) => ({
    with(argsToCheck: Record<string, any>) {
      if (!Array.isArray(contractReceipt.events)) expect.fail(`No events emitted`);

      let event;
      if (idx >= 0) event = contractReceipt.events[idx].event;
      else {
        for (let i = 0; i < contractReceipt.events.length; i++) {
          event = contractReceipt.events[i];
          if (event.event === eventName) break;
        }
      }

      if (!event || event.event !== eventName) expect.fail(`The event '${eventName}' does not exist`);

      for (const arg in argsToCheck) {
        if (!event.args[arg]) expect.fail(`The event '${eventName}' does not exist on index ${idx}`);
        expect(event.args[arg], `The event '${eventName}' has wrong '${arg}'`).to.equal(argsToCheck[arg]);
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

export const generateCommitFromVote = (choice: number) => {
  const salt = randomBytes(32);
  return [keccak256([choice, ...salt]), salt];
};
