import React, { useEffect } from "react";

import { useScrollTop } from "hooks/useScrollTop";

const ScrollTop: React.FC = () => {
  const scrollTop = useScrollTop();

  useEffect(() => {
    scrollTop();
  });

  return <></>;
};
export default ScrollTop;
