import React from "react";
import { QueryClient, QueryClientProvider as _QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const QueryClientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <_QueryClientProvider client={queryClient}> {children} </_QueryClientProvider>
);

export default QueryClientProvider;
