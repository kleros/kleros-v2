import React from "react";
import styled from "styled-components";

import { Textarea } from "@kleros/ui-components-library";

import { getMissingJustificationCharacters, MIN_VOTE_JUSTIFICATION_LENGTH } from "utils/voteJustification";

const StyledTextarea = styled(Textarea)`
  width: 100%;
  height: auto;
  textarea {
    height: 200px;
    border-color: ${({ theme }) => theme.stroke};
  }
  small {
    font-weight: 400;
    hyphens: auto;
  }
`;

interface IJustificationArea {
  justification: string;
  setJustification: (arg0: string) => void;
}

const JustificationArea: React.FC<IJustificationArea> = ({ justification, setJustification }) => {
  const missing = getMissingJustificationCharacters(justification);
  const isIncomplete = justification.trim() !== "" && missing > 0;
  const length = MIN_VOTE_JUSTIFICATION_LENGTH - missing;

  return (
    <StyledTextarea
      dir="auto"
      value={justification}
      onChange={(e) => setJustification(e.target.value)}
      placeholder="Justify your vote..."
      message={
        isIncomplete
          ? `A justification is required to vote: ${missing} more characters needed ` +
            `(${length}/${MIN_VOTE_JUSTIFICATION_LENGTH}).`
          : `A good justification contributes to case comprehension. ` +
            `Low quality justifications can be challenged. Minimum ${MIN_VOTE_JUSTIFICATION_LENGTH} characters.`
      }
      variant={missing > 0 ? "warning" : "info"}
    />
  );
};

export default JustificationArea;
