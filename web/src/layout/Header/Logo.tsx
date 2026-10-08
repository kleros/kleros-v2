import React from "react";

import { Link } from "react-router-dom";

import KlerosCourtLogo from "svgs/header/kleros-court.svg";

import { cn } from "utils/cn";

const Logo: React.FC = () => (
  <div className="flex flex-row items-center gap-4">
    <Link to={"/"}>
      <KlerosCourtLogo
        className={cn(
          "[transition:0.1s] max-h-[40px] w-auto",
          "[&:hover_path]:[fill:color-mix(in_srgb,_var(--klerosUIComponentsWhite)_74.90196078431373%,_transparent)]"
        )}
      />
    </Link>
  </div>
);

export default Logo;
