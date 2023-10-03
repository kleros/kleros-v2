import React from "react";
import styled from "styled-components";

import FormNotifs from "./FormNotifs";
import { EnsureChain } from "components/EnsureChain";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
`;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: center;
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.primaryText};
  margin-top: 16px;
  margin-bottom: 12px;
`;

const HeaderNotifs: React.FC = () => {
  return <HeaderContainer>Contact Details</HeaderContainer>;
};

const EnsureChainContainer = styled.div`
  display: flex;
  justify-content: center;
  padding-top: 16px;
  padding-bottom: 16px;
`;

const SendMeNotifications: React.FC = () => {
  return (
    <EnsureChainContainer>
      <EnsureChain>
        <Container>
          <HeaderNotifs />
          <FormNotifs />
        </Container>
      </EnsureChain>
    </EnsureChainContainer>
  );
};

export default SendMeNotifications;
