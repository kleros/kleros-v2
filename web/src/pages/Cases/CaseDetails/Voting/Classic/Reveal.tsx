import React, { useCallback, useMemo, useState } from "react";

import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import type { Address } from "viem";

import { Button } from "@kleros/ui-components-library";

import { usePopulatedDisputeData } from "hooks/queries/usePopulatedDisputeData";
import { useRevealVote } from "hooks/useRevealVote";
import type { Bytes32Hash } from "utils/crypto/hashVote";
import { isUndefined } from "utils/index";

import { useDisputeDetailsQuery } from "queries/useDisputeDetailsQuery";

import { DisputeKits } from "src/dispute-kits";

import { EnsureChain } from "components/EnsureChain";
import InfoCard from "components/InfoCard";
import MarkdownEditor from "components/MarkdownEditor";
import MarkdownRenderer from "components/MarkdownRenderer";

interface IReveal {
  arbitrable?: Address;
  voteIDs: string[];
  setIsOpen: (val: boolean) => void;
  commit?: Bytes32Hash;
  isRevealPeriod: boolean;
  disputeKitId: DisputeKits;
}

const Reveal: React.FC<IReveal> = ({ arbitrable, voteIDs, setIsOpen, commit, isRevealPeriod, disputeKitId }) => {
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

    await revealVote({
      params: {
        disputeId: parsedDisputeID,
        voteIds: parsedVoteIDs,
        justification,
        roundIndex: Number(currentRoundIndex),
        disputeKitId,
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
    disputeKitId,
  ]);

  return (
    <div className="w-full h-auto">
      {isUndefined(commit) ? (
        <InfoCard msg={t("voting.failed_to_commit")} className="m-[16px_0]" />
      ) : isRevealPeriod ? (
        <>
          <div dir="auto">
            <MarkdownRenderer content={disputeDetails?.question ?? ""} />
          </div>
          <MarkdownEditor value={justification} onChange={setJustification} />
          <EnsureChain className="m-[8px_auto]">
            <Button
              variant="secondary"
              text={t("buttons.justify_and_reveal")}
              isDisabled={isPending || isUndefined(disputeDetails)}
              isLoading={isPending}
              onPress={handleReveal}
              className="m-[16px_auto]"
            />
          </EnsureChain>
        </>
      ) : (
        <InfoCard msg={t("voting.vote_successfully_committed")} className="m-[16px_0]" />
      )}
    </div>
  );
};

export default Reveal;
