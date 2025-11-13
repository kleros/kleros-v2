import React, { useCallback, useMemo } from "react";
import styled from "styled-components";

import { useParams } from "react-router-dom";
import { useLocalStorage } from "react-use";
import { encodePacked, keccak256 } from "viem";
import { useConfig, usePublicClient } from "wagmi";

import { simulateDisputeKitClassicCastCommit, simulateDisputeKitGatedCastCommit } from "hooks/contracts/generated";
import useSigningAccount from "hooks/useSigningAccount";
import { isUndefined } from "utils/index";
import { wrapWithToast } from "utils/wrapWithToast";

import { useDisputeDetailsQuery } from "queries/useDisputeDetailsQuery";

import { useWallet } from "src/context/walletProviders";
import { useDisputeKit } from "src/hooks/useContractDisputeKits";
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
  const { providerType } = useWallet();
  const publicClient = usePublicClient();
  const wagmiConfig = useConfig();
  const { signingAccount, generateSigningAccount } = useSigningAccount();
  const { callCommit } = useDisputeKit(disputeData?.dispute?.currentRound.disputeKit.address);
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
      if (providerType !== "lemon") {
        console.log("simulating cast commit");
        const simulate = isGated ? simulateDisputeKitGatedCastCommit : simulateDisputeKitClassicCastCommit;
        await simulate(wagmiConfig, {
          args: [parsedDisputeID, parsedVoteIDs, commit],
        });
      }

      if (publicClient) {
        await wrapWithToast(async () => await callCommit([parsedDisputeID, parsedVoteIDs, commit]), publicClient).then(
          ({ status }) => {
            setIsOpen(status);
          }
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
