import React, { useState } from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import { DisputeKitClassic } from "@kleros/kleros-v2-contracts/typechain-types/src/arbitration/dispute-kits/DisputeKitClassic";
import { Button, Textarea } from "@kleros/ui-components-library";
import { useWeb3 } from "hooks/useWeb3";
import { useConnectedContract } from "hooks/useConnectedContract";
import { useGetMetaEvidence } from "queries/useGetMetaEvidence";
import { useDrawQuery } from "queries/useDrawQuery";

const Binary: React.FC<{ arbitrable: string }> = ({ arbitrable }) => {
  const { id } = useParams();
  const { data: metaEvidence } = useGetMetaEvidence(id, arbitrable);
  const { account } = useWeb3();
  const { data: draws } = useDrawQuery(account, id ? parseInt(id) : undefined);
  console.log(draws);
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
          placeholder="Jusitfy your vote..."
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
                onClick={() =>
                  disputeKit.castVote(id, [1], i + 1, "", justification)
                }
              />
            )
          )}
        </OptionsContainer>
      </MainContainer>
      <RefuseToArbitrateContainer>
        <Button variant="secondary" text="Refuse to Arbitrate" />
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
