import React, { useMemo } from "react";
import styled, { Theme, css, useTheme } from "styled-components";

const COLORS: Record<string, Array<keyof Theme>> = {
  red: ["error", "errorLight"],
  green: ["success", "successLight"],
  blue: ["primaryBlue", "mediumBlue"],
  purple: ["secondaryPurple", "mediumPurple"],
  lightPurple: ["tint", "mediumPurple"],
  grey: ["secondaryText", "lightGrey"],
};

export type IColors = keyof typeof COLORS;

const LabelContainer = styled.div<{ contentColor: string; backgroundColor: string; asPill: boolean }>`
  display: inline-flex;
  width: max-content;
  padding: 4px 8px;
  align-items: center;
  gap: 8px;
  border-radius: 300px;
  background-color: ${({ backgroundColor }) => backgroundColor};

  ${({ asPill, contentColor }) =>
    asPill &&
    css`
      gap: 6px;
      height: 24px;
      padding: 0 12px;
      border: 1px solid ${`${contentColor}66`};
      white-space: nowrap;

      label,
      span {
        font-size: 12px;
        font-weight: 600;
      }

      > * + *::before {
        content: "·";
        margin-right: 6px;
        color: ${contentColor};
        opacity: 0.6;
      }
    `}
`;

const IconContainer = styled.div<{ contentColor: string }>`
  height: 14px;
  width: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  > svg {
    fill: ${({ contentColor }) => contentColor};
  }
`;

const StyledText = styled.label<{ contentColor: string }>`
  font-size: 12px;
  font-weight: 400;
  color: ${({ contentColor }) => contentColor};
`;

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
    <LabelContainer {...{ contentColor, backgroundColor, asPill }}>
      {asPill ? null : (
        <IconContainer {...{ contentColor }}>
          <Icon />
        </IconContainer>
      )}
      <StyledText {...{ contentColor }}>{text}</StyledText>
      {children}
    </LabelContainer>
  );
};

export default Label;
