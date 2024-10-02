import React from "react";
import styled from "styled-components";

import { StyledSkeleton } from "components/StyledSkeleton";
import { isUndefined } from "utils/index";

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

const StyledExtraStatTitleSkeleton = styled(StyledSkeleton)`
  width: 100px;
`;

export interface IExtraStatsDisplay {
  title: string;
  icon: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
  content?: React.ReactNode;
  text?: string;
}

const ExtraStatsDisplay: React.FC<IExtraStatsDisplay> = ({ title, text, content, icon: Icon, ...props }) => {
  return (
    <Container {...props}>
      <SVGContainer>{<Icon />}</SVGContainer>
      <TextContainer>
        <label>{title}:</label>
        {content ? content : <StyledP>{!isUndefined(text) ? text : <StyledExtraStatTitleSkeleton />}</StyledP>}
      </TextContainer>
    </Container>
  );
};

export default ExtraStatsDisplay;
