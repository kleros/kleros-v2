import React from "react";
import styled from "styled-components";

import { type DocRenderer } from "@cyntler/react-doc-viewer";
import ReactMarkdown from "react-markdown";

const Container = styled.div`
  padding: 16px;
`;

const StyledMarkdown = styled(ReactMarkdown)`
  background-color: ${({ theme }) => theme.whiteBackground};
  a {
    font-size: 16px;
  }
  code {
    color: ${({ theme }) => theme.secondaryText};
  }
`;

const MarkdownRenderer: DocRenderer = ({ mainState: { currentDocument } }) => {
  if (!currentDocument) return null;
  const base64String = (currentDocument.fileData as string).split(",")[1];

  // Decode the base64 string
  const decodedData = atob(base64String);

  return (
    <Container id="md-renderer">
      <StyledMarkdown>{decodedData}</StyledMarkdown>
    </Container>
  );
};

MarkdownRenderer.fileTypes = ["md", "text/plain"];
MarkdownRenderer.weight = 1;

export default MarkdownRenderer;
