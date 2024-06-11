import React, { useMemo } from "react";
import styled, { Theme, useTheme } from "styled-components";

const COLORS: Record<string, Array<keyof Theme>> = {
  red: ["error", "errorLight"],
  green: ["success", "successLight"],
  blue: ["primaryBlue", "mediumBlue"],
  purple: ["secondaryPurple", "mediumPurple"],
  lightPurple: ["tint", "mediumPurple"],
  grey: ["secondaryText", "lightGrey"],
};

export type IColors = keyof typeof COLORS;

const LabelContainer = styled.div<{ backgroundColor: string }>`
  display: inline-flex;
  width: max-content;
  padding: 4px 8px;
  align-items: center;
  gap: 10px;
  border-radius: 300px;
  background-color: ${({ backgroundColor }) => backgroundColor};
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
}

const Label: React.FC<ILabelProps> = ({ text, icon: Icon, color }) => {
  const theme = useTheme();
  const [contentColor, backgroundColor] = useMemo(() => {
    return COLORS[color].map((color) => theme[color]);
  }, [theme, color]);

  return (
    <LabelContainer {...{ backgroundColor }}>
      <IconContainer {...{ contentColor }}>
        <Icon />
      </IconContainer>
      <StyledText {...{ contentColor }}>{text}</StyledText>
    </LabelContainer>
  );
};

export default Label;
