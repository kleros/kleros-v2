import React from "react";
import { landscapeStyle } from "styles/landscapeStyle";
import styled, { useTheme, css } from "styled-components";
import { responsiveSize } from "styles/responsiveSize";

const Container = styled.div`
  display: flex;
  max-width: 196px;
  align-items: center;
  gap: 8px;

  ${landscapeStyle(
    () => css`
      margin-bottom: ${responsiveSize(16, 30)};
    `
  )}
`;

const SVGContainer = styled.div<{ iconColor: string; backgroundColor: string }>`
  height: 48px;
  width: 48px;
  border-radius: 50%;
  background-color: ${({ backgroundColor }) => backgroundColor};
  display: flex;
  align-items: center;
  justify-content: center;
  svg {
    fill: ${({ iconColor }) => iconColor};
    height: ${({ iconColor, theme }) => (iconColor === theme.success ? "24px" : "32px")};
    width: ${({ iconColor, theme }) => (iconColor === theme.success ? "24px" : "32px")};
  }
`;

const TextContainer = styled.div`
  h1 {
    margin: 0;
  }
`;

const createPair = (iconColor: string, backgroundColor: string) => ({
  iconColor,
  backgroundColor,
});

export interface IStatDisplay {
  title: string;
  text: string | React.ReactNode;
  subtext: string | React.ReactNode;
  icon: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
  color: "red" | "orange" | "green" | "blue" | "purple";
}

const StatDisplay: React.FC<IStatDisplay> = ({ title, text, subtext, icon: Icon, color, ...props }) => {
  const theme = useTheme();
  const COLORS = {
    red: createPair(theme.error, theme.errorLight),
    orange: createPair(theme.warning, theme.warningLight),
    green: createPair(theme.success, theme.successLight),
    blue: createPair(theme.primaryBlue, theme.mediumBlue),
    purple: createPair(theme.secondaryPurple, theme.mediumPurple),
  };

  return (
    <Container {...props}>
      <SVGContainer {...{ ...COLORS[color] }}>{<Icon />}</SVGContainer>
      <TextContainer>
        <label>{title}</label>
        <h1>{text}</h1>
        <label>{subtext}</label>
      </TextContainer>
    </Container>
  );
};

export default StatDisplay;
