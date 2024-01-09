import React, { useCallback, useMemo, useState } from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import { useLocalStorage } from "react-use";
import { encodePacked, keccak256, PrivateKeyAccount } from "viem";
import { useWalletClient, usePublicClient } from "wagmi";
import ReactMarkdown from "react-markdown";
import { Button } from "@kleros/ui-components-library";
import { prepareWriteDisputeKitClassic } from "hooks/contracts/generated";
import { wrapWithToast } from "utils/wrapWithToast";
import { useDisputeDetailsQuery } from "queries/useDisputeDetailsQuery";
import JustificationArea from "./JustificationArea";
import { isUndefined } from "utils/index";
import { useDisputeTemplate } from "queries/useDisputeTemplate";
import useSigningAccount from "hooks/useSigningAccount";

const Container = styled.div`
  width: 100%;
  height: auto;
`;

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

interface IReveal {
  arbitrable: `0x${string}`;
  voteIDs: string[];
  setIsOpen: (val: boolean) => void;
  commit: string;
}

const Reveal: React.FC<IReveal> = ({ arbitrable, voteIDs, setIsOpen, commit }) => {
  const { id } = useParams();
  const [isSending, setIsSending] = useState(false);
  const parsedDisputeID = useMemo(() => BigInt(id ?? 0), [id]);
  const parsedVoteIDs = useMemo(() => voteIDs.map((voteID) => BigInt(voteID)), [voteIDs]);
  const { data: disputeData } = useDisputeDetailsQuery(id);
  const [justification, setJustification] = useState("");
  const { data: disputeTemplate } = useDisputeTemplate(id, arbitrable);
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
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
      ? await getSaltAndChoice(signingAccount, generateSigningAccount, saltKey, disputeTemplate.answers, commit)
      : JSON.parse(storedSaltAndChoice);
    if (isUndefined(choice)) return;
    const { request } = await prepareWriteDisputeKitClassic({
      functionName: "castVote",
      args: [parsedDisputeID, parsedVoteIDs, BigInt(choice), BigInt(salt), justification],
    });
    if (request && walletClient) {
      await wrapWithToast(async () => await walletClient.writeContract(request), publicClient).then((result) => {
        setIsOpen(result);
      });
    }
    setIsSending(false);
  }, [
    commit,
    disputeTemplate?.answers,
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
      <ReactMarkdown>{disputeTemplate.question}</ReactMarkdown>
      <JustificationArea {...{ justification, setJustification }} />
      <Button
        variant="secondary"
        text="Justify & Reveal"
        disabled={isSending}
        isLoading={isSending}
        onClick={async () => {
          handleReveal();
        }}
      />
    </Container>
  );
};

export default Reveal;
