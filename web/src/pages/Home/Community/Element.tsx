import React from "react";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  gap: 8px;

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
`;

export interface IElement {
  primaryText?: string;
  urls: { node: React.ReactNode; link: string }[];
  Icon?: React.FC<React.SVGAttributes<SVGElement>>;
}

export const Element: React.FC<IElement> = ({ primaryText, urls, Icon }) => (
  <Container>
    {Icon && <Icon />}
    {primaryText && (
      <>
        <StyledLabel>{primaryText}</StyledLabel> <StyledLabel>|</StyledLabel>
      </>
    )}
    <div className="link-container">
      {urls.map(({ node, link }, i) => (
        <a key={i} href={link}>
          {node}
        </a>
      ))}
    </div>
  </Container>
);
