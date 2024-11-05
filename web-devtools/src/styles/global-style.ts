import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  :root {
    --toastify-color-info: ${({ theme }) => theme.klerosUIComponentsPrimaryBlue};
    --toastify-color-success: ${({ theme }) => theme.klerosUIComponentsSuccess};
    --toastify-color-warning: ${({ theme }) => theme.klerosUIComponentsWarning};
    --toastify-color-error: ${({ theme }) => theme.klerosUIComponentsError};
  }

  .react-loading-skeleton {
    z-index: 0;
    --base-color: ${({ theme }) => theme.klerosUIComponentsSkeletonBackground};
    --highlight-color: ${({ theme }) => theme.klerosUIComponentsSkeletonHighlight};
  }

  body {
    font-family: "Open Sans", sans-serif;
    margin: 0px;
    background-color: ${({ theme }) => theme.klerosUIComponentsLightBackground};
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
  }

  h1 {
    margin: 0 0 16px 0;
    font-weight: 600;
    font-size: 24px;
    line-height: 32px;
    color: ${({ theme }) => theme.klerosUIComponentsPrimaryText};
  }

  h2 {
    margin: 0 0 16px 0;
    font-weight: 400;
    font-size: 24px;
    line-height: 32px;
    color: ${({ theme }) => theme.klerosUIComponentsPrimaryText};
  }

  h3 {
    margin: 0 0 16px 0;
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
    color: ${({ theme }) => theme.klerosUIComponentsPrimaryText};
  }

  p {
    font-weight: 400;
    font-size: 16px;
    line-height: 24px;
    color: ${({ theme }) => theme.klerosUIComponentsPrimaryText};
  }

  textarea {
    font-family: "Open Sans";
    font-size: 14px;
  }

  small {
    font-weight: 600;
    font-size: 14px;
    line-height: 18px;
    color: ${({ theme }) => theme.klerosUIComponentsPrimaryText};
  }

  label {
    font-weight: 400;
    font-size: 14px;
    line-height: 18px;
    color: ${({ theme }) => theme.klerosUIComponentsSecondaryText};
  }

  a {
    font-weight: 400;
    font-size: 14px;
    text-decoration: none;
    color: ${({ theme }) => theme.klerosUIComponentsPrimaryBlue};
  }

  hr {
    opacity: 1;
    border: 1px solid ${({ theme }) => theme.klerosUIComponentsStroke};
  }

  svg, img {
    display: inline-block;
    vertical-align: middle;
  visibility: visible;

  }

  ul, ol {
    li {
      color: ${({ theme }) => theme.klerosUIComponentsPrimaryText};
    }
  }

  .os-theme-dark {
    --os-handle-bg: ${({ theme }) => theme.klerosUIComponentsVioletPurple};
    --os-handle-bg-hover: ${({ theme }) => theme.klerosUIComponentsSecondaryPurple};
    --os-handle-bg-active: ${({ theme }) => theme.klerosUIComponentsLavenderPurple};
  }
`;
