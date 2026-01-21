import React, { useCallback, useMemo, useState } from "react";
import styled from "styled-components";

import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { Button } from "@kleros/ui-components-library";

import { useRevealVote } from "hooks/useRevealVote";

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
  arbitrable?: `0x${string}`;
  commit: `0x${string}`;
  voteIDs: string[];
  setIsOpen: (val: boolean) => void;
  isGated: boolean;
}

const Reveal: React.FC<IReveal> = ({ voteIDs, setIsOpen, isGated, commit, arbitrable }) => {
  const { t } = useTranslation();
  const { id } = useParams();
  const { data: disputeData } = useDisputeDetailsQuery(id);
  const [justification, setJustification] = useState("");
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

    revealVote({
      params: {
        disputeId: parsedDisputeID,
        voteIds: parsedVoteIDs,
        roundIndex: Number(currentRoundIndex),
        justification,
        type: isGated ? DisputeKits.GatedShutter : DisputeKits.Shutter,
      },
      context: {
        commit,
        answers: disputeDetails?.answers,
      },
    });
  }, [parsedVoteIDs, justification, currentRoundIndex, revealVote, disputeDetails, commit, isGated, parsedDisputeID]);

  return (
    <Container>
      <Button text={t("buttons.reveal_your_vote")} onClick={handleReveal} disabled={isPending} isLoading={isPending} />
      {/* TODO: if justification is not stored, show input for it */}
    </Container>
  );
};

export default Reveal;
