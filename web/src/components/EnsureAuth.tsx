import React, { useCallback } from "react";

import { useTranslation } from "react-i18next";
import { useAccount } from "wagmi";

import { useAtlasProvider } from "@kleros/kleros-app";
import { Button } from "@kleros/ui-components-library";

import { errorToast, infoToast, successToast } from "utils/wrapWithToast";

interface IEnsureAuth {
  children: React.ReactElement;
  message?: string;
  buttonText?: string;
  className?: string;
}

const EnsureAuth: React.FC<IEnsureAuth> = ({ children, message, buttonText, className }) => {
  const { address } = useAccount();
  const { isVerified, isSigningIn, authoriseUser } = useAtlasProvider();
  const { t } = useTranslation();

  const handleClick = useCallback(() => {
    infoToast(t("wallet.signing_in_user"));

    authoriseUser()
      .then(() => successToast(t("wallet.signed_in_successfully")))
      .catch((err) => {
        console.error(err);
        errorToast(t("wallet.sign_in_failed_error", { error: err?.message }));
      });
  }, [authoriseUser, t]);
  return isVerified ? (
    children
  ) : (
    <div className="flex flex-col gap-4 justify-center items-center">
      {message ? <p className="m-0 p-0">{message}</p> : null}
      <Button
        text={buttonText ?? t("wallet.sign_in")}
        onPress={handleClick}
        isDisabled={isSigningIn || !address}
        isLoading={isSigningIn}
        {...{ className }}
      />
    </div>
  );
};

export default EnsureAuth;
