import React, { useCallback, useMemo, useState } from "react";
import styled from "styled-components";

import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useLocalStorage } from "react-use";
import { encodePacked, keccak256, PrivateKeyAccount } from "viem";
import { useWalletClient, usePublicClient, useConfig } from "wagmi";

import { Answer } from "@kleros/kleros-sdk";
import { Button } from "@kleros/ui-components-library";

import { DisputeKits } from "consts/index";
import {
  simulateDisputeKitClassicCastVote,
  simulateDisputeKitGatedCastVote,
  simulateDisputeKitGatedArgentinaConsumerProtectionCastVote,
} from "hooks/contracts/generated";
import { usePopulatedDisputeData } from "hooks/queries/usePopulatedDisputeData";
import useSigningAccount from "hooks/useSigningAccount";
import { isUndefined } from "utils/index";
import { wrapWithToast, catchShortMessage } from "utils/wrapWithToast";

import { useDisputeDetailsQuery } from "queries/useDisputeDetailsQuery";

import { EnsureChain } from "components/EnsureChain";
import InfoCard from "components/InfoCard";
import MarkdownEditor from "components/MarkdownEditor";
import MarkdownRenderer from "components/MarkdownRenderer";

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

const StyledEnsureChain = styled(EnsureChain)`
  margin: 8px auto;
`;

const MarkdownWrapper = styled.div``;
interface IReveal {
  arbitrable?: `0x${string}`;
  voteIDs: string[];
  setIsOpen: (val: boolean) => void;
  commit: string;
  isRevealPeriod: boolean;
  isGated: boolean;
  disputeKitName?: DisputeKits;
}

const Reveal: React.FC<IReveal> = ({ arbitrable, voteIDs, setIsOpen, commit, isRevealPeriod, isGated }) => {
  const { t } = useTranslation();
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
      ? await getSaltAndChoice(signingAccount, generateSigningAccount, saltKey, disputeDetails?.answers ?? [], commit)
      : JSON.parse(storedSaltAndChoice);
    if (isUndefined(choice)) return;

    const simulate =
      disputeKitName === DisputeKits.ArgentinaConsumerProtection
        ? simulateDisputeKitGatedArgentinaConsumerProtectionCastVote
        : isGated
          ? simulateDisputeKitGatedCastVote
          : simulateDisputeKitClassicCastVote;
    const { request } = await catchShortMessage(
      simulate(wagmiConfig, {
        args: [parsedDisputeID, parsedVoteIDs, BigInt(choice), BigInt(salt), justification],
      })
    );
    if (request && walletClient && publicClient) {
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
    isGated,
    disputeKitName,
  ]);

  return (
    <Container>
      {isUndefined(commit) ? (
        <StyledInfoCard msg={t("voting.failed_to_commit")} />
      ) : isRevealPeriod ? (
        <>
          <MarkdownWrapper dir="auto">
            <MarkdownRenderer content={disputeDetails?.question ?? ""} />
          </MarkdownWrapper>
          <MarkdownEditor value={justification} onChange={setJustification} />
          <StyledEnsureChain>
            <StyledButton
              variant="secondary"
              text={t("buttons.justify_and_reveal")}
              disabled={isSending || isUndefined(disputeDetails)}
              isLoading={isSending}
              onClick={handleReveal}
            />
          </StyledEnsureChain>
        </>
      ) : (
        <StyledInfoCard msg={t("voting.vote_successfully_committed")} />
      )}
    </Container>
  );
};

const getSaltAndChoice = async (
  signingAccount: PrivateKeyAccount | undefined,
  generateSigningAccount: () => Promise<PrivateKeyAccount | undefined> | undefined,
  saltKey: string,
  answers: Answer[],
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

  // when dispute is invalid, just add RFA to the answers array
  const candidates =
    answers?.length > 0
      ? answers
      : [{ id: "0x0", title: "Refuse to Arbitrate", description: "Refuse to Arbitrate" } as Answer];

  const { choice } = candidates.reduce<{ found: boolean; choice: bigint }>(
    (acc, answer) => {
      if (acc.found) return acc;
      const innerCommit = keccak256(encodePacked(["uint256", "uint256"], [BigInt(answer.id), BigInt(salt)]));
      if (innerCommit === commit) {
        return { found: true, choice: BigInt(answer.id) };
      } else return acc;
    },
    { found: false, choice: BigInt(-1) }
  );
  return { salt, choice };
};

export default Reveal;
