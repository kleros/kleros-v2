import "styled-components";

import { lightTheme } from "./themes";

/**
 * The app owns its styled-components theme type. The v2 ui-components-library
 * shipped a compatible theme shape via its exported `lightTheme`/`darkTheme`
 * objects; v3 dropped styled-components theming entirely (it is now CSS-vars +
 * Tailwind based), so `DefaultTheme` is declared here from the local theme.
 */
type KlerosTheme = typeof lightTheme;

declare module "styled-components" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface DefaultTheme extends KlerosTheme {}
}
