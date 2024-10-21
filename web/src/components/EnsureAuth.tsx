import React from "react";

import { useAccount } from "wagmi";

import { Button } from "@kleros/ui-components-library";

import { useAtlasProvider } from "context/AtlasProvider";

interface IEnsureAuth {
  children: React.ReactElement;
  className?: string;
}

const EnsureAuth: React.FC<IEnsureAuth> = ({ children, className }) => {
  const { address } = useAccount();
  const { isVerified, isSigningIn, authoriseUser } = useAtlasProvider();
  return isVerified ? (
    children
  ) : (
    <Button
      text="Sign In"
      onClick={authoriseUser}
      disabled={isSigningIn || !address}
      isLoading={isSigningIn}
      {...{ className }}
    />
  );
};

export default EnsureAuth;
