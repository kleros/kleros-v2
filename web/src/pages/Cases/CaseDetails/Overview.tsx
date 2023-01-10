import React from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import { utils } from "ethers";
import { useDisputeDetailsQuery } from "queries/useDisputeDetailsQuery";
import { useGetMetaEvidence } from "queries/useGetMetaEvidence";
import { useCourtPolicy } from "queries/useCourtPolicy";
import { useCourtPolicyURI } from "queries/useCourtPolicyURI";
import PolicyIcon from "svgs/icons/policy.svg";
import DisputeInfo from "components/DisputeCard/DisputeInfo";

const Overview: React.FC<{ arbitrable?: string; courtID?: string }> = ({
  arbitrable,
  courtID,
}) => {
  const { id } = useParams();
  const { data: metaEvidence } = useGetMetaEvidence(id, arbitrable);
  const { data: disputeDetails } = useDisputeDetailsQuery(id);
  const { data: courtPolicyURI } = useCourtPolicyURI(courtID);
  const { data: courtPolicy } = useCourtPolicy(courtID);
  const courtName = courtPolicy?.name;
  const court = disputeDetails?.dispute?.court;
  const rewards = court
    ? `≥ ${utils.formatEther(court.feeForJuror)} ETH`
    : undefined;
  const category = metaEvidence ? metaEvidence.category : undefined;
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
        <DisputeInfo court={courtName} {...{ rewards, category }} />
      </Container>
      <ShadeArea>
        <p>Make sure you understand the Policies</p>
        <LinkContainer>
          {metaEvidence?.fileURI && (
            <StyledA
              href={`https://ipfs.kleros.io${metaEvidence.fileURI}`}
              target="_blank"
              rel="noreferrer"
            >
              <PolicyIcon />
              Dispute Policy
            </StyledA>
          )}
          {courtPolicy && (
            <StyledA
              href={`https://ipfs.kleros.io${courtPolicyURI}`}
              target="_blank"
              rel="noreferrer"
            >
              <PolicyIcon />
              Court Policy
            </StyledA>
          )}
        </LinkContainer>
      </ShadeArea>
    </>
  );
};

const Container = styled.div`
  width: 100%;
  height: auto;
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
  > p {
    margin-top: 0;
  }
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

export default Overview;
