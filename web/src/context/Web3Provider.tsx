import React, { useCallback, useState } from "react";

import { Config, WagmiProvider } from "wagmi";

import { DEFAULT_CHAIN } from "consts/chains";
import { isLocalDeployment } from "consts/index";

import { appKit, createMockAdapter, wagmiAdapter } from "src/config/wagmi";
import { isUndefined } from "src/utils";

// Test hook for the Playwright wallet fixture; set only by .env.e2e.public and local deployments.
const isMockWalletEnabled = isLocalDeployment() || import.meta.env.REACT_APP_MOCK_WALLET === "true";

declare global {
  interface Window {
    _setupMockAccount: (...args: Parameters<typeof createMockAdapter>) => void;
  }
}

const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wagmiConfig, setWagmiConfig] = useState<Config>();

  const _setupMockAccount = useCallback(async (...args: Parameters<Window["_setupMockAccount"]>) => {
    const adapter = await createMockAdapter(...args);
    appKit.addAdapter(adapter, [DEFAULT_CHAIN]);
    setWagmiConfig(adapter.wagmiConfig);
  }, []);

  if (isMockWalletEnabled && !isUndefined(window)) window._setupMockAccount = _setupMockAccount;

  return <WagmiProvider config={wagmiConfig ?? wagmiAdapter.wagmiConfig}> {children} </WagmiProvider>;
};

export default Web3Provider;
