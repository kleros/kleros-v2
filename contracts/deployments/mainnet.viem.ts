//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DAI
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1)
 */
export const daiABI = [
  { stateMutability: "nonpayable", type: "constructor", inputs: [] },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "owner",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "spender",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "value",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "Approval",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [{ name: "usr", internalType: "address", type: "address", indexed: true }],
    name: "Deny",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [{ name: "usr", internalType: "address", type: "address", indexed: true }],
    name: "Rely",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "from", internalType: "address", type: "address", indexed: true },
      { name: "to", internalType: "address", type: "address", indexed: true },
      {
        name: "value",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "Transfer",
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "DOMAIN_SEPARATOR",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "PERMIT_TYPEHASH",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [
      { name: "", internalType: "address", type: "address" },
      { name: "", internalType: "address", type: "address" },
    ],
    name: "allowance",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "spender", internalType: "address", type: "address" },
      { name: "value", internalType: "uint256", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "from", internalType: "address", type: "address" },
      { name: "value", internalType: "uint256", type: "uint256" },
    ],
    name: "burn",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "spender", internalType: "address", type: "address" },
      { name: "subtractedValue", internalType: "uint256", type: "uint256" },
    ],
    name: "decreaseAllowance",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "usr", internalType: "address", type: "address" }],
    name: "deny",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "deploymentChainId",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "spender", internalType: "address", type: "address" },
      { name: "addedValue", internalType: "uint256", type: "uint256" },
    ],
    name: "increaseAllowance",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "to", internalType: "address", type: "address" },
      { name: "value", internalType: "uint256", type: "uint256" },
    ],
    name: "mint",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "name",
    outputs: [{ name: "", internalType: "string", type: "string" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "nonces",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "owner", internalType: "address", type: "address" },
      { name: "spender", internalType: "address", type: "address" },
      { name: "value", internalType: "uint256", type: "uint256" },
      { name: "deadline", internalType: "uint256", type: "uint256" },
      { name: "v", internalType: "uint8", type: "uint8" },
      { name: "r", internalType: "bytes32", type: "bytes32" },
      { name: "s", internalType: "bytes32", type: "bytes32" },
    ],
    name: "permit",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "usr", internalType: "address", type: "address" }],
    name: "rely",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", internalType: "string", type: "string" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "totalSupply",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "to", internalType: "address", type: "address" },
      { name: "value", internalType: "uint256", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "from", internalType: "address", type: "address" },
      { name: "to", internalType: "address", type: "address" },
      { name: "value", internalType: "uint256", type: "uint256" },
    ],
    name: "transferFrom",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "version",
    outputs: [{ name: "", internalType: "string", type: "string" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "wards",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
] as const;

/**
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1)
 */
export const daiAddress = {
  42161: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
} as const;

/**
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1)
 */
export const daiConfig = { address: daiAddress, abi: daiABI } as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IHomeGateway
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iHomeGatewayABI = [
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "_arbitrator",
        internalType: "contract IArbitratorV2",
        type: "address",
        indexed: false,
      },
      {
        name: "_arbitrableChainId",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "_arbitrable",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "_arbitrableDisputeID",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "_arbitratorDisputeID",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "_externalDisputeID",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "_templateId",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "_templateUri",
        internalType: "string",
        type: "string",
        indexed: false,
      },
    ],
    name: "CrossChainDisputeIncoming",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "_arbitrator",
        internalType: "contract IArbitratorV2",
        type: "address",
        indexed: true,
      },
      {
        name: "_arbitrableDisputeID",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "_externalDisputeID",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "_templateId",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "_templateUri",
        internalType: "string",
        type: "string",
        indexed: false,
      },
    ],
    name: "DisputeRequest",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "_arbitrator",
        internalType: "contract IArbitratorV2",
        type: "address",
        indexed: true,
      },
      {
        name: "_disputeID",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "_ruling",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "Ruling",
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "_disputeHash", internalType: "bytes32", type: "bytes32" }],
    name: "disputeHashToHomeID",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "feeToken",
    outputs: [{ name: "", internalType: "contract IERC20", type: "address" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "foreignChainID",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "foreignGateway",
    outputs: [{ name: "", internalType: "address", type: "address" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "receiverGateway",
    outputs: [{ name: "", internalType: "address", type: "address" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      {
        name: "_params",
        internalType: "struct IHomeGateway.RelayCreateDisputeParams",
        type: "tuple",
        components: [
          {
            name: "foreignBlockHash",
            internalType: "bytes32",
            type: "bytes32",
          },
          { name: "foreignChainID", internalType: "uint256", type: "uint256" },
          {
            name: "foreignArbitrable",
            internalType: "address",
            type: "address",
          },
          {
            name: "foreignDisputeID",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "externalDisputeID",
            internalType: "uint256",
            type: "uint256",
          },
          { name: "templateId", internalType: "uint256", type: "uint256" },
          { name: "templateUri", internalType: "string", type: "string" },
          { name: "choices", internalType: "uint256", type: "uint256" },
          { name: "extraData", internalType: "bytes", type: "bytes" },
        ],
      },
      { name: "_feeAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "relayCreateDispute",
    outputs: [],
  },
  {
    stateMutability: "payable",
    type: "function",
    inputs: [
      {
        name: "_params",
        internalType: "struct IHomeGateway.RelayCreateDisputeParams",
        type: "tuple",
        components: [
          {
            name: "foreignBlockHash",
            internalType: "bytes32",
            type: "bytes32",
          },
          { name: "foreignChainID", internalType: "uint256", type: "uint256" },
          {
            name: "foreignArbitrable",
            internalType: "address",
            type: "address",
          },
          {
            name: "foreignDisputeID",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "externalDisputeID",
            internalType: "uint256",
            type: "uint256",
          },
          { name: "templateId", internalType: "uint256", type: "uint256" },
          { name: "templateUri", internalType: "string", type: "string" },
          { name: "choices", internalType: "uint256", type: "uint256" },
          { name: "extraData", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    name: "relayCreateDispute",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "_disputeID", internalType: "uint256", type: "uint256" },
      { name: "_ruling", internalType: "uint256", type: "uint256" },
    ],
    name: "rule",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "veaInbox",
    outputs: [{ name: "", internalType: "contract IVeaInbox", type: "address" }],
  },
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Pinakion
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x330bD769382cFc6d50175903434CCC8D206DCAE5)
 */
export const pinakionABI = [
  { stateMutability: "nonpayable", type: "constructor", inputs: [] },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "owner",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "spender",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "value",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "Approval",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "from", internalType: "address", type: "address", indexed: true },
      { name: "to", internalType: "address", type: "address", indexed: true },
      {
        name: "value",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "Transfer",
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [
      { name: "owner", internalType: "address", type: "address" },
      { name: "spender", internalType: "address", type: "address" },
    ],
    name: "allowance",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "spender", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "account", internalType: "address", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "spender", internalType: "address", type: "address" },
      { name: "subtractedValue", internalType: "uint256", type: "uint256" },
    ],
    name: "decreaseAllowance",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "spender", internalType: "address", type: "address" },
      { name: "addedValue", internalType: "uint256", type: "uint256" },
    ],
    name: "increaseAllowance",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "name",
    outputs: [{ name: "", internalType: "string", type: "string" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", internalType: "string", type: "string" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "totalSupply",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "to", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "from", internalType: "address", type: "address" },
      { name: "to", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
    ],
    name: "transferFrom",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
  },
] as const;

/**
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x330bD769382cFc6d50175903434CCC8D206DCAE5)
 */
export const pinakionAddress = {
  42161: "0x330bD769382cFc6d50175903434CCC8D206DCAE5",
} as const;

/**
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x330bD769382cFc6d50175903434CCC8D206DCAE5)
 */
export const pinakionConfig = {
  address: pinakionAddress,
  abi: pinakionABI,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PolicyRegistry
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Gnosis Gnosis Chain Explorer__](https://blockscout.com/xdai/mainnet//address/0x9d494768936b6bDaabc46733b8D53A937A6c6D7e)
 */
export const policyRegistryABI = [
  {
    constant: true,
    payable: false,
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "governor",
    outputs: [{ name: "", type: "address" }],
  },
  {
    constant: true,
    payable: false,
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "", type: "uint256" }],
    name: "policies",
    outputs: [{ name: "", type: "string" }],
  },
  {
    constant: false,
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_governor", type: "address" }],
    name: "changeGovernor",
    outputs: [],
  },
  {
    constant: false,
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "_subcourtID", type: "uint256" },
      { name: "_policy", type: "string" },
    ],
    name: "setPolicy",
    outputs: [],
  },
  {
    payable: false,
    stateMutability: "nonpayable",
    type: "constructor",
    inputs: [{ name: "_governor", type: "address" }],
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "_subcourtID", type: "uint256", indexed: true },
      { name: "_policy", type: "string", indexed: false },
    ],
    name: "PolicyUpdate",
  },
] as const;

