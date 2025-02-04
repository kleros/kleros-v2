import { type ContractTransaction } from "ethers";

const governableAbi = [
  {
    inputs: [],
    name: "governor",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

export const execute = async (tx: ContractTransaction) => {
  const hre = require("hardhat");
  const { ethers } = hre;

  const contract = await ethers.getContractAt(governableAbi, tx.to);
  const governor = await contract.governor();
  const isContract = (await ethers.provider.getCode(governor)).length > 2;
  if (isContract) {
    // Don't execute, just log the tx. It must be submitted for execution separately.
    console.log("tx = %O", tx);
  } else {
    // Execute the tx
    const signer = (await ethers.getSigners())[0];
    await signer.sendTransaction(tx);
  }
};
