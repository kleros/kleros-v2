import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useWalletClient, usePublicClient, useAccount } from "wagmi";

import { executeFundAppeal } from "actions/fundAppeal/execute";
import type { FundAppealParams } from "actions/fundAppeal/params";

import { errorToast, wrapWithToast } from "utils/wrapWithToast";

import { isUndefined } from "src/utils";

export function useFundAppeal(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { address: account, chain } = useAccount();

  return useMutation({
    mutationFn: async (params: FundAppealParams) => {
      if (isUndefined(account)) {
        throw new Error("Account not defined. Is the wallet connected?");
      }
      if (isUndefined(chain)) {
        throw new Error("Chain not defined. Is the wallet connected?");
      }

      if (isUndefined(walletClient)) {
        throw new Error("WalletClient not defined. Is the wallet connected?");
      }

      if (isUndefined(publicClient)) {
        throw new Error("PublicClient not defined. Is the wallet connected?");
      }

      const executeTxn = () => executeFundAppeal(params, { chain, account, walletClient });

      const result = await wrapWithToast(executeTxn, publicClient);

      return result;
    },
    onSuccess: (res) => {
      if (!res.status) return;
      onSuccess?.();
      queryClient.invalidateQueries({ queryKey: ["useClassicAppealQuery"] });
    },
    onError: (err: unknown) => {
      console.error(err);
      if (err instanceof Error) {
        errorToast(err.message);
      }
    },
  });
}
