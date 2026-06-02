import React from "react";
import styled from "styled-components";

import { useTranslation } from "react-i18next";

import EnsureAuth from "components/EnsureAuth";
import { EnsureChain } from "components/EnsureChain";
import { ISettings } from "layout/Header/navbar/index";

import FormContactDetails from "./FormContactDetails";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
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
  const { t } = useTranslation();
  return <HeaderContainer>{t("headers.contact_details")}</HeaderContainer>;
};

const EnsureChainContainer = styled.div`
  display: flex;
  justify-content: center;
  padding-top: 20px;
  padding-bottom: 20px;
`;

const NotificationSettings: React.FC<ISettings> = ({ toggleIsSettingsOpen }) => {
  return (
    <EnsureChainContainer>
      <EnsureChain>
        <Container>
          <EnsureAuth>
            <>
              <HeaderNotifs />
              <FormContactDetails toggleIsSettingsOpen={toggleIsSettingsOpen} />
            </>
          </EnsureAuth>
        </Container>
      </EnsureChain>
    </EnsureChainContainer>
  );
};

export default NotificationSettings;
