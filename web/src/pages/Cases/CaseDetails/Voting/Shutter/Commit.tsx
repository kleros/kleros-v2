import React, { useCallback, useMemo, useState } from "react";
import styled from "styled-components";

import { useParams } from "react-router-dom";
import { useLocalStorage } from "react-use";
import { keccak256, stringToHex, encodeAbiParameters } from "viem";
import { useWalletClient, usePublicClient, useConfig } from "wagmi";

import {
  simulateDisputeKitGatedShutterCastCommitShutter,
  simulateDisputeKitShutterCastCommitShutter,
} from "hooks/contracts/generated";
import { useCountdown } from "hooks/useCountdown";
import useSigningAccount from "hooks/useSigningAccount";
import { isUndefined } from "utils/index";
import { encrypt } from "utils/shutter";
import { wrapWithToast } from "utils/wrapWithToast";

import { DisputeDetailsQuery } from "queries/useDisputeDetailsQuery";

import { getDeadline } from "../../Timeline";
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
  dispute: DisputeDetailsQuery["dispute"];
  currentPeriodIndex: number;
  isGated: boolean;
}

const SEPARATOR = "-";

/**
 * This hashing function must be follow the same logic as DisputeKitClassic.hashVote()
 */
const hashVote = (choice: bigint, salt: bigint, justification: string): `0x${string}` => {
  const justificationHash = keccak256(stringToHex(justification));

  // Encode and hash the parameters together (mimics Solidity's abi.encode)
  const encodedParams = encodeAbiParameters(
    [
      { type: "uint256" }, // choice
      { type: "uint256" }, // salt
      { type: "bytes32" }, // justificationHash
    ],
    [choice, salt, justificationHash]
  );

  return keccak256(encodedParams);
};

const Commit: React.FC<ICommit> = ({
  arbitrable,
  voteIDs,
  setIsOpen,
  refetch,
  dispute,
  currentPeriodIndex,
  isGated,
}) => {
  const { id } = useParams();
  const parsedDisputeID = useMemo(() => BigInt(id ?? 0), [id]);
  const parsedVoteIDs = useMemo(() => voteIDs.map((voteID) => BigInt(voteID)), [voteIDs]);
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const wagmiConfig = useConfig();
  const { signingAccount, generateSigningAccount } = useSigningAccount();
  const [justification, setJustification] = useState("");
  const saltKey = useMemo(() => `shutter-dispute-${id}-voteids-${voteIDs}`, [id, voteIDs]);
  const [_, setSalt] = useLocalStorage(saltKey);
  const deadlineCommitPeriod = getDeadline(
    currentPeriodIndex,
    dispute?.lastPeriodChange,
    dispute?.court.timesPerPeriod
  );
  const countdownToVotingPeriod = useCountdown(deadlineCommitPeriod);

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
      setSalt(JSON.stringify({ salt, choice: choice.toString(), justification }));

      const encodedMessage = `${choice.toString()}${SEPARATOR}${salt}${SEPARATOR}${justification}`;
      /* an extra 300 seconds (5 minutes) of decryptionDelay is enforced after Commit period is over
      to avoid premature decryption and voting attacks if no one passes the Commit period quickly */
      const decryptionDelay = countdownToVotingPeriod ?? 0 + 300;
      const { encryptedCommitment, identity } = await encrypt(encodedMessage, decryptionDelay);

      const commitHash = hashVote(choice, BigInt(salt), justification);

      let request;
      if (isGated) {
        request = await simulateDisputeKitGatedShutterCastCommitShutter(wagmiConfig, {
          args: [parsedDisputeID, parsedVoteIDs, commitHash, identity as `0x${string}`, encryptedCommitment],
        });
      } else {
        request = await simulateDisputeKitShutterCastCommitShutter(wagmiConfig, {
          args: [parsedDisputeID, parsedVoteIDs, commitHash, identity as `0x${string}`, encryptedCommitment],
        });
      }

      if (walletClient && publicClient) {
        await wrapWithToast(async () => await walletClient.writeContract(request), publicClient).then(({ status }) => {
          setIsOpen(status);
        });
      }
      refetch();
    },
    [
      wagmiConfig,
      justification,
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
      countdownToVotingPeriod,
      isGated,
    ]
  );

  return id ? (
    <Container>
      <OptionsContainer
        {...{
          arbitrable,
          justification,
          setJustification,
          handleSelection: handleCommit,
        }}
      />
    </Container>
  ) : null;
};

export default Commit;
