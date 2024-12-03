import React, { useState } from "react";
import styled from "styled-components";
import Skeleton from "react-loading-skeleton";

import { responsiveSize } from "styles/responsiveSize";

const Container = styled.a`
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 8px 28px 8px;
  max-width: 100px;
  border-radius: 3px;
  :hover {
    transition:
      transform 0.15s,
      background-color 0.3s;
    transform: scale(1.02);
    background-color: ${({ theme }) => theme.lightGrey};
  }
  gap: 8px;
  width: ${responsiveSize(100, 130)};
  background-color: ${({ theme }) => theme.lightBackground};
`;

const StyledIcon = styled.svg`
  width: 48px;
  height: 48px;
`;

const StyledImg = styled.img<{ isLoaded: boolean }>`
  width: 48px;
  height: 48px;
  display: ${({ isLoaded }) => (isLoaded ? "block" : "none")};
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
  const [isImgLoaded, setIsImgLoaded] = useState(false);

  return (
    <Container href={url} target="_blank">
      {typeof Icon === "string" ? (
        <>
          {!isImgLoaded ? <Skeleton width={48} height={46} circle /> : null}
          <StyledImg alt={Icon} src={Icon} isLoaded={isImgLoaded} onLoad={() => setIsImgLoaded(true)} />
        </>
      ) : (
        <StyledIcon as={Icon} />
      )}
      <StyledSmall>{text}</StyledSmall>
    </Container>
  );
};

export default Product;
