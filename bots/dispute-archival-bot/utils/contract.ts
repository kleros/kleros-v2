import { createPublicClient, createWalletClient, type Hex, type Address } from "viem";
import { getEnvConfig } from "../config";
import { privateKeyToAccount } from "viem/accounts";
import { alchemyTransport } from "./rpc";
import { arbitrumSepolia } from "viem/chains";
import { disputeArchiveAbi } from "../abi/DisputeArchive";

// WARNING: temporary
export const CHAIN = arbitrumSepolia;

const getClients = () => {
  const config = getEnvConfig();

  const account = privateKeyToAccount(config.privateKey as Hex);

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

export async function registerCid(disputeId: string, courtId: string, cid: string) {
  const { publicClient, walletClient, account } = getClients();
  const config = getEnvConfig();

  const { request } = await publicClient.simulateContract({
    account,
    address: config.disputeArchiveAddress as Address,
    abi: disputeArchiveAbi,
    functionName: "register",
    args: [BigInt(disputeId), BigInt(courtId), cid],
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
