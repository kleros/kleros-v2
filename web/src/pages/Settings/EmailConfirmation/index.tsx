import React, { useEffect, useMemo, useState } from "react";
import styled, { css } from "styled-components";

import { Link, useSearchParams } from "react-router-dom";
import { isAddress } from "viem";

import { Button } from "@kleros/ui-components-library";

import CheckIcon from "svgs/icons/check-circle-outline.svg";
import WarningIcon from "svgs/icons/warning-outline.svg";
import InvalidIcon from "svgs/label-icons/minus-circle.svg";

import { useAtlasProvider } from "@kleros/kleros-app";

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
  white-space: pre-line;

  ${landscapeStyle(
    () => css`
      text-align: left;
    `
  )}
`;

const Header = styled.h1<{ fontColor: string }>`
  ${textCss}
  ${({ fontColor }) => css`
    color: ${({ theme }) => theme[fontColor]};
  `};
`;

const Subtitle = styled.h3`
  ${textCss}
  max-width: 735px;
`;

const HeaderIconContainer = styled.div<{ iconColor: string }>`
  svg {
    width: 64px;
    height: 64px;
    ${({ iconColor }) => css`
      path {
        fill: ${({ theme }) => theme[iconColor]};
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

const messageConfigs = {
  invalid: {
    headerMsg: "Invalid Link!",
    subtitleMsg: "Oops, seems like you followed an invalid link.",
    buttonMsg: "Contact Support",
    buttonTo: "https://t.me/kleros",
    Icon: InvalidIcon,
    color: "primaryText",
  },
  error: {
    headerMsg: "Something went wrong",
    subtitleMsg: "Oops, seems like something went wrong in our systems",
    buttonMsg: "Contact Support",
    buttonTo: "https://t.me/kleros",
    Icon: WarningIcon,
    color: "error",
  },
  confirmed: {
    headerMsg: "Congratulations! \nYour email has been verified!",
    subtitleMsg:
      "We'll remind you when your actions are required on Court, and send you notifications on key moments to help you achieve the best of Kleros.",
    buttonMsg: "Let's start!",
    buttonTo: "/",
    Icon: CheckIcon,
    color: "success",
  },
  expired: {
    headerMsg: "Verification link expired...",
    subtitleMsg:
      "Oops, the email verification link has expired. No worries! Go to settings and click on Resend it to receive another verification email.",
    buttonMsg: "Open Settings",
    buttonTo: "/#notifications",
    Icon: WarningIcon,
    color: "warning",
  },
};

const EmailConfirmation: React.FC = () => {
  const { confirmEmail } = useAtlasProvider();

  const [isConfirming, setIsConfirming] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isTokenInvalid, setIsTokenInvalid] = useState(false);
  const [isError, setIsError] = useState(false);
  const [searchParams, _] = useSearchParams();
  const address = searchParams.get("address");
  const token = searchParams.get("token");

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

  const { headerMsg, subtitleMsg, buttonMsg, buttonTo, Icon, color } = useMemo(() => {
    if (!address || !isAddress(address) || !token || isTokenInvalid) return messageConfigs.invalid;
    if (isError) return messageConfigs.error;
    if (isConfirmed) return messageConfigs.confirmed;
    return messageConfigs.expired;
  }, [address, token, isError, isConfirmed, isTokenInvalid]);

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
            <Link to={buttonTo}>
              <Button text={buttonMsg} />
            </Link>
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
