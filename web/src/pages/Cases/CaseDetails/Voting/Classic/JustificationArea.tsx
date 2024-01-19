import React from "react";
import styled from "styled-components";
import { Textarea } from "@kleros/ui-components-library";

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

const JustificationArea: React.FC<IJustificationArea> = ({ justification, setJustification }) => (
  <StyledTextarea
    value={justification}
    onChange={(e) => setJustification(e.target.value)}
    placeholder="Justify your vote..."
    message={
      "A good justification contributes to case comprehension. " + "Low quality justifications can be challenged."
    }
    variant="info"
  />
);

export default JustificationArea;
