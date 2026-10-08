import React, { useMemo } from "react";

import useTheme from "hooks/useTheme";
import { cn } from "utils/cn";

import { type Theme } from "styles/themes";

const COLORS: Record<string, Array<keyof Theme>> = {
  red: ["error", "errorLight"],
  green: ["success", "successLight"],
  blue: ["primaryBlue", "mediumBlue"],
  purple: ["secondaryPurple", "mediumPurple"],
  lightPurple: ["tint", "mediumPurple"],
  grey: ["secondaryText", "lightGrey"],
};

export type IColors = keyof typeof COLORS;

export interface ILabelProps {
  text: string;
  icon: React.FC<React.SVGAttributes<SVGElement>>;
  color: keyof typeof COLORS;
  asPill?: boolean;
  /** To render extra items inside the Pill variant. */
  children?: React.ReactNode;
}

const Label: React.FC<ILabelProps> = ({ text, icon: Icon, color, asPill = false, children }) => {
  const theme = useTheme();
  const [contentColor, backgroundColor] = useMemo(() => {
    return COLORS[color].map((color) => theme[color]);
  }, [theme, color]);

  return (
    <div
      className={cn(
        "inline-flex w-max items-center gap-2 rounded-[300px] px-2 py-1",
        asPill &&
          "h-6 gap-1.5 border border-solid px-3 py-0 whitespace-nowrap [&_label]:text-[12px] [&_label]:font-semibold [&_span]:text-[12px] [&_span]:font-semibold [&>*+*]:before:mr-1.5 [&>*+*]:before:text-[var(--label-color)] [&>*+*]:before:opacity-60 [&>*+*]:before:content-['·']"
      )}
      style={
        {
          backgroundColor,
          borderColor: asPill ? `${contentColor}66` : undefined,
          "--label-color": contentColor,
        } as React.CSSProperties
      }
    >
      {asPill ? null : (
        <div className="flex size-3.5 items-center justify-center [&>svg]:fill-current" style={{ color: contentColor }}>
          <Icon />
        </div>
      )}
      <label className="text-[12px] font-normal" style={{ color: contentColor }}>
        {text}
      </label>
      {asPill ? children : null}
    </div>
  );
};

export default Label;
