import React, { useCallback, useMemo, useState } from "react";
import styled from "styled-components";

import { useParams } from "react-router-dom";

import { useCastCommit } from "hooks/useCastCommit";
import { useCountdown } from "hooks/useCountdown";

import { DisputeDetailsQuery, useDisputeDetailsQuery } from "queries/useDisputeDetailsQuery";

import { DisputeKits } from "src/consts";

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
  dispute: DisputeDetailsQuery["dispute"];
  currentPeriodIndex: number;
  isGated: boolean;
}

const Commit: React.FC<ICommit> = ({ arbitrable, voteIDs, setIsOpen, dispute, currentPeriodIndex, isGated }) => {
  const [justification, setJustification] = useState("");

  const { id } = useParams();
  const parsedDisputeID = useMemo(() => BigInt(id ?? 0), [id]);
  const parsedVoteIDs = useMemo(() => voteIDs.map((voteID) => BigInt(voteID)), [voteIDs]);

  const { data: disputeData } = useDisputeDetailsQuery(id);

  const currentRoundIndex = disputeData?.dispute?.currentRoundIndex;
  const deadlineCommitPeriod = getDeadline(
    currentPeriodIndex,
    dispute?.lastPeriodChange,
    dispute?.court.timesPerPeriod
  );
  const countdownToVotingPeriod = useCountdown(deadlineCommitPeriod);

  const { mutateAsync: castCommit } = useCastCommit(() => {
    setIsOpen(true);
  });

  const handleCommit = useCallback(
    async (choice: bigint) => {
      /* an extra 300 seconds (5 minutes) of decryptionDelay is enforced after Commit period is over
      to avoid premature decryption and voting attacks if no one passes the Commit period quickly */
      const decryptionDelay = (countdownToVotingPeriod ?? 0) + 300;

      castCommit({
        type: isGated ? DisputeKits.GatedShutter : DisputeKits.Shutter,
        disputeId: parsedDisputeID,
        choice,
        voteIds: parsedVoteIDs,
        roundIndex: currentRoundIndex,
        justification,
        decryptionDelay,
      });
    },
    [justification, parsedVoteIDs, parsedDisputeID, countdownToVotingPeriod, isGated, castCommit, currentRoundIndex]
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
