import React from "react";
import { createRoot } from "react-dom/client";
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
if (app) {
  const root = createRoot(app);
  root.render(<WebApp />);
}
