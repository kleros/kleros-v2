import React, { useCallback, useMemo, useState } from "react";
import styled from "styled-components";

import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import type { Address } from "viem";

import { Button } from "@kleros/ui-components-library";

import { useRevealVote } from "hooks/useRevealVote";
import type { Bytes32Hash } from "utils/crypto/hashVote";

import { useDisputeDetailsQuery } from "queries/useDisputeDetailsQuery";
import { usePopulatedDisputeData } from "queries/usePopulatedDisputeData";

import { DisputeKits } from "src/consts";
import { isUndefined } from "src/utils";

const Container = styled.div`
  width: 100%;
  height: auto;
  display: flex;
  justify-content: center;
  margin-top: 16px;
`;

interface IReveal {
  arbitrable?: Address;
  commit?: Bytes32Hash;
  voteIDs: string[];
  setIsOpen: (val: boolean) => void;
  disputeKitName?: DisputeKits;
}

const Reveal: React.FC<IReveal> = ({ voteIDs, setIsOpen, disputeKitName, commit, arbitrable }) => {
  const { t } = useTranslation();
  const { id } = useParams();
  const { data: disputeData } = useDisputeDetailsQuery(id);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [justification, _setJustification] = useState("");
  const { data: disputeDetails } = usePopulatedDisputeData(id, arbitrable);
  const currentRoundIndex = disputeData?.dispute?.currentRoundIndex;

  const parsedDisputeID = useMemo(() => BigInt(id ?? 0), [id]);
  const parsedVoteIDs = useMemo(() => voteIDs.map((voteID) => BigInt(voteID)), [voteIDs]);

  // TODO: inspect local storage and ask user to input new justification if they want
  const { mutateAsync: revealVote, isPending } = useRevealVote(() => {
    setIsOpen(true);
  });
  const handleReveal = useCallback(async () => {
    if (isUndefined(currentRoundIndex)) {
      return;
    }

    await revealVote({
      params: {
        disputeId: parsedDisputeID,
        voteIds: parsedVoteIDs,
        roundIndex: Number(currentRoundIndex),
        justification,
        type: disputeKitName ?? DisputeKits.Shutter,
      },
      context: {
        commit,
        answers: disputeDetails?.answers,
      },
    });
  }, [
    parsedVoteIDs,
    justification,
    currentRoundIndex,
    revealVote,
    disputeDetails,
    commit,
    disputeKitName,
    parsedDisputeID,
  ]);

  return (
    <Container>
      <Button
        text={t("buttons.reveal_your_vote")}
        onPress={handleReveal}
        isDisabled={isPending}
        isLoading={isPending}
      />
      {/* TODO: if justification is not stored, show input for it */}
    </Container>
  );
};

export default Reveal;
