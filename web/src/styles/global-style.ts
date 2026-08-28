import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  :root {
    --toastify-color-info: ${({ theme }) => theme.primaryBlue};
    --toastify-color-success: ${({ theme }) => theme.success};
    --toastify-color-warning: ${({ theme }) => theme.warning};
    --toastify-color-error: ${({ theme }) => theme.error};
  }

  .react-loading-skeleton {
    z-index: 0;
    --base-color: ${({ theme }) => theme.skeletonBackground};
    --highlight-color: ${({ theme }) => theme.skeletonHighlight};
  }

  body {
    font-family: "Open Sans", sans-serif;
    margin: 0px;
    background-color: ${({ theme }) => theme.lightBlue};
  }

  html {
    box-sizing: border-box;
  }

  *, *:before, *:after {
    box-sizing: inherit;
  }

  *:focus {
    outline: none;
  }

  .ReactModal__Overlay {
    background-color: #1b003fcc !important;
    z-index: 10000;
  }

  /* Base element typography lives in styles/base-elements.css (see there). */

  textarea {
    font-family: "Open Sans";
    font-size: 14px;
  }

  input {
    font-size: 14px;
  }

  hr {
    opacity: 1;
    border: 1px solid ${({ theme }) => theme.stroke};
  }

  svg, img {
    display: inline-block;
    vertical-align: middle;
    visibility: visible;
  }

  .os-theme-dark {
    --os-handle-bg: ${({ theme }) => theme.violetPurple};
    --os-handle-bg-hover: ${({ theme }) => theme.secondaryPurple};
    --os-handle-bg-active: ${({ theme }) => theme.lavenderPurple};
  }

  // @cyntler/react-doc-viewer injects a canvas to load pdf, this is alters the height of body tag, so set to hidden
  .hiddenCanvasElement{
    display: none;
  }

  [class*="Toastify__toast-container"] {
    top: unset;
    padding-top: 20px !important;
  }
`;
