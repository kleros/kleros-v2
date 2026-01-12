import React, { useCallback } from "react";
import styled from "styled-components";

import { useTranslation } from "react-i18next";

import { useAtlasProvider } from "@kleros/kleros-app";
import { Button } from "@kleros/ui-components-library";

import HourglassIcon from "svgs/icons/hourglass.svg";

import { errorToast, infoToast, successToast } from "utils/wrapWithToast";

const InfoContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16px;
  width: 100%;
  padding-top: 16px;
  margin-top: 32px;
  border-top: 1px solid ${({ theme }) => theme.stroke};
`;

const InfoInnerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: start;
  gap: 8px;
`;

const InfoTitle = styled.h3`
  margin: 0;
`;
const InfoSubtitle = styled.label``;

const StyledHourglassIcon = styled(HourglassIcon)`
  width: 32px;
  height: 32px;
  fill: ${({ theme }) => theme.primaryBlue};
`;

const StyledButton = styled(Button)`
  display: inline-block;
  background-color: transparent;
  padding: 0;
  .button-text {
    color: ${({ theme }) => theme.primaryBlue};
    font-weight: 400;
    font-size: 14px;
  }
  .button-svg {
    path {
      fill: ${({ theme }) => theme.primaryBlue};
    }
  }
  :focus,
  :hover {
    background-color: transparent;
  }
`;

interface IEmailInfo {
  toggleIsSettingsOpen: () => void;
}

const EmailVerificationInfo: React.FC<IEmailInfo> = ({ toggleIsSettingsOpen }) => {
  const { userExists, user, updateEmail } = useAtlasProvider();
  const { t } = useTranslation();

  const resendVerificationEmail = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!user) return;
      infoToast(t("email_verification.sending_verification_email"));
      updateEmail({ newEmail: user.email })
        .then(async (res) => {
          if (res) {
            successToast(t("notifications.verification_email_sent"));
            toggleIsSettingsOpen();
          }
        })
        .catch((err) => {
          console.log(err);
          errorToast(`${t("email_verification.failed_to_send_verification")} ${err?.message}`);
        });
    },
    [user, updateEmail, toggleIsSettingsOpen, t]
  );

  return userExists && !user?.isEmailVerified ? (
    <InfoContainer>
      <StyledHourglassIcon />
      <InfoInnerContainer>
        <InfoTitle>{t("email_verification.email_verification_pending")}</InfoTitle>
        <InfoSubtitle>
          {t("email_verification.verification_email_sent_text")}
          <br /> {t("email_verification.didnt_receive_email")}{" "}
          <StyledButton text={t("buttons.resend_it")} onClick={resendVerificationEmail} />
        </InfoSubtitle>
      </InfoInnerContainer>
    </InfoContainer>
  ) : (
    <></>
  );
};

export default EmailVerificationInfo;
