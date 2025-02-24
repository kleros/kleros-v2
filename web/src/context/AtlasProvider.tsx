import React from "react";

import { useConfig } from "wagmi";

import { AtlasProvider as _AtlasProvider, Products } from "@kleros/kleros-app";

const AtlasProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const wagmiConfig = useConfig();
  return (
    <_AtlasProvider config={{ uri: import.meta.env.REACT_APP_ATLAS_URI, product: Products.CourtV2, wagmiConfig }}>
      {children}
    </_AtlasProvider>
  );
};

export default AtlasProvider;
