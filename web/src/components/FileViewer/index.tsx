import React from "react";
import styled from "styled-components";

import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";

import "@cyntler/react-doc-viewer/dist/index.css";
import { customScrollbar } from "styles/customScrollbar";

import MarkdownRenderer from "./Viewers/MarkdownViewer";

const Wrapper = styled.div`
  background-color: ${({ theme }) => theme.whiteBackground};
  border-radius: 3px;
  box-shadow: 0px 2px 3px 0px rgba(0, 0, 0, 0.06);
  max-height: 1050px;
  overflow: scroll;

  ${customScrollbar}
`;

const StyledDocViewer = styled(DocViewer)`
  background-color: ${({ theme }) => theme.whiteBackground} !important;
`;

/**
 * @description this viewer supports loading multiple files, it can load urls, local files, etc
 * @param url The url of the file to be displayed
 * @returns renders the file
 */
const FileViewer: React.FC<{ url: string }> = ({ url }) => {
  const docs = [{ uri: url }];
  return (
    <Wrapper className="file-viewer-wrapper">
      <StyledDocViewer
        documents={docs}
        pluginRenderers={[...DocViewerRenderers, MarkdownRenderer]}
        config={{
          header: {
            disableHeader: true,
            disableFileName: true,
          },
          pdfZoom: {
            defaultZoom: 0.8,
            zoomJump: 0.1,
          },
          pdfVerticalScrollByDefault: true, // false as default
        }}
      />
    </Wrapper>
  );
};

export default FileViewer;
