import { CustomAccordion } from "@kleros/ui-components-library";
import React from "react";
import styled from "styled-components";
import { responsiveSize } from "styles/responsiveSize";
import { Answer } from "context/NewDisputeContext";
import { isUndefined } from "utils/index";
import { shortenAddress } from "utils/shortenAddress";
import { DrawnJuror } from "utils/getDrawnJurorsWithCount";
import Identicon from "react-identicons";
import InfoCard from "components/InfoCard";

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
const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${responsiveSize(8, 12)};
  flex-wrap: wrap;
`;

const StyledLabel = styled.label<{ variant?: string }>`
  color: ${({ theme, variant }) => (variant ? theme[variant] : theme.primaryText)};
`;

const AccordionTitle: React.FC<{
  juror: string;
  choice?: string;
  voteCount: number;
  period: string;
  answers: Answer[];
}> = ({ juror, choice, voteCount, period, answers }) => {
  const VoteStatus = () => {
    if (isUndefined(choice) && ["appeal", "execution"].includes(period))
      return <StyledLabel>Forgot to vote</StyledLabel>;
    return (
      <StyledLabel>
        {isUndefined(choice) ? (
          "Pending Vote"
        ) : (
          <>
            Voted : <small>{getVoteChoice(parseInt(choice), answers)}</small>
          </>
        )}
      </StyledLabel>
    );
  };
  return (
    <TitleContainer>
      <Identicon size="20" string={juror} />
      <StyledLabel variant="secondaryText">{shortenAddress(juror)}</StyledLabel>
      <VoteStatus />
      <StyledLabel variant="secondaryPurple">
        {voteCount} vote{voteCount > 1 && "s"}
      </StyledLabel>
    </TitleContainer>
  );
};

const AccordionContent: React.FC<{
  justification: string;
}> = ({ justification }) => (
  <JustificationContainer>
    <label>Justification:</label>
    <p>{justification}</p>
  </JustificationContainer>
);

interface VotesAccordion {
  drawnJurors: DrawnJuror[];
  period: string;
  answers: Answer[];
}

const VotesAccordion: React.FC<VotesAccordion> = ({ drawnJurors, period, answers }) => {
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
export const getVoteChoice = (vote: number, answers: { title: string }[]) => {
  const selectedAnswer = answers?.[vote - 1]?.title;
  if (vote === 0) {
    return "Refuse to arbitrate";
  } else if (!isUndefined(selectedAnswer)) {
    return selectedAnswer;
  } else {
    return `Answer 0x${vote}`;
  }
};

export default VotesAccordion;
