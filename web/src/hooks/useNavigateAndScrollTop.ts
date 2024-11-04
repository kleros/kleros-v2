import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { OverlayScrollContext } from "context/OverlayScrollContext";

export const useNavigateAndScrollTop = () => {
  const navigate = useNavigate();
  const osInstanceRef = useContext(OverlayScrollContext);

  const navigateAndScrollTop = (path) => {
    navigate(path);
    osInstanceRef?.current?.osInstance().elements().viewport.scroll({ top: 0 });
  };

  return navigateAndScrollTop;
};
