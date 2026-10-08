import React, { useEffect } from "react";

import { useLocalStorage } from "hooks/useLocalStorage";
import { ToggleThemeProvider } from "hooks/useToggleThemeContext";

const ThemeProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [theme, setTheme] = useLocalStorage<string>("theme", "dark");
  const toggleTheme = () => {
    if (theme === "light") setTheme("dark");
    else setTheme("light");
  };

  // The `dark` class drives the ui-components-library's CSS variables (`:root.dark`
  // in its theme.css) and styles/base-elements.css. index.html only sets it pre-paint.
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme !== "light");
  }, [theme]);

  return <ToggleThemeProvider {...{ theme, toggleTheme }}>{children}</ToggleThemeProvider>;
};

export default ThemeProvider;
