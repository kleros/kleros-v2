import React from "react";
import styled from "styled-components";

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

const StyledA = styled.a`
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    text-decoration: underline;
  }
`;

export interface IElement {
  Icon?: React.FC<React.SVGAttributes<SVGElement>>;
  title: string;
  link: string;
  primaryText?: string;
}

export const Element: React.FC<IElement> = ({ primaryText, title, link, Icon }) => (
  <Container>
    <div className="link-container">
      <StyledA href={link} target="_blank" rel="noreferrer">
        {Icon && <Icon />}
        {title}
      </StyledA>
    </div>
    {primaryText && <StyledLabel>{primaryText}</StyledLabel>}
  </Container>
);
