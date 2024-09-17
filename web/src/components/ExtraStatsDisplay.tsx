import React from "react";
import styled from "styled-components";

import { StyledSkeleton } from "components/StyledSkeleton";

const Container = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 24px;
`;

const SVGContainer = styled.div`
  display: flex;
  height: 14px;
  width: 14px;
  align-items: center;
  justify-content: center;
  svg {
    fill: ${({ theme }) => theme.secondaryPurple};
  }
`;

const TextContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
`;

const StyledP = styled.p`
  font-size: 14px;
  font-weight: 600;
  margin: 0;
`;

export interface IExtraStatsDisplay {
  title: string;
  text: string;
  icon: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
}

const ExtraStatsDisplay: React.FC<IExtraStatsDisplay> = ({ title, text, icon: Icon, ...props }) => {
  return (
    <Container {...props}>
      <SVGContainer>{<Icon />}</SVGContainer>
      <TextContainer>
        <label>{title}:</label>
        <StyledP>{text !== null ? text : <StyledSkeleton />}</StyledP>
      </TextContainer>
    </Container>
  );
};

export default ExtraStatsDisplay;
