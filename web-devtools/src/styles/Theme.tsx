import React from "react";
import { ThemeProvider } from "styled-components";

import { darkTheme } from "@kleros/ui-components-library";

const theme = {
  ...darkTheme,
};

const Theme = ({ children }: Readonly<{ children: React.ReactNode }>) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
);

export default Theme;
