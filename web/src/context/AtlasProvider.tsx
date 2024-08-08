import React, { useMemo, createContext, useContext, useState, useCallback, useEffect } from "react";

import { GraphQLClient } from "graphql-request";
import { decodeJwt } from "jose";
import { useAccount, useChainId, useSignMessage } from "wagmi";

import { useSessionStorage } from "hooks/useSessionStorage";
import { createMessage, getNonce, loginUser } from "utils/atlas";

interface IAtlasProvider {
  isVerified: boolean;
  isSigningIn: boolean;

  authoriseUser: () => void;
}

const Context = createContext<IAtlasProvider | undefined>(undefined);

const atlasUri: string = import.meta.env.REACT_APP_ATLAS_URI ?? "";
if (!atlasUri) {
  console.warn("REACT_APP_ATLAS_URI is not defined. Please check your environment variables.");
}

const AtlasProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { address } = useAccount();
  const chainId = useChainId();
  const [authToken, setAuthToken] = useSessionStorage<string | undefined>("authToken", undefined);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const { signMessageAsync } = useSignMessage();

  const atlasGqlClient = useMemo(() => {
    const headers = authToken
      ? {
          authorization: authToken,
        }
      : undefined;
    return new GraphQLClient(atlasUri, { headers });
  }, [authToken]);

  /**
   * @description verifies user authorisation
   * @returns boolean - true if user is authorized
   */
  const verifySession = useCallback(() => {
    try {
      if (!authToken || !address) return false;

      const payload = decodeJwt(authToken);

      if ((payload?.sub as string)?.toLowerCase() !== address.toLowerCase()) return false;
      if (payload.exp && payload.exp < Date.now() / 1000) return false;

      return true;
    } catch {
      return false;
    }
  }, [authToken, address]);

  useEffect(() => {
    // initial verfiy check
    setIsVerified(verifySession());

    // verify session every 5 sec
    const intervalId = setInterval(() => {
      setIsVerified(verifySession());
    }, 5000);

    return () => {
      clearInterval(intervalId);
    };
  }, [authToken, verifySession]);

  /**
   * @description authorise user and enable authorised calls
   */
  const authoriseUser = useCallback(async () => {
    try {
      if (!address || !chainId) return;
      setIsSigningIn(true);
      const nonce = await getNonce(atlasGqlClient, address);

      const message = createMessage(address, nonce, chainId);
      const signature = await signMessageAsync({ message });

      const token = await loginUser(atlasGqlClient, { message, signature });

      setAuthToken(token);
    } catch (err: any) {
      // eslint-disable-next-line
      console.log("Authorize User Error : ", err?.message);
    } finally {
      setIsSigningIn(false);
    }
  }, [address, chainId, setAuthToken, signMessageAsync, atlasGqlClient]);

  return (
    <Context.Provider
      value={useMemo(() => ({ isVerified, isSigningIn, authoriseUser }), [isVerified, isSigningIn, authoriseUser])}
    >
      {children}
    </Context.Provider>
  );
};

export const useAtlasProvider = () => {
  const context = useContext(Context);
  if (!context) {
    throw new Error("Context Provider not found.");
  }
  return context;
};

export default AtlasProvider;
