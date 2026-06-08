import React, { useCallback, useMemo, useState } from "react";
import styled from "styled-components";

import { useTranslation } from "react-i18next";
import { useAccount } from "wagmi";

import { DisputeDetails } from "@kleros/kleros-sdk/src/dataMappings/utils/disputeDetailsTypes";

import { Answer as IAnswer } from "context/NewDisputeContext";
import { isUndefined } from "utils/index";
import { isSafeNavigationUrl } from "utils/urlValidation";

import { DisputeDetailsQuery, VotingHistoryQuery } from "src/graphql/graphql";

import { responsiveSize } from "styles/responsiveSize";

import ExternalLinkWarning from "components/ExternalLinkWarning";
import MarkdownRenderer from "components/MarkdownRenderer";
import { StyledSkeleton } from "components/StyledSkeleton";

import CardLabel from "../DisputeView/CardLabels";
import { Divider } from "../Divider";
import RulingAndRewardsIndicators from "../Verdict/RulingAndRewardsIndicators";

import AliasDisplay from "./Alias";

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

const RulingAndRewardsAndLabels = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
`;

const FrontendUrlLink = styled.a`
  color: ${({ theme }) => theme.primaryBlue};
  cursor: pointer;

  :hover {
    text-decoration: underline;
    color: ${({ theme }) => theme.secondaryBlue};
  }
`;

interface IDisputeContext {
  disputeDetails?: DisputeDetails;
  isRpcError?: boolean;
  dispute?: DisputeDetailsQuery | undefined;

  disputeId?: string;
  votingHistory?: VotingHistoryQuery | undefined;
}

export const DisputeContext: React.FC<IDisputeContext> = ({
  disputeDetails,
  isRpcError = false,
  dispute,
  disputeId,
  votingHistory,
}) => {
  const { isDisconnected } = useAccount();
  const { t } = useTranslation();
  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const errMsg = isRpcError ? t("errors.rpc_error") : t("errors.invalid_dispute_data");
  const rounds = votingHistory?.dispute?.rounds;
  const aliases = disputeDetails?.aliases;
  const jurorRewardsDispersed = useMemo(() => Boolean(rounds?.every((round) => round.jurorRewardsDispersed)), [rounds]);

  const safeFrontendUrl = useMemo(() => {
    const url = disputeDetails?.frontendUrl;
    return url && isSafeNavigationUrl(url) ? url : undefined;
  }, [disputeDetails?.frontendUrl]);

  const handleConfirmNavigation = useCallback(() => {
    if (safeFrontendUrl) {
      window.open(safeFrontendUrl, "_blank", "noopener,noreferrer");
    }
    setIsWarningOpen(false);
  }, [safeFrontendUrl]);

  const handleCancelNavigation = useCallback(() => {
    setIsWarningOpen(false);
  }, []);

  return (
    <>
      <TitleSection>
        <StyledH1 dir="auto">
          {isUndefined(disputeDetails) ? <StyledSkeleton /> : (disputeDetails?.title ?? errMsg)}
        </StyledH1>
        {!isUndefined(disputeDetails) &&
        !isUndefined(dispute) &&
        !isUndefined(disputeId) &&
        !isUndefined(votingHistory) ? (
          <RulingAndRewardsAndLabels>
            {!isUndefined(Boolean(dispute?.dispute?.ruled)) || jurorRewardsDispersed ? (
              <RulingAndRewardsIndicators
                ruled={Boolean(dispute?.dispute?.ruled)}
                jurorRewardsDispersed={jurorRewardsDispersed}
              />
            ) : null}
            {!isDisconnected ? (
              <CardLabel {...{ disputeId }} round={(rounds?.length ?? 0) - 1} isList={false} isOverview={true} />
            ) : null}
          </RulingAndRewardsAndLabels>
        ) : null}
        <Divider />
      </TitleSection>
      {disputeDetails?.question?.trim() || disputeDetails?.description?.trim() ? (
        <div>
          {disputeDetails?.question?.trim() ? (
            <ReactMarkdownWrapper dir="auto">
              <MarkdownRenderer content={disputeDetails.question} />
            </ReactMarkdownWrapper>
          ) : null}
          {disputeDetails?.description?.trim() ? (
            <ReactMarkdownWrapper dir="auto">
              <MarkdownRenderer content={disputeDetails.description} />
            </ReactMarkdownWrapper>
          ) : null}
        </div>
      ) : null}

      {safeFrontendUrl ? (
        <>
          <FrontendUrlLink
            href={safeFrontendUrl}
            onClick={(event) => {
              event.preventDefault();
              setIsWarningOpen(true);
            }}
          >
            {t("misc.go_to_arbitrable")}
          </FrontendUrlLink>
          <ExternalLinkWarning
            isOpen={isWarningOpen}
            url={safeFrontendUrl}
            onConfirm={handleConfirmNavigation}
            onCancel={handleCancelNavigation}
          />
        </>
      ) : null}
      <VotingOptions>
        {isUndefined(disputeDetails) ? null : <AnswersHeader>{t("headers.voting_options")}</AnswersHeader>}
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

      {isUndefined(aliases) ? null : (
        <>
          <Divider />
          <AliasesContainer>
            {Object.keys(aliases).map((key) => (
              <AliasDisplay name={key} key={key} address={aliases[key]} />
            ))}
          </AliasesContainer>
        </>
      )}
    </>
  );
};
