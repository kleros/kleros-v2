import { useWalletContext } from "../context";
import type { WalletProviderHook } from "../interfaces";

/**
 * Hook principal para acceder a la funcionalidad del wallet
 * Debe ser usado dentro de un WalletProvider
 */
export function useWallet(): WalletProviderHook {
  return useWalletContext();
}
