import React from "react";
import styled from "styled-components";

import { StyledSkeleton } from "components/StyledSkeleton";
import { isUndefined } from "utils/index";
import { InternalLink } from "./InternalLink";

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

const StyledInternalLink = styled(InternalLink)`
  font-weight: 600;
`;

const StyledExtraStatTitleSkeleton = styled(StyledSkeleton)`
  width: 100px;
`;

export interface IExtraStatsDisplay {
  title: string;
  courtId?: string;
  icon: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
  content?: React.ReactNode;
  text?: string;
}

const ExtraStatsDisplay: React.FC<IExtraStatsDisplay> = ({ title, courtId, text, content, icon: Icon, ...props }) => {
  return (
    <Container {...props}>
      <SVGContainer>{<Icon />}</SVGContainer>
      <TextContainer>
        <label>{title}:</label>
        {content ? (
          content
        ) : (
          <StyledInternalLink to={`/courts/${courtId?.toString()}`}>
            {!isUndefined(text) ? text : <StyledExtraStatTitleSkeleton />}
          </StyledInternalLink>
        )}
      </TextContainer>
    </Container>
  );
};

export default ExtraStatsDisplay;
