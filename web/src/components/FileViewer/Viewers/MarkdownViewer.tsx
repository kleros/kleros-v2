import React from "react";
import styled from "styled-components";

import { type DocRenderer } from "@cyntler/react-doc-viewer";

import MarkdownRenderer from "../../MarkdownRenderer";

const Container = styled.div`
  padding: 16px;
`;

const decodeBase64Utf8 = (base64: string): string => {
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (char) => char.codePointAt(0) ?? 0);
  return new TextDecoder("utf-8").decode(bytes);
};

const decodeFileData = (fileData: string | ArrayBuffer): string => {
  if (fileData instanceof ArrayBuffer) {
    return new TextDecoder("utf-8").decode(fileData);
  }
  if (!fileData.startsWith("data:")) {
    return fileData;
  }
  // RFC 2397: `data:[<mediatype>][;base64],<payload>` — the payload is base64
  // only when `;base64` is the last parameter before the comma; otherwise it's
  // percent-encoded. Dispatching on the header (not on atob success) avoids
  // mis-decoding payloads that happen to be valid base64 by coincidence.
  const commaIdx = fileData.indexOf(",");
  const header = commaIdx === -1 ? "" : fileData.slice("data:".length, commaIdx);
  const payload = commaIdx === -1 ? "" : fileData.slice(commaIdx + 1);
  const isBase64 = header.toLowerCase().endsWith(";base64");
  try {
    return isBase64 ? decodeBase64Utf8(payload) : decodeURIComponent(payload);
  } catch {
    return "";
  }
};

const MarkdownDocRenderer: DocRenderer = ({ mainState: { currentDocument } }) => {
  if (!currentDocument?.fileData) return null;

  return (
    <Container id="md-renderer">
      <MarkdownRenderer content={decodeFileData(currentDocument.fileData)} />
    </Container>
  );
};

MarkdownDocRenderer.fileTypes = ["md", "text/plain"];
MarkdownDocRenderer.weight = 1;

export default MarkdownDocRenderer;
