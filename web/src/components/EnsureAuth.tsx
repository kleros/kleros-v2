import React, { useCallback } from "react";

import { useAccount } from "wagmi";

import { Button } from "@kleros/ui-components-library";
import { useAtlasProvider } from "@kleros/kleros-app";
import { toast } from "react-toastify";
import { OPTIONS as toastOptions } from "utils/wrapWithToast";

interface IEnsureAuth {
  children: React.ReactElement;
  className?: string;
}

const EnsureAuth: React.FC<IEnsureAuth> = ({ children, className }) => {
  const { address } = useAccount();
  const { isVerified, isSigningIn, authoriseUser } = useAtlasProvider();

  const handleClick = useCallback(() => {
    toast.info(`Signing in User...`, toastOptions);

    authoriseUser()
      .then(() => toast.success("Signed In successfully!", toastOptions))
      .catch((err) => {
        console.log(err);
        toast.error(`Sign-In failed: ${err?.message}`, toastOptions);
      });
  }, [authoriseUser]);
  return isVerified ? (
    children
  ) : (
    <Button
      text="Sign In"
      onClick={handleClick}
      disabled={isSigningIn || !address}
      isLoading={isSigningIn}
      {...{ className }}
    />
  );
};

export default EnsureAuth;
