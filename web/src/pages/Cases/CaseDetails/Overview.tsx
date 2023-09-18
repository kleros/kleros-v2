import React, { useEffect } from "react";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";
import { useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { formatEther } from "viem";
import { useDisputeDetailsQuery } from "queries/useDisputeDetailsQuery";
import { useDisputeTemplate } from "queries/useDisputeTemplate";
import { useCourtPolicy } from "queries/useCourtPolicy";
import { useFiltersContext } from "context/FilterProvider";
import { isUndefined } from "utils/index";
import { Periods } from "consts/periods";
import { IPFS_GATEWAY } from "consts/index";
import PolicyIcon from "svgs/icons/policy.svg";
import { StyledSkeleton } from "components/StyledSkeleton";
import DisputeInfo from "components/DisputeCard/DisputeInfo";
import Verdict from "components/Verdict/index";
import { useVotingHistory } from "hooks/queries/useVotingHistory";

const Container = styled.div`
  width: 100%;
  height: auto;
  display: flex;
  flex-direction: column;
  gap: calc(16px + (32 - 16) * (min(max(100vw, 375px), 1250px) - 375px) / 875);

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

const ShadeArea = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  padding: calc(16px + (32 - 16) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
  margin-top: calc(24px + (48 - 24) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
  background-color: ${({ theme }) => theme.mediumBlue};
  > p {
    margin-top: 0;
    margin-bottom: 16px;
    ${landscapeStyle(
      () => css`
        margin-bottom: 0;
      `
    )};
  }

  ${landscapeStyle(
    () => css`
      flex-direction: row;
      justify-content: space-between;
    `
  )};
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
  gap: calc(8px + (24 - 8) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
`;

const Divider = styled.hr`
  display: flex;
  color: ${({ theme }) => theme.stroke};
  margin: 0;
`;

interface IOverview {
  arbitrable?: `0x${string}`;
  courtID?: string;
  currentPeriodIndex: number;
}

const Overview: React.FC<IOverview> = ({ arbitrable, courtID, currentPeriodIndex }) => {
  const { id } = useParams();
  const { data: disputeTemplate } = useDisputeTemplate(id, arbitrable);
  const { data: disputeDetails } = useDisputeDetailsQuery(id);
  const { data: courtPolicy } = useCourtPolicy(courtID);
  const { isList, setIsList } = useFiltersContext();
  const { data: votingHistory } = useVotingHistory(id);
  const localRounds = votingHistory?.dispute?.disputeKitDispute?.localRounds;
  const courtName = courtPolicy?.name;
  const court = disputeDetails?.dispute?.court;
  const rewards = court ? `≥ ${formatEther(court.feeForJuror)} ETH` : undefined;
  const category = disputeTemplate ? disputeTemplate.category : undefined;

  useEffect(() => {
    if (isList) {
      setIsList(false);
    }
  }, []);

  return (
    <>
      <Container>
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
        <Divider />
        {currentPeriodIndex !== Periods.evidence && (
          <>
            <Verdict arbitrable={arbitrable} />
            <Divider />
          </>
        )}

        <DisputeInfo courtId={court?.id} court={courtName} round={localRounds?.length} {...{ rewards, category }} />
      </Container>
      <ShadeArea>
        <p>Make sure you understand the Policies</p>
        <LinkContainer>
          {disputeTemplate?.policyURI && (
            <StyledA href={`${IPFS_GATEWAY}${disputeTemplate.policyURI}`} target="_blank" rel="noreferrer">
              <PolicyIcon />
              Dispute Policy
            </StyledA>
          )}
          {courtPolicy && (
            <StyledA href={`#/courts/${court?.id}/purpose?section=description`}>
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
