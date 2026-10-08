import styled, { css } from "styled-components";

import { MAX_WIDTH_LANDSCAPE, landscapeStyle } from "styles/landscapeStyle";
import { responsiveSize } from "styles/responsiveSize";

// Landscape-only: mirrors HeaderContainer so popups anchor to the header's content box, not
// the viewport. Two elements: the popups' absolute left/right: 0 resolve against the padding
// box, so the padding here can't inset them — the inner relative div marks the content edge.
// Below landscape the popups place themselves; staying inert lets their top/left percentages
// resolve against the Overlay.
export const PopupAnchor = styled.div`
  ${landscapeStyle(
    () => css`
      width: 100%;
      max-width: ${MAX_WIDTH_LANDSCAPE};
      margin: 0 auto;
      padding: 0 ${responsiveSize(0, 132)};
    `
  )}
`;

export const PopupAnchorInner = styled.div`
  ${landscapeStyle(
    () => css`
      position: relative;
    `
  )}
`;
