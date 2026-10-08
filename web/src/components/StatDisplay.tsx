import React from "react";

import useTheme from "hooks/useTheme";
import { cn } from "utils/cn";

const createPair = (iconColor: string, backgroundColor: string) => ({
  iconColor,
  backgroundColor,
});

export interface IStatDisplay {
  title: string | React.ReactNode;
  text: string | React.ReactNode;
  subtext?: string | React.ReactNode;
  icon: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
  color: "red" | "orange" | "green" | "blue" | "purple";
  isSmallDisplay?: boolean;
}

const StatDisplay: React.FC<IStatDisplay> = ({
  title,
  text,
  subtext,
  icon: Icon,
  color,
  isSmallDisplay = false,
  ...props
}) => {
  const theme = useTheme();
  const COLORS = {
    red: createPair(theme.error, theme.errorLight),
    orange: createPair(theme.warning, theme.warningLight),
    green: createPair(theme.success, theme.successLight),
    blue: createPair(theme.primaryBlue, theme.mediumBlue),
    purple: createPair(theme.secondaryPurple, theme.mediumPurple),
  };

  return (
    <div className={cn("flex items-center gap-2", isSmallDisplay ? "w-[151px]" : "max-w-[196px]")} {...props}>
      <div
        className={cn(
          "flex items-center justify-center rounded-full [&_svg]:fill-current",
          isSmallDisplay ? "size-8 [&_svg]:h-5" : "size-12"
        )}
        style={{ color: COLORS[color].iconColor, backgroundColor: COLORS[color].backgroundColor }}
      >
        <Icon />
      </div>
      <div className={cn("flex flex-col", isSmallDisplay ? "gap-[3px]" : "gap-2")}>
        <label className="text-[14px]">{title}</label>
        <label
          className={cn(
            "font-semibold text-klerosUIComponentsPrimaryText",
            isSmallDisplay ? "text-[16px]" : "text-[24px]"
          )}
        >
          {text}
        </label>
        <label className={isSmallDisplay ? "text-[12px]" : "text-[14px]"}>{subtext}</label>
      </div>
    </div>
  );
};

export default StatDisplay;
