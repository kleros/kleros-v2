import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  html {
    box-sizing: border-box;
    margin: 0px;
  }

  *, *:before, *:after {
    box-sizing: inherit;
    margin: inherit;
  }

  body {
    font-family: "Open Sans", sans-serif;
  }

  hr {
    opacity: 1;
  }

  svg, img {
    display: inline-block;
    vertical-align: middle;
  }
`;
