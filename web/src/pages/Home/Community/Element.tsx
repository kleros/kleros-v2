import React from "react";
import styled from "styled-components";

import { ExternalLink } from "components/ExternalLink";

const Container = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;

  svg {
    width: 16px;
    height: 16px;
  }
`;

const StyledLabel = styled.label`
  color: ${({ theme }) => theme.primaryText};
  font-weight: 600;
`;

const StyledExternalLink = styled(ExternalLink)`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export interface IElement {
  Icon?: React.FC<React.SVGAttributes<SVGElement>>;
  title: string;
  link: string;
  primaryText?: string;
}

export const Element: React.FC<IElement> = ({ primaryText, title, link, Icon }) => (
  <Container>
    <StyledExternalLink to={link} target="_blank" rel="noopener noreferrer">
      {Icon && <Icon />}
      {title}
    </StyledExternalLink>
    {primaryText && <StyledLabel>{primaryText}</StyledLabel>}
  </Container>
);
