import React from "react";
import ReactMarkdown from "react-markdown";
import styled from "styled-components";
import { StyledSkeleton } from "components/StyledSkeleton";
import { isUndefined } from "utils/index";

const QuestionAndDescription = styled.div`
  display: flex;
  flex-direction: column;
  > * {
    margin: 0px;
  }
`;

const VotingOptions = styled(QuestionAndDescription)`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Answers = styled.div`
  display: flex;
  flex-direction: column;

  span {
    margin: 0px;
    display: flex;
    gap: 8px;
  }
`;

export const DisputeBasicInfo: React.FC<any> = ({ disputeTemplate }) => {
  return (
    <>
      <h1>
        {isUndefined(disputeTemplate) ? (
          <StyledSkeleton />
        ) : (
          disputeTemplate?.title ?? "The dispute's template is not correct please vote refuse to arbitrate"
        )}
      </h1>

      <QuestionAndDescription>
        <ReactMarkdown>{disputeTemplate?.question}</ReactMarkdown>
        <ReactMarkdown>{disputeTemplate?.description}</ReactMarkdown>
      </QuestionAndDescription>

      {disputeTemplate?.frontendUrl && (
        <a href={disputeTemplate?.frontendUrl} target="_blank" rel="noreferrer">
          Go to arbitrable
        </a>
      )}
      <VotingOptions>
        {disputeTemplate && <h3>Voting Options</h3>}
        <Answers>
          {disputeTemplate?.answers?.map((answer: { title: string; description: string }, i: number) => (
            <span key={i}>
              <small>Option {i + 1}:</small>
              <label>{answer.title}</label>
            </span>
          ))}
        </Answers>
      </VotingOptions>
    </>
  );
};
