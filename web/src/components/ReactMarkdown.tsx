import React from "react";
import styled from "styled-components";
import Reactmkdwn from "react-markdown";

const StyledMarkdown = styled(Reactmkdwn)`
  font-size: 16px;
  *,
  ** {
    font-size: 16px;
  }
`;

const ReactMarkdown: React.FC<{ children: string }> = ({ children }) => <StyledMarkdown>{children}</StyledMarkdown>;

export default ReactMarkdown;
