import React, { type CSSProperties } from "react";

import KlerosIcon from "svgs/icons/kleros.svg";

import { cn } from "utils/cn";

type Width = CSSProperties["width"];
type Height = CSSProperties["height"];

interface ILoader {
  width?: Width;
  height?: Height;
  className?: string;
}

const Loader: React.FC<ILoader> = ({ width = "100%", height = "100%", className }) => (
  <div className={cn("m-auto", className)} style={{ width, height }}>
    <KlerosIcon className="animate-[kleros-breathing_2s_ease-out_infinite_normal] [&_path]:fill-klerosUIComponentsStroke" />
  </div>
);

export default Loader;
