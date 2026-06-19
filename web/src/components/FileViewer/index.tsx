import React, { useMemo } from "react";
import styled from "styled-components";

import DocViewer, { DocViewerRenderers, type IConfig, type IDocument } from "@cyntler/react-doc-viewer";

import "@cyntler/react-doc-viewer/dist/index.css";
import { isValidUrl } from "utils/urlValidation";

import { customScrollbar } from "styles/customScrollbar";

import MarkdownRenderer from "./Viewers/MarkdownViewer";
import SvgRenderer from "./Viewers/SvgViewer";

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

  #pdf-controls {
    z-index: 3;
  }

  [class*="--loading"] {
    color: ${({ theme }) => theme.secondaryText};
  }
`;

const Message = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 24px;
  color: ${({ theme }) => theme.secondaryText};
  font-size: 14px;

  .url {
    font-family: monospace;
    font-size: 12px;
    word-break: break-all;
  }

  a {
    color: ${({ theme }) => theme.primaryBlue};
    text-decoration: underline;
  }
`;

// Only http/https render. court v2 exclusively loads https IPFS attachments
// (gated upstream by getAllowedAttachmentUrl in utils/urlValidation), so the
// viewer stays strict: data:, blob:, file:, etc. are rejected until a real use
// case requires them.
const SAFE_URL_SCHEMES = new Set(["http:", "https:"]);

/**
 * Returns true if `raw` is a relative URL, or an http/https URL that survives
 * the shared sanitizer. `isValidUrl` (@braintree/sanitize-url) strips
 * `javascript:`/`data:`/`vbscript:` plus control-character and HTML-entity
 * obfuscation; the scheme allowlist additionally blocks `blob:`/`file:`/
 * `about:` and custom schemes the sanitizer lets through.
 */
const isSafeUrl = (raw: string): boolean => {
  if (!isValidUrl(raw)) return false;
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    // Relative URLs (e.g. "/foo", "./bar.pdf") throw — they resolve against the
    // page origin and inherit its safety, so they're allowed.
    return true;
  }
  return SAFE_URL_SCHEMES.has(parsed.protocol.toLowerCase());
};

const fileNameIfIpfsUrl = (url: string) => {
  if (!url || typeof url !== "string") {
    return "document";
  }
  const ipfsPattern = /(?:ipfs:\/\/|https?:\/\/(?:[A-Za-z0-9.-]+)\/ipfs\/)([A-Za-z0-9]+[A-Za-z0-9\-_]*)\/?(.*)/;

  const match = ipfsPattern.exec(url);

  if (match) {
    const ipfsHash = match[1];
    const path = match[2] || "";

    const sanitizedPath = path.replace(/\//g, "_");

    return `ipfs-${ipfsHash}${sanitizedPath ? "_" + sanitizedPath : ""}`;
  } else {
    return "document";
  }
};

const NoRendererFallback = ({ document, fileName }: { document: IDocument | undefined; fileName: string }) => (
  <Message>
    <p>This file type can&apos;t be previewed.</p>
    {document?.uri ? (
      <a href={document.uri} download={fileName} rel="noopener noreferrer" target="_blank">
        Open in a new tab
      </a>
    ) : null}
  </Message>
);

/**
 * @description this viewer supports loading multiple files, it can load urls, local files, etc
 * @param url The url of the file to be displayed
 * @returns renders the file
 *
 * Security: only http/https URLs that pass the shared sanitizer render;
 * `data:`, `blob:`, `javascript:`, and other schemes show a fallback message
 * instead, so a hostile `url` can't deliver code execution through the
 * underlying viewer or its fallback download link.
 */
const FileViewer: React.FC<{ url: string }> = ({ url }) => {
  const safe = isSafeUrl(url);

  const fileName = fileNameIfIpfsUrl(url);
  const docs = useMemo(() => [{ uri: url, fileName }], [url, fileName]);

  const config: IConfig = {
    header: {
      disableHeader: true,
      disableFileName: true,
    },
    pdfZoom: {
      defaultZoom: 0.8,
      zoomJump: 0.1,
    },
    pdfVerticalScrollByDefault: true, // false as default
    noRenderer: {
      overrideComponent: NoRendererFallback,
    },
  };

  return (
    <Wrapper className="file-viewer-wrapper">
      {safe ? (
        <StyledDocViewer
          documents={docs}
          pluginRenderers={[...DocViewerRenderers, MarkdownRenderer, SvgRenderer]}
          config={config}
        />
      ) : (
        <Message>
          <p>Unable to display this file.</p>
          <p className="url">{url}</p>
        </Message>
      )}
    </Wrapper>
  );
};

export default FileViewer;
