"use client";
import React from "react";
import { ThemeProvider } from "styled-components";

import { theme } from "styles/Theme";

import { GlobalStyle } from "styles/global-style";

const StyledComponentsProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      {children}
    </ThemeProvider>
  );
};

export default StyledComponentsProvider;
