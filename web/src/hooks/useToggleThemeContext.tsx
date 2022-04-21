import React, { createContext, useContext } from "react";

// eslint-disable-next-line @typescript-eslint/no-empty-function
const Context = createContext<[string, () => void]>(["light", () => {}]);

export const ToggleThemeProvider: React.FC<{
  theme: string;
  toggleTheme: () => void;
}> = ({ theme, toggleTheme, children }) => {
  return (
    <Context.Provider value={[theme, toggleTheme]}>{children}</Context.Provider>
  );
};

export const useToggleTheme: () => [string, () => void] = () => {
  const toggleTheme = useContext(Context);
  return toggleTheme;
};
