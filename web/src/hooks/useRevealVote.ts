import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useWalletClient, usePublicClient, useAccount } from "wagmi";

import { removeCommitData } from "actions/helpers/storage";
import { getVoteKey } from "actions/helpers/storage/key";
import { executeReveal } from "actions/reveal/execute";
import { ResolveRevealContext, RevealParams } from "actions/reveal/params";
import { resolveRevealInputs } from "actions/reveal/resolveRevealInputs";

import { DistributiveOmit, PartialBy } from "utils/types";
import { errorToast, wrapWithToast } from "utils/wrapWithToast";

import { isUndefined } from "src/utils";

import useSigningAccount from "./useSigningAccount";

type RevealVoteMutation = {
  // in case of recovery, juror may provide a new justification. choice and salt are handled internally
  params: DistributiveOmit<PartialBy<RevealParams, "justification">, "choice" | "salt">;
  context: Pick<ResolveRevealContext, "commit" | "answers">;
};

export function useRevealVote(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { signingAccount, generateSigningAccount } = useSigningAccount();
  const { address: account, chain } = useAccount();

  return useMutation({
    mutationFn: async ({ params, context }: RevealVoteMutation) => {
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

      const executeParams = await resolveRevealInputs(params, { ...context, signingAccount, generateSigningAccount });

      const executeTxn = () => executeReveal(executeParams, { chain, account, walletClient });

      const result = await wrapWithToast(executeTxn, publicClient);

      // we can't put this inside execute as a sent transaction can still fail,
      // so we do it here with confirmation
      if (result.status) {
        const key = getVoteKey(params.disputeId, params.roundIndex, params.voteIds);
        removeCommitData(key);
      }

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
