import React, { useState } from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import Identicon from "react-identicons";
import { Tabs, Accordion, Box } from "@kleros/ui-components-library";
import BalanceIcon from "svgs/icons/law-balance.svg";
import { useVotingHistory } from "queries/useVotingHistory";
import { useDisputeTemplate } from "queries/useDisputeTemplate";
import { shortenAddress } from "utils/shortenAddress";
import { isUndefined } from "utils/index";

const Container = styled.div``;

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
    justify-content: unset;
    padding: 11.5px 18px;
    background-color: ${({ theme }) => theme.whiteBackground} !important;
    border: 1px solid ${({ theme }) => theme.stroke} !important;
    > p {
      margin-left: 12px;
      margin-right: auto;
      color: ${({ theme }) => theme.primaryText};
    }
    > svg {
      fill: ${({ theme }) => theme.primaryText} !important;
    }
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

export const getVoteChoice = (vote, answers) => {
  const selectedAnswer = answers?.[vote - 1]?.title;
  if (vote === 0) {
    return "Refuse to arbitrate";
  } else if (!isUndefined(selectedAnswer)) {
    return selectedAnswer;
  } else {
    return `Answer 0x${vote}`;
  }
};

const VotingHistory: React.FC<{ arbitrable?: `0x${string}`; isQuestion: boolean }> = ({ arbitrable, isQuestion }) => {
  const { id } = useParams();
  const { data: votingHistory } = useVotingHistory(id);
  const [currentTab, setCurrentTab] = useState(0);
  const { data: disputeTemplate } = useDisputeTemplate(id, arbitrable);
  const rounds = votingHistory?.dispute?.rounds;
  const localRounds = votingHistory?.dispute?.disputeKitDispute?.localRounds;
  const answers = disputeTemplate?.answers;

  return (
    <Container>
      <h1>Voting History</h1>
      {rounds && localRounds && disputeTemplate && (
        <>
          {isQuestion && disputeTemplate.question ? (
            <ReactMarkdown>{disputeTemplate.question}</ReactMarkdown>
          ) : (
            <ReactMarkdown>The dispute's template is not correct please vote refuse to arbitrate</ReactMarkdown>
          )}
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
              {localRounds.at(currentTab)?.totalVoted === rounds.at(currentTab)?.nbVotes
                ? "All jurors voted"
                : localRounds.at(currentTab)?.totalVoted.toString() +
                  ` vote${localRounds.at(currentTab)?.totalVoted.toString() === "1" ? "" : "s"} cast out of ` +
                  rounds.at(currentTab)?.nbVotes}
            </p>
          </StyledBox>
          <StyledAccordion
            items={
              localRounds.at(currentTab)?.votes.map((vote) => ({
                title: shortenAddress(vote.juror.id),
                icon: <Identicon size="20" string={vote.juror.id} />,
                body: (
                  <AccordionContent
                    choice={getVoteChoice(parseInt(vote.choice), answers)}
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

export default VotingHistory;
