import React, { useCallback, useMemo, useState } from "react";
import styled from "styled-components";

import ReactMarkdown from "react-markdown";
import { useParams } from "react-router-dom";
import { useLocalStorage } from "react-use";
import { encodePacked, keccak256, PrivateKeyAccount } from "viem";
import { useWalletClient, usePublicClient, useConfig } from "wagmi";

import { Button } from "@kleros/ui-components-library";

import { simulateDisputeKitClassicCastVote } from "hooks/contracts/generated";
import { usePopulatedDisputeData } from "hooks/queries/usePopulatedDisputeData";
import useSigningAccount from "hooks/useSigningAccount";
import { isUndefined } from "utils/index";
import { wrapWithToast, catchShortMessage } from "utils/wrapWithToast";

import { useDisputeDetailsQuery } from "queries/useDisputeDetailsQuery";

import InfoCard from "components/InfoCard";

import JustificationArea from "./JustificationArea";

const Container = styled.div`
  width: 100%;
  height: auto;
`;

const StyledInfoCard = styled(InfoCard)`
  margin: 16px 0;
`;

const StyledButton = styled(Button)`
  margin: 16px auto;
`;

interface IReveal {
  arbitrable: `0x${string}`;
  voteIDs: string[];
  setIsOpen: (val: boolean) => void;
  commit: string;
  isRevealPeriod: boolean;
}

const Reveal: React.FC<IReveal> = ({ arbitrable, voteIDs, setIsOpen, commit, isRevealPeriod }) => {
  const { id } = useParams();
  const [isSending, setIsSending] = useState(false);
  const parsedDisputeID = useMemo(() => BigInt(id ?? 0), [id]);
  const parsedVoteIDs = useMemo(() => voteIDs.map((voteID) => BigInt(voteID)), [voteIDs]);
  const { data: disputeData } = useDisputeDetailsQuery(id);
  const [justification, setJustification] = useState("");
  const { data: disputeDetails } = usePopulatedDisputeData(id, arbitrable);
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const wagmiConfig = useConfig();
  const { signingAccount, generateSigningAccount } = useSigningAccount();
  const currentRoundIndex = disputeData?.dispute?.currentRoundIndex;
  const saltKey = useMemo(
    () => `dispute-${id}-round-${currentRoundIndex}-voteids-${voteIDs}`,
    [id, currentRoundIndex, voteIDs]
  );
  const [storedSaltAndChoice, _] = useLocalStorage<string>(saltKey);

  const handleReveal = useCallback(async () => {
    setIsSending(true);
    const { salt, choice } = isUndefined(storedSaltAndChoice)
      ? await getSaltAndChoice(signingAccount, generateSigningAccount, saltKey, disputeDetails.answers, commit)
      : JSON.parse(storedSaltAndChoice);
    if (isUndefined(choice)) return;
    const { request } = await catchShortMessage(
      simulateDisputeKitClassicCastVote(wagmiConfig, {
        args: [parsedDisputeID, parsedVoteIDs, BigInt(choice), BigInt(salt), justification],
      })
    );
    if (request && walletClient) {
      await wrapWithToast(async () => await walletClient.writeContract(request), publicClient).then(({ status }) => {
        setIsOpen(status);
      });
    }
    setIsSending(false);
  }, [
    wagmiConfig,
    commit,
    disputeDetails?.answers,
    storedSaltAndChoice,
    generateSigningAccount,
    signingAccount,
    saltKey,
    justification,
    parsedVoteIDs,
    parsedDisputeID,
    publicClient,
    setIsOpen,
    walletClient,
  ]);

  return (
    <Container>
      {isUndefined(commit) ? (
        <StyledInfoCard msg="Failed to commit on time." />
      ) : isRevealPeriod ? (
        <>
          <ReactMarkdown>{disputeDetails?.question}</ReactMarkdown>
          <JustificationArea {...{ justification, setJustification }} />
          <StyledButton
            variant="secondary"
            text="Justify & Reveal"
            disabled={isSending || isUndefined(disputeDetails)}
            isLoading={isSending}
            onClick={handleReveal}
          />
        </>
      ) : (
        <StyledInfoCard msg="Your vote was successfully commited, please wait until reveal period to reveal it." />
      )}
    </Container>
  );
};

const getSaltAndChoice = async (
  signingAccount: PrivateKeyAccount | undefined,
  generateSigningAccount: () => Promise<PrivateKeyAccount | undefined> | undefined,
  saltKey: string,
  answers: { title: string; description: string }[],
  commit: string
) => {
  const message = { message: saltKey };
  const rawSalt = !isUndefined(signingAccount)
    ? await signingAccount.signMessage(message)
    : await (async () => {
        const account = await generateSigningAccount();
        return await account?.signMessage(message);
      })();
  if (isUndefined(rawSalt)) return;
  const salt = keccak256(rawSalt);

  answers.unshift({ title: "Refuse To Arbitrate", description: "Refuse To Arbitrate" });
  const { choice } = answers.reduce<{ found: boolean; choice: number }>(
    (acc, _, i) => {
      if (acc.found) return acc;
      const innerCommit = keccak256(encodePacked(["uint256", "uint256"], [BigInt(i), BigInt(salt)]));
      if (innerCommit === commit) {
        return { found: true, choice: i };
      } else return acc;
    },
    { found: false, choice: -1 }
  );
  return { salt, choice };
};

export default Reveal;
