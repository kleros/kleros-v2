import React from "react";
import { ThemeProvider } from "styled-components";
import { useLocalStorage } from "hooks/useLocalStorage";
import { ToggleThemeProvider } from "hooks/useToggleThemeContext";
import { GlobalStyle } from "styles/global-style";
import { lightTheme, darkTheme } from "styles/themes";

const StyledComponentsProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [theme, setTheme] = useLocalStorage<string>("theme", "dark");
  const toggleTheme = () => {
    if (theme === "light") setTheme("dark");
    else setTheme("light");
  };
  return (
    <ThemeProvider theme={theme === "light" ? lightTheme : darkTheme}>
      <ToggleThemeProvider {...{ theme, toggleTheme }}>
        <GlobalStyle />
        {children}
      </ToggleThemeProvider>
    </ThemeProvider>
  );
};

export default StyledComponentsProvider;
