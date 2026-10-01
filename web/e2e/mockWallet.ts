import type { Page } from "@playwright/test";
import { createWalletClient, hexToString, http, isHex, type Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { arbitrumSepolia } from "viem/chains";

import { rpcUrl } from "./chain";

export const MOCK_WALLET_NAME = "E2E Wallet";

/**
 * Injects an EIP-1193 provider (window.ethereum + EIP-6963 announcement) backed by a local viem account.
 * Reads are forwarded to the Alchemy RPC; signing and sending happen in the Node test process.
 */
export const installMockWallet = async (page: Page, privateKey: Hex, walletName: string = MOCK_WALLET_NAME) => {
  const account = privateKeyToAccount(privateKey);
  const wallet = createWalletClient({ account, chain: arbitrumSepolia, transport: http(rpcUrl()) });
  let chainId = arbitrumSepolia.id;
  const log: { method: string; hash?: string }[] = [];
  /** Every signing/sending request the wallet received, whether or not it was fulfilled. */
  const signingRequests: string[] = [];
  const signingMethods = /^(eth_sendTransaction|eth_sign|personal_sign|eth_signTypedData.*|eth_sendRawTransaction)$/;

  await page.exposeFunction("__e2eWalletRequest", async (method: string, params: any[] = []) => {
    if (signingMethods.test(method)) signingRequests.push(method);
    switch (method) {
      case "eth_requestAccounts":
      case "eth_accounts":
        return [account.address];
      case "eth_chainId":
        return `0x${chainId.toString(16)}`;
      case "net_version":
        return String(chainId);
      case "wallet_switchEthereumChain":
        chainId = parseInt(params[0].chainId, 16);
        if (chainId !== arbitrumSepolia.id) throw Object.assign(new Error("Unrecognized chain"), { code: 4902 });
        return null;
      case "wallet_addEthereumChain":
        return null;
      case "personal_sign": {
        const [message] = params as [string];
        return await account.signMessage({ message: isHex(message) ? { raw: message } : message });
      }
      case "eth_sign":
        return await account.signMessage({ message: { raw: params[1] } });
      case "eth_signTypedData_v4":
      case "eth_signTypedData": {
        const typed = typeof params[1] === "string" ? JSON.parse(params[1]) : params[1];
        const { EIP712Domain: _ignored, ...types } = typed.types;
        return await account.signTypedData({
          domain: typed.domain,
          types,
          primaryType: typed.primaryType,
          message: typed.message,
        });
      }
      case "eth_sendTransaction": {
        const tx = params[0];
        const hash = await wallet.sendTransaction({
          to: tx.to,
          data: tx.data,
          value: tx.value ? BigInt(tx.value) : undefined,
          gas: tx.gas ? BigInt(tx.gas) : undefined,
        });
        log.push({ method, hash });
        return hash;
      }
      default:
        return await wallet.request({ method, params } as any);
    }
  });

  await page.addInitScript(
    ({ name, address }) => {
      const listeners: Record<string, Set<(...a: unknown[]) => void>> = {};
      const provider = {
        isMetaMask: false,
        isE2EWallet: true,
        selectedAddress: address,
        request: async ({ method, params }: { method: string; params?: unknown[] }) => {
          const result = await (window as any).__e2eWalletRequest(method, params ?? []);
          if (method === "wallet_switchEthereumChain")
            listeners["chainChanged"]?.forEach((l) => l((params as any)[0].chainId));
          return result;
        },
        on: (event: string, fn: (...a: unknown[]) => void) => ((listeners[event] ??= new Set()).add(fn), provider),
        removeListener: (event: string, fn: (...a: unknown[]) => void) => (listeners[event]?.delete(fn), provider),
        off: (event: string, fn: (...a: unknown[]) => void) => (listeners[event]?.delete(fn), provider),
        addListener: (event: string, fn: (...a: unknown[]) => void) => (
          (listeners[event] ??= new Set()).add(fn), provider
        ),
      };
      const icon =
        "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiI+PHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsPSIjMDBhIi8+PC9zdmc+";
      const info = { uuid: "e2e00000-0000-4000-8000-000000000001", name, icon, rdns: "xyz.kleros.e2e" };
      const announce = () =>
        window.dispatchEvent(
          new CustomEvent("eip6963:announceProvider", { detail: Object.freeze({ info, provider }) })
        );
      window.addEventListener("eip6963:requestProvider", announce);
      (window as any).ethereum = provider;
      announce();
    },
    { name: walletName, address: account.address }
  );

  return { account, log, signingRequests };
};
