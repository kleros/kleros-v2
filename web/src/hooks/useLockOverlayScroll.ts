import { useContext, useEffect } from "react";

import { OverlayScrollContext } from "context/OverlayScrollContext";

// Popups can overlap (e.g. a vote's success popup opening while the settings menu is open), so locks are counted.
const lockCounts = new WeakMap<object, number>();

/**
 * Locks the page scroll while `shouldLock`. It unlocks on close or unmount, once every popup that locked it has
 * released it.
 */
export const useLockOverlayScroll = (shouldLock: boolean) => {
  const osInstanceRef = useContext(OverlayScrollContext);

  useEffect(() => {
    const osInstance = osInstanceRef?.current?.osInstance();
    if (!shouldLock || !osInstance) return;
    lockCounts.set(osInstance, (lockCounts.get(osInstance) ?? 0) + 1);
    osInstance.options({ overflow: { x: "hidden", y: "hidden" } });
    return () => {
      const count = (lockCounts.get(osInstance) ?? 1) - 1;
      lockCounts.set(osInstance, count);
      if (count === 0) osInstance.options({ overflow: { x: "scroll", y: "scroll" } });
    };
  }, [shouldLock, osInstanceRef]);
};
