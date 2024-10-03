import React, { useEffect, useMemo, useState } from "react";
import styled, { css, useTheme } from "styled-components";

import { useNavigate, useSearchParams } from "react-router-dom";
import { isAddress } from "viem";

import { Button } from "@kleros/ui-components-library";

import CheckIcon from "svgs/icons/check-circle-outline.svg";
import WarningIcon from "svgs/icons/warning-outline.svg";
import InvalidIcon from "svgs/label-icons/minus-circle.svg";

import { useAtlasProvider } from "context/AtlasProvider";

import { landscapeStyle } from "styles/landscapeStyle";

import Loader from "components/Loader";

const Container = styled.div`
  display: flex;
  width: 100%;
  gap: 48px 16px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 80px;
  ${landscapeStyle(
    () => css`
      flex-direction: row;
      justify-content: space-between;
    `
  )}
`;

const InfoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
  align-items: center;
  flex: 1;
  ${landscapeStyle(
    () => css`
      align-items: start;
    `
  )}
`;

const textCss = css`
  margin: 0;
  text-align: center;
  ${landscapeStyle(
    () => css`
      text-align: left;
    `
  )}
`;

const Header = styled.h1<{ fontColor: string }>`
  ${textCss}
  ${({ fontColor }) =>
    css`
      color: ${fontColor};
    `};
`;

const Subtitle = styled.h3`
  ${textCss}
`;

const HeaderIconContainer = styled.div<{ iconColor: string }>`
  svg {
    width: 64px;
    height: 64px;
    ${({ iconColor }) =>
      css`
        path {
          fill: ${iconColor};
        }
      `}
  }
`;

const IconContainer = styled.div`
  svg {
    width: 250px;
    height: 250px;
    path {
      fill: ${({ theme }) => theme.whiteBackground};
    }
  }
`;

const EmailConfirmation: React.FC = () => {
  const theme = useTheme();
  const { confirmEmail } = useAtlasProvider();

  const [isConfirming, setIsConfirming] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isTokenInvalid, setIsTokenInvalid] = useState(false);
  const [isError, setIsError] = useState(false);
  const [searchParams, _] = useSearchParams();
  const address = searchParams.get("address");
  const token = searchParams.get("token");

  const navigate = useNavigate();

  useEffect(() => {
    if (address && isAddress(address) && token) {
      setIsConfirming(true);

      confirmEmail({ address, token })
        .then((res) => {
          setIsConfirmed(res.isConfirmed);
          setIsTokenInvalid(res.isTokenInvalid);
          setIsError(res.isError);
        })
        .finally(() => setIsConfirming(false));
    }
  }, [address, token, confirmEmail]);

  const [headerMsg, subtitleMsg, buttonMsg, buttonTo, Icon, color] = useMemo(() => {
    if (!address || !isAddress(address) || !token || isTokenInvalid)
      return [
        "Invalid Link!",
        "Oops, seems like you followed an invalid link.",
        "Contact Support",
        "/",
        InvalidIcon,
        theme.primaryText,
      ];
    else if (isError)
      return [
        "Something went wrong",
        "Oops, seems like something went wrong in our systems",
        "Contact Support",
        "/",
        WarningIcon,
        theme.error,
      ];
    else if (isConfirmed)
      return [
        "Congratulations! Your email has been verified!",
        "We'll remind you when your actions are required on Court, and send you notifications on key moments to help you achieve the best of Kleros.",
        "Let's start!",
        "/",
        CheckIcon,
        theme.success,
      ];
    else
      return [
        "Verification link expired...",
        "Oops, the email verification link has expired. No worries! Go to settings and click on Resend it to receive another verification email.",
        "Open Settings",
        "/#notifications",
        WarningIcon,
        theme.warning,
      ];
  }, [address, token, isError, isConfirmed, isTokenInvalid, theme]);

  return (
    <Container>
      {isConfirming ? (
        <Loader width={"148px"} height={"148px"} />
      ) : (
        <>
          <InfoWrapper>
            <HeaderIconContainer iconColor={color}>
              <Icon />
            </HeaderIconContainer>
            <Header fontColor={color}>{headerMsg}</Header>
            <Subtitle>{subtitleMsg}</Subtitle>
            <Button text={buttonMsg} onClick={() => navigate(buttonTo)} />
          </InfoWrapper>
          <IconContainer>
            <Icon />
          </IconContainer>
        </>
      )}
    </Container>
  );
};

export default EmailConfirmation;
