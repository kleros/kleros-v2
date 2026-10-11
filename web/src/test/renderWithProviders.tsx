import React, { type ReactElement, type ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, renderHook, type RenderHookOptions } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { http, type Address } from "viem";
import { arbitrumSepolia } from "viem/chains";
import { createConfig, mock, WagmiProvider } from "wagmi";

import GraphqlBatcherProvider from "context/GraphqlBatcher";
import StyledComponentsProvider from "context/StyledComponentsProvider";

import { MOCK_ACCOUNT_1 } from "./mocks";
import { rpcHandler, TEST_RPC_URL, type ReadMock } from "./msw/rpc";
import { server } from "./msw/server";

/** arbitrumSepolia (the devnet DEFAULT_CHAIN) with its RPC pointed at the MSW handler. */
export const testChain = {
  ...arbitrumSepolia,
  rpcUrls: { default: { http: [TEST_RPC_URL] } },
} as const;

export interface ProviderOptions {
  /** Initial URL, e.g. "/cases/12/voting". */
  route?: string;
  /** Route pattern the UI is mounted under so `useParams` resolves, e.g. "/cases/:id/*". */
  path?: string;
  /** Connected wallet; `null` renders disconnected. */
  account?: Address | null;
  /** Contract reads answered by the JSON-RPC mock. */
  reads?: ReadMock[];
  /** Receipt status for transactions sent through the mock wallet. */
  receiptStatus?: "success" | "reverted";
  /** Extra providers mounted inside the router, outermost first. */
  providers?: React.ComponentType<{ children: ReactNode }>[];
}

export const createProviders = ({
  route = "/",
  path = "*",
  account = MOCK_ACCOUNT_1,
  reads = [],
  receiptStatus,
  providers = [],
}: ProviderOptions = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity }, mutations: { retry: false } },
  });
  const rpc = rpcHandler({ reads, receiptStatus, chainId: testChain.id, accounts: account ? [account] : [] });
  server.use(rpc.handler);

  const config = createConfig({
    chains: [testChain],
    connectors: [
      mock({ accounts: [account ?? MOCK_ACCOUNT_1], features: { defaultConnected: !!account, reconnect: true } }),
    ],
    transports: { [testChain.id]: http(TEST_RPC_URL) },
    batch: { multicall: false },
  });

  const Wrapper: React.FC<{ children: ReactNode }> = ({ children }) => {
    const inner = providers.reduceRight<ReactNode>((acc, Provider) => <Provider>{acc}</Provider>, children);
    return (
      <WagmiProvider config={config} reconnectOnMount={!!account}>
        <QueryClientProvider client={queryClient}>
          <StyledComponentsProvider>
            <GraphqlBatcherProvider>
              <MemoryRouter initialEntries={[route]}>
                <Routes>
                  <Route path={path} element={inner} />
                </Routes>
              </MemoryRouter>
            </GraphqlBatcherProvider>
          </StyledComponentsProvider>
        </QueryClientProvider>
      </WagmiProvider>
    );
  };

  return { Wrapper, queryClient, config, rpcCalls: rpc.calls, sentTransactions: rpc.sent };
};

/** The only way a component test renders: fresh QueryClient, mock wallet, router, theme, batcher. */
export function renderWithProviders(ui: ReactElement, options: ProviderOptions = {}) {
  const { Wrapper, ...rest } = createProviders(options);
  const user = userEvent.setup();
  return { user, ...rest, ...render(ui, { wrapper: Wrapper }) };
}

export function renderHookWithProviders<Result, Props>(
  hook: (props: Props) => Result,
  options: ProviderOptions & Omit<RenderHookOptions<Props>, "wrapper"> = {}
) {
  const { route, path, account, reads, receiptStatus, providers, ...hookOptions } = options;
  const { Wrapper, ...rest } = createProviders({ route, path, account, reads, receiptStatus, providers });
  return { ...rest, ...renderHook(hook, { wrapper: Wrapper, ...hookOptions }) };
}
