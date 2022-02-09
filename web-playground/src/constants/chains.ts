export const SUPPORTED_CHAINS = [4, 421611];

export const NETWORKS = {
  4: {
    name: "Rinkeby",
    title: "Ethereum Testnet Rinkeby",
    chain: "ETH",
    rpc: [
      "https://rinkeby.infura.io/v3/${INFURA_API_KEY}",
      "wss://rinkeby.infura.io/ws/v3/${INFURA_API_KEY}",
    ],
    faucets: [
      "http://fauceth.komputing.org?chain=4&address=${ADDRESS}",
      "https://faucet.rinkeby.io",
    ],
    nativeCurrency: {
      name: "Rinkeby Ether",
      symbol: "RIN",
      decimals: 18,
    },
    infoURL: "https://www.rinkeby.io",
    shortName: "rin",
    chainId: 4,
    networkId: 4,
    ens: {
      registry: "0xe7410170f87102df0055eb195163a03b7f2bff4a",
    },
    explorers: [
      {
        name: "etherscan-rinkeby",
        url: "https://rinkeby.etherscan.io",
        standard: "EIP3091",
      },
    ],
  },
  421611: {
    name: "Arbitrum Rinkeby",
    title: "Arbitrum Testnet Rinkeby",
    chainId: 421611,
    shortName: "arb-rinkeby",
    chain: "ETH",
    networkId: 421611,
    nativeCurrency: {
      name: "Arbitrum Rinkeby Ether",
      symbol: "ARETH",
      decimals: 18,
    },
    rpc: ["https://rinkeby.arbitrum.io/rpc", "wss://rinkeby.arbitrum.io/ws"],
    faucets: ["http://fauceth.komputing.org?chain=421611&address=${ADDRESS}"],
    infoURL: "https://arbitrum.io",
    explorers: [
      {
        name: "arbitrum-rinkeby",
        url: "https://rinkeby-explorer.arbitrum.io",
        standard: "EIP3091",
      },
    ],
    parent: {
      type: "L2",
      chain: "eip155-4",
      bridges: [{ url: "https://bridge.arbitrum.io" }],
    },
  },
};
