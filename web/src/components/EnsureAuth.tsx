import React, { useCallback } from "react";
import styled from "styled-components";

import { useAccount } from "wagmi";

import { useAtlasProvider } from "@kleros/kleros-app";
import { Button } from "@kleros/ui-components-library";

import { errorToast, infoToast, successToast } from "utils/wrapWithToast";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  justify-content: center;
  align-items: center;
`;

const StyledInfo = styled.p`
  margin: 0;
  padding: 0;
`;

interface IEnsureAuth {
  children: React.ReactElement;
  message?: string;
  buttonText?: string;
  className?: string;
}

const EnsureAuth: React.FC<IEnsureAuth> = ({ children, message, buttonText, className }) => {
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
    <Container>
      {message ? <StyledInfo>{message}</StyledInfo> : null}
      <Button
        text={buttonText ?? "Sign In"}
        onClick={handleClick}
        disabled={isSigningIn || !address}
        isLoading={isSigningIn}
        {...{ className }}
      />
    </Container>
  );
};

export default EnsureAuth;
