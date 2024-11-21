import React, { useCallback } from "react";
import styled from "styled-components";

import { Button } from "@kleros/ui-components-library";

import HourglassIcon from "svgs/icons/hourglass.svg";

import { errorToast, infoToast, successToast } from "utils/wrapWithToast";
import { useAtlasProvider } from "@kleros/kleros-app";

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

  // TODO : update toast info, dont show "Updating email"
  const resendEmail = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!user) return;
      infoToast(`Updating Email ...`);
      updateEmail({ newEmail: user.email })
        .then(async (res) => {
          if (res) {
            successToast("Email Updated successfully!");
            toggleIsSettingsOpen();
          }
        })
        .catch((err) => {
          console.log(err);
          errorToast(`Updating Email failed: ${err?.message}`);
        });
    },
    [user, updateEmail, toggleIsSettingsOpen]
  );

  return userExists && !user?.isEmailVerified ? (
    <InfoContainer>
      <StyledHourglassIcon />
      <InfoInnerContainer>
        <InfoTitle>Email Verification Pending</InfoTitle>
        <InfoSubtitle>
          We sent you a verification email. Please, verify it.
          <br /> Didn’t receive the email? <StyledButton text="Resend it" onClick={resendEmail} />
        </InfoSubtitle>
      </InfoInnerContainer>
    </InfoContainer>
  ) : (
    <></>
  );
};

export default EmailVerificationInfo;
