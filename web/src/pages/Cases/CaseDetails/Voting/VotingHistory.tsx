import React, { useState } from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";
import { Tabs, Accordion, Box } from "@kleros/ui-components-library";
import BalanceIcon from "svgs/icons/law-balance.svg";
import { useVotingHistory } from "queries/useVotingHistory";
import { useGetMetaEvidence } from "queries/useGetMetaEvidence";
import { shortenAddress } from "utils/shortenAddress";

const VotingHistory: React.FC<{ arbitrable: string }> = ({ arbitrable }) => {
  const { id } = useParams();
  const { data: votingHistory } = useVotingHistory(id);
  const [currentTab, setCurrentTab] = useState(0);
  const { data: metaEvidence } = useGetMetaEvidence(id, arbitrable);
  const rounds = votingHistory?.dispute?.rounds;
  return (
    <Container>
      <h1>Voting History</h1>
      {rounds && metaEvidence && (
        <>
          <p>{metaEvidence.question}</p>
          <StyledTabs
            currentValue={currentTab}
            items={rounds.map((_, i) => ({
              text: `Round ${i + 1}`,
              value: i,
            }))}
            callback={(i: number) => setCurrentTab(i)}
          />
          <StyledBox>
            <BalanceIcon />
            <p>
              {rounds.at(currentTab)?.totalVoted ===
              rounds.at(currentTab)?.nbVotes
                ? "All jurors voted"
                : `${rounds.at(currentTab)?.totalVoted} jurors voted out of ${
                    rounds.at(currentTab)?.nbVotes
                  }`}
            </p>
          </StyledBox>
          <StyledAccordion
            items={
              rounds.at(currentTab)?.votes.map((vote) => ({
                title: shortenAddress(vote.juror.id),
                Icon: () => (
                  <Jazzicon
                    diameter={24}
                    seed={jsNumberForAddress(vote.juror.id)}
                  />
                ),
                body: (
                  <AccordionContent
                    choice={
                      vote.choice === 0
                        ? "Refuse to arbitrate"
                        : metaEvidence.rulingOptions.titles[vote.choice - 1]
                    }
                    justification={vote.justification || ""}
                  />
                ),
              })) || []
            }
          />
        </>
      )}
    </Container>
  );
};

const Container = styled.div`
  padding: 16px;
`;

const StyledTabs = styled(Tabs)`
  width: 100%;
  margin-bottom: 16px;
`;

const StyledBox = styled(Box)`
  width: 100%;
  height: auto;
  border-radius: 3px;
  padding: 8px 16px;
  display: flex;
  gap: 8px;
  align-items: center;
  > p {
    margin: 0;
  }
  > svg {
    height: 16px;
    fill: ${({ theme }) => theme.secondaryPurple};
  }
`;

const StyledAccordion = styled(Accordion)`
  width: 100%;
  > * > button {
    background-color: ${({ theme }) => theme.whiteBackground} !important;
    border: 1px solid ${({ theme }) => theme.stroke} !important;
  }
  > * > div > div {
    padding: 8px 16px;
  }
`;

const AccordionContent: React.FC<{
  choice: string;
  justification: string;
}> = ({ choice, justification }) => {
  return (
    <div>
      <VotedContainer>
        <label>Voted:</label>
        <small>{choice}</small>
      </VotedContainer>
      <JustificationContainer>
        <label>Justification:</label>
        <p>{justification}</p>
      </JustificationContainer>
    </div>
  );
};

const VotedContainer = styled.div`
  width: 100%;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const JustificationContainer = styled.div`
  > p {
    margin: 0px;
  }
`;

export default VotingHistory;