/**
 * [__View Contract on Gnosis Gnosis Chain Explorer__](https://blockscout.com/xdai/mainnet//address/0x9d494768936b6bDaabc46733b8D53A937A6c6D7e)
 */
export const policyRegistryAddress = {
  100: "0x9d494768936b6bDaabc46733b8D53A937A6c6D7e",
} as const;

/**
 * [__View Contract on Gnosis Gnosis Chain Explorer__](https://blockscout.com/xdai/mainnet//address/0x9d494768936b6bDaabc46733b8D53A937A6c6D7e)
 */
export const policyRegistryConfig = {
  address: policyRegistryAddress,
  abi: policyRegistryABI,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// RandomizerOracle
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x5b8bB80f2d72D0C85caB8fB169e8170A05C94bAF)
 */
export const randomizerOracleABI = [] as const;

/**
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x5b8bB80f2d72D0C85caB8fB169e8170A05C94bAF)
 */
export const randomizerOracleAddress = {
  42161: "0x5b8bB80f2d72D0C85caB8fB169e8170A05C94bAF",
} as const;

/**
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x5b8bB80f2d72D0C85caB8fB169e8170A05C94bAF)
 */
export const randomizerOracleConfig = {
  address: randomizerOracleAddress,
  abi: randomizerOracleABI,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// TokenBridge
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Gnosis Gnosis Chain Explorer__](https://blockscout.com/xdai/mainnet//address/0xf6A78083ca3e2a662D6dd1703c939c8aCE2e268d)
 */
export const tokenBridgeABI = [
  {
    constant: false,
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "version", type: "uint256" },
      { name: "implementation", type: "address" },
    ],
    name: "upgradeTo",
    outputs: [],
  },
  {
    constant: true,
    payable: false,
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "version",
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    constant: true,
    payable: false,
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "implementation",
    outputs: [{ name: "", type: "address" }],
  },
  {
    constant: true,
    payable: false,
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "upgradeabilityOwner",
    outputs: [{ name: "", type: "address" }],
  },
  {
    constant: false,
    payable: true,
    stateMutability: "payable",
    type: "function",
    inputs: [
      { name: "version", type: "uint256" },
      { name: "implementation", type: "address" },
      { name: "data", type: "bytes" },
    ],
    name: "upgradeToAndCall",
    outputs: [],
  },
  {
    constant: false,
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "newOwner", type: "address" }],
    name: "transferProxyOwnership",
    outputs: [],
  },
  { payable: true, stateMutability: "payable", type: "fallback" },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "previousOwner", type: "address", indexed: false },
      { name: "newOwner", type: "address", indexed: false },
    ],
    name: "ProxyOwnershipTransferred",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "version", type: "uint256", indexed: false },
      { name: "implementation", type: "address", indexed: true },
    ],
    name: "Upgraded",
  },
] as const;

