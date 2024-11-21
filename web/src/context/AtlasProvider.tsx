import React from "react";
import { AtlasProvider as _AtlasProvider, Products } from "@kleros/kleros-app";
import { useQueryClient } from "@tanstack/react-query";

const AtlasProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  return (
    <_AtlasProvider config={{ uri: import.meta.env.REACT_APP_ATLAS_URI, product: Products.CourtV2, queryClient }}>
      {children}
    </_AtlasProvider>
  );
};

export default AtlasProvider;
