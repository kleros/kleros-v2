import React from "react";
import styled from "styled-components";
import { ISettings } from "../types";

import FormContactDetails from "./FormContactDetails";
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

const NotificationSettings: React.FC<ISettings> = ({ setIsSettingsOpen }) => {
  return (
    <EnsureChainContainer>
      <EnsureChain>
        <Container>
          <HeaderNotifs />
          <FormContactDetails setIsSettingsOpen={setIsSettingsOpen} />
        </Container>
      </EnsureChain>
    </EnsureChainContainer>
  );
};

export default NotificationSettings;
