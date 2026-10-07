import { useCallback } from "react";

import { useSendTransaction } from "@privy-io/react-auth";
import { type Abi, type Address, encodeFunctionData, type Hash, type Hex } from "viem";
import { useConfig } from "wagmi";
import { writeContract } from "wagmi/actions";

import { useEmbeddedWallet } from "hooks/useIsEmbeddedWallet";

/** Request object produced by wagmi's `simulate*` / `useSimulate*`. */
export interface IWriteRequest {
  address: Address;
  abi: Abi;
  functionName: string;
  args?: readonly unknown[];
  value?: bigint;
  chainId?: number;
}

interface IPrivyTransaction {
  to: Address;
  data: Hex;
  value?: bigint;
  chainId?: number;
}

export interface IWriteRequestDeps {
  /** Set whenever the user has a Privy embedded wallet. */
  embeddedAddress?: Address;
  sendPrivyTransaction: (
    tx: IPrivyTransaction,
    options: { sponsor: boolean; uiOptions: { showWalletUIs: boolean }; address: Address }
  ) => Promise<{ hash: Hash }>;
  writeWagmi: (request: IWriteRequest) => Promise<Hash>;
}

/**
 * Embedded wallets send a silent, gas-sponsored transaction through Privy.
 * External wallets keep the plain wagmi path (own prompt, own gas).
 */
export const routeWriteRequest = async (request: IWriteRequest, deps: IWriteRequestDeps): Promise<Hash> => {
  const { embeddedAddress, sendPrivyTransaction, writeWagmi } = deps;
  if (!embeddedAddress) return writeWagmi(request);

  const data = encodeFunctionData({ abi: request.abi, functionName: request.functionName, args: request.args });
  const { hash } = await sendPrivyTransaction(
    { to: request.address, data, value: request.value, chainId: request.chainId },
    { sponsor: true, uiOptions: { showWalletUIs: false }, address: embeddedAddress }
  );
  return hash;
};

export const useWriteRequest = () => {
  const config = useConfig();
  const embeddedWallet = useEmbeddedWallet();
  const { sendTransaction } = useSendTransaction();
  const embeddedAddress = embeddedWallet?.address as Address | undefined;

  const writeRequest = useCallback(
    (request: IWriteRequest) =>
      routeWriteRequest(request, {
        embeddedAddress,
        sendPrivyTransaction: (tx, options) => sendTransaction(tx, options),
        writeWagmi: (req) => writeContract(config, req as Parameters<typeof writeContract>[1]),
      }),
    [config, embeddedAddress, sendTransaction]
  );

  return writeRequest;
};
