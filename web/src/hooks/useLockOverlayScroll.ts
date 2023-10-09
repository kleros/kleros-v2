import { useContext, useEffect, useCallback } from "react";
import { OverlayScrollContext } from "context/OverlayScrollContext";

export const useLockOverlayScroll = (shouldLock: boolean) => {
  const osInstanceRef = useContext(OverlayScrollContext);

  const lockScroll = useCallback(() => {
    const osInstance = osInstanceRef?.current?.osInstance();
    if (osInstance) {
      osInstance.options({ overflow: { x: "hidden", y: "hidden" } });
    }
  }, [osInstanceRef]);

  const unlockScroll = useCallback(() => {
    const osInstance = osInstanceRef?.current?.osInstance();
    if (osInstance) {
      osInstance.options({ overflow: { x: "scroll", y: "scroll" } });
    }
  }, [osInstanceRef]);

  useEffect(() => {
    if (shouldLock) {
      lockScroll();
    } else {
      unlockScroll();
    }
  }, [shouldLock, lockScroll, unlockScroll]);
};
