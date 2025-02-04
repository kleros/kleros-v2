import { useContext } from "react";
import { OverlayScrollContext } from "context/OverlayScrollContext";

export const useScrollTop = () => {
  const osInstanceRef = useContext(OverlayScrollContext);

  const scrollTop = (smooth = false) => {
    osInstanceRef?.current
      ?.osInstance()
      .elements()
      .viewport.scroll({ top: 0, behavior: smooth ? "smooth" : "auto" });
  };

  return scrollTop;
};
