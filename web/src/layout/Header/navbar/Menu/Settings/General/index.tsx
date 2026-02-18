import React from "react";
import styled, { css } from "styled-components";

import { useTranslation } from "react-i18next";
import { useAccount, useDisconnect } from "wagmi";

import { Button } from "@kleros/ui-components-library";

import { landscapeStyle } from "styles/landscapeStyle";
import { responsiveSize } from "styles/responsiveSize";

import { ChainDisplay } from "components/ConnectWallet/AccountDisplay";
import { EnsureChain } from "components/EnsureChain";
import { LanguageSelector } from "components/LanguageSelector";

import { ISettings } from "../../../index";

import WalletAndProfile from "./WalletAndProfile";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const StyledChainContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  align-items: center;
  :before {
    content: "";
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: ${({ theme }) => theme.success};
  }
  > label {
    color: ${({ theme }) => theme.success};
  }
`;

const StyledButton = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 8px;
`;

const EnsureChainContainer = styled.div`
  display: flex;
  justify-content: center;
  padding-top: 24px;
  padding-bottom: 20px;
`;

const UserContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const LanguageSelectorContainer = styled.div`
  padding: 24px 32px 0;
  width: 86vw;
  max-width: 660px;
  box-sizing: border-box;
  align-self: center;
  ${landscapeStyle(
    () => css`
      width: ${responsiveSize(300, 460, 300)};
    `
  )}
`;

export const DisconnectWalletButton: React.FC = () => {
  const { t } = useTranslation();
  const { disconnect } = useDisconnect();
  return <Button text={t("buttons.disconnect")} onClick={() => disconnect()} />;
};

const General: React.FC<ISettings> = ({ toggleIsSettingsOpen }) => {
  const { address } = useAccount();

  return (
    <>
      <LanguageSelectorContainer>
        <LanguageSelector />
      </LanguageSelectorContainer>
      <EnsureChainContainer>
        <EnsureChain>
          <Container>
            {address && (
              <UserContainer>
                <StyledChainContainer>
                  <ChainDisplay />
                </StyledChainContainer>
                <WalletAndProfile {...{ toggleIsSettingsOpen }} />
                <StyledButton>
                  <DisconnectWalletButton />
                </StyledButton>
              </UserContainer>
            )}
          </Container>
        </EnsureChain>
      </EnsureChainContainer>
    </>
  );
};

export default General;
