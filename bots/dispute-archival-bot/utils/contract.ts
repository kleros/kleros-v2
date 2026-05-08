import { createPublicClient, createWalletClient, type Address } from "viem";
import { getEnvConfig } from "../config.ts";
import { privateKeyToAccount } from "viem/accounts";
import { alchemyTransport } from "./rpc.ts";
import { arbitrumSepolia } from "viem/chains";
import { disputeArchiveAbi } from "../abi/DisputeArchive.ts";

// WARNING: temporary
export const CHAIN = arbitrumSepolia;

const getClients = () => {
  const config = getEnvConfig();

  const account = privateKeyToAccount(`0x${config.privateKey}`);

  return {
    publicClient: createPublicClient({
      chain: CHAIN,
      transport: alchemyTransport(CHAIN.id),
    }),
    walletClient: createWalletClient({
      account,
      chain: CHAIN,
      transport: alchemyTransport(CHAIN.id),
    }),
    account,
  };
};

export async function registerCid(disputeId: string, cid: string) {
  const { publicClient, walletClient, account } = getClients();
  const config = getEnvConfig();

  const { request } = await publicClient.simulateContract({
    account,
    address: config.disputeArchiveAddress as Address,
    abi: disputeArchiveAbi,
    functionName: "register",
    args: [BigInt(disputeId), cid],
  });

  const hash = await walletClient.writeContract(request);

  const receipt = await publicClient.waitForTransactionReceipt({
    hash,
  });

  if (receipt.status !== "success") {
    throw new Error("Transaction failed");
  }

  return hash;
}

// checks if the dispute was already archived
export async function isDisputeArchived(disputeId: string) {
  const { publicClient } = getClients();
  const config = getEnvConfig();

  const res = await publicClient.readContract({
    address: config.disputeArchiveAddress as Address,
    abi: disputeArchiveAbi,
    functionName: "archivedDisputeToCid",
    args: [BigInt(disputeId)],
  });

  return res.length !== 0;
}
