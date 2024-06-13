import { css } from "styled-components";

export const customScrollbar = css`
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  ::-webkit-scrollbar-track {
    background: transparent;
  }
  ::-webkit-scrollbar-thumb {
    background-color: ${({ theme }) => theme.violetPurple};
    border-radius: 10px;
    transition: opacity 0.15s, background-color 0.15s, border-color 0.15s, width 0.15s;
  }
  ::-webkit-scrollbar-thumb:hover {
    background-color: ${({ theme }) => theme.secondaryPurple};
  }
  ::-webkit-scrollbar-thumb:active {
    background-color: ${({ theme }) => theme.lavenderPurple};
  }

  // firefox
  scrollbar-width: thin;
  scrollbar-color: ${({ theme }) => theme.violetPurple} transparent;
`;
