import React from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import { useGetMetaEvidence } from "queries/useGetMetaEvidence";
import { useCourtPolicy } from "queries/useCourtPolicy";
import PolicyIcon from "svgs/icons/policy.svg";

const Overview: React.FC<{ arbitrable: string; courtID: string }> = ({
  arbitrable,
  courtID,
}) => {
  const { id } = useParams();
  const { data: metaEvidence } = useGetMetaEvidence(id, arbitrable);
  const { data: courtPolicyEvent } = useCourtPolicy(parseInt(courtID));
  const courtPolicy = courtPolicyEvent?.args._policy;
  return (
    <>
      <Container>
        <h1>{metaEvidence?.title}</h1>
        <QuestionAndDescription>
          <h3>{metaEvidence?.question}</h3>
          <p>{metaEvidence?.description}</p>
        </QuestionAndDescription>
        <VotingOptions>
          {metaEvidence && <h3>Voting Options</h3>}
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
      <ShadeArea>
        <p>Make sure you understand the Policies</p>
        <LinkContainer>
          {metaEvidence?.fileURI && (
            <StyledA
              href={metaEvidence.fileURI}
              target="_blank"
              rel="noreferrer"
            >
              <PolicyIcon />
              Dispute Policy
            </StyledA>
          )}
          {courtPolicy && (
            <StyledA href={courtPolicy} target="_blank" rel="noreferrer">
              <PolicyIcon />
              Court Policy
            </StyledA>
          )}
        </LinkContainer>
      </ShadeArea>
    </>
  );
};

// {metaEvidence?.aliases &&
// Object.keys(metaEvidence.aliases).length !== 0 ? (
//   <hr />
// ) : null}

const Container = styled.div`
  width: 100%;
  height: auto;
  padding: 8px 16px;
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

const ShadeArea = styled.div`
  width: 100%;
  padding: 16px;
  background-color: ${({ theme }) => theme.mediumBlue};
`;

const StyledA = styled.a`
  display: flex;
  align-items: center;
  gap: 4px;
  > svg {
    width: 16px;
    fill: ${({ theme }) => theme.primaryBlue};
  }
`;

const LinkContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

// const StyledIFrame = styled.iframe`
//   width: 1px;
//   min-width: 100%;
//   height: 360px;
//   border: none;
// `;

export default Overview;
