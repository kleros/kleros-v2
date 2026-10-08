import React from "react";

import ReactDOM from "react-dom";

const OverlayPortal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return ReactDOM.createPortal(
    <div className="fixed top-0 left-0 z-9999 w-full h-full">{children}</div>,
    document.body
  );
};

export default OverlayPortal;
