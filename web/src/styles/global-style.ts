import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  body {
    font-family: "Open Sans", sans-serif;
    margin: 0px;
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

  h1 {
    font-weight: 600;
    font-size: 24px;
    line-height: 32px;
    color: ${({ theme }) => theme.primaryText};
  }

  h2 {
    font-weight: 400;
    font-size: 24px;
    line-height: 32px;
    color: ${({ theme }) => theme.primaryText};
  }

  h3 {
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
    color: ${({ theme }) => theme.primaryText};
  }

  p {
    font-weight: 400;
    font-size: 16px;
    line-height: 24px;
    color: ${({ theme }) => theme.primaryText};
  }

  s {
    font-weight: 600;
    font-size: 14px;
    line-height: 18px;
    color: ${({ theme }) => theme.primaryText};
  }

  label {
    font-weight: 400;
    font-size: 14px;
    line-height: 18px;
    color: ${({ theme }) => theme.secondaryText};
  }

  hr {
    opacity: 1;
    border: 1px solid ${({ theme }) => theme.stroke};
  }

  svg, img {
    display: inline-block;
    vertical-align: middle;
  }
`;
