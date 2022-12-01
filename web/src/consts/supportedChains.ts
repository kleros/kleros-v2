export const SUPPORTED_CHAINS = {
  421613: {
    chainName: "Arbitrum Goerli",
    nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://goerli-rollup.arbitrum.io/rpc"],
    blockExplorerUrls: ["https://testnet.arbiscan.io/"],
  },
};

export const SUPPORTED_CHAINIDS = Object.keys(SUPPORTED_CHAINS).map((x) =>
  parseInt(x)
);
