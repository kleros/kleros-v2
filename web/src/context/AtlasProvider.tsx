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
  uploadToIpfs,
  type User,
  type AddUserData,
  type UpdateEmailData,
  type ConfirmEmailData,
  type ConfirmEmailResponse,
  Roles,
  Products,
  AuthorizationError,
} from "utils/atlas";

import { isUndefined } from "src/utils";
import { GraphQLError } from "graphql";

interface IAtlasProvider {
  isVerified: boolean;
  isSigningIn: boolean;
  isAddingUser: boolean;
  isFetchingUser: boolean;
  isUpdatingUser: boolean;
  isUploadingFile: boolean;
  user: User | undefined;
  userExists: boolean;
  authoriseUser: () => void;
  addUser: (userSettings: AddUserData) => Promise<boolean>;
  updateEmail: (userSettings: UpdateEmailData) => Promise<boolean>;
  uploadFile: (file: File, role: Roles) => Promise<string | null>;
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
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const { signMessageAsync } = useSignMessage();

  const atlasGqlClient = useMemo(() => {
    const headers = authToken
      ? {
          authorization: `Bearer ${authToken}`,
        }
      : undefined;
    return new GraphQLClient(`${atlasUri}/graphql`, { headers });
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
    let timeoutId: ReturnType<typeof setTimeout>;

    const verifyAndSchedule = () => {
      // initial verify check
      const isValid = verifySession();
      setIsVerified(isValid);

      if (isValid && authToken) {
        try {
          const payload = decodeJwt(authToken);
          const expiresIn = (payload.exp as number) * 1000 - Date.now();

          timeoutId = setTimeout(verifyAndSchedule, Math.max(0, expiresIn));
        } catch (err) {
          console.error("Error decoding JWT:", err);
          setIsVerified(false);
        }
      }
    };

    verifyAndSchedule();

    return () => {
      clearTimeout(timeoutId);
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
    return !isUndefined(user.email);
  }, [user]);

  function fetchWithAuthErrorHandling<T>(request: () => Promise<T>): Promise<T> {
    try {
      return request();
    } catch (error) {
      if (
        error instanceof AuthorizationError ||
        (error instanceof GraphQLError && error?.extensions?.["code"] === "UNAUTHENTICATED")
      ) {
        setIsVerified(false);
      }
      throw error;
    }
  }

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

        const userAdded = await fetchWithAuthErrorHandling(() => addUserToAtlas(atlasGqlClient, userSettings));
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

        const emailUpdated = await fetchWithAuthErrorHandling(() => updateEmailInAtlas(atlasGqlClient, userSettings));
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
   * @description upload file to ipfs
   * @param {File} file - file to be uploaded
   * @param {Roles} role - role for which file is being uploaded
   * @returns {Promise<string | null>} A promise that resolves to the ipfs cid if file was uploaded successfully else
   *                                   null
   */
  const uploadFile = useCallback(
    async (file: File, role: Roles) => {
      try {
        if (!address || !isVerified || !atlasUri || !authToken) return null;
        setIsUploadingFile(true);

        const hash = await fetchWithAuthErrorHandling(() =>
          uploadToIpfs({ baseUrl: atlasUri, authToken }, { file, name: file.name, role, product: Products.CourtV2 })
        );
        return hash ? `/ipfs/${hash}` : null;
      } catch (err: any) {
        // eslint-disable-next-line
        console.log("Upload File Error : ", err?.message);
        return null;
      } finally {
        setIsUploadingFile(false);
      }
    },
    [address, isVerified, setIsUploadingFile, authToken]
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
          isUploadingFile,
          uploadFile,
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
          isUploadingFile,
          uploadFile,
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
