import React from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { GlobalStyle } from "./styles/global-style";
import { lightTheme } from "./styles/themes";
import Layout from "components/layout";

const WebApp = () => (
  <React.StrictMode>
    <HashRouter>
      <ThemeProvider theme={lightTheme}>
        <GlobalStyle />
        <Layout />
      </ThemeProvider>
    </HashRouter>
  </React.StrictMode>
);

const app = document.getElementById("app");
if (app) {
  const root = createRoot(app);
  root.render(<WebApp />);
}
