import { CustomAccordion } from "@kleros/ui-components-library";
import React from "react";
import styled from "styled-components";
import { Answer } from "context/NewDisputeContext";
import { DrawnJuror } from "utils/getDrawnJurorsWithCount";
import InfoCard from "components/InfoCard";
import AccordionTitle from "./AccordionTitle";
import { responsiveSize } from "styles/responsiveSize";
import { getVoteChoice } from "utils/getVoteChoice";
import { isUndefined } from "utils/index";

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
    padding: 8px ${responsiveSize(8, 16)};
  }
`;
const JustificationContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  > p {
    margin: 0px;
  }
`;

const StyledLabel = styled.label`
  color: ${({ theme }) => theme.primaryText};
`;

const AccordionContent: React.FC<{
  choice?: string;
  answers: Answer[];
  justification: string;
}> = ({ justification, choice, answers }) => (
  <JustificationContainer>
    {!isUndefined(choice) ? (
      <StyledLabel>
        Voted : <small>{getVoteChoice(parseInt(choice), answers)}</small>
      </StyledLabel>
    ) : null}
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
            <AccordionContent
              justification={drawnJuror?.vote?.justification.reference ?? ""}
              choice={drawnJuror.vote?.justification?.choice}
              answers={answers}
            />
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
