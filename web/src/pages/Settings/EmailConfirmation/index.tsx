import React, { useEffect, useMemo, useState } from "react";
import styled, { css } from "styled-components";

import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router-dom";
import { isAddress } from "viem";

import { useAtlasProvider } from "@kleros/kleros-app";
import { Button } from "@kleros/ui-components-library";

import CheckIcon from "svgs/icons/check-circle-outline.svg";
import WarningIcon from "svgs/icons/warning-outline.svg";
import InvalidIcon from "svgs/label-icons/minus-circle.svg";

import { landscapeStyle } from "styles/landscapeStyle";

import Loader from "components/Loader";
import ScrollTop from "components/ScrollTop";

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

const EmailConfirmation: React.FC = () => {
  const { confirmEmail } = useAtlasProvider();
  const { t } = useTranslation();

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
    const messageConfigs = {
      invalid: {
        headerMsg: t("email_verification.invalid_link"),
        subtitleMsg: t("email_verification.invalid_link_subtitle"),
        buttonMsg: t("email_verification.contact_support"),
        buttonTo: "https://t.me/kleros",
        Icon: InvalidIcon,
        color: "primaryText",
      },
      error: {
        headerMsg: t("email_verification.something_went_wrong"),
        subtitleMsg: t("email_verification.something_went_wrong_subtitle"),
        buttonMsg: t("email_verification.contact_support"),
        buttonTo: "https://t.me/kleros",
        Icon: WarningIcon,
        color: "error",
      },
      confirmed: {
        headerMsg: t("email_verification.congratulations_verified"),
        subtitleMsg: t("email_verification.verification_success_subtitle"),
        buttonMsg: t("email_verification.lets_start"),
        buttonTo: "/",
        Icon: CheckIcon,
        color: "success",
      },
      expired: {
        headerMsg: t("email_verification.verification_link_expired"),
        subtitleMsg: t("email_verification.verification_expired_subtitle"),
        buttonMsg: t("email_verification.open_settings"),
        buttonTo: "/#notifications",
        Icon: WarningIcon,
        color: "warning",
      },
    };

    if (!address || !isAddress(address) || !token || isTokenInvalid) return messageConfigs.invalid;
    if (isError) return messageConfigs.error;
    if (isConfirmed) return messageConfigs.confirmed;
    return messageConfigs.expired;
  }, [address, token, isError, isConfirmed, isTokenInvalid, t]);

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
      <ScrollTop />
    </Container>
  );
};

export default EmailConfirmation;
