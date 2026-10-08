"use client";
import React from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";

import GraphqlBatcherProvider from "context/GraphqlBatcher";
import Web3Provider from "context/Web3Provider";
const queryClient = new QueryClient();

const Layout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  return (
    <Web3Provider>
      <QueryClientProvider client={queryClient}>
        <GraphqlBatcherProvider>
          <main className="min-h-[calc(100vh-130px)]">
            <ToastContainer className="p-4 pt-[70px]" />
            {children}
          </main>
        </GraphqlBatcherProvider>
      </QueryClientProvider>
    </Web3Provider>
  );
};

export default Layout;
