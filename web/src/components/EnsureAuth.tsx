import React, { useCallback } from "react";

import { useAccount } from "wagmi";
import { useAtlasProvider } from "@kleros/kleros-app";
import { Button } from "@kleros/ui-components-library";
import { errorToast, infoToast, successToast } from "utils/wrapWithToast";

interface IEnsureAuth {
  children: React.ReactElement;
  className?: string;
}

const EnsureAuth: React.FC<IEnsureAuth> = ({ children, className }) => {
  const { address } = useAccount();
  const { isVerified, isSigningIn, authoriseUser } = useAtlasProvider();
  const handleClick = useCallback(() => {
    infoToast(`Signing in User...`);

    authoriseUser()
      .then(() => successToast("Signed In successfully!"))
      .catch((err) => {
        console.log(err);
        errorToast(`Sign-In failed: ${err?.message}`);
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
