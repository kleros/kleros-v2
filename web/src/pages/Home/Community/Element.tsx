import React from "react";

import { ExternalLink } from "components/ExternalLink";

export interface IElement {
  Icon?: React.FC<React.SVGAttributes<SVGElement>>;
  title: string;
  link: string;
  primaryText?: string;
}

export const Element: React.FC<IElement> = ({ primaryText, title, link, Icon }) => (
  <div className="flex gap-2 items-center flex-wrap [&_svg]:w-[16px] [&_svg]:h-[16px]">
    <ExternalLink to={link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
      {Icon && <Icon />}
      {title}
    </ExternalLink>
    {primaryText && <label className="text-klerosUIComponentsPrimaryText font-semibold">{primaryText}</label>}
  </div>
);
