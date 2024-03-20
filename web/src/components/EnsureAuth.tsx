import { Button } from "@kleros/ui-components-library";
import React, { useMemo } from "react";
import { SiweMessage } from "siwe";
import { useAccount, useNetwork, useSignMessage } from "wagmi";
import * as jwt from "jose";
import { authoriseUser } from "utils/authoriseUser";
import { useSessionStorage } from "hooks/useSessionStorage";

interface IEnsureAuth {
  children: React.ReactElement;
  className?: string;
}

export const EnsureAuth: React.FC<IEnsureAuth> = ({ children, className }) => {
  const localToken = window.sessionStorage.getItem("auth-token");

  const [authToken, setAuthToken] = useSessionStorage<string | null>("auth-token", localToken);
  const { address } = useAccount();
  const { chain } = useNetwork();

  const { signMessageAsync } = useSignMessage();

  const isVerified = useMemo(() => {
    if (!authToken || !address) return false;

    const payload = jwt.decodeJwt(authToken);

    if ((payload?.id as string).toLowerCase() !== address.toLowerCase()) return false;
    if (payload.exp && payload.exp < Date.now() / 1000) return false;

    return true;
  }, [authToken, address]);

  const handleSignIn = async () => {
    try {
      if (!address) return;

      const message = createSiweMessage(address, "Sign In to Kleros with Ethereum.", chain?.id);

      const signature = await signMessageAsync({ message });

      if (!signature) return;

      authoriseUser({
        address,
        signature,
        message,
      })
        .then(async (res) => {
          const response = await res.json();
          setAuthToken(response["token"]);
        })
        .catch((err) => console.log({ err }));
    } catch (err) {
      console.log({ err });
    }
  };

  return isVerified ? children : <Button text="Sign In" onClick={handleSignIn} {...{ className }} />;
};

function createSiweMessage(address: `0x${string}`, statement: string, chainId: number = 421614) {
  const domain = window.location.host;
  const origin = window.location.origin;
  const message = new SiweMessage({
    domain,
    address,
    statement,
    uri: origin,
    version: "1",
    chainId,
  });
  return message.prepareMessage();
}
