import React, { useMemo, useState } from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import { useWalletClient, usePublicClient } from "wagmi";
import { Button, Textarea } from "@kleros/ui-components-library";
import { prepareWriteDisputeKitClassic } from "hooks/contracts/generated";
import { wrapWithToast } from "utils/wrapWithToast";
import { useDisputeTemplate } from "queries/useDisputeTemplate";
import { useDisputeDetailsQuery } from "queries/useDisputeDetailsQuery";
import { EnsureChain } from "components/EnsureChain";

const Container = styled.div`
  width: 100%;
  height: auto;
`;
const MainContainer = styled.div`
  width: 100%;
  height: auto;
`;
const StyledTextarea = styled(Textarea)`
  width: 100%;
  height: auto;
  textarea {
    height: 200px;
    border-color: ${({ theme }) => theme.stroke};
  }
  small {
    font-weight: 400;
    hyphens: auto;
  }
`;
const OptionsContainer = styled.div`
  margin-top: 24px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px;
`;
const RefuseToArbitrateContainer = styled.div`
  width: 100%;
  background-color: ${({ theme }) => theme.lightBlue};
  padding: 32px;
  display: flex;
  justify-content: center;
`;

interface IBinary {
  arbitrable: `0x${string}`;
  voteIDs: string[];
  setIsOpen: (val: boolean) => void;
}

const Binary: React.FC<IBinary> = ({ arbitrable, voteIDs, setIsOpen }) => {
  const { id } = useParams();
  const parsedDisputeID = BigInt(id ?? 0);
  const parsedVoteIDs = useMemo(() => voteIDs.map((voteID) => BigInt(voteID)), [voteIDs]);
  const { data: disputeTemplate } = useDisputeTemplate(id, arbitrable);
  const { data: disputeData } = useDisputeDetailsQuery(id);
  const [chosenOption, setChosenOption] = useState(-1);
  const [isSending, setIsSending] = useState(false);
  const [justification, setJustification] = useState("");
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const handleVote = async (voteOption: number) => {
    setIsSending(true);
    setChosenOption(voteOption);
    const { request } = await prepareWriteDisputeKitClassic({
      functionName: "castVote",
      args: [
        parsedDisputeID,
        parsedVoteIDs,
        BigInt(voteOption),
        BigInt(disputeData?.dispute?.currentRoundIndex),
        justification,
      ],
    });
    if (walletClient) {
      wrapWithToast(async () => await walletClient.writeContract(request), publicClient).finally(() => {
        setChosenOption(-1);
        setIsSending(false);
        setIsOpen(true);
      });
    }
  };

  return id ? (
    <Container>
      <MainContainer>
        <h1>{disputeTemplate?.question}</h1>
        <StyledTextarea
          value={justification}
          onChange={(e) => setJustification(e.target.value)}
          placeholder="Justify your vote..."
          message={
            "A good justification contributes to case comprehension. " + "Low quality justifications can be challenged."
          }
          variant="info"
        />
        <OptionsContainer>
          {disputeTemplate?.answers?.map((answer: { title: string; description: string }, i: number) => {
            return (
              <EnsureChain key={answer.title}>
                <Button
                  text={answer.title}
                  disabled={isSending}
                  isLoading={chosenOption === i + 1}
                  onClick={() => handleVote(i + 1)}
                />
              </EnsureChain>
            );
          })}
        </OptionsContainer>
      </MainContainer>
      <RefuseToArbitrateContainer>
        <EnsureChain>
          <Button
            variant="secondary"
            text="Refuse to Arbitrate"
            disabled={isSending}
            isLoading={chosenOption === 0}
            onClick={() => handleVote(0)}
          />
        </EnsureChain>
      </RefuseToArbitrateContainer>
    </Container>
  ) : (
    <></>
  );
};

export default Binary;
