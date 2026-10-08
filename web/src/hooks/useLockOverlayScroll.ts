import { useContext, useEffect } from "react";

import { OverlayScrollContext } from "context/OverlayScrollContext";

/**
 * Locks the page scroll while `shouldLock`. It unlocks on close or unmount, and only what it locked,
 * so a popup opening as another one closes keeps its lock.
 */
export const useLockOverlayScroll = (shouldLock: boolean) => {
  const osInstanceRef = useContext(OverlayScrollContext);

  useEffect(() => {
    const osInstance = osInstanceRef?.current?.osInstance();
    if (!shouldLock || !osInstance) return;
    osInstance.options({ overflow: { x: "hidden", y: "hidden" } });
    return () => {
      osInstance.options({ overflow: { x: "scroll", y: "scroll" } });
    };
  }, [shouldLock, osInstanceRef]);
};
