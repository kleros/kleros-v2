import React from "react";
import styled from "styled-components";
import { responsiveSize } from "styles/responsiveSize";

const Container = styled.a`
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 8px 35px 8px;
  max-width: 100px;
  border-radius: 3px;
  :hover {
    transform: scale(1.05);
    transition: 350ms;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }
  gap: 8px;
  width: ${responsiveSize(100, 130)};

  background-color: ${({ theme }) => theme.lightBackground};
`;

const StyledIcon = styled.svg`
  width: 48px;
  height: 48px;
`;

const StyledImg = styled.img`
  width: 48px;
  height: 48px;
`;

const StyledSmall = styled.small`
  display: flex;
  font-weight: 400;
  line-height: 19px;
  text-align: center;
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
      <StyledSmall>{text}</StyledSmall>
    </Container>
  );
};

export default Product;
