import React, { createContext, useContext } from "react";

const Context = createContext<[string, () => void]>([
  "light",
  () => {
    // default empty-function
  },
]);

export const ToggleThemeProvider: React.FC<{
  children: React.ReactNode;
  theme: string;
  toggleTheme: () => void;
}> = ({ theme, toggleTheme, children }) => {
  return (
    <Context.Provider value={[theme, toggleTheme]}>{children}</Context.Provider>
  );
};

export const useToggleTheme: () => [string, () => void] = () => {
  return useContext(Context);
};
