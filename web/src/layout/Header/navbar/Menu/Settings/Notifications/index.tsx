import React from "react";
import styled from "styled-components";

import TelegramLogo from "svgs/socialmedia/telegram.svg";

import { HERMES_TELEGRAM_BOT_URL } from "consts/index";

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
  return <HeaderContainer>Contact Details</HeaderContainer>;
};

const EnsureChainContainer = styled.div`
  display: flex;
  justify-content: center;
  padding-top: 20px;
  padding-bottom: 20px;
`;

const StyledSvg = styled.svg`
  display: inline-block;
  width: 18px;
  height: 18px;
  fill: ${({ theme }) => theme.primaryBlue};
`;

const StyledA = styled.a`
  display: flex;
  justify-content: center;
  gap: 4px;
  margin-top: 90px;
  margin-bottom: 110px;
  font-size: 16px;

  &:hover {
    text-decoration: underline;
  }
`;

const NotificationSettings: React.FC<ISettings> = ({ toggleIsSettingsOpen }) => {
  return (
    <EnsureChainContainer>
      <EnsureChain>
        <Container>
          {/* <StyledA href={HERMES_TELEGRAM_BOT_URL} target="_blank" rel="noreferrer">
            Subscribe to the Hermes Messenger Bot
            <StyledSvg as={TelegramLogo} />
          </StyledA> */}
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
