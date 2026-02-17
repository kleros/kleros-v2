import React from "react";
import styled, { css } from "styled-components";

import { useTranslation } from "react-i18next";
import Modal from "react-modal";

import { Button } from "@kleros/ui-components-library";

import WarningIcon from "svgs/icons/warning-outline.svg";

import { landscapeStyle } from "styles/landscapeStyle";

const StyledModal = styled(Modal)`
  position: absolute;
  top: 50%;
  left: 50%;
  right: auto;
  bottom: auto;
  margin-right: -50%;
  transform: translate(-50%, -50%);
  height: auto;
  max-height: 90vh;
  width: min(90%, 480px);
  border: 1px solid ${({ theme }) => theme.stroke};
  border-radius: 8px;
  background-color: ${({ theme }) => theme.whiteBackground};
  padding: 32px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  z-index: 10002;
  overflow-y: auto;
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 10001;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

const StyledWarningIcon = styled(WarningIcon)`
  width: 24px;
  height: 24px;
  fill: ${({ theme }) => theme.warning};
`;

const Title = styled.h3`
  color: ${({ theme }) => theme.primaryText};
  font-size: 18px;
  font-weight: 600;
  margin: 0;
`;

const Message = styled.p`
  color: ${({ theme }) => theme.primaryText};
  font-size: 14px;
  line-height: 1.5;
  margin: 0 0 16px 0;
`;

const UrlContainer = styled.div`
  background-color: ${({ theme }) => theme.lightGrey};
  border: 1px solid ${({ theme }) => theme.stroke};
  border-radius: 4px;
  padding: 12px;
  margin: 16px 0;
  word-break: break-all;
`;

const Url = styled.code`
  color: ${({ theme }) => theme.secondaryText};
  font-size: 13px;
  font-family: monospace;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 24px;

  ${landscapeStyle(
    () => css`
      justify-content: flex-end;
    `
  )}
`;

const CancelButton = styled(Button)`
  background-color: ${({ theme }) => theme.whiteBackground};
  border: 1px solid ${({ theme }) => theme.stroke};

  p {
    color: ${({ theme }) => theme.primaryText} !important;
  }

  &:hover {
    background-color: ${({ theme }) => theme.mediumBlue};
  }
`;

const ConfirmButton = styled(Button)`
  background-color: ${({ theme }) => theme.warning};
  color: ${({ theme }) => theme.whiteBackground};
  border: 1px solid ${({ theme }) => theme.warning};

  &:hover {
    background-color: ${({ theme }) => theme.warning}BB;
  }
`;

interface IExternalLinkWarning {
  isOpen: boolean;
  url: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ExternalLinkWarning: React.FC<IExternalLinkWarning> = ({ isOpen, url, onConfirm, onCancel }) => {
  const { t } = useTranslation();
  return (
    <StyledModal
      isOpen={isOpen}
      onRequestClose={onCancel}
      overlayElement={(props, contentElement) => <Overlay {...props}>{contentElement}</Overlay>}
      ariaHideApp={false}
      role="dialog"
      aria-labelledby="external-link-title"
      aria-describedby="external-link-description"
    >
      <Header>
        <StyledWarningIcon />
        <Title id="external-link-title">{t("popups.external_link_warning")}</Title>
      </Header>

      <Message id="external-link-description">{t("popups.external_link_message")}</Message>

      <UrlContainer>
        <Url>{url}</Url>
      </UrlContainer>

      <Message>
        <strong>{t("popups.safety_tips")}</strong>
        <br />
        {t("popups.verify_domain")}
        <br />
        {t("popups.check_suspicious")}
        <br />
        {t("popups.trust_destination")}
      </Message>

      <ButtonContainer>
        <CancelButton text={t("buttons.cancel")} onClick={onCancel} />
        <ConfirmButton text={t("buttons.continue_to_external_site")} onClick={onConfirm} />
      </ButtonContainer>
    </StyledModal>
  );
};

export default ExternalLinkWarning;
