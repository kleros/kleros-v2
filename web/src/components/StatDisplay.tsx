import React from "react";
import styled, { useTheme } from "styled-components";

const createPair = (iconColor: string, backgroundColor: string) => ({
  iconColor,
  backgroundColor,
});

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
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
    max-height: 22px;
    max-width: 22px;
  }
`;

const TextContainer = styled.div`
  h1 {
    margin: 0;
  }
`;

export interface IStatDisplay {
  title: string;
  text: string;
  subtext: string;
  icon: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
  color: "red" | "orange" | "green" | "blue" | "purple";
}

const StatDisplay: React.FC<IStatDisplay> = ({
  title,
  text,
  subtext,
  icon: Icon,
  color,
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
