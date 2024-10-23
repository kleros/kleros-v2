import React from "react";

import { DesktopHeader } from "./DesktopHeader";
import { MobileHeader } from "./MobileHeader";

const Header: React.FC = () => {
  return (
    <>
      <MobileHeader />
      <DesktopHeader />
    </>
  );
};

export default Header;
