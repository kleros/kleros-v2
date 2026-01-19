import React, { useCallback, useMemo, useState } from "react";
import styled from "styled-components";

import { useParams } from "react-router-dom";

import { useVote } from "hooks/useVote";

import { useDisputeDetailsQuery } from "queries/useDisputeDetailsQuery";

import { DisputeKits } from "src/consts";

import OptionsContainer from "../OptionsContainer";

const Container = styled.div`
  width: 100%;
  height: auto;
`;

interface IVote {
  arbitrable: `0x${string}`;
  voteIDs: string[];
  setIsOpen: (val: boolean) => void;
}

const Vote: React.FC<IVote> = ({ arbitrable, voteIDs, setIsOpen }) => {
  const { id } = useParams();
  const parsedDisputeID = useMemo(() => BigInt(id ?? 0), [id]);
  const parsedVoteIDs = useMemo(() => voteIDs.map((voteID) => BigInt(voteID)), [voteIDs]);
  const { data: disputeData } = useDisputeDetailsQuery(id);
  const [justification, setJustification] = useState("");

  const { mutateAsync: vote } = useVote(() => {
    setIsOpen(true);
  });

  const handleVote = useCallback(
    async (voteOption: bigint) => {
      vote({
        disputeId: parsedDisputeID,
        voteIds: parsedVoteIDs,
        choice: voteOption,
        salt: BigInt(disputeData?.dispute?.currentRoundIndex),
        justification,
        type: DisputeKits.Classic,
      });
    },
    [disputeData?.dispute?.currentRoundIndex, justification, parsedVoteIDs, parsedDisputeID, vote]
  );

  return (
    <Container>
      <OptionsContainer {...{ arbitrable, justification, setJustification, handleSelection: handleVote }} />
    </Container>
  );
};

export default Vote;
