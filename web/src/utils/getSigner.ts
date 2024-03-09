import { providers } from "ethers";
import { useMemo } from "react";
import type { Account, Chain, Client, Transport } from "viem";
import { useWalletClient } from "wagmi";

export function clientToSigner(client: Client<Transport, Chain, Account>, chainId: number) {
  const { account, transport } = client;
  const network = {
    chainId: chainId,
    name: "custom",
  };
  const provider = new providers.Web3Provider(transport, network);
  const signer = provider.getSigner(account.address);
  return signer;
}

/** Hook to convert a Viem Client to an ethers.js Signer. */
export function useEthersSigner({ chainId }: { chainId: number }) {
  const { data: client } = useWalletClient();
  return useMemo(() => (client ? clientToSigner(client, chainId) : undefined), [client, chainId]);
}
