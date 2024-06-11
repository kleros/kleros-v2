import React from "react";
import styled from "styled-components";

import { type DocRenderer } from "@cyntler/react-doc-viewer";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dark } from "react-syntax-highlighter/dist/esm/styles/prism";

const Container = styled.div`
  padding: 16px;
`;

const StyledMarkdown = styled(ReactMarkdown)`
  background-color: ${({ theme }) => theme.whiteBackground};
  a {
    font-size: 16px;
  }
`;

const MarkdownRenderer: DocRenderer = ({ mainState: { currentDocument } }) => {
  if (!currentDocument) return null;
  const base64String = (currentDocument.fileData as string).split(",")[1];

  // Decode the base64 string
  const decodedData = atob(base64String);

  return (
    <Container id="md-renderer">
      <StyledMarkdown
        components={{
          code(props) {
            const { children, className, node, ...rest } = props;
            const match = /language-(\w+)/.exec(className || "");
            return match ? (
              <SyntaxHighlighter {...rest} PreTag="div" language={match[1]} style={dark}>
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            ) : (
              <code {...rest} className={className}>
                {children}
              </code>
            );
          },
        }}
      >
        {decodedData}
      </StyledMarkdown>
    </Container>
  );
};

MarkdownRenderer.fileTypes = ["md", "text/plain"];
MarkdownRenderer.weight = 1;

export default MarkdownRenderer;
