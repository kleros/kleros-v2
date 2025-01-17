import React, { useCallback, useMemo } from "react";
import styled from "styled-components";

import { useParams } from "react-router-dom";
import { useLocalStorage } from "react-use";
import { keccak256, encodePacked } from "viem";
import { useWalletClient, usePublicClient, useConfig } from "wagmi";

import { simulateDisputeKitClassicCastCommit } from "hooks/contracts/generated";
import useSigningAccount from "hooks/useSigningAccount";
import { isUndefined } from "utils/index";
import { wrapWithToast } from "utils/wrapWithToast";

import { useDisputeDetailsQuery } from "queries/useDisputeDetailsQuery";

import OptionsContainer from "./OptionsContainer";

const Container = styled.div`
  width: 100%;
  height: auto;
`;

interface ICommit {
  arbitrable: `0x${string}`;
  voteIDs: string[];
  setIsOpen: (val: boolean) => void;
  refetch: () => void;
}

const Commit: React.FC<ICommit> = ({ arbitrable, voteIDs, setIsOpen, refetch }) => {
  const { id } = useParams();
  const parsedDisputeID = useMemo(() => BigInt(id ?? 0), [id]);
  const parsedVoteIDs = useMemo(() => voteIDs.map((voteID) => BigInt(voteID)), [voteIDs]);
  const { data: disputeData } = useDisputeDetailsQuery(id);
  const currentRoundIndex = disputeData?.dispute?.currentRoundIndex;
  const { data: walletClient } = useWalletClient();
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
      const message = { message: saltKey };
      const rawSalt = !isUndefined(signingAccount)
        ? await signingAccount.signMessage(message)
        : await (async () => {
            const account = await generateSigningAccount();
            return await account?.signMessage(message);
          })();

      if (isUndefined(rawSalt)) return;

      const salt = keccak256(rawSalt);
      setSalt(JSON.stringify({ salt, choice: choice.toString() }));
      const commit = keccak256(encodePacked(["uint256", "uint256"], [BigInt(choice), BigInt(salt)]));
      const { request } = await simulateDisputeKitClassicCastCommit(wagmiConfig, {
        args: [parsedDisputeID, parsedVoteIDs, commit],
      });
      if (walletClient && publicClient) {
        await wrapWithToast(async () => await walletClient.writeContract(request), publicClient).then(({ status }) => {
          setIsOpen(status);
        });
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
    ]
  );

  return id ? (
    <Container>
      <OptionsContainer {...{ arbitrable, handleSelection: handleCommit }} />
    </Container>
  ) : null;
};

export default Commit;
