import React from "react";
import styled, { useTheme, css } from "styled-components";

const Container = styled.div<{ isSmallDisplay: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  ${({ isSmallDisplay }) =>
    isSmallDisplay
      ? css`
          width: 151px;
        `
      : css`
          max-width: 196px;
        `}
`;

const SVGContainer = styled.div<{ iconColor: string; backgroundColor: string; isSmallDisplay: boolean }>`
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ backgroundColor }) => backgroundColor};
  svg {
    fill: ${({ iconColor }) => iconColor};
  }

  ${({ isSmallDisplay }) =>
    isSmallDisplay
      ? css`
          height: 32px;
          width: 32px;
          svg {
            height: 20px;
          }
        `
      : css`
          height: 48px;
          width: 48px;
        `}
`;

const TextContainer = styled.div<{ isSmallDisplay: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${({ isSmallDisplay }) => (isSmallDisplay ? "3px" : "8px")};
`;

const StyledTitle = styled.label`
  font-size: 14px;
`;

const StyledValue = styled.label<{ isSmallDisplay: boolean }>`
  font-size: ${({ isSmallDisplay }) => (isSmallDisplay ? "16px" : "24px")};
  font-weight: 600;
  color: ${({ theme }) => theme.primaryText};
`;

const StyledUSDValue = styled.label<{ isSmallDisplay: boolean }>`
  font-size: ${({ isSmallDisplay }) => (isSmallDisplay ? "12px" : "14px")};
`;

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
    <Container {...{ isSmallDisplay }} {...props}>
      <SVGContainer {...{ ...COLORS[color], isSmallDisplay }}>{<Icon />}</SVGContainer>
      <TextContainer {...{ isSmallDisplay }}>
        <StyledTitle>{title}</StyledTitle>
        <StyledValue {...{ isSmallDisplay }}>{text}</StyledValue>
        <StyledUSDValue {...{ isSmallDisplay }}>{subtext}</StyledUSDValue>
      </TextContainer>
    </Container>
  );
};

export default StatDisplay;
