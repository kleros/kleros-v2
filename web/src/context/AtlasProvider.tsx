import React from "react";
import { AtlasProvider as _AtlasProvider, Products } from "@kleros/kleros-app";

const AtlasProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <_AtlasProvider config={{ uri: import.meta.env.REACT_APP_ATLAS_URI, product: Products.CourtV2 }}>
      {children}
    </_AtlasProvider>
  );
};

export default AtlasProvider;
