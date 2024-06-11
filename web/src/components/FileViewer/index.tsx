import React from "react";
import styled from "styled-components";

import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";

import "@cyntler/react-doc-viewer/dist/index.css";
import MarkdownRenderer from "./Viewers/MarkdownViewer";

const StyledDocViewer = styled(DocViewer)`
  padding: 0px 8px;
  background-color: ${({ theme }) => theme.whiteBackground} !important;

  #pdf-controls {
    z-index: 0;
  }
`;

/**
 * @description this viewer supports loading multiple files, it can load urls, local files, etc
 * @param url The url of the file to be displayed
 * @returns renders the file
 */
const FileViewer: React.FC<{ url: string }> = ({ url }) => {
  const docs = [{ uri: url }];
  return (
    <StyledDocViewer
      documents={docs}
      pluginRenderers={[...DocViewerRenderers, MarkdownRenderer]}
      config={{
        header: {
          disableHeader: true,
          disableFileName: true,
        },
        pdfZoom: {
          defaultZoom: 1.1, // 1 as default,
          zoomJump: 0.2, // 0.1 as default,
        },
        pdfVerticalScrollByDefault: true, // false as default
      }}
    />
  );
};

export default FileViewer;
