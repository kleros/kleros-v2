"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import styled from "styled-components";
import GraphqlBatcherProvider from "context/GraphqlBatcher";

const Main = styled.main`
  min-height: calc(100vh - 130px);
`;
const queryClient = new QueryClient();

const Layout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  return (
    <QueryClientProvider client={queryClient}>
      <GraphqlBatcherProvider>
        <Main>{children}</Main>
      </GraphqlBatcherProvider>
    </QueryClientProvider>
  );
};

export default Layout;
