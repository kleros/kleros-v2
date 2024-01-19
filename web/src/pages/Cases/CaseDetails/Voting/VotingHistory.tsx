import React, { useState } from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import Identicon from "react-identicons";
import { Tabs, Accordion } from "@kleros/ui-components-library";
import { useVotingHistory } from "queries/useVotingHistory";
import { useDisputeTemplate } from "queries/useDisputeTemplate";
import { shortenAddress } from "utils/shortenAddress";
import { isUndefined } from "utils/index";
import { getLocalRounds } from "utils/getLocalRounds";
import PendingVotesBox from "./PendingVotesBox";

const Container = styled.div``;

const StyledTabs = styled(Tabs)`
  width: 100%;
  margin-bottom: 16px;
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

export const getVoteChoice = (vote: number, answers: { title: string }[]) => {
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
  const localRounds = getLocalRounds(votingHistory?.dispute?.disputeKitDispute);
  const answers = disputeTemplate?.answers;

  return (
    <Container>
      <h1>Voting History</h1>
      {rounds && localRounds && disputeTemplate && (
        <>
          {isQuestion && disputeTemplate.question ? (
            <ReactMarkdown>{disputeTemplate.question}</ReactMarkdown>
          ) : (
            <ReactMarkdown>{"The dispute's template is not correct please vote refuse to arbitrate"}</ReactMarkdown>
          )}
          <StyledTabs
            currentValue={currentTab}
            items={rounds.map((_, i) => ({
              text: `Round ${i + 1}`,
              value: i,
            }))}
            callback={(i: number) => setCurrentTab(i)}
          />
          <PendingVotesBox
            current={localRounds.at(currentTab)?.totalVoted}
            total={rounds.at(currentTab)?.nbVotes}
            court={rounds.at(currentTab)?.court.name}
          />
          <StyledAccordion
            items={
              localRounds.at(currentTab)?.justifications?.map((justification) => ({
                title: shortenAddress(justification.juror.id),
                icon: <Identicon size="20" string={justification.juror.id} />,
                body: (
                  <AccordionContent
                    choice={getVoteChoice(parseInt(justification.choice), answers)}
                    justification={justification.reference || ""}
                  />
                ),
              })) ?? []
            }
          />
        </>
      )}
    </Container>
  );
};

export default VotingHistory;
