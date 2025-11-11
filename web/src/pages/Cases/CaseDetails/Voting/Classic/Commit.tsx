import React, { useCallback, useMemo } from "react";
import styled from "styled-components";

import { useParams } from "react-router-dom";
import { useLocalStorage } from "react-use";
import { encodePacked, keccak256, TransactionReceipt } from "viem";
import { useConfig, usePublicClient, useWalletClient } from "wagmi";

import { simulateDisputeKitClassicCastCommit, simulateDisputeKitGatedCastCommit } from "hooks/contracts/generated";
import useSigningAccount from "hooks/useSigningAccount";
import { isUndefined } from "utils/index";
import { wrapWithToast } from "utils/wrapWithToast";

import { useDisputeDetailsQuery } from "queries/useDisputeDetailsQuery";

import { useWallet } from "~src/context/walletProviders";
import OptionsContainer from "../OptionsContainer";

const Container = styled.div`
  width: 100%;
  height: auto;
`;

interface ICommit {
  arbitrable: `0x${string}`;
  voteIDs: string[];
  setIsOpen: (val: boolean) => void;
  refetch: () => void;
  isGated: boolean;
}

const Commit: React.FC<ICommit> = ({ arbitrable, voteIDs, setIsOpen, refetch, isGated }) => {
  const { id } = useParams();
  const parsedDisputeID = useMemo(() => BigInt(id ?? 0), [id]);
  const parsedVoteIDs = useMemo(() => voteIDs.map((voteID) => BigInt(voteID)), [voteIDs]);
  const { data: disputeData } = useDisputeDetailsQuery(id);
  const currentRoundIndex = disputeData?.dispute?.currentRoundIndex;
  const { data: walletClient } = useWalletClient();
  const { sendTransaction } = useWallet();
  const publicClient = usePublicClient();
  const wagmiConfig = useConfig();
  const { signingAccount, generateSigningAccount } = useSigningAccount();
  const saltKey = useMemo(
    () => `dispute-${id}-round-${currentRoundIndex}-voteids-${voteIDs}`,
    [id, currentRoundIndex, voteIDs]
  );
  const [_, setSalt] = useLocalStorage(saltKey);

  const handleCommit = useCallback(
    async (choice: bigint) => {
      console.log("handling commit");
      const message = { message: saltKey };
      console.log("signingAccount", signingAccount);
      const rawSalt = !isUndefined(signingAccount)
        ? await signingAccount.signMessage(message)
        : await (async () => {
            const account = await generateSigningAccount();
            console.log("handleCommit, account signing", account);
            return await account?.signMessage(message);
          })();

      if (isUndefined(rawSalt)) return;

      const salt = keccak256(rawSalt);
      setSalt(JSON.stringify({ salt, choice: choice.toString() }));
      const commit = keccak256(encodePacked(["uint256", "uint256"], [BigInt(choice), BigInt(salt)]));

      const simulate = isGated ? simulateDisputeKitGatedCastCommit : simulateDisputeKitClassicCastCommit;

      const { request } = await simulate(wagmiConfig, {
        args: [parsedDisputeID, parsedVoteIDs, commit],
      });
      console.log("commit", request);
      if (publicClient) {
        await wrapWithToast(
          async () =>
            await sendTransaction({
              chain: request.chain,
              to: request.address,
              functionName: request.functionName,
              abi: request.abi,
            }),
          publicClient
        );
      }
      refetch();
    },
    [
      wagmiConfig,
      saltKey,
      setSalt,
      parsedVoteIDs,
      parsedDisputeID,
      publicClient,
      setIsOpen,
      walletClient,
      generateSigningAccount,
      signingAccount,
      refetch,
      isGated,
    ]
  );

  return id ? (
    <Container>
      <OptionsContainer {...{ arbitrable, handleSelection: handleCommit }} />
    </Container>
  ) : null;
};

export default Commit;
