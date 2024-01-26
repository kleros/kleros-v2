import React from "react";
import styled, { useTheme } from "styled-components";

const LabelContainer = styled.div<{ contentColor: string; backgroundColor: string }>`
  display: inline-flex;
  padding: 4px 8px;
  align-items: center;
  gap: 10px;
  border-radius: 300px;
  background-color: ${({ backgroundColor }) => backgroundColor};
  div > svg {
    fill: ${({ contentColor }) => contentColor};
  }
  label {
    color: ${({ contentColor }) => contentColor};
  }
`;
const IconContainer = styled.div`
  height: 14px;
  width: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledText = styled.label`
  font-size: 12px;
  font-weight: 400;
`;

const createPair = (contentColor: string, backgroundColor: string) => ({
  contentColor,
  backgroundColor,
});

interface ILabelProps {
  text: string;
  icon: React.FC<React.SVGAttributes<SVGElement>>;
  color: "red" | "green" | "blue" | "purple" | "grey" | "lightPurple";
}
const Label: React.FC<ILabelProps> = ({ text, icon: Icon, color }) => {
  const theme = useTheme();

  const COLORS = {
    red: createPair(theme.error, theme.errorLight),
    green: createPair(theme.success, theme.successLight),
    blue: createPair(theme.primaryBlue, theme.mediumBlue),
    purple: createPair(theme.secondaryPurple, theme.mediumPurple),
    lightPurple: createPair(theme.tint, theme.mediumPurple),
    grey: createPair(theme.secondaryText, theme.lightGrey),
  };
  return (
    <LabelContainer {...COLORS[color]}>
      <IconContainer>
        <Icon />
      </IconContainer>
      <StyledText>{text}</StyledText>
    </LabelContainer>
  );
};

export default Label;
