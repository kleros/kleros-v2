import React from "react";
import styled from "styled-components";

import Reactmkdwn from "react-markdown";

const StyledMarkdown = styled(Reactmkdwn)`
  font-size: 16px;
`;

const ReactMarkdown: React.FC<{ children: string }> = ({ children }) => {
  if (!children) {
    return <div>No content available</div>;
  }
  try {
    return <StyledMarkdown>{children}</StyledMarkdown>;
  } catch (error) {
    return <div>Error rendering content</div>;
  }
};

export default ReactMarkdown;
