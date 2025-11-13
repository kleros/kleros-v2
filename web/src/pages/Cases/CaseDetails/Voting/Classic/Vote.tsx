import React, { useCallback, useMemo, useState } from "react";
import styled from "styled-components";

import { useParams } from "react-router-dom";
import { useConfig, usePublicClient } from "wagmi";

import { useWallet } from "context/walletProviders";
import { simulateDisputeKitClassicCastVote } from "hooks/contracts/generated";
import { useDisputeKit } from "hooks/useContractDisputeKits";
import { wrapWithToast } from "utils/wrapWithToast";

import { useDisputeDetailsQuery } from "queries/useDisputeDetailsQuery";

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
  const publicClient = usePublicClient();
  const { providerType, account } = useWallet();
  const wagmiConfig = useConfig();
  const { callVote } = useDisputeKit(disputeData?.dispute?.currentRound.disputeKit.address);

  const handleVote = useCallback(
    async (voteOption: number) => {
      const args = [
        parsedDisputeID,
        parsedVoteIDs,
        BigInt(voteOption),
        BigInt(disputeData?.dispute?.currentRoundIndex),
        justification,
      ];
      if (providerType !== "lemon") {
        await simulateDisputeKitClassicCastVote(wagmiConfig, {
          args: args as any,
        });
      }

      if (publicClient && account) {
        await wrapWithToast(async () => await callVote(args), publicClient).then(({ status }) => {
          setIsOpen(status);
        });
      }
    },
    [
      wagmiConfig,
      disputeData?.dispute?.currentRoundIndex,
      justification,
      parsedVoteIDs,
      parsedDisputeID,
      publicClient,
      setIsOpen,
    ]
  );

  return (
    <Container>
      <OptionsContainer {...{ arbitrable, justification, setJustification, handleSelection: handleVote }} />
    </Container>
  );
};

export default Vote;
