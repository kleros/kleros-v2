import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useWalletClient, usePublicClient, useAccount } from "wagmi";

import { executeCommit } from "actions/commit/execute";
import type {
  ClassicCommitParams,
  CommitParams,
  GatedCommitParams,
  GatedShutterCommitParams,
  ShutterCommitParams,
} from "actions/commit/params";

import { generateSalt, getSaltKey } from "utils/crypto/generateSalt";
import { wrapWithToast } from "utils/wrapWithToast";

import { isUndefined } from "src/utils";

import useSigningAccount from "./useSigningAccount";

type CommitVoteParams =
  | Omit<ClassicCommitParams, "salt">
  | Omit<ShutterCommitParams, "salt">
  | Omit<GatedCommitParams, "salt">
  | Omit<GatedShutterCommitParams, "salt">;

export function useCastCommit(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { signingAccount: _signingAccount, generateSigningAccount } = useSigningAccount();
  const { address: account, chain } = useAccount();

  return useMutation({
    mutationFn: async (params: CommitVoteParams) => {
      if (isUndefined(account)) {
        throw new Error("Account not defined. Is the wallet connected?");
      }
      if (isUndefined(chain)) {
        throw new Error("Chain not defined. Is the wallet connected?");
      }

      if (isUndefined(walletClient)) {
        throw new Error("WalletClient not defined. Is the wallet connected?");
      }

      // ensure we have a signing account
      const signingAccount = _signingAccount ?? (await generateSigningAccount());
      if (!signingAccount) throw new Error("No signing account available");

      // generate salt
      const saltKey = getSaltKey(params.disputeId, params.roundIndex, params.voteIds);

      const message = saltKey;
      const salt = await generateSalt(signingAccount, message);

      localStorage.setItem(saltKey, JSON.stringify({ salt, choice: params.choice.toString() }));

      const executeParams: CommitParams = { ...params, salt: BigInt(salt) };
      const executeTxn = () => executeCommit(executeParams, { chain, account, walletClient });

      const result = await wrapWithToast(executeTxn, publicClient!);

      return result;
    },
    onSuccess: () => {
      onSuccess?.();
      queryClient.invalidateQueries({ queryKey: ["useDrawQuery"] });
    },
    onError: (err: unknown) => {
      console.error(err);
    },
  });
}
