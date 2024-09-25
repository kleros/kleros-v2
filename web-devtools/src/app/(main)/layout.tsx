"use client";
import React from "react";
import styled from "styled-components";

import "react-toastify/dist/ReactToastify.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";

import GraphqlBatcherProvider from "context/GraphqlBatcher";
import Web3Provider from "context/Web3Provider";

const Main = styled.main`
  min-height: calc(100vh - 130px);
`;
const queryClient = new QueryClient();

const StyledToastContainer = styled(ToastContainer)`
  padding: 16px;
  padding-top: 70px;
`;

const Layout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  return (
    <Web3Provider>
      <QueryClientProvider client={queryClient}>
        <GraphqlBatcherProvider>
          <Main>
            <StyledToastContainer />
            {children}
          </Main>
        </GraphqlBatcherProvider>
      </QueryClientProvider>
    </Web3Provider>
  );
};

export default Layout;
