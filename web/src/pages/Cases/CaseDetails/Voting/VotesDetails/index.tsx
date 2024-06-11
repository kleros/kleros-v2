import React, { useMemo } from "react";
import styled from "styled-components";

import { Card, CustomAccordion } from "@kleros/ui-components-library";

import { Answer } from "context/NewDisputeContext";
import { DrawnJuror } from "utils/getDrawnJurorsWithCount";
import { getVoteChoice } from "utils/getVoteChoice";
import { isUndefined } from "utils/index";

import { responsiveSize } from "styles/responsiveSize";

import InfoCard from "components/InfoCard";

import AccordionTitle from "./AccordionTitle";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 8px;
`;

const StyledAccordion = styled(CustomAccordion)`
  width: 100%;
  > * > button {
    justify-content: unset;
    padding: 11.5px ${responsiveSize(8, 18)} !important;
    background-color: ${({ theme }) => theme.whiteBackground} !important;
    border: 1px solid ${({ theme }) => theme.stroke} !important;
    > svg {
      fill: ${({ theme }) => theme.primaryText} !important;
    }
  }
  //adds padding to body container
  > * > div > div {
    padding: ${responsiveSize(16, 24)} ${responsiveSize(8, 16)};
  }
`;

const StyledCard = styled(Card)`
  width: 100%;
  height: auto;
  padding: 11.5px ${responsiveSize(8, 18)};
  margin: 8px 0;
`;

const AccordionContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const JustificationText = styled.div`
  color: ${({ theme }) => theme.secondaryText};
  font-size: 16px;
  line-height: 1.2;
  &:before {
    content: "Justification: ";
    color: ${({ theme }) => theme.primaryText};
  }
`;

const StyledLabel = styled.label`
  color: ${({ theme }) => theme.primaryText};
  font-size: 16px;
`;

const SecondaryTextLabel = styled.label`
  color: ${({ theme }) => theme.secondaryText};
  font-size: 16px;
`;

const AccordionContent: React.FC<{
  choice?: string;
  answers: Answer[];
  justification: string;
}> = ({ justification, choice, answers }) => (
  <AccordionContentContainer>
    {!isUndefined(choice) && (
      <div>
        <StyledLabel>Voted:&nbsp;</StyledLabel>
        <SecondaryTextLabel>{getVoteChoice(parseInt(choice), answers)}</SecondaryTextLabel>
      </div>
    )}
    {justification ? (
      <JustificationText>{justification}</JustificationText>
    ) : (
      <SecondaryTextLabel>No justification provided</SecondaryTextLabel>
    )}
  </AccordionContentContainer>
);

interface IVotesAccordion {
  drawnJurors: DrawnJuror[];
  period: string;
  answers: Answer[];
  isActiveRound: boolean;
}

const VotesAccordion: React.FC<IVotesAccordion> = ({ drawnJurors, period, answers, isActiveRound }) => {
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
                />
              ),
              body: (
                <AccordionContent
                  justification={drawnJuror?.vote?.justification.reference ?? ""}
                  choice={drawnJuror.vote?.justification?.choice}
                  answers={answers}
                />
              ),
            }
          : null
      )
      .filter((item) => item !== null);
  }, [drawnJurors, period, answers, isActiveRound]);

  return (
    <>
      {drawnJurors.length === 0 ? (
        <>
          <br />
          <InfoCard msg="Jurors have not been drawn yet." />
        </>
      ) : null}
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
                />
              </StyledCard>
            )
        )}
      </Container>
    </>
  );
};

export default VotesAccordion;
