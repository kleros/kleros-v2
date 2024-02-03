import { Card, CustomAccordion } from "@kleros/ui-components-library";
import React from "react";
import styled from "styled-components";
import { Answer } from "context/NewDisputeContext";
import { DrawnJuror } from "utils/getDrawnJurorsWithCount";
import InfoCard from "components/InfoCard";
import AccordionTitle from "./AccordionTitle";
import { responsiveSize } from "styles/responsiveSize";
import { getVoteChoice } from "utils/getVoteChoice";
import { isUndefined } from "utils/index";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 20px;
  gap: 16px;
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
    padding: ${responsiveSize(8, 24)} ${responsiveSize(8, 16)};
  }
`;

const StyledCard = styled(Card)`
  width: 100%;
  height: auto;
  padding: 11.5px ${responsiveSize(8, 18)};
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
  const accordionItems = drawnJurors
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
            body: drawnJuror.vote?.justification?.choice ? (
              <AccordionContent
                justification={drawnJuror?.vote?.justification.reference ?? ""}
                choice={drawnJuror.vote?.justification?.choice}
                answers={answers}
              />
            ) : null,
          }
        : null
    )
    .filter((item) => item !== null);

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
