export const SUPPORTED_CHAINS = {
  421611: {
    chainName: "Arbitrum Rinkeby",
    nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://rinkeby.arbitrum.io/rpc"],
    blockExplorerUrls: ["https://testnet.arbiscan.io/"],
  },
};

export const SUPPORTED_CHAINIDS = Object.keys(SUPPORTED_CHAINS).map((x) =>
  parseInt(x)
);
