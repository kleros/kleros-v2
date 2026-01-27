import React from "react";
import styled from "styled-components";

import { type DocRenderer } from "@cyntler/react-doc-viewer";

import MarkdownRenderer from "../../MarkdownRenderer";

const Container = styled.div`
  padding: 16px;
`;

const MarkdownDocRenderer: DocRenderer = ({ mainState: { currentDocument } }) => {
  if (!currentDocument) return null;
  const base64String = (currentDocument.fileData as string).split(",")[1];

  // Decode the base64 string
  const decodedData = atob(base64String);

  return (
    <Container id="md-renderer">
      <MarkdownRenderer content={decodedData} />
    </Container>
  );
};

MarkdownDocRenderer.fileTypes = ["md", "text/plain"];
MarkdownDocRenderer.weight = 1;

export default MarkdownDocRenderer;
