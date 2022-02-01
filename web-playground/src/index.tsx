import React from "react";
import ReactDOM from "react-dom";
import { ThemeProvider } from "styled-components";
import { GlobalStyle } from "./styles/global-style";
import { lightTheme } from "./styles/themes";

const WebApp = () => (
  <React.StrictMode>
    <ThemeProvider theme={lightTheme}>
      <GlobalStyle />
      <h1>Hello World</h1>
    </ThemeProvider>
  </React.StrictMode>
);

const app = document.getElementById("app");
ReactDOM.render(<WebApp />, app);
