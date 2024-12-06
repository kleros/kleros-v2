import React, { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useScrollTop } from "hooks/useScrollTop";

const ScrollTop: React.FC = () => {
  const scrollTop = useScrollTop();
  const { search, pathname } = useLocation();
  const navigate = useNavigate();
  const hasScrolled = useRef(false);

  useEffect(() => {
    if (hasScrolled.current) return;
    const params = new URLSearchParams(search);
    const section = params.get("section");

    if (section) {
      const targetElement = document.getElementById(section);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth" });
        hasScrolled.current = true;
        navigate(pathname, { replace: true });
        return;
      }
    }

    scrollTop();
  }, []);

  return null;
};

export default ScrollTop;
