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
    font-size: 24px;
    font-weight: 600;
    line-height: 33px;
    margin: 0;
    color: ${(props) => props.theme.primaryText}
  }
  h2 {
    font-size: 16px;
    font-weight: 600;
    line-height: 22px;
    margin: 0;
    color: ${(props) => props.theme.primaryText}
  }
  p {
    font-size: 16px;
    font-weight: 400;
    line-height: 22px;
    margin: 0;
    color: ${(props) => props.theme.primaryText};
    overflow-wrap: break-word;
    white-space: pre-wrap;
  }
  small {
    font-size: 14px;
    font-weight: 400;
    line-height: 19px;
    margin: 0;
    color: ${(props) => props.theme.secondaryText};
    overflow-wrap: break-word;
    white-space: pre-wrap;
  }
  hr {
    opacity: 1;
  }
  svg, img {
    display: inline-block;
    vertical-align: middle;
  }
  /**
   * 1. Change the font styles in all browsers.
   * 2. Remove the margin in Firefox and Safari.
   */
  button,
  input,
  optgroup,
  select,
  textarea {
    font-family: inherit; /* 1 */
    font-size: 100%; /* 1 */
    line-height: 1.15; /* 1 */
    margin: 0; /* 2 */
    border: none;
  }
  /**
   * Show the overflow in IE.
   * 1. Show the overflow in Edge.
   */
  button,
  input { /* 1 */
    overflow: visible;
  }
  /**
   * Remove the inheritance of text transform in Edge, Firefox, and IE.
   * 1. Remove the inheritance of text transform in Firefox.
   */
  button,
  select { /* 1 */
    text-transform: none;
  }
  /**
   * Correct the inability to style clickable types in iOS and Safari.
   */
  button,
  [type="button"],
  [type="reset"],
  [type="submit"] {
    -webkit-appearance: button;
    :hover:enabled {
      cursor: pointer;
    }
  }
`;
