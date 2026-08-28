import React, { useMemo, createContext, useContext, useState, useCallback, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { GraphQLClient } from "graphql-request";
import { decodeJwt } from "jose";
import { useAccount, useChainId, useSignMessage, type Config } from "wagmi";
import {
  createMessage,
  getNonce,
  loginUser,
  addUser as addUserToAtlas,
  deleteUser as deleteUserFromAtlas,
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
  AuthorizationError,
  IpfsProduct,
  SignupProduct,
  IpfsProductNotConfigured,
  fetchIsSubscribed,
} from "../utils";

import { GraphQLError } from "graphql";
import { isUndefined } from "../../../utils";
import { useSessionStorage } from "../hooks/useSessionStorage";
import { fetchRestrictions, Role } from "../utils/fetchRestrictions";
import { Address } from "viem";

export interface IAtlasProvider {
  isVerified: boolean;
  isSigningIn: boolean;
  isAddingUser: boolean;
  isDeletingUser: boolean;
  isFetchingUser: boolean;
  isUpdatingUser: boolean;
  isUploadingFile: boolean;
  isConfirmingEmail: boolean;
  user: User | undefined;
  userExists: boolean;
  /** Authorise user and enable authorised calls. */
  authoriseUser(): Promise<void>;
  /**
   * Adds a new user to Atlas.
   * @param userSettings - Email to register. `product` is taken from `signupProduct` config.
   * @returns Resolves to true if the user was added successfully.
   */
  addUser(userSettings: Omit<AddUserData, "product">): Promise<boolean>;
  /**
   * Updates user email in Atlas.
   * @param userSettings - New email. `product` is taken from `signupProduct` config.
   * @returns Resolves to true if email was updated successfully.
   */
  updateEmail(userSettings: Omit<UpdateEmailData, "product">): Promise<boolean>;
  /**
   * Deletes the user and unsubscribes them from notification emails
   * across all Kleros products (not only `signupProduct`). Irreversible until they register again.
   * @returns Resolves to true if the user was deleted successfully.
   */
  deleteUser(): Promise<boolean>;
  /**
   * Upload file to IPFS via Atlas. Requires `ipfsProduct` in config.
   * @param file - File to upload.
   * @param role - Role for which the file is being uploaded.
   * @returns IPFS path (e.g. `/ipfs/...`) if uploaded successfully, else null when unauthenticated.
   */
  uploadFile(file: File, role: Roles): Promise<string | null>;
  /**
   * Confirms user email in Atlas.
   * @param userSettings - Confirmation payload from the verification link.
   * @returns Confirmation result and `isError` when the request failed.
   */
  confirmEmail(userSettings: ConfirmEmailData): Promise<
    ConfirmEmailResponse & {
      isError: boolean;
    }
  >;
  /**
   * Checks if a user is subscribed to notifications.
   * @param address - Address to check
   * @returns Boolean representing subscription status.
   */
  checkIsSubscribed(address: Address): Promise<boolean>;
  /** Role upload limits for `ipfsProduct`, when configured. */
  roleRestrictions: Role[] | undefined;
}

const Context = createContext<IAtlasProvider | undefined>(undefined);

interface AtlasConfig {
  uri: string;
  // Product used for signup and email update (e.g. Court V2, Foresight).
  // If no specific product, use CourtV2.
  signupProduct: SignupProduct;
  // Product for IPFS uploads. Omit if this app does not upload files via Atlas.
  ipfsProduct?: IpfsProduct;
  wagmiConfig: Config;
}

export const AtlasProvider: React.FC<{ config: AtlasConfig; children?: React.ReactNode }> = ({ children, config }) => {
  const { address } = useAccount({ config: config.wagmiConfig });
  const chainId = useChainId({ config: config.wagmiConfig });
  const queryClient = useQueryClient();

  const [authToken, setAuthToken] = useSessionStorage<string | undefined>("authToken", undefined);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isUpdatingUser, setIsUpdatingUser] = useState(false);
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const [isConfirmingEmail, setIsConfirmingEmail] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const { signMessageAsync } = useSignMessage({ config: config.wagmiConfig });

  const atlasGqlClient = useMemo(() => {
    const headers = authToken
      ? {
          authorization: `Bearer ${authToken}`,
        }
      : undefined;
    return new GraphQLClient(`${config.uri}/graphql`, { headers });
  }, [authToken, config.uri]);

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
  } = useQuery(
    {
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
    },
    queryClient
  );

  const { data: roleRestrictions } = useQuery(
    {
      queryKey: [`RoleRestrictions`],
      enabled: Boolean(config.ipfsProduct),
      staleTime: Infinity,
      queryFn: async () => {
        if (isUndefined(config.ipfsProduct)) return;
        try {
          return await fetchRestrictions(atlasGqlClient, config.ipfsProduct);
        } catch {
          return undefined;
        }
      },
    },
    queryClient
  );

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

  async function fetchWithAuthErrorHandling<T>(request: () => Promise<T>): Promise<T> {
    try {
      return await request();
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

  const authoriseUser = useCallback(
    async (statement?: string) => {
      try {
        if (!address || !chainId) return;
        setIsSigningIn(true);
        const nonce = await getNonce(atlasGqlClient, address);

        const message = createMessage(address, nonce, chainId, statement);
        const signature = await signMessageAsync({ message });

        const token = await loginUser(atlasGqlClient, { message, signature });
        setAuthToken(token);
      } catch (err: unknown) {
        throw err;
      } finally {
        setIsSigningIn(false);
      }
    },
    [address, chainId, setAuthToken, signMessageAsync, atlasGqlClient]
  );

  const addUser = useCallback(
    async (userSettings: Omit<AddUserData, "product">) => {
      try {
        if (!address || !isVerified) return false;
        setIsAddingUser(true);

        const userAdded = await fetchWithAuthErrorHandling(() =>
          addUserToAtlas(atlasGqlClient, { ...userSettings, product: config.signupProduct })
        );
        refetchUser();

        return userAdded;
      } catch (err: unknown) {
        throw err;
      } finally {
        setIsAddingUser(false);
      }
    },
    [address, isVerified, setIsAddingUser, atlasGqlClient, refetchUser, config.signupProduct]
  );

  const updateEmail = useCallback(
    async (userSettings: Omit<UpdateEmailData, "product">) => {
      try {
        if (!address || !isVerified) return false;
        setIsUpdatingUser(true);

        const emailUpdated = await fetchWithAuthErrorHandling(() =>
          updateEmailInAtlas(atlasGqlClient, { ...userSettings, product: config.signupProduct })
        );
        refetchUser();

        return emailUpdated;
      } catch (err: unknown) {
        throw err;
      } finally {
        setIsUpdatingUser(false);
      }
    },
    [address, isVerified, setIsUpdatingUser, atlasGqlClient, refetchUser, config.signupProduct]
  );

  const deleteUser = useCallback(async () => {
    try {
      if (!address || !isVerified) return false;
      setIsDeletingUser(true);

      const userDeleted = await fetchWithAuthErrorHandling(() => deleteUserFromAtlas(atlasGqlClient));
      refetchUser();

      return userDeleted;
    } finally {
      setIsDeletingUser(false);
    }
  }, [address, isVerified, setIsDeletingUser, atlasGqlClient, refetchUser]);

  const uploadFile = useCallback(
    async (file: File, role: Roles) => {
      const product = config.ipfsProduct;

      if (isUndefined(product)) {
        throw new IpfsProductNotConfigured();
      }

      try {
        if (!address || !isVerified || !config.uri || !authToken) return null;
        let resolvedRestrictions = roleRestrictions;

        // Try to fetch restrictions again if first background try failed
        if (isUndefined(resolvedRestrictions)) {
          resolvedRestrictions = await fetchRestrictions(atlasGqlClient, product);
        }

        if (isUndefined(resolvedRestrictions)) {
          throw new Error(`uploadFile: Unable to fetch role restrictions for ${product}`);
        }

        const restrictions = resolvedRestrictions.find((supportedRoles) => Roles[supportedRoles.name] === role);

        if (!restrictions) throw new Error("Unsupported role.");

        const isValidMimeType = restrictions.restriction.allowedMimeTypes.some((allowedType) => {
          if (allowedType.endsWith("/*")) {
            const prefix = allowedType.replace("/*", "/");
            return file.type.startsWith(prefix);
          }
          return allowedType === file.type;
        });

        if (!isValidMimeType) throw new Error("Unsupported file type.");
        if (file.size > restrictions.restriction.maxSize)
          throw new Error(
            `File too big. Max allowed size : ${(restrictions.restriction.maxSize / (1024 * 1024)).toFixed(2)} mb.`
          );

        setIsUploadingFile(true);

        const hash = await fetchWithAuthErrorHandling(() =>
          uploadToIpfs({ baseUrl: config.uri, authToken }, { file, name: file.name, role, product: product })
        );
        return hash ? `/ipfs/${hash}` : null;
      } finally {
        setIsUploadingFile(false);
      }
    },
    [
      address,
      isVerified,
      setIsUploadingFile,
      authToken,
      config.uri,
      config.ipfsProduct,
      roleRestrictions,
      atlasGqlClient,
    ]
  );

  const confirmEmail = useCallback(
    async (userSettings: ConfirmEmailData): Promise<ConfirmEmailResponse & { isError: boolean }> => {
      try {
        setIsConfirmingEmail(true);

        const emailConfirmed = await confirmEmailInAtlas(atlasGqlClient, userSettings);

        return { ...emailConfirmed, isError: false };
      } catch (err: any) {
        // eslint-disable-next-line
        console.log("Confirm Email Error : ", err?.message);
        return { isConfirmed: false, isTokenExpired: false, isTokenInvalid: false, isError: true };
      } finally {
        setIsConfirmingEmail(false);
      }
    },
    [atlasGqlClient]
  );

  const checkIsSubscribed = useCallback(
    async (address: Address): Promise<boolean> => fetchIsSubscribed(atlasGqlClient, address),
    [atlasGqlClient]
  );

  return (
    <Context.Provider
      value={useMemo(
        (): IAtlasProvider => ({
          isVerified,
          isSigningIn,
          isAddingUser,
          isDeletingUser,
          authoriseUser,
          addUser,
          deleteUser,
          user,
          isFetchingUser,
          updateEmail,
          isUpdatingUser,
          userExists,
          isUploadingFile,
          uploadFile,
          confirmEmail,
          roleRestrictions,
          isConfirmingEmail,
          checkIsSubscribed,
        }),
        [
          isVerified,
          isSigningIn,
          isAddingUser,
          isDeletingUser,
          authoriseUser,
          addUser,
          deleteUser,
          user,
          isFetchingUser,
          updateEmail,
          isUpdatingUser,
          userExists,
          isUploadingFile,
          uploadFile,
          confirmEmail,
          roleRestrictions,
          isConfirmingEmail,
          checkIsSubscribed,
        ]
      )}
    >
      {children}
    </Context.Provider>
  );
};

/** Atlas context. Must be used within {@link AtlasProvider}. */
export const useAtlasProvider = (): IAtlasProvider => {
  const context = useContext(Context);
  if (!context) {
    throw new Error("Context Provider not found.");
  }
  return context;
};

export default AtlasProvider;
