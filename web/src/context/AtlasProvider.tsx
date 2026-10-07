import React from "react";

import { useConfig } from "wagmi";

import { AtlasProvider as _AtlasProvider, Products } from "@kleros/kleros-app";

import { useEmbeddedSignMessage } from "hooks/useEmbeddedSignMessage";

const AtlasProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const wagmiConfig = useConfig();
  const signMessage = useEmbeddedSignMessage();
  return (
    <_AtlasProvider
      config={{ uri: import.meta.env.REACT_APP_ATLAS_URI, product: Products.CourtV2, wagmiConfig, signMessage }}
    >
      {children}
    </_AtlasProvider>
  );
};

export default AtlasProvider;
