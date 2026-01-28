import React, { useCallback, useMemo, useState } from "react";
import styled from "styled-components";

import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { Button } from "@kleros/ui-components-library";

import { usePopulatedDisputeData } from "hooks/queries/usePopulatedDisputeData";
import { useRevealVote } from "hooks/useRevealVote";
import { isUndefined } from "utils/index";

import { useDisputeDetailsQuery } from "queries/useDisputeDetailsQuery";

import { DisputeKits } from "src/consts";

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
  commit: `0x${string}`;
  isRevealPeriod: boolean;
  isGated: boolean;
}

const Reveal: React.FC<IReveal> = ({ arbitrable, voteIDs, setIsOpen, commit, isRevealPeriod, isGated }) => {
  const { t } = useTranslation();
  const { id } = useParams();
  const parsedDisputeID = useMemo(() => BigInt(id ?? 0), [id]);
  const parsedVoteIDs = useMemo(() => voteIDs.map((voteID) => BigInt(voteID)), [voteIDs]);
  const { data: disputeData } = useDisputeDetailsQuery(id);
  const [justification, setJustification] = useState("");
  const { data: disputeDetails } = usePopulatedDisputeData(id, arbitrable);
  const currentRoundIndex = disputeData?.dispute?.currentRoundIndex;

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
        justification,
        roundIndex: Number(currentRoundIndex),
        type: isGated ? DisputeKits.Gated : DisputeKits.Classic,
      },
      context: {
        commit,
        answers: disputeDetails?.answers,
      },
    });
  }, [
    currentRoundIndex,
    revealVote,
    commit,
    disputeDetails?.answers,
    justification,
    parsedVoteIDs,
    parsedDisputeID,
    isGated,
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
              disabled={isPending || isUndefined(disputeDetails)}
              isLoading={isPending}
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

export default Reveal;
