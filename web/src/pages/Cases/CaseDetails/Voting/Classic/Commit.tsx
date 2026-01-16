import React, { useCallback, useMemo } from "react";
import styled from "styled-components";

import { useParams } from "react-router-dom";

import { useCastCommit } from "hooks/useCastCommit";

import { useDisputeDetailsQuery } from "queries/useDisputeDetailsQuery";

import { DisputeKits } from "src/consts";

import OptionsContainer from "../OptionsContainer";

const Container = styled.div`
  width: 100%;
  height: auto;
`;

interface ICommit {
  arbitrable: `0x${string}`;
  voteIDs: string[];
  setIsOpen: (val: boolean) => void;
  isGated: boolean;
}

const Commit: React.FC<ICommit> = ({ arbitrable, voteIDs, setIsOpen, isGated }) => {
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
      castCommit({
        type: isGated ? DisputeKits.Gated : DisputeKits.Classic,
        disputeId: parsedDisputeID,
        choice,
        voteIds: parsedVoteIDs,
        roundIndex: currentRoundIndex,
      });
    },
    [castCommit, parsedDisputeID, currentRoundIndex, parsedVoteIDs, isGated]
  );

  return id ? (
    <Container>
      <OptionsContainer {...{ arbitrable, handleSelection: handleCommit }} />
    </Container>
  ) : null;
};

export default Commit;
