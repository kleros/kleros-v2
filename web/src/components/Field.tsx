import React from "react";

import { cn } from "utils/cn";

import { InternalLink } from "./InternalLink";

export interface IField {
  icon: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
  name: string;
  value: string;
  link?: string;
  width?: string;
  isOverview?: boolean;
  isJurorBalance?: boolean;
  className?: string;
}

const Field: React.FC<IField> = ({ icon: Icon, name, value, link, isOverview, isJurorBalance, className }) => {
  return (
    <div
      dir="auto"
      className={cn(
        "flex w-full items-center justify-start whitespace-nowrap [&_.value]:grow [&_.value]:text-end",
        "[&_.value]:text-klerosUIComponentsPrimaryText [&_svg]:mr-2 [&_svg]:w-3.5 [&_svg]:shrink-0",
        "[&_svg]:fill-klerosUIComponentsSecondaryPurple",
        (isOverview || isJurorBalance) &&
          "lg:w-auto lg:gap-2 lg:[&_.value]:grow-0 lg:[&_.value]:font-semibold lg:[&_a]:font-semibold lg:[&_svg]:mr-0",
        className
      )}
    >
      <Icon />
      <label>{name}:</label>
      {link ? (
        <div className={cn("pb-0.25", "value")}>
          <InternalLink
            to={link}
            onClick={(event) => {
              event.stopPropagation();
            }}
            className="flex [text-wrap:auto] justify-end leading-[1.25]"
          >
            {value}
          </InternalLink>
        </div>
      ) : (
        <label className="value">{value}</label>
      )}
    </div>
  );
};
export default Field;
