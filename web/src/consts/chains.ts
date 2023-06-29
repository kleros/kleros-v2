export const SUPPORTED_CHAINS = {
  421613: {
    chainName: "Arbitrum Goerli",
    nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://goerli-rollup.arbitrum.io/rpc"],
    blockExplorerUrls: ["https://goerli.arbiscan.io/"],
  },
};

export const DEFAULT_CHAIN = 421613;

export const SUPPORTED_CHAINIDS = Object.keys(SUPPORTED_CHAINS).map((x) => parseInt(x));

export const QUERY_CHAINS = {
  10200: {
    chainName: "Chiado Testnet",
    nativeCurrency: { name: "xDAI", symbol: "xDAI", decimals: 18 },
    rpcUrls: ["https://rpc.eu-central-2.gateway.fm/v3/gnosis/archival/chiado"],
    blockExplorerUrls: ["https://blockscout.chiadochain.net"],
  },
};

export const QUERY_CHAINIDS = Object.keys(QUERY_CHAINS).map((x) => parseInt(x));
