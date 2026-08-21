import React from "react";
import styled from "styled-components";

import InfoIcon from "svgs/icons/info-circle.svg";

import { MIN_VOTE_JUSTIFICATION_LENGTH } from "src/utils/voteJustification";

import MarkdownEditor from "components/MarkdownEditor";

const MessageContainer = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 8px;
`;

const MessageText = styled.small`
  font-size: 14px;
  font-weight: 400;
  color: ${({ theme }) => theme.secondaryText};
  hyphens: auto;
  line-height: 1.4;
`;

const StyledInfoIcon = styled(InfoIcon)`
  width: 16px;
  height: 16px;
  fill: ${({ theme }) => theme.secondaryText} !important;
  flex-shrink: 0;
  margin-top: 2px;

  path {
    fill: ${({ theme }) => theme.secondaryText} !important;
  }

  * {
    fill: ${({ theme }) => theme.secondaryText} !important;
  }
`;

interface IJustificationArea {
  justification: string;
  setJustification: (arg0: string) => void;
}

const JustificationArea: React.FC<IJustificationArea> = ({ justification, setJustification }) => (
  <>
    <MarkdownEditor value={justification} onChange={setJustification} placeholder="Justify your vote..." />
    <MessageContainer>
      <StyledInfoIcon />
      <MessageText>
        {`A good justification contributes to case comprehension. ` +
          `Low quality justifications can be challenged. Minimum ${MIN_VOTE_JUSTIFICATION_LENGTH} characters.`}
      </MessageText>
    </MessageContainer>
  </>
);

export default JustificationArea;
