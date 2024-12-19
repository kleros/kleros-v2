import React from "react";
import ReactDOM from "react-dom";
import styled from "styled-components";

const PortalContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
  width: 100%;
  height: 100%;
`;

const OverlayPortal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return ReactDOM.createPortal(<PortalContainer>{children}</PortalContainer>, document.body);
};

export default OverlayPortal;
