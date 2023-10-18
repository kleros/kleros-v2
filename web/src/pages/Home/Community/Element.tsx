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

  .link-container {
    display: flex;
    gap: 8px;
  }
`;

const StyledLabel = styled.label`
  color: ${({ theme }) => theme.primaryText};
  font-weight: 600;
`;

const StyledA = styled.a`
  display: flex;
  align-items: center;
`;

export interface IElement {
  primaryText?: string;
  urls: { node: React.ReactNode; link: string }[];
  Icon?: React.FC<React.SVGAttributes<SVGElement>>;
}

export const Element: React.FC<IElement> = ({ primaryText, urls, Icon }) => (
  <Container>
    {Icon && <Icon />}

    <div className="link-container">
      {urls.map(({ node, link }) => (
        <StyledA key={link} href={link} target="_blank" rel="noreferrer">
          {node}
        </StyledA>
      ))}
    </div>
    {primaryText && <StyledLabel>{primaryText}</StyledLabel>}
  </Container>
);
