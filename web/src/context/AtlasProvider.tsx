import React, { useMemo, createContext, useContext, useState, useCallback, useEffect } from "react";

import { GraphQLClient } from "graphql-request";
import { decodeJwt } from "jose";
import { useAccount, useChainId, useSignMessage } from "wagmi";

import { useSessionStorage } from "hooks/useSessionStorage";
import { createMessage, getNonce, loginUser } from "utils/atlas";

import { isUndefined } from "src/utils";

interface IAtlasProvider {
  isVerified: boolean;
  isSigningIn: boolean;

  authoriseUser: () => void;
}

const Context = createContext<IAtlasProvider | undefined>(undefined);

// eslint-disable-next-line
// @ts-ignore
const atlasUri = import.meta.env.REACT_APP_ATLAS_URI ?? "";

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
  const authoriseUser = useCallback(() => {
    if (!address) return;
    setIsSigningIn(true);
    getNonce(atlasGqlClient, address)
      .then((nonce) => {
        const message = createMessage(address, chainId, nonce);
        signMessageAsync({ message }).then((signature) => {
          if (!isUndefined(signature)) {
            loginUser(atlasGqlClient, { signature, message })
              .then((token) => {
                setAuthToken(token);
              })
              .finally(() => setIsSigningIn(false));
          }
        });
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.log(`authorise user error : ${err?.message}`);
        setIsSigningIn(false);
      });
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
