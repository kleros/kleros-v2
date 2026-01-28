import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useWalletClient, usePublicClient, useAccount } from "wagmi";

import { executeCommit } from "actions/commit/execute";
import type { CommitParams } from "actions/commit/params";
import { getVoteKey } from "actions/helpers/storage/key";

import { generateSalt } from "utils/crypto/generateSalt";
import { PartialBy } from "utils/types";
import { errorToast, wrapWithToast } from "utils/wrapWithToast";

import { isUndefined } from "src/utils";

import useSigningAccount from "./useSigningAccount";

type CommitVoteParams = PartialBy<CommitParams, "salt">;

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

      if (isUndefined(publicClient)) {
        throw new Error("PublicClient not defined. Is the wallet connected?");
      }

      // ensure we have a signing account
      const signingAccount = _signingAccount ?? (await generateSigningAccount());
      if (!signingAccount) throw new Error("No signing account available");

      // generate salt
      const saltKey = getVoteKey(params.disputeId, params.roundIndex, params.voteIds);

      const message = saltKey;
      const salt = await generateSalt(signingAccount, message);

      const executeParams: CommitParams = { ...params, salt: BigInt(salt) };
      const executeTxn = () => executeCommit(executeParams, { chain, account, walletClient });

      const result = await wrapWithToast(executeTxn, publicClient);

      return result;
    },
    onSuccess: (res) => {
      if (!res.status) return;
      onSuccess?.();
      queryClient.invalidateQueries({ queryKey: ["useDrawQuery"] });
    },
    onError: (err: unknown) => {
      console.error(err);
      if (err instanceof Error) {
        errorToast(err.message);
      }
    },
  });
}
