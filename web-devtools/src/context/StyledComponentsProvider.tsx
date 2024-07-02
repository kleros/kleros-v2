"use client";
import React from "react";
import { ThemeProvider } from "styled-components";

import { darkTheme } from "@kleros/ui-components-library";

import { GlobalStyle } from "styles/global-style";

const StyledComponentsProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <ThemeProvider theme={darkTheme}>
      <GlobalStyle />
      {children}
    </ThemeProvider>
  );
};

export default StyledComponentsProvider;
