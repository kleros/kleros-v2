import React from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import { useGetMetaEvidence } from "queries/useGetMetaEvidence";

const Overview: React.FC<{ arbitrable: string }> = ({ arbitrable }) => {
  const { id } = useParams();
  const { data: metaEvidence } = useGetMetaEvidence(id, arbitrable);
  return (
    <Container>
      <h1>{metaEvidence?.title}</h1>
      <QuestionAndDescription>
        <h3>{metaEvidence?.question}</h3>
        <p>{metaEvidence?.description}</p>
      </QuestionAndDescription>
      <VotingOptions>
        <h3>Voting Options</h3>
        {metaEvidence?.rulingOptions?.titles?.map(
          (answer: string, i: number) => (
            <span key={i}>
              <small>Option {i + 1}:</small>
              <label>{answer}</label>
            </span>
          )
        )}
      </VotingOptions>
      <hr />
    </Container>
  );
};
// {metaEvidence?.aliases &&
// Object.keys(metaEvidence.aliases).length !== 0 ? (
//   <hr />
// ) : null}

const Container = styled.div`
  width: 100%;
  height: auto;
  padding: 16px 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;

  > h1 {
    margin: 0;
  }

  > hr {
    width: 100%;
  }
`;

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
  > span {
    margin: 0px;
    display: flex;
    gap: 8px;
  }
`;

// const StyledIFrame = styled.iframe`
//   width: 1px;
//   min-width: 100%;
//   height: 360px;
//   border: none;
// `;

export default Overview;
