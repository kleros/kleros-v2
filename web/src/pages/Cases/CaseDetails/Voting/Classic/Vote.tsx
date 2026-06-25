import React, { useCallback, useMemo, useState } from "react";
import styled from "styled-components";

import { useParams } from "react-router-dom";
import type { Address } from "viem";

import { useVote } from "hooks/useVote";

import { useDisputeDetailsQuery } from "queries/useDisputeDetailsQuery";

import { VoteParams } from "src/actions/vote/params";
import { DisputeKits } from "src/dispute-kits";
import { isUndefined } from "src/utils";

import OptionsContainer from "../OptionsContainer";

const Container = styled.div`
  width: 100%;
  height: auto;
`;

interface IVote {
  arbitrable: Address;
  voteIDs: string[];
  setIsOpen: (val: boolean) => void;
  disputeKitId: DisputeKits;
}

const Vote: React.FC<IVote> = ({ arbitrable, voteIDs, setIsOpen, disputeKitId }) => {
  const { id } = useParams();
  const parsedDisputeID = useMemo(() => BigInt(id ?? 0), [id]);
  const parsedVoteIDs = useMemo(() => voteIDs.map((voteID) => BigInt(voteID)), [voteIDs]);
  const { data: disputeData } = useDisputeDetailsQuery(id);
  const currentRoundIndex = disputeData?.dispute?.currentRoundIndex;
  const [justification, setJustification] = useState("");

  const { mutateAsync: vote } = useVote(() => {
    setIsOpen(true);
  });

  const handleVote = useCallback(
    async (voteOption: bigint) => {
      if (isUndefined(currentRoundIndex)) {
        return;
      }

      await vote({
        disputeId: parsedDisputeID,
        voteIds: parsedVoteIDs,
        choice: voteOption,
        salt: BigInt(currentRoundIndex),
        justification,
        disputeKitId,
      } as VoteParams);
    },
    [currentRoundIndex, justification, parsedVoteIDs, parsedDisputeID, vote, disputeKitId]
  );

  return (
    <Container>
      <OptionsContainer {...{ arbitrable, justification, setJustification, handleSelection: handleVote }} />
    </Container>
  );
};

export default Vote;
