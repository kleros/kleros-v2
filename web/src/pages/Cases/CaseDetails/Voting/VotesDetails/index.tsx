import { CustomAccordion } from "@kleros/ui-components-library";
import React from "react";
import styled from "styled-components";
import { Answer } from "context/NewDisputeContext";
import { DrawnJuror } from "utils/getDrawnJurorsWithCount";
import InfoCard from "components/InfoCard";
import AccordionTitle from "./AccordionTitle";

const StyledAccordion = styled(CustomAccordion)`
  width: 100%;
  > * > button {
    justify-content: unset;
    padding: 11.5px 18px;
    background-color: ${({ theme }) => theme.whiteBackground} !important;
    border: 1px solid ${({ theme }) => theme.stroke} !important;
    > svg {
      fill: ${({ theme }) => theme.primaryText} !important;
    }
  }
  //adds padding to body container
  > * > div > div {
    padding: 8px 16px;
  }
`;
const JustificationContainer = styled.div`
  > p {
    margin: 0px;
  }
`;

const StyledLabel = styled.label`
  color: ${({ theme }) => theme.primaryText};
`;

const AccordionContent: React.FC<{
  justification: string;
}> = ({ justification }) => (
  <JustificationContainer>
    <StyledLabel>Justification:</StyledLabel>
    <p>{justification}</p>
  </JustificationContainer>
);

interface VotesAccordion {
  drawnJurors: DrawnJuror[];
  period: string;
  answers: Answer[];
  isActiveRound: boolean;
}

const VotesAccordion: React.FC<VotesAccordion> = ({ drawnJurors, period, answers, isActiveRound }) => {
  return drawnJurors.length ? (
    <StyledAccordion
      items={
        drawnJurors?.map((drawnJuror) => ({
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
            <AccordionContent justification={drawnJuror?.vote?.justification.reference ?? ""} />
          ) : null,
        })) ?? []
      }
    />
  ) : (
    <>
      <br />
      <InfoCard msg="Jurors have not been drawn yet." />
    </>
  );
};

export default VotesAccordion;
