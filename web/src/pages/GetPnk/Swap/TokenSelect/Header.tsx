import React from "react";
import styled from "styled-components";
import CloseIcon from "svgs/icons/close.svg";
import { useTokenSelectContext } from "./TokenSelectProvider";

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 26px 26px 0px;
`;

const Title = styled.h3`
  margin: 0;
`;

const SVGContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 16px;
  height: 16px;
  cursor: pointer;
  svg {
    fill: ${({ theme }) => theme.primaryBlue};
  }
`;

const Header: React.FC = () => {
  const { toggleTokenSelect } = useTokenSelectContext();
  return (
    <Container>
      <Title>Select Token</Title>
      <SVGContainer onClick={toggleTokenSelect}>
        <CloseIcon />
      </SVGContainer>
    </Container>
  );
};

export default Header;
