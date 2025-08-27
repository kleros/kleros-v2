import { type ContractTransaction } from "ethers";
import fs from "fs";
import { type BuilderTransaction, template, transaction, transactionBuilderUrl } from "./tx-builder";

const governableAbi = [
  {
    inputs: [],
    name: "owner",
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

const transactions: BuilderTransaction[] = [];

export const execute = async (tx: ContractTransaction) => {
  const hre = require("hardhat");
  const { ethers } = hre;

  const contract = await ethers.getContractAt(governableAbi, tx.to);
  const owner = await contract.owner();
  const isContract = (await ethers.provider.getCode(owner)).length > 2;
  if (isContract) {
    // Don't execute, just log the tx. It must be submitted for execution separately.
    const { to, value, data } = tx;
    transactions.push(transaction({ to, value, data }));
    console.log("tx = %O", tx);
  } else {
    // Execute the tx
    const signer = (await ethers.getSigners())[0];
    await signer.sendTransaction(tx);
  }
};

export function writeTransactionBatch({ name, outputPath = "tx-batch.json" }: { name: string; outputPath?: string }) {
  if (!name?.trim()) throw new Error("Batch name is required");

  if (!transactions?.length) {
    console.log("No transaction batch to write");
    return;
  }

  try {
    const templateObject = template({ name, transactions });
    fs.writeFileSync(outputPath, JSON.stringify(templateObject, null, 2));
    transactions.length = 0;
    console.log(`Transaction batch written to ${outputPath}`);
    console.log(`The batch can be submitted to the Safe app at: ${transactionBuilderUrl}`);
  } catch (error) {
    throw new Error(`Failed to write transaction batch: ${(error as Error).message}`);
  }
}
