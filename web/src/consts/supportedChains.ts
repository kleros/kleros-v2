export const SUPPORTED_CHAINS = {
  421613: {
    chainName: "Arbitrum Goerli",
    nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://goerli-rollup.arbitrum.io/rpc"],
    blockExplorerUrls: ["https://goerli.arbiscan.io/"],
  },
};

export const DEFAULT_CHAIN = 421613;

export const SUPPORTED_CHAINIDS = Object.keys(SUPPORTED_CHAINS).map((x) =>
  parseInt(x)
);
