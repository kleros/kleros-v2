import React, { useEffect, useState } from "react";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";
import { useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { formatEther } from "viem";
import { useDisputeDetailsQuery } from "queries/useDisputeDetailsQuery";
import { useDisputeTemplate } from "queries/useDisputeTemplate";
import { useCourtPolicy } from "queries/useCourtPolicy";
import { isUndefined } from "utils/index";
import { deepParseTemplateWithData, executeAction } from "utils/dataMappings";
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
  const { data: votingHistory } = useVotingHistory(id);

  const [parsedDisputeTemplate, setParsedDisputeTemplate] = useState<any>({});

  const localRounds = votingHistory?.dispute?.disputeKitDispute?.localRounds;
  const courtName = courtPolicy?.name;
  const court = disputeDetails?.dispute?.court;
  const rewards = court ? `≥ ${formatEther(court.feeForJuror)} ETH` : undefined;
  const category = disputeTemplate ? disputeTemplate.category : undefined;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const parsedTemplate = JSON.parse(disputeTemplate?.templateData);
        const parsedMapping = JSON.parse(disputeTemplate?.templateDataMappings);

        let populatedData = {};

        for (const action of parsedMapping) {
          const result = await executeAction(action);
          populatedData = { ...populatedData, ...result };
        }

        const finalTemplate = deepParseTemplateWithData(parsedTemplate, populatedData);
        setParsedDisputeTemplate(finalTemplate);
      } catch (e) {
        console.error(e);
      }
    };

    fetchData();
  }, [disputeTemplate]);

  return (
    <>
      <Container>
        <h1>
          {isUndefined(disputeTemplate) ? (
            <StyledSkeleton />
          ) : (
            parsedDisputeTemplate?.template?.content ??
            "The dispute's template is not correct please vote refuse to arbitrate"
          )}
        </h1>
        <QuestionAndDescription>
          <ReactMarkdown>{parsedDisputeTemplate?.question}</ReactMarkdown>
          <ReactMarkdown>{parsedDisputeTemplate?.description}</ReactMarkdown>
        </QuestionAndDescription>
        {parsedDisputeTemplate?.frontendUrl && (
          <a href={parsedDisputeTemplate?.frontendUrl} target="_blank" rel="noreferrer">
            Go to arbitrable
          </a>
        )}
        <VotingOptions>
          {parsedDisputeTemplate && <h3>Voting Options</h3>}
          <Answers>
            {parsedDisputeTemplate?.options?.titles?.map((title: string, i: number) => (
              <span key={i}>
                <small>Option {i + 1}:</small>
                <label>{title}. </label>
                <label>{parsedDisputeTemplate.options.descriptions[i]}</label>
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
          {parsedDisputeTemplate?.policyURI && (
            <StyledA href={`${IPFS_GATEWAY}${parsedDisputeTemplate.policyURI}`} target="_blank" rel="noreferrer">
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
