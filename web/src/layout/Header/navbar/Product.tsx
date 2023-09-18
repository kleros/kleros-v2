import React from "react";
import styled from "styled-components";

const Container = styled.a`
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 25px 35px 25px;
  max-width: 100px;
  border-radius: 3px;
  :hover {
    transform: scale(1.05);
    transition: 350ms;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }
  gap: 8px;
  width: calc(100px + (130 - 100) * (100vw - 375px) / (1250 - 375));
  white-space: nowrap;

  background-color: ${({ theme }) => theme.lightBackground};
  small {
    font-weight: 400;
    line-height: 19px;
    font-size: 14px;
  }
`;

const StyledIcon = styled.svg``;

const StyledImg = styled.img`
  max-width: 48px;
  max-height: 48px;
`;

interface IProduct {
  text: string;
  url: string;
  Icon: React.FC<React.SVGAttributes<SVGElement>> | string;
}

const Product: React.FC<IProduct> = ({ text, url, Icon }) => {
  return (
    <Container href={url} target="_blank">
      {typeof Icon === "string" ? <StyledImg alt={Icon} src={Icon} /> : <StyledIcon as={Icon} />}
      <small>{text}</small>
    </Container>
  );
};

export default Product;
