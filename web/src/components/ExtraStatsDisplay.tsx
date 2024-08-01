import React from "react";
import styled from "styled-components";

import { StyledSkeleton } from "components/StyledSkeleton";

const Container = styled.div`
  display: flex;
  max-width: 380px;
  align-items: center;
  gap: 8px;
`;

const SVGContainer = styled.div`
  height: 14px;
  width: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  svg {
    fill: ${({ theme }) => theme.secondaryPurple};
  }
`;

const TextContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  p {
    min-width: 60px;
  }
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
        <p>{text !== null ? text : <StyledSkeleton />}</p>
      </TextContainer>
    </Container>
  );
};

export default ExtraStatsDisplay;
