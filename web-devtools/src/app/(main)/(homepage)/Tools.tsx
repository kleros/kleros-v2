import React from "react";

import Link from "next/link";

import PaperIcon from "svgs/icons/arrow.svg";

import { cn } from "utils/cn";

const tools = [
  { name: "Dispute Templates Preview", route: "/dispute-template" },
  { name: "Configure Ruler", route: "/ruler" },
  { name: "Courts Manager (coming soon)", route: "/" },
  { name: "Arbitrable Explorer (coming soon)", route: "/" },
];

const Tools: React.FC = () => {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-4 rounded-t-[3px] border-t-[3px]",
        "border-klerosUIComponentsSecondaryPurple bg-klerosUIComponentsWhiteBackground p-4"
      )}
    >
      <p>Tools</p>
      <div className="grid w-full grid-cols-2 gap-2 max-[768px]:grid-cols-1">
        {tools.map((tool, index) => (
          <li
            className={cn(
              "flex w-full items-center gap-2 rounded-[3px] border border-klerosUIComponentsLightBlue",
              "bg-klerosUIComponentsLightBackground p-4 transition-colors duration-300"
            )}
            key={index}
          >
            <Link href={tool.route} passHref>
              <div className="flex w-full items-center gap-2 text-klerosUIComponentsSecondaryText no-underline">
                <div
                  className={cn(
                    "flex items-center justify-center [&_svg]:size-3",
                    "[&_svg]:fill-klerosUIComponentsSecondaryPurple"
                  )}
                >
                  <PaperIcon />
                </div>
                <span className="text-base">{tool.name}</span>
              </div>
            </Link>
          </li>
        ))}
      </div>
    </div>
  );
};

export default Tools;
