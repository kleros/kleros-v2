import React, { useMemo } from "react";
import styled from "styled-components";

import { DisputeDetails } from "@kleros/kleros-sdk/src/dataMappings/utils/disputeDetailsTypes";

import { INVALID_DISPUTE_DATA_ERROR, RPC_ERROR } from "consts/index";
import { Answer as IAnswer } from "context/NewDisputeContext";
import { isUndefined } from "utils/index";

import { responsiveSize } from "styles/responsiveSize";

import { DisputeDetailsQuery, VotingHistoryQuery } from "src/graphql/graphql";

import ReactMarkdown from "components/ReactMarkdown";
import { StyledSkeleton } from "components/StyledSkeleton";

import { Divider } from "../Divider";
import { ExternalLink } from "../ExternalLink";

import AliasDisplay from "./Alias";
import RulingAndRewardsIndicators from "../Verdict/RulingAndRewardsIndicators";

const StyledH1 = styled.h1`
  margin: 0;
  word-wrap: break-word;
  font-size: ${responsiveSize(20, 26)};
  line-height: 24px;
`;

const TitleSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ReactMarkdownWrapper = styled.div`
  & p:first-of-type {
    margin: 0;
  }
`;

const VotingOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const AnswersContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${responsiveSize(4, 2)};
`;

const AnswersHeader = styled.small`
  margin: 0;
`;

export const AnswerTitleAndDescription = styled.div`
  display: block;
`;

export const AnswerTitle = styled.small`
  display: inline;
`;

export const AnswerDescription = styled.small`
  display: inline;
  font-weight: 400;
  color: ${({ theme }) => theme.secondaryText};
`;

const AliasesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${responsiveSize(8, 20)};
`;

interface IDisputeContext {
  disputeDetails?: DisputeDetails;
  dispute: DisputeDetailsQuery | undefined;
  isRpcError?: boolean;
  votingHistory: VotingHistoryQuery | undefined;
}

export const DisputeContext: React.FC<IDisputeContext> = ({
  disputeDetails,
  dispute,
  isRpcError = false,
  votingHistory,
}) => {
  const errMsg = isRpcError ? RPC_ERROR : INVALID_DISPUTE_DATA_ERROR;
  const rounds = votingHistory?.dispute?.rounds;
  const jurorRewardsDispersed = useMemo(() => Boolean(rounds?.every((round) => round.jurorRewardsDispersed)), [rounds]);
  console.log({ jurorRewardsDispersed }, disputeDetails);

  return (
    <>
      <TitleSection>
        <StyledH1 dir="auto">
          {isUndefined(disputeDetails) ? <StyledSkeleton /> : (disputeDetails?.title ?? errMsg)}
        </StyledH1>
        {!isUndefined(Boolean(dispute?.dispute?.ruled)) || jurorRewardsDispersed ? (
          <RulingAndRewardsIndicators
            ruled={Boolean(dispute?.dispute?.ruled)}
            jurorRewardsDispersed={jurorRewardsDispersed}
          />
        ) : null}
        <Divider />
      </TitleSection>
      {disputeDetails?.question?.trim() || disputeDetails?.description?.trim() ? (
        <div>
          {disputeDetails?.question?.trim() ? (
            <ReactMarkdownWrapper dir="auto">
              <ReactMarkdown>{disputeDetails.question}</ReactMarkdown>
            </ReactMarkdownWrapper>
          ) : null}
          {disputeDetails?.description?.trim() ? (
            <ReactMarkdownWrapper dir="auto">
              <ReactMarkdown>{disputeDetails.description}</ReactMarkdown>
            </ReactMarkdownWrapper>
          ) : null}
        </div>
      ) : null}

      {isUndefined(disputeDetails?.frontendUrl) ? null : (
        <ExternalLink to={disputeDetails?.frontendUrl} target="_blank" rel="noreferrer">
          Go to arbitrable
        </ExternalLink>
      )}
      <VotingOptions>
        {isUndefined(disputeDetails) ? null : <AnswersHeader>Voting Options</AnswersHeader>}
        <AnswersContainer>
          {disputeDetails?.answers?.map((answer: IAnswer, i: number) => (
            <AnswerTitleAndDescription dir="auto" key={answer.title}>
              <label>{i + 1}. </label>
              <AnswerTitle>{answer.title}</AnswerTitle>
              <AnswerDescription>{answer.description.trim() ? ` - ${answer.description}` : null}</AnswerDescription>
            </AnswerTitleAndDescription>
          ))}
        </AnswersContainer>
      </VotingOptions>

      {isUndefined(disputeDetails?.aliases) ? null : (
        <>
          <Divider />
          <AliasesContainer>
            {Object.keys(disputeDetails.aliases).map((key) => (
              <AliasDisplay name={key} key={key} address={disputeDetails.aliases[key]} />
            ))}
          </AliasesContainer>
        </>
      )}
    </>
  );
};
