import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  body {
    font-family: "Open Sans", sans-serif;
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

  hr {
    opacity: 1;
  }

  svg, img {
    display: inline-block;
    vertical-align: middle;
  }
`;
