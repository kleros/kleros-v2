import React from "react";
import styled from "styled-components";
import KlerosCourt from "./KlerosCourt";

const Container = styled.div`
  height: 64px;
  width: 100vw;
  background-color: ${({ theme }) => theme.primaryPurple};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
`;

const Header: React.FC = () => (
  <Container>
    <KlerosCourt />
  </Container>
);

export default Header;
