import React, { useCallback } from "react";

import { useTranslation } from "react-i18next";

import { useAtlasProvider } from "@kleros/kleros-app";
import { Button } from "@kleros/ui-components-library";

import HourglassIcon from "svgs/icons/hourglass.svg";

import { cn } from "utils/cn";
import { errorToast, infoToast, successToast } from "utils/wrapWithToast";

interface IEmailInfo {
  toggleIsSettingsOpen: () => void;
}

const EmailVerificationInfo: React.FC<IEmailInfo> = ({ toggleIsSettingsOpen }) => {
  const { userExists, user, updateEmail } = useAtlasProvider();
  const { t } = useTranslation();

  const resendVerificationEmail = useCallback(() => {
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
        console.error(err);
        errorToast(t("email_verification.failed_to_send_verification_error", { error: err?.message }));
      });
  }, [user, updateEmail, toggleIsSettingsOpen, t]);

  return userExists && !user?.isEmailVerified ? (
    <div className="flex flex-row items-center gap-4 w-full pt-4 mt-8 [border-top:1px_solid_var(--klerosUIComponentsStroke)]">
      <HourglassIcon className="w-[32px] h-[32px] fill-klerosUIComponentsPrimaryBlue" />
      <div className="flex flex-col [align-items:start] gap-2">
        <h3 className="m-0">{t("email_verification.email_verification_pending")}</h3>
        <label>
          {t("email_verification.verification_email_sent_text")}
          <br /> {t("email_verification.didnt_receive_email")}{" "}
          <Button
            text={t("buttons.resend_it")}
            onPress={resendVerificationEmail}
            className={cn(
              "inline-block bg-transparent p-0 [&_.button-text]:text-klerosUIComponentsPrimaryBlue",
              "[&_.button-text]:font-normal [&_.button-text]:text-[14px]",
              "[&_.button-svg_path]:fill-klerosUIComponentsPrimaryBlue [&:focus]:bg-transparent",
              "[&:hover]:bg-transparent"
            )}
          />
        </label>
      </div>
    </div>
  ) : (
    <></>
  );
};

export default EmailVerificationInfo;
