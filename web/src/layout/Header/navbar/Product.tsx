import React from "react";
import styled from "styled-components";

interface IProduct {
  text: string;
  url: string;
  Icon: React.FC<React.SVGAttributes<SVGElement>>;
}

const Container = styled.a`
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 25px 35px 25px;
  border-radius: 3px;
  :hover {
    transform: scale(1.05);
    transition: 350ms;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }
  gap: 8px;
  width: max-content;
  background-color: ${({ theme }) => theme.lightBackground};

  small {
    font-weight: 400;
    line-height: 19px;
    font-size: 14px;
  }

  svg {
    width: 48px;
    height: 48px;
    fill: none;
    visibility: visible;
    display: inline-block;
  }
`;

const StyledIcon = styled.svg`
  width: 48px;
  height: 48px;
  fill: none;
  visibility: visible;
  display: inline-block;
  fill: ${({ theme }) => theme.secondaryPurple};
`;

const Product: React.FC<IProduct> = ({ text, url, Icon }) => {
  return (
    <Container href={url} target="_blank">
      <StyledIcon as={Icon} />
      <small>{text}</small>
    </Container>
  );
};

export default Product;
