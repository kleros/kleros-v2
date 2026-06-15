import React, { useMemo } from "react";
import styled from "styled-components";

import DocViewer, { DocViewerRenderers, type IConfig, type IDocument } from "@cyntler/react-doc-viewer";

import "@cyntler/react-doc-viewer/dist/index.css";
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

const SAFE_URL_SCHEMES = new Set(["http:", "https:", "blob:", "data:"]);

// `data:` URI MIMEs that execute script on top-frame navigation. Modern Chrome
// and Firefox already block most of these via data:-navigation restrictions,
// but coverage varies by version and type (XHTML and XML have historically
// slipped through), so re-enforcing at the gate keeps the threat model
// auditable. SVG is included because `<svg onload>` runs script when navigated
// to (it does not when loaded via `<img src>`, which is how SvgViewer renders
// it). XML/XHTML can execute script via xml-stylesheet processing instructions
// or inline `<script>` once parsed as a document.
const UNSAFE_DATA_MIMES = new Set([
  "text/html",
  "application/xhtml+xml",
  "application/xml",
  "text/xml",
  "image/svg+xml",
]);

/**
 * Returns true if `raw` is a relative URL or uses an allowlisted scheme.
 * Blocks `javascript:`, `vbscript:`, `file:`, `about:`, and anything else that
 * could execute code or escape sandboxing when the underlying viewer (or its
 * "open in new tab" fallback) navigates to it.
 *
 * `allowedDataMimes` is a consumer-supplied override for the default
 * `UNSAFE_DATA_MIMES` blocklist — entries here pass even if blocklisted.
 */
const isSafeUrl = (raw: string, allowedDataMimes: ReadonlySet<string>): boolean => {
  if (typeof raw !== "string" || raw.length === 0) return false;
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    // Relative URLs (e.g. "/foo", "./bar.pdf") throw — they resolve against the
    // page origin and inherit its safety, so they're allowed.
    return true;
  }
  const protocol = parsed.protocol.toLowerCase();
  if (!SAFE_URL_SCHEMES.has(protocol)) return false;
  if (protocol === "data:") {
    const rawMime = parsed.pathname.split(/[,;]/)[0].trim().toLowerCase();
    // Defense-in-depth: spec-compliant browsers do NOT percent-decode the
    // data:-URL mediatype, so an encoded `text%2Fhtml` already fails MIME
    // parsing and falls back to safe `text/plain`. We decode anyway to harden
    // against legacy runtimes; reject if decoding throws so malformed inputs
    // can't slip through.
    let mime: string;
    try {
      mime = decodeURIComponent(rawMime);
    } catch {
      return false;
    }
    if (allowedDataMimes.has(mime)) return true;
    if (UNSAFE_DATA_MIMES.has(mime)) return false;
  }
  return true;
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
    <a href={document?.uri ?? ""} download={fileName} rel="noopener noreferrer" target="_blank">
      Open in a new tab
    </a>
  </Message>
);

/**
 * @description this viewer supports loading multiple files, it can load urls, local files, etc
 * @param url The url of the file to be displayed
 * @param allowedDataMimes Opt-in `data:` MIME types that bypass the script-execution gate (trusted sources only)
 * @returns renders the file
 *
 * Security: rejects `javascript:`, `vbscript:`, `file:`, and other unlisted
 * schemes up front so a hostile `url` can't deliver code execution through the
 * underlying viewer or its fallback download link.
 */
const FileViewer: React.FC<{ url: string; allowedDataMimes?: readonly string[] }> = ({ url, allowedDataMimes }) => {
  const allowedDataMimesSet = useMemo(
    () => new Set((allowedDataMimes ?? []).map((m) => m.toLowerCase())),
    [allowedDataMimes]
  );
  const safe = isSafeUrl(url, allowedDataMimesSet);

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
