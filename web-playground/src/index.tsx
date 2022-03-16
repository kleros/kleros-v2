import React from "react";
import ReactDOM from "react-dom";
import { DAppProvider, Config, Rinkeby, ArbitrumRinkeby } from "@usedapp/core";
import { QueryClient, QueryClientProvider } from "react-query";
import App from "./app";

const config: Config = {
  readOnlyChainId: Rinkeby.chainId,
  readOnlyUrls: {
    [Rinkeby.chainId]:
      "https://rinkeby.infura.io/v3/4d07c7b5ff9642efa23389f76d145baf",
    [ArbitrumRinkeby.chainId]:
      "https://arb-rinkeby.g.alchemy.com/v2/zdlANywZ-MToqociw6beiqCJiP165DFa",
  },
  networks: [Rinkeby, ArbitrumRinkeby],
};

const queryClient = new QueryClient();
const WebApp = () => (
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <DAppProvider {...{ config }}>
        <App />
      </DAppProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

const app = document.getElementById("app");
ReactDOM.render(<WebApp />, app);
