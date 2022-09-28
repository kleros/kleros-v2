import React, { useState } from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import { DisputeKitClassic } from "@kleros/kleros-v2-contracts/typechain-types/src/arbitration/dispute-kits/DisputeKitClassic";
import { Button, Textarea } from "@kleros/ui-components-library";
import { useConnectedContract } from "hooks/useConnectedContract";
import { useGetMetaEvidence } from "queries/useGetMetaEvidence";

const Binary: React.FC<{ arbitrable: string; voteIDs: string[] }> = ({
  arbitrable,
  voteIDs,
}) => {
  const { id } = useParams();
  const { data: metaEvidence } = useGetMetaEvidence(id, arbitrable);
  const [chosenOption, setChosenOption] = useState(-1);
  const [isSending, setIsSending] = useState(false);
  const [justification, setJustification] = useState("");
  const disputeKit = useConnectedContract(
    "DisputeKitClassic"
  ) as DisputeKitClassic;
  return id ? (
    <Container>
      <MainContainer>
        <h1>{metaEvidence?.question}</h1>
        <StyledTextarea
          value={justification}
          onChange={(e) => setJustification(e.target.value)}
          placeholder="Justify your vote..."
          message={
            "A good justification contributes to case comprehension. " +
            "Low quality justifications can be challenged."
          }
          variant="info"
        />
        <OptionsContainer>
          {metaEvidence?.rulingOptions?.titles?.map(
            (answer: string, i: number) => (
              <Button
                key={i}
                text={answer}
                disabled={isSending}
                isLoading={chosenOption === i + 1}
                onClick={async () => {
                  setIsSending(true);
                  setChosenOption(i + 1);
                  await disputeKit
                    .castVote(id, voteIDs, i + 1, 0, justification)
                    .then(async (tx) => await tx.wait(2))
                    .finally(() => {
                      setChosenOption(-1);
                      setIsSending(false);
                    });
                }}
              />
            )
          )}
        </OptionsContainer>
      </MainContainer>
      <RefuseToArbitrateContainer>
        <Button
          variant="secondary"
          text="Refuse to Arbitrate"
          disabled={isSending}
          isLoading={chosenOption === 0}
          onClick={async () => {
            setIsSending(true);
            setChosenOption(0);
            await disputeKit
              .castVote(id, voteIDs, 0, 0, justification)
              .then(async (tx) => await tx.wait(2))
              .finally(() => {
                setChosenOption(-1);
                setIsSending(false);
              });
          }}
        />
      </RefuseToArbitrateContainer>
    </Container>
  ) : (
    <></>
  );
};

const Container = styled.div`
  width: 100%;
  height: auto;
`;

const MainContainer = styled.div`
  width: 100%;
  height: auto;
  padding: 24px;
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

export default Binary;
