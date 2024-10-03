import React, { useMemo, createContext, useContext, useState, useCallback, useEffect } from "react";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { GraphQLClient } from "graphql-request";
import { decodeJwt } from "jose";
import { useAccount, useChainId, useSignMessage } from "wagmi";

import { useSessionStorage } from "hooks/useSessionStorage";
import {
  createMessage,
  getNonce,
  loginUser,
  addUser as addUserToAtlas,
  fetchUser,
  updateEmail as updateEmailInAtlas,
  confirmEmail as confirmEmailInAtlas,
  type User,
  type AddUserData,
  type UpdateEmailData,
  type ConfirmEmailData,
  type ConfirmEmailResponse,
} from "utils/atlas";

import { isUndefined } from "src/utils";

interface IAtlasProvider {
  isVerified: boolean;
  isSigningIn: boolean;
  isAddingUser: boolean;
  isFetchingUser: boolean;
  isUpdatingUser: boolean;
  user: User | undefined;
  userExists: boolean;
  authoriseUser: () => void;
  addUser: (userSettings: AddUserData) => Promise<boolean>;
  updateEmail: (userSettings: UpdateEmailData) => Promise<boolean>;
  confirmEmail: (userSettings: ConfirmEmailData) => Promise<
    ConfirmEmailResponse & {
      isError: boolean;
    }
  >;
}

const Context = createContext<IAtlasProvider | undefined>(undefined);

const atlasUri: string = import.meta.env.REACT_APP_ATLAS_URI ?? "";
if (!atlasUri) {
  console.warn("REACT_APP_ATLAS_URI is not defined. Please check your environment variables.");
}

const AtlasProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { address } = useAccount();
  const chainId = useChainId();
  const queryClient = useQueryClient();
  const [authToken, setAuthToken] = useSessionStorage<string | undefined>("authToken", undefined);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isUpdatingUser, setIsUpdatingUser] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const { signMessageAsync } = useSignMessage();

  const atlasGqlClient = useMemo(() => {
    const headers = authToken
      ? {
          authorization: `Bearer ${authToken}`,
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
  }, [authToken, verifySession, address]);

  const {
    data: user,
    isLoading: isFetchingUser,
    refetch: refetchUser,
  } = useQuery({
    queryKey: [`UserSettings`],
    enabled: isVerified && !isUndefined(address),
    queryFn: async () => {
      try {
        if (!isVerified || isUndefined(address)) return undefined;
        return await fetchUser(atlasGqlClient);
      } catch {
        return undefined;
      }
    },
  });

  useEffect(() => {
    if (!isVerified) return;
    refetchUser();
  }, [isVerified, refetchUser]);

  // remove old user's data on address change
  useEffect(() => {
    queryClient.removeQueries({ queryKey: ["UserSettings"] });
  }, [address, queryClient]);

  // this would change based on the fields we have and what defines a user to be existing
  const userExists = useMemo(() => {
    if (!user) return false;
    return user.email ? true : false;
  }, [user]);

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

  /**
   * @description adds a new user to atlas
   * @param {AddUserData} userSettings - object containing data to be added
   * @returns {Promise<boolean>} A promise that resolves to true if the user was added successfully
   */
  const addUser = useCallback(
    async (userSettings: AddUserData) => {
      try {
        if (!address || !isVerified) return false;
        setIsAddingUser(true);

        const userAdded = await addUserToAtlas(atlasGqlClient, userSettings);
        refetchUser();

        return userAdded;
      } catch (err: any) {
        // eslint-disable-next-line
        console.log("Add User Error : ", err?.message);
        return false;
      } finally {
        setIsAddingUser(false);
      }
    },
    [address, isVerified, setIsAddingUser, atlasGqlClient, refetchUser]
  );

  /**
   * @description updates user email in atlas
   * @param {UpdateEmailData} userSettings - object containing data to be updated
   * @returns {Promise<boolean>} A promise that resolves to true if email was updated successfully
   */
  const updateEmail = useCallback(
    async (userSettings: UpdateEmailData) => {
      try {
        if (!address || !isVerified) return false;
        setIsUpdatingUser(true);

        const emailUpdated = await updateEmailInAtlas(atlasGqlClient, userSettings);
        refetchUser();

        return emailUpdated;
      } catch (err: any) {
        // eslint-disable-next-line
        console.log("Update User Email Error : ", err?.message);
        return false;
      } finally {
        setIsUpdatingUser(false);
      }
    },
    [address, isVerified, setIsUpdatingUser, atlasGqlClient, refetchUser]
  );

  /**
   * @description confirms user email in atlas
   * @param {ConfirmEmailData} userSettings - object containing data to be sent
   * @returns {Promise<boolean>} A promise that resolves to true if email was confirmed successfully
   */
  const confirmEmail = useCallback(
    async (userSettings: ConfirmEmailData): Promise<ConfirmEmailResponse & { isError: boolean }> => {
      try {
        setIsUpdatingUser(true);

        const emailConfirmed = await confirmEmailInAtlas(atlasGqlClient, userSettings);

        return { ...emailConfirmed, isError: false };
      } catch (err: any) {
        // eslint-disable-next-line
        console.log("Confirm Email Error : ", err?.message);
        return { isConfirmed: false, isTokenExpired: false, isTokenInvalid: false, isError: true };
      }
    },
    [atlasGqlClient]
  );

  return (
    <Context.Provider
      value={useMemo(
        () => ({
          isVerified,
          isSigningIn,
          isAddingUser,
          authoriseUser,
          addUser,
          user,
          isFetchingUser,
          updateEmail,
          isUpdatingUser,
          userExists,
          confirmEmail,
        }),
        [
          isVerified,
          isSigningIn,
          isAddingUser,
          authoriseUser,
          addUser,
          user,
          isFetchingUser,
          updateEmail,
          isUpdatingUser,
          userExists,
          confirmEmail,
        ]
      )}
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