/**
 * [__View Contract on Gnosis Gnosis Chain Explorer__](https://blockscout.com/xdai/mainnet//address/0xf6A78083ca3e2a662D6dd1703c939c8aCE2e268d)
 */
export const tokenBridgeAddress = {
  100: "0xf6A78083ca3e2a662D6dd1703c939c8aCE2e268d",
} as const;

/**
 * [__View Contract on Gnosis Gnosis Chain Explorer__](https://blockscout.com/xdai/mainnet//address/0xf6A78083ca3e2a662D6dd1703c939c8aCE2e268d)
 */
export const tokenBridgeConfig = {
  address: tokenBridgeAddress,
  abi: tokenBridgeABI,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// TransactionBatcher
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Gnosis Gnosis Chain Explorer__](https://blockscout.com/xdai/mainnet//address/0x6426800F8508b15AED271337498fa5e7D0794d46)
 */
export const transactionBatcherABI = [
  {
    stateMutability: "payable",
    type: "function",
    inputs: [
      { name: "targets", internalType: "address[]", type: "address[]" },
      { name: "values", internalType: "uint256[]", type: "uint256[]" },
      { name: "datas", internalType: "bytes[]", type: "bytes[]" },
    ],
    name: "batchSend",
    outputs: [],
  },
] as const;

/**
 * [__View Contract on Gnosis Gnosis Chain Explorer__](https://blockscout.com/xdai/mainnet//address/0x6426800F8508b15AED271337498fa5e7D0794d46)
 */
export const transactionBatcherAddress = {
  100: "0x6426800F8508b15AED271337498fa5e7D0794d46",
} as const;

/**
 * [__View Contract on Gnosis Gnosis Chain Explorer__](https://blockscout.com/xdai/mainnet//address/0x6426800F8508b15AED271337498fa5e7D0794d46)
 */
export const transactionBatcherConfig = {
  address: transactionBatcherAddress,
  abi: transactionBatcherABI,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// WETH
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * - [__View Contract on Gnosis Gnosis Chain Explorer__](https://blockscout.com/xdai/mainnet//address/0x6A023CCd1ff6F2045C3309768eAd9E68F978f6e1)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x82aF49447D8a07e3bd95BD0d56f35241523fBab1)
 */
export const wethABI = [
  {
    stateMutability: "payable",
    type: "constructor",
    inputs: [
      { name: "_logic", internalType: "address", type: "address" },
      { name: "admin_", internalType: "address", type: "address" },
      { name: "_data", internalType: "bytes", type: "bytes" },
    ],
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "previousAdmin",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "newAdmin",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "AdminChanged",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "implementation",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "Upgraded",
  },
  { stateMutability: "payable", type: "fallback" },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [],
    name: "admin",
    outputs: [{ name: "admin_", internalType: "address", type: "address" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "newAdmin", internalType: "address", type: "address" }],
    name: "changeAdmin",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [],
    name: "implementation",
    outputs: [{ name: "implementation_", internalType: "address", type: "address" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "newImplementation", internalType: "address", type: "address" }],
    name: "upgradeTo",
    outputs: [],
  },
  {
    stateMutability: "payable",
    type: "function",
    inputs: [
      { name: "newImplementation", internalType: "address", type: "address" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "upgradeToAndCall",
    outputs: [],
  },
  { stateMutability: "payable", type: "receive" },
] as const;

/**
 * - [__View Contract on Gnosis Gnosis Chain Explorer__](https://blockscout.com/xdai/mainnet//address/0x6A023CCd1ff6F2045C3309768eAd9E68F978f6e1)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x82aF49447D8a07e3bd95BD0d56f35241523fBab1)
 */
export const wethAddress = {
  100: "0x6A023CCd1ff6F2045C3309768eAd9E68F978f6e1",
  42161: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
} as const;

/**
 * - [__View Contract on Gnosis Gnosis Chain Explorer__](https://blockscout.com/xdai/mainnet//address/0x6A023CCd1ff6F2045C3309768eAd9E68F978f6e1)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x82aF49447D8a07e3bd95BD0d56f35241523fBab1)
 */
export const wethConfig = { address: wethAddress, abi: wethABI } as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// WrappedPinakion
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Gnosis Gnosis Chain Explorer__](https://blockscout.com/xdai/mainnet//address/0xcb3231aBA3b451343e0Fddfc45883c842f223846)
 */
export const wrappedPinakionABI = [
  {
    stateMutability: "payable",
    type: "constructor",
    inputs: [
      { name: "_logic", internalType: "address", type: "address" },
      { name: "_admin", internalType: "address", type: "address" },
      { name: "_data", internalType: "bytes", type: "bytes" },
    ],
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "previousAdmin",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "newAdmin",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "AdminChanged",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "implementation",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "Upgraded",
  },
  { stateMutability: "payable", type: "fallback" },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [],
    name: "admin",
    outputs: [{ name: "", internalType: "address", type: "address" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "newAdmin", internalType: "address", type: "address" }],
    name: "changeAdmin",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [],
    name: "implementation",
    outputs: [{ name: "", internalType: "address", type: "address" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "newImplementation", internalType: "address", type: "address" }],
    name: "upgradeTo",
    outputs: [],
  },
  {
    stateMutability: "payable",
    type: "function",
    inputs: [
      { name: "newImplementation", internalType: "address", type: "address" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "upgradeToAndCall",
    outputs: [],
  },
  { stateMutability: "payable", type: "receive" },
] as const;

/**
 * [__View Contract on Gnosis Gnosis Chain Explorer__](https://blockscout.com/xdai/mainnet//address/0xcb3231aBA3b451343e0Fddfc45883c842f223846)
 */
export const wrappedPinakionAddress = {
  100: "0xcb3231aBA3b451343e0Fddfc45883c842f223846",
} as const;

/**
 * [__View Contract on Gnosis Gnosis Chain Explorer__](https://blockscout.com/xdai/mainnet//address/0xcb3231aBA3b451343e0Fddfc45883c842f223846)
 */
export const wrappedPinakionConfig = {
  address: wrappedPinakionAddress,
  abi: wrappedPinakionABI,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// xKlerosLiquid
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Gnosis Gnosis Chain Explorer__](https://blockscout.com/xdai/mainnet//address/0x9C1dA9A04925bDfDedf0f6421bC7EEa8305F9002)
 */
export const xKlerosLiquidABI = [
  {
    stateMutability: "payable",
    type: "constructor",
    inputs: [
      { name: "_logic", internalType: "address", type: "address" },
      { name: "_admin", internalType: "address", type: "address" },
      { name: "_data", internalType: "bytes", type: "bytes" },
    ],
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "previousAdmin",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "newAdmin",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "AdminChanged",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "implementation",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "Upgraded",
  },
  { stateMutability: "payable", type: "fallback" },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [],
    name: "admin",
    outputs: [{ name: "", internalType: "address", type: "address" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "newAdmin", internalType: "address", type: "address" }],
    name: "changeAdmin",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [],
    name: "implementation",
    outputs: [{ name: "", internalType: "address", type: "address" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "newImplementation", internalType: "address", type: "address" }],
    name: "upgradeTo",
    outputs: [],
  },
  {
    stateMutability: "payable",
    type: "function",
    inputs: [
      { name: "newImplementation", internalType: "address", type: "address" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "upgradeToAndCall",
    outputs: [],
  },
  { stateMutability: "payable", type: "receive" },
] as const;

/**
 * [__View Contract on Gnosis Gnosis Chain Explorer__](https://blockscout.com/xdai/mainnet//address/0x9C1dA9A04925bDfDedf0f6421bC7EEa8305F9002)
 */
export const xKlerosLiquidAddress = {
  100: "0x9C1dA9A04925bDfDedf0f6421bC7EEa8305F9002",
} as const;

/**
 * [__View Contract on Gnosis Gnosis Chain Explorer__](https://blockscout.com/xdai/mainnet//address/0x9C1dA9A04925bDfDedf0f6421bC7EEa8305F9002)
 */
export const xKlerosLiquidConfig = {
  address: xKlerosLiquidAddress,
  abi: xKlerosLiquidABI,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// xPNK
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Gnosis Gnosis Chain Explorer__](https://blockscout.com/xdai/mainnet//address/0x37b60f4E9A31A64cCc0024dce7D0fD07eAA0F7B3)
 */
export const xPnkABI = [] as const;

/**
 * [__View Contract on Gnosis Gnosis Chain Explorer__](https://blockscout.com/xdai/mainnet//address/0x37b60f4E9A31A64cCc0024dce7D0fD07eAA0F7B3)
 */
export const xPnkAddress = {
  100: "0x37b60f4E9A31A64cCc0024dce7D0fD07eAA0F7B3",
} as const;

/**
 * [__View Contract on Gnosis Gnosis Chain Explorer__](https://blockscout.com/xdai/mainnet//address/0x37b60f4E9A31A64cCc0024dce7D0fD07eAA0F7B3)
 */
export const xPnkConfig = { address: xPnkAddress, abi: xPnkABI } as const;
