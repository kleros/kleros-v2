import { useContext } from "react";
import { OverlayScrollContext } from "context/OverlayScrollContext";

export const useScrollTop = () => {
  const osInstanceRef = useContext(OverlayScrollContext);

  const scrollTop = () => {
    osInstanceRef?.current?.osInstance().elements().viewport.scroll({ top: 0 });
  };

  return scrollTop;
};
