import { darkTheme, lightTheme, type Theme } from "styles/themes";

import { useToggleTheme } from "./useToggleThemeContext";

/** Use resolved colors only where an API cannot consume CSS variables (for example canvas). */
export const useTheme = (): Theme => {
  const [theme] = useToggleTheme();
  return theme === "light" ? lightTheme : darkTheme;
};

export default useTheme;
