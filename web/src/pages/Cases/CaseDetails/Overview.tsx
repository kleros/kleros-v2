import React from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import { formatEther } from "viem";
import Skeleton from "react-loading-skeleton";
import { useDisputeDetailsQuery } from "queries/useDisputeDetailsQuery";
import { useDisputeTemplate } from "queries/useDisputeTemplate";
import { useCourtPolicy } from "queries/useCourtPolicy";
import { useCourtPolicyURI } from "queries/useCourtPolicyURI";
import { isUndefined } from "utils/index";
import PolicyIcon from "svgs/icons/policy.svg";
import DisputeInfo from "components/DisputeCard/DisputeInfo";
import Verdict from "components/Verdict/index";

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
  margin-top: 16px;
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

const Overview: React.FC<{ arbitrable?: `0x${string}`; courtID?: string }> = ({ arbitrable, courtID }) => {
  const { id } = useParams();
  const { data: disputeTemplate } = useDisputeTemplate(id, arbitrable);
  const { data: disputeDetails } = useDisputeDetailsQuery(id);
  const { data: courtPolicyURI } = useCourtPolicyURI(courtID);
  const { data: courtPolicy } = useCourtPolicy(courtID);
  const courtName = courtPolicy?.name;
  const court = disputeDetails?.dispute?.court;
  const rewards = court ? `≥ ${formatEther(court.feeForJuror)} ETH` : undefined;
  const category = disputeTemplate ? disputeTemplate.category : undefined;
  return (
    <>
      <Container>
        <h1>
          {isUndefined(disputeTemplate) ? (
            <Skeleton />
          ) : (
            disputeTemplate?.title ?? "The dispute's template is not correct please vote refuse to arbitrate"
          )}
        </h1>
        <QuestionAndDescription>
          <h3>{disputeTemplate?.question}</h3>
          <p>{disputeTemplate?.description}</p>
        </QuestionAndDescription>
        <a
          href="https://app.proofofhumanity.id/profile/0x00de4b13153673bcae2616b67bf822500d325fc3"
          target="_blank"
          rel="noreferrer"
        >
          View profile on Proof of Humanity
        </a>
        <VotingOptions>
          {disputeTemplate && <h3>Voting Options</h3>}
          {disputeTemplate?.answers?.map((answer: { title: string; description: string }, i: number) => (
            <span key={i}>
              <small>Option {i + 1}:</small>
              <label>{answer.title}</label>
            </span>
          ))}
        </VotingOptions>
        <hr />
        {disputeDetails?.dispute?.ruled && <Verdict id={id!} disputeTemplate={disputeTemplate} />}
        <hr />
        <DisputeInfo courtId={court?.id} court={courtName} {...{ rewards, category }} />
      </Container>
      <ShadeArea>
        <p>Make sure you understand the Policies</p>
        <LinkContainer>
          {disputeTemplate?.policyURI && (
            <StyledA href={`https://cloudflare-ipfs.com${disputeTemplate.policyURI}`} target="_blank" rel="noreferrer">
              <PolicyIcon />
              Dispute Policy
            </StyledA>
          )}
          {courtPolicy && (
            <StyledA href={`https://cloudflare-ipfs.com${courtPolicyURI}`} target="_blank" rel="noreferrer">
              <PolicyIcon />
              Court Policy
            </StyledA>
          )}
        </LinkContainer>
      </ShadeArea>
    </>
  );
};

export default Overview;
