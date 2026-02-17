import React, { useMemo } from "react";
import styled, { css } from "styled-components";

import { useTranslation } from "react-i18next";

import { Card, CustomAccordion } from "@kleros/ui-components-library";

import { Answer } from "context/NewDisputeContext";
import { formatDate } from "utils/date";
import { DrawnJuror } from "utils/getDrawnJurorsWithCount";
import { getVoteChoice } from "utils/getVoteChoice";
import { getTxnExplorerLink, isUndefined } from "utils/index";

import { hoverShortTransitionTiming } from "styles/commonStyles";
import { landscapeStyle } from "styles/landscapeStyle";

import { ExternalLink } from "components/ExternalLink";
import InfoCard from "components/InfoCard";
import MarkdownRenderer from "components/MarkdownRenderer";

import AccordionTitle from "./AccordionTitle";

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledAccordion = styled(CustomAccordion)`
  width: 100%;

  [class*="accordion-item"] {
    margin: 0;
  }

  [class*="accordion-button"] {
    padding: 16px !important;
    margin: 4px 0;
  }

  [class*="Body"] {
    padding: 8px;
  }

  ${landscapeStyle(
    () => css`
      [class*="accordion-button"] {
        padding: 12px 16px !important;
      }
      [class*="Body"] {
        padding: 12px 16px;
      }
    `
  )}
`;

const StyledCard = styled(Card)`
  ${hoverShortTransitionTiming}
  width: 100%;
  height: auto;
  padding: 16px;
  border: 1px solid ${({ theme }) => theme.stroke};
  margin: 4px 0;

  :hover {
    background-color: ${({ theme }) => theme.lightGrey}BB;
  }

  ${landscapeStyle(
    () => css`
      padding: 12px 16px;
    `
  )}
`;

const AccordionContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const VotedText = styled.label`
  color: ${({ theme }) => theme.secondaryText};
  font-size: 16px;
`;

const VotedLabel = styled.span`
  color: ${({ theme }) => theme.primaryText};
  margin-right: 4px;
`;

const JustificationContainer = styled.div`
  line-height: 1.25;
`;

const JustificationLabel = styled.span`
  color: ${({ theme }) => theme.primaryText};
  font-size: 16px;
  margin-right: 4px;
`;

const SecondaryTextLabel = styled.label`
  color: ${({ theme }) => theme.secondaryText};
  font-size: 16px;
  flex: 1;
`;

const StyledInfoCard = styled(InfoCard)`
  margin-top: 18.5px;
`;

const AccordionContent: React.FC<{
  choice?: string;
  answers: Answer[];
  justification: string;
  timestamp?: string;
  transactionHash?: string;
}> = ({ justification, choice, answers, timestamp, transactionHash }) => {
  const { t, i18n } = useTranslation();
  const transactionExplorerLink = useMemo(() => {
    return getTxnExplorerLink(transactionHash ?? "");
  }, [transactionHash]);

  return (
    <AccordionContentContainer>
      {!isUndefined(choice) && (
        <VotedText dir="auto">
          <VotedLabel>{t("misc.voted")}</VotedLabel>
          {getVoteChoice(choice, answers)}
        </VotedText>
      )}

      {justification ? (
        <JustificationContainer dir="auto">
          <JustificationLabel>{t("misc.justification")}</JustificationLabel>
          <MarkdownRenderer content={justification} />
        </JustificationContainer>
      ) : (
        <SecondaryTextLabel>{t("voting.no_justification_provided")}</SecondaryTextLabel>
      )}
      {!isUndefined(timestamp) && (
        <ExternalLink to={transactionExplorerLink} rel="noopener noreferrer" target="_blank">
          {formatDate(Number(timestamp), true, i18n.language)}
        </ExternalLink>
      )}
    </AccordionContentContainer>
  );
};

interface IVotesAccordion {
  drawnJurors: DrawnJuror[];
  period: string;
  answers: Answer[];
  isActiveRound: boolean;
  hiddenVotes: boolean;
}

const VotesAccordion: React.FC<IVotesAccordion> = ({ drawnJurors, period, answers, isActiveRound, hiddenVotes }) => {
  const { t } = useTranslation();
  const accordionItems = useMemo(() => {
    return drawnJurors
      .map((drawnJuror) =>
        !isUndefined(drawnJuror.vote?.justification?.choice)
          ? {
              title: (
                <AccordionTitle
                  juror={drawnJuror.juror.id}
                  voteCount={drawnJuror.voteCount}
                  choice={drawnJuror.vote?.justification?.choice}
                  period={period}
                  answers={answers}
                  isActiveRound={isActiveRound}
                  commited={Boolean(drawnJuror.vote.commited)}
                  hiddenVotes={hiddenVotes}
                />
              ),
              body: (
                <AccordionContent
                  justification={drawnJuror?.vote?.justification.reference ?? ""}
                  choice={drawnJuror.vote?.justification?.choice}
                  answers={answers}
                  transactionHash={drawnJuror.transactionHash}
                  timestamp={drawnJuror.timestamp}
                />
              ),
            }
          : null
      )
      .filter((item) => item !== null);
  }, [drawnJurors, period, answers, isActiveRound, hiddenVotes]);

  return (
    <>
      {drawnJurors.length === 0 ? <StyledInfoCard msg={t("alerts.jurors_not_drawn_yet")} /> : null}
      <Container>
        {accordionItems.length > 0 ? <StyledAccordion items={accordionItems} /> : null}
        {drawnJurors.map(
          (drawnJuror) =>
            isUndefined(drawnJuror.vote?.justification?.choice) && (
              <StyledCard key={drawnJuror.juror.id}>
                <AccordionTitle
                  juror={drawnJuror.juror.id}
                  voteCount={drawnJuror.voteCount}
                  period={period}
                  answers={answers}
                  isActiveRound={isActiveRound}
                  hiddenVotes={hiddenVotes}
                  commited={Boolean(drawnJuror.vote?.commited)}
                />
              </StyledCard>
            )
        )}
      </Container>
    </>
  );
};

export default VotesAccordion;
