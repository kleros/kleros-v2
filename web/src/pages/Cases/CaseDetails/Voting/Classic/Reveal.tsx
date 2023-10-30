import React, { useCallback, useMemo, useState } from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import { useLocalStorage } from "react-use";
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

const getSaltAndChoice = (signingAccount, generateSigningAccount, saltKey) => {
  return { salt: "0x", choice: "1" };
};

interface IReveal {
  arbitrable: `0x${string}`;
  voteIDs: string[];
  setIsOpen: (val: boolean) => void;
}

const Reveal: React.FC<IReveal> = ({ arbitrable, voteIDs, setIsOpen }) => {
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
    const { salt, choice } = isUndefined(storedSaltAndChoice)
      ? getSaltAndChoice(signingAccount, generateSigningAccount, saltKey)
      : JSON.parse(storedSaltAndChoice);
    const { request } = await prepareWriteDisputeKitClassic({
      functionName: "castVote",
      args: [parsedDisputeID, parsedVoteIDs, BigInt(choice), BigInt(salt), justification],
    });
    if (walletClient) {
      wrapWithToast(async () => await walletClient.writeContract(request), publicClient).then(() => {
        setIsOpen(true);
      });
    }
  }, [
    storedSaltAndChoice,
    generateSigningAccount,
    signingAccount,
    saltKey,
    disputeData?.dispute?.currentRoundIndex,
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
          setIsSending(true);
          handleReveal();
        }}
      />
    </Container>
  );
};

export default Reveal;
