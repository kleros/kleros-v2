import React, { useEffect, useMemo, useState } from "react";

import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router-dom";
import { isAddress } from "viem";

import { useAtlasProvider } from "@kleros/kleros-app";
import { Button } from "@kleros/ui-components-library";

import CheckIcon from "svgs/icons/check-circle-outline.svg";
import WarningIcon from "svgs/icons/warning-outline.svg";
import InvalidIcon from "svgs/label-icons/minus-circle.svg";

import { cn } from "utils/cn";

import Loader from "components/Loader";
import ScrollTop from "components/ScrollTop";

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

  const statusClasses = {
    primaryText: "text-klerosUIComponentsPrimaryText",
    error: "text-klerosUIComponentsError",
    success: "text-klerosUIComponentsSuccess",
    warning: "text-klerosUIComponentsWarning",
  };
  const statusClassName = statusClasses[color as keyof typeof statusClasses];

  return (
    <div className="flex w-full gap-x-4 gap-y-12 flex-col justify-center items-center mt-20 lg:flex-row lg:justify-between">
      {isConfirming ? (
        <Loader width={"148px"} height={"148px"} />
      ) : (
        <>
          <div className="flex flex-col gap-8 items-center flex-1 lg:items-start">
            <div className={cn("[&_svg]:w-16 [&_svg]:h-16 [&_svg_path]:fill-current", statusClassName)}>
              <Icon />
            </div>
            <h1 className={cn("m-0 text-center whitespace-pre-line lg:text-left", statusClassName)}>{headerMsg}</h1>
            <h3 className="m-0 text-center whitespace-pre-line lg:text-left max-w-[735px]">{subtitleMsg}</h3>
            <Link to={buttonTo}>
              <Button text={buttonMsg} />
            </Link>
          </div>
          <div className="[&_svg]:w-[250px] [&_svg]:h-[250px] [&_svg_path]:fill-klerosUIComponentsWhiteBackground">
            <Icon />
          </div>
        </>
      )}
      <ScrollTop />
    </div>
  );
};

export default EmailConfirmation;
