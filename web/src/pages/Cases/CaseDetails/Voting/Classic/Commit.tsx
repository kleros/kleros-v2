import React, { useCallback, useMemo } from "react";

import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import type { Address } from "viem";

import { useCastCommit } from "hooks/useCastCommit";

import { useDisputeDetailsQuery } from "queries/useDisputeDetailsQuery";

import { CommitParams } from "src/actions/commit/params";
import { DisputeKits } from "src/dispute-kits";
import { isUndefined } from "src/utils";
import { PartialBy } from "src/utils/types";

import OptionsContainer from "../OptionsContainer";

interface ICommit {
  arbitrable: Address;
  voteIDs: string[];
  setIsOpen: (val: boolean) => void;
  disputeKitId: DisputeKits;
}

const Commit: React.FC<ICommit> = ({ arbitrable, voteIDs, setIsOpen, disputeKitId }) => {
  const { t } = useTranslation();
  const { id } = useParams();
  const parsedDisputeID = useMemo(() => BigInt(id ?? 0), [id]);
  const parsedVoteIDs = useMemo(() => voteIDs.map((voteID) => BigInt(voteID)), [voteIDs]);
  const { data: disputeData } = useDisputeDetailsQuery(id);
  const currentRoundIndex = disputeData?.dispute?.currentRoundIndex;

  const { mutateAsync: castCommit } = useCastCommit(() => {
    setIsOpen(true);
  });

  const handleCommit = useCallback(
    async (choice: bigint) => {
      if (isUndefined(currentRoundIndex)) {
        return;
      }

      await castCommit({
        disputeKitId,
        disputeId: parsedDisputeID,
        choice,
        voteIds: parsedVoteIDs,
        roundIndex: Number(currentRoundIndex),
      } as PartialBy<CommitParams, "salt">);
    },
    [castCommit, parsedDisputeID, currentRoundIndex, parsedVoteIDs, disputeKitId]
  );

  return id ? (
    <div className="w-full h-auto">
      <OptionsContainer
        {...{ arbitrable, handleSelection: handleCommit, confirmHint: t("voting.justification_at_reveal") }}
      />
    </div>
  ) : null;
};

export default Commit;
