# Kleros App

Library for Kleros DApps with reusable abstractions and components.

# Usage

```node
yarn install @kleros/kleros-app
```

## 1. Atlas Interaction

- This library exports utilities to interact with Atlas (Kleros' backend) with minimal code.

- AtlasProvider : Provides functions to interact with Atlas.

> AtlasProvider needs to be wrapped with [<WagmiProvider/>](https://wagmi.sh/react/api/WagmiProvider) and [<QueryClientProvider/>](https://tanstack.com/query/latest/docs/framework/react/reference/QueryClientProvider#queryclientprovider) to work properly.

#### Usage

1. At the root of your app, setup AtlasProvider.
   **uri** : Atlas backend uri
   **product** : The product / Kleros DApp interacting with Atlas (CourtV2, Curate, etc.)

```typescript
import { WagmiProvider } from 'wagmi'
import { config } from './config'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AtlasProvider, Products } from "@kleros/kleros-app";
import { useConfig } from 'wagmi'

const queryClient = new QueryClient()

function App() {
  const wagmiConfig = useConfig()

  return
    <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
            <AtlasProvider config={{ uri: import.meta.env.REACT_APP_ATLAS_URI, product: Products.CourtV2, wagmiConfig: wagmiConfig }}>
            ...
            </AtlasProvider>
        </QueryClientProvider>
    </WagmiProvider>
}
```

2. Once Provider is set up, use the functions provided.

```typescript
import React, { useCallback } from "react";

import { useAccount } from "wagmi";
import { useAtlasProvider } from "@kleros/kleros-app";
import { Button } from "@kleros/ui-components-library";


interface IEnsureAuth {
  children: React.ReactElement;
  className?: string;
}

const EnsureAuth: React.FC<IEnsureAuth> = ({ children, className }) => {
  const { address } = useAccount();
  const { isVerified, isSigningIn, authoriseUser } = useAtlasProvider();

  const handleClick = useCallback(() => {
    // authorise a user
    authoriseUser()
      .then((res) => { console.log(res)})
      .catch((err) => {
        console.log(err);
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

```

3. [IAtlasProvider](https://github.com/kleros/kleros-v2/blob/feat/kleros-app/kleros-app/src/lib/atlas/providers/AtlasProvider.tsx)

```typescript
interface IAtlasProvider {
  isVerified: boolean;
  isSigningIn: boolean;
  isAddingUser: boolean;
  isFetchingUser: boolean;
  isUpdatingUser: boolean;
  isUploadingFile: boolean;
  user: User | undefined;
  userExists: boolean;
  authoriseUser: () => Promise<void>;
  addUser: (userSettings: AddUserData) => Promise<boolean>;
  updateEmail: (userSettings: UpdateEmailData) => Promise<boolean>;
  uploadFile: (file: File, role: Roles) => Promise<string | null>;
  confirmEmail: (userSettings: ConfirmEmailData) => Promise<
    ConfirmEmailResponse & {
      isError: boolean;
    }
  >;
}
```
