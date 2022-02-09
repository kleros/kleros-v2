import React, { useState } from "react";
import styled, { ThemeProvider } from "styled-components";
import { GlobalStyle } from "./styles/global-style";
import { lightTheme, darkTheme } from "./styles/themes";
import Header from "./components/header";
import Main from "./components/main";

const Background = styled.div`
  width: 100vw;
  height: 100vh;
  background: ${({ theme }) => theme.lightBackground};
  display: flex;
  justify-content: center;
  align-items: center;
`;

const App: React.FC = () => {
  const [theme, setTheme] = useState("dark");
  return (
    <ThemeProvider theme={theme === "dark" ? darkTheme : lightTheme}>
      <GlobalStyle />
      <Background>
        <Header
          toggleTheme={() =>
            theme === "dark" ? setTheme("light") : setTheme("dark")
          }
        />
        <Main />
      </Background>
    </ThemeProvider>
  );
};

export default App;
