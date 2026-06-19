import React from "react";
import styled from "styled-components";

import { type DocRenderer } from "@cyntler/react-doc-viewer";

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Image = styled.img`
  max-width: 100%;
`;

// Render SVG via `<img src>` rather than letting @cyntler/react-doc-viewer fall
// back to its "open in new tab" link. `<img>`-loaded SVG runs in the W3C
// "secure static" mode: scripts, event handlers, external `<image>`/`<use>`
// references, CSS `url()`, and `<foreignObject>` are all disabled by the
// browser (the same sandbox GitHub and Wikipedia use for user-uploaded SVGs).
// Without this renderer, DocViewer has no SVG match and the fallback link
// top-frame-navigates to the URL, executing any scripts in the SVG document.
const SvgDocRenderer: DocRenderer = ({ mainState: { currentDocument } }) => {
  if (!currentDocument?.uri) return null;
  return (
    <Container id="image-renderer">
      <Image id="image-img" src={currentDocument.uri} alt={currentDocument.fileName ?? ""} />
    </Container>
  );
};

SvgDocRenderer.fileTypes = ["svg", "image/svg+xml"];
SvgDocRenderer.weight = 1;

export default SvgDocRenderer;
