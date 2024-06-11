import { useMemo } from "react";

import { useWindowSize } from "react-use";

import { BREAKPOINT_LANDSCAPE } from "styles/landscapeStyle";

const useIsDesktop = () => {
  const { width } = useWindowSize();
  return useMemo(() => width > BREAKPOINT_LANDSCAPE, [width]);
};

export default useIsDesktop;
