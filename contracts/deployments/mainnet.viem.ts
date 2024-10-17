//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DAI
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1)
 */
export const daiAbi = [
  { type: "constructor", inputs: [], stateMutability: "nonpayable" },
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
    type: "function",
    inputs: [],
    name: "DOMAIN_SEPARATOR",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "PERMIT_TYPEHASH",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "", internalType: "address", type: "address" },
      { name: "", internalType: "address", type: "address" },
    ],
    name: "allowance",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "spender", internalType: "address", type: "address" },
      { name: "value", internalType: "uint256", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "from", internalType: "address", type: "address" },
      { name: "value", internalType: "uint256", type: "uint256" },
    ],
    name: "burn",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "spender", internalType: "address", type: "address" },
      { name: "subtractedValue", internalType: "uint256", type: "uint256" },
    ],
    name: "decreaseAllowance",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "usr", internalType: "address", type: "address" }],
    name: "deny",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "deploymentChainId",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "spender", internalType: "address", type: "address" },
      { name: "addedValue", internalType: "uint256", type: "uint256" },
    ],
    name: "increaseAllowance",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "to", internalType: "address", type: "address" },
      { name: "value", internalType: "uint256", type: "uint256" },
    ],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "name",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "nonces",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
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
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "usr", internalType: "address", type: "address" }],
    name: "rely",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "totalSupply",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "to", internalType: "address", type: "address" },
      { name: "value", internalType: "uint256", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "from", internalType: "address", type: "address" },
      { name: "to", internalType: "address", type: "address" },
      { name: "value", internalType: "uint256", type: "uint256" },
    ],
    name: "transferFrom",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "version",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "wards",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
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
export const daiConfig = { address: daiAddress, abi: daiAbi } as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DisputeKitClassicNeo
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0xb7c292cD9Fd3d20De84a71AE1caF054eEB6374A9)
 */
export const disputeKitClassicNeoAbi = [
  { type: "fallback", stateMutability: "payable" },
  { type: "receive", stateMutability: "payable" },
  { type: "error", inputs: [], name: "AlreadyInitialized" },
  { type: "error", inputs: [], name: "FailedDelegateCall" },
  {
    type: "error",
    inputs: [{ name: "implementation", internalType: "address", type: "address" }],
    name: "InvalidImplementation",
  },
  { type: "error", inputs: [], name: "NotInitializing" },
  { type: "error", inputs: [], name: "UUPSUnauthorizedCallContext" },
  {
    type: "error",
    inputs: [{ name: "slot", internalType: "bytes32", type: "bytes32" }],
    name: "UUPSUnsupportedProxiableUUID",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "_coreDisputeID",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "_coreRoundID",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "_choice",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
    ],
    name: "ChoiceFunded",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "_coreDisputeID",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "_juror",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "_voteIDs",
        internalType: "uint256[]",
        type: "uint256[]",
        indexed: false,
      },
      {
        name: "_commit",
        internalType: "bytes32",
        type: "bytes32",
        indexed: false,
      },
    ],
    name: "CommitCast",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "_coreDisputeID",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "_coreRoundID",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "_choice",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "_contributor",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "_amount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "Contribution",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "_coreDisputeID",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "_numberOfChoices",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "_extraData",
        internalType: "bytes",
        type: "bytes",
        indexed: false,
      },
    ],
    name: "DisputeCreation",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "version",
        internalType: "uint64",
        type: "uint64",
        indexed: false,
      },
    ],
    name: "Initialized",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "newImplementation",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "Upgraded",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "_coreDisputeID",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "_juror",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "_voteIDs",
        internalType: "uint256[]",
        type: "uint256[]",
        indexed: false,
      },
      {
        name: "_choice",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "_justification",
        internalType: "string",
        type: "string",
        indexed: false,
      },
    ],
    name: "VoteCast",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "_coreDisputeID",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "_coreRoundID",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "_choice",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "_contributor",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "_amount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "Withdrawal",
  },
  {
    type: "function",
    inputs: [],
    name: "LOSER_APPEAL_PERIOD_MULTIPLIER",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "LOSER_STAKE_MULTIPLIER",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "ONE_BASIS_POINT",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "WINNER_STAKE_MULTIPLIER",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "_coreDisputeID", internalType: "uint256", type: "uint256" }],
    name: "areCommitsAllCast",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "_coreDisputeID", internalType: "uint256", type: "uint256" }],
    name: "areVotesAllCast",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_coreDisputeID", internalType: "uint256", type: "uint256" },
      { name: "_voteIDs", internalType: "uint256[]", type: "uint256[]" },
      { name: "_commit", internalType: "bytes32", type: "bytes32" },
    ],
    name: "castCommit",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_coreDisputeID", internalType: "uint256", type: "uint256" },
      { name: "_voteIDs", internalType: "uint256[]", type: "uint256[]" },
      { name: "_choice", internalType: "uint256", type: "uint256" },
      { name: "_salt", internalType: "uint256", type: "uint256" },
      { name: "_justification", internalType: "string", type: "string" },
    ],
    name: "castVote",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "_core", internalType: "address", type: "address" }],
    name: "changeCore",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "_governor", internalType: "address payable", type: "address" }],
    name: "changeGovernor",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "core",
    outputs: [{ name: "", internalType: "contract KlerosCore", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    name: "coreDisputeIDToLocal",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_coreDisputeID", internalType: "uint256", type: "uint256" },
      { name: "_numberOfChoices", internalType: "uint256", type: "uint256" },
      { name: "_extraData", internalType: "bytes", type: "bytes" },
      { name: "_nbVotes", internalType: "uint256", type: "uint256" },
    ],
    name: "createDispute",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "_coreDisputeID", internalType: "uint256", type: "uint256" }],
    name: "currentRuling",
    outputs: [
      { name: "ruling", internalType: "uint256", type: "uint256" },
      { name: "tied", internalType: "bool", type: "bool" },
      { name: "overridden", internalType: "bool", type: "bool" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    name: "disputes",
    outputs: [
      { name: "numberOfChoices", internalType: "uint256", type: "uint256" },
      { name: "jumped", internalType: "bool", type: "bool" },
      { name: "extraData", internalType: "bytes", type: "bytes" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_coreDisputeID", internalType: "uint256", type: "uint256" },
      { name: "_nonce", internalType: "uint256", type: "uint256" },
    ],
    name: "draw",
    outputs: [{ name: "drawnAddress", internalType: "address", type: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_destination", internalType: "address", type: "address" },
      { name: "_amount", internalType: "uint256", type: "uint256" },
      { name: "_data", internalType: "bytes", type: "bytes" },
    ],
    name: "executeGovernorProposal",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_coreDisputeID", internalType: "uint256", type: "uint256" },
      { name: "_choice", internalType: "uint256", type: "uint256" },
    ],
    name: "fundAppeal",
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [
      { name: "_coreDisputeID", internalType: "uint256", type: "uint256" },
      { name: "_coreRoundID", internalType: "uint256", type: "uint256" },
    ],
    name: "getCoherentCount",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_coreDisputeID", internalType: "uint256", type: "uint256" },
      { name: "_coreRoundID", internalType: "uint256", type: "uint256" },
      { name: "_voteID", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "uint256", type: "uint256" },
    ],
    name: "getDegreeOfCoherence",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "_coreDisputeID", internalType: "uint256", type: "uint256" }],
    name: "getFundedChoices",
    outputs: [{ name: "fundedChoices", internalType: "uint256[]", type: "uint256[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_coreDisputeID", internalType: "uint256", type: "uint256" },
      { name: "_coreRoundID", internalType: "uint256", type: "uint256" },
      { name: "_choice", internalType: "uint256", type: "uint256" },
    ],
    name: "getRoundInfo",
    outputs: [
      { name: "winningChoice", internalType: "uint256", type: "uint256" },
      { name: "tied", internalType: "bool", type: "bool" },
      { name: "totalVoted", internalType: "uint256", type: "uint256" },
      { name: "totalCommited", internalType: "uint256", type: "uint256" },
      { name: "nbVoters", internalType: "uint256", type: "uint256" },
      { name: "choiceCount", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_coreDisputeID", internalType: "uint256", type: "uint256" },
      { name: "_coreRoundID", internalType: "uint256", type: "uint256" },
      { name: "_voteID", internalType: "uint256", type: "uint256" },
    ],
    name: "getVoteInfo",
    outputs: [
      { name: "account", internalType: "address", type: "address" },
      { name: "commit", internalType: "bytes32", type: "bytes32" },
      { name: "choice", internalType: "uint256", type: "uint256" },
      { name: "voted", internalType: "bool", type: "bool" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "governor",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_governor", internalType: "address", type: "address" },
      { name: "_core", internalType: "contract KlerosCore", type: "address" },
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_coreDisputeID", internalType: "uint256", type: "uint256" },
      { name: "_coreRoundID", internalType: "uint256", type: "uint256" },
      { name: "_voteID", internalType: "uint256", type: "uint256" },
    ],
    name: "isVoteActive",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "proxiableUUID",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "newImplementation", internalType: "address", type: "address" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "upgradeToAndCall",
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [
      { name: "_coreDisputeID", internalType: "uint256", type: "uint256" },
      {
        name: "_beneficiary",
        internalType: "address payable",
        type: "address",
      },
      { name: "_coreRoundID", internalType: "uint256", type: "uint256" },
      { name: "_choice", internalType: "uint256", type: "uint256" },
    ],
    name: "withdrawFeesAndRewards",
    outputs: [{ name: "amount", internalType: "uint256", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "constructor",
    inputs: [
      { name: "_implementation", internalType: "address", type: "address" },
      { name: "_data", internalType: "bytes", type: "bytes" },
    ],
    stateMutability: "nonpayable",
  },
] as const;

/**
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0xb7c292cD9Fd3d20De84a71AE1caF054eEB6374A9)
 */
export const disputeKitClassicNeoAddress = {
  42161: "0xb7c292cD9Fd3d20De84a71AE1caF054eEB6374A9",
} as const;

/**
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0xb7c292cD9Fd3d20De84a71AE1caF054eEB6374A9)
 */
export const disputeKitClassicNeoConfig = {
  address: disputeKitClassicNeoAddress,
  abi: disputeKitClassicNeoAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DisputeKitClassicNeo_Implementation
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x86Ac67e5550F837a650B4B0Cd4778D4293a2bDe3)
 */
export const disputeKitClassicNeoImplementationAbi = [
  { type: "constructor", inputs: [], stateMutability: "nonpayable" },
  { type: "error", inputs: [], name: "AlreadyInitialized" },
  { type: "error", inputs: [], name: "FailedDelegateCall" },
  {
    type: "error",
    inputs: [{ name: "implementation", internalType: "address", type: "address" }],
    name: "InvalidImplementation",
  },
  { type: "error", inputs: [], name: "NotInitializing" },
  { type: "error", inputs: [], name: "UUPSUnauthorizedCallContext" },
  {
    type: "error",
    inputs: [{ name: "slot", internalType: "bytes32", type: "bytes32" }],
    name: "UUPSUnsupportedProxiableUUID",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "_coreDisputeID",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "_coreRoundID",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "_choice",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
    ],
    name: "ChoiceFunded",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "_coreDisputeID",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "_juror",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "_voteIDs",
        internalType: "uint256[]",
        type: "uint256[]",
        indexed: false,
      },
      {
        name: "_commit",
        internalType: "bytes32",
        type: "bytes32",
        indexed: false,
      },
    ],
    name: "CommitCast",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "_coreDisputeID",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "_coreRoundID",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "_choice",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "_contributor",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "_amount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "Contribution",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "_coreDisputeID",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "_numberOfChoices",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "_extraData",
        internalType: "bytes",
        type: "bytes",
        indexed: false,
      },
    ],
    name: "DisputeCreation",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "version",
        internalType: "uint64",
        type: "uint64",
        indexed: false,
      },
    ],
    name: "Initialized",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "newImplementation",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "Upgraded",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "_coreDisputeID",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "_juror",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "_voteIDs",
        internalType: "uint256[]",
        type: "uint256[]",
        indexed: false,
      },
      {
        name: "_choice",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "_justification",
        internalType: "string",
        type: "string",
        indexed: false,
      },
    ],
    name: "VoteCast",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "_coreDisputeID",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "_coreRoundID",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "_choice",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "_contributor",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "_amount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "Withdrawal",
  },
  {
    type: "function",
    inputs: [],
    name: "LOSER_APPEAL_PERIOD_MULTIPLIER",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "LOSER_STAKE_MULTIPLIER",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "ONE_BASIS_POINT",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "WINNER_STAKE_MULTIPLIER",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "_coreDisputeID", internalType: "uint256", type: "uint256" }],
    name: "areCommitsAllCast",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "_coreDisputeID", internalType: "uint256", type: "uint256" }],
    name: "areVotesAllCast",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_coreDisputeID", internalType: "uint256", type: "uint256" },
      { name: "_voteIDs", internalType: "uint256[]", type: "uint256[]" },
      { name: "_commit", internalType: "bytes32", type: "bytes32" },
    ],
    name: "castCommit",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_coreDisputeID", internalType: "uint256", type: "uint256" },
      { name: "_voteIDs", internalType: "uint256[]", type: "uint256[]" },
      { name: "_choice", internalType: "uint256", type: "uint256" },
      { name: "_salt", internalType: "uint256", type: "uint256" },
      { name: "_justification", internalType: "string", type: "string" },
    ],
    name: "castVote",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "_core", internalType: "address", type: "address" }],
    name: "changeCore",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "_governor", internalType: "address payable", type: "address" }],
    name: "changeGovernor",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "core",
    outputs: [{ name: "", internalType: "contract KlerosCore", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    name: "coreDisputeIDToLocal",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_coreDisputeID", internalType: "uint256", type: "uint256" },
      { name: "_numberOfChoices", internalType: "uint256", type: "uint256" },
      { name: "_extraData", internalType: "bytes", type: "bytes" },
      { name: "_nbVotes", internalType: "uint256", type: "uint256" },
    ],
    name: "createDispute",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "_coreDisputeID", internalType: "uint256", type: "uint256" }],
    name: "currentRuling",
    outputs: [
      { name: "ruling", internalType: "uint256", type: "uint256" },
      { name: "tied", internalType: "bool", type: "bool" },
      { name: "overridden", internalType: "bool", type: "bool" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    name: "disputes",
    outputs: [
      { name: "numberOfChoices", internalType: "uint256", type: "uint256" },
      { name: "jumped", internalType: "bool", type: "bool" },
      { name: "extraData", internalType: "bytes", type: "bytes" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_coreDisputeID", internalType: "uint256", type: "uint256" },
      { name: "_nonce", internalType: "uint256", type: "uint256" },
    ],
    name: "draw",
    outputs: [{ name: "drawnAddress", internalType: "address", type: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_destination", internalType: "address", type: "address" },
      { name: "_amount", internalType: "uint256", type: "uint256" },
      { name: "_data", internalType: "bytes", type: "bytes" },
    ],
    name: "executeGovernorProposal",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_coreDisputeID", internalType: "uint256", type: "uint256" },
      { name: "_choice", internalType: "uint256", type: "uint256" },
    ],
    name: "fundAppeal",
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [
      { name: "_coreDisputeID", internalType: "uint256", type: "uint256" },
      { name: "_coreRoundID", internalType: "uint256", type: "uint256" },
    ],
    name: "getCoherentCount",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_coreDisputeID", internalType: "uint256", type: "uint256" },
      { name: "_coreRoundID", internalType: "uint256", type: "uint256" },
      { name: "_voteID", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "uint256", type: "uint256" },
    ],
    name: "getDegreeOfCoherence",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "_coreDisputeID", internalType: "uint256", type: "uint256" }],
    name: "getFundedChoices",
    outputs: [{ name: "fundedChoices", internalType: "uint256[]", type: "uint256[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_coreDisputeID", internalType: "uint256", type: "uint256" },
      { name: "_coreRoundID", internalType: "uint256", type: "uint256" },
      { name: "_choice", internalType: "uint256", type: "uint256" },
    ],
    name: "getRoundInfo",
    outputs: [
      { name: "winningChoice", internalType: "uint256", type: "uint256" },
      { name: "tied", internalType: "bool", type: "bool" },
      { name: "totalVoted", internalType: "uint256", type: "uint256" },
      { name: "totalCommited", internalType: "uint256", type: "uint256" },
      { name: "nbVoters", internalType: "uint256", type: "uint256" },
      { name: "choiceCount", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_coreDisputeID", internalType: "uint256", type: "uint256" },
      { name: "_coreRoundID", internalType: "uint256", type: "uint256" },
      { name: "_voteID", internalType: "uint256", type: "uint256" },
    ],
    name: "getVoteInfo",
    outputs: [
      { name: "account", internalType: "address", type: "address" },
      { name: "commit", internalType: "bytes32", type: "bytes32" },
      { name: "choice", internalType: "uint256", type: "uint256" },
      { name: "voted", internalType: "bool", type: "bool" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "governor",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_governor", internalType: "address", type: "address" },
      { name: "_core", internalType: "contract KlerosCore", type: "address" },
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_coreDisputeID", internalType: "uint256", type: "uint256" },
      { name: "_coreRoundID", internalType: "uint256", type: "uint256" },
      { name: "_voteID", internalType: "uint256", type: "uint256" },
    ],
    name: "isVoteActive",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "proxiableUUID",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "newImplementation", internalType: "address", type: "address" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "upgradeToAndCall",
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [
      { name: "_coreDisputeID", internalType: "uint256", type: "uint256" },
      {
        name: "_beneficiary",
        internalType: "address payable",
        type: "address",
      },
      { name: "_coreRoundID", internalType: "uint256", type: "uint256" },
      { name: "_choice", internalType: "uint256", type: "uint256" },
    ],
    name: "withdrawFeesAndRewards",
    outputs: [{ name: "amount", internalType: "uint256", type: "uint256" }],
    stateMutability: "nonpayable",
  },
] as const;

/**
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x86Ac67e5550F837a650B4B0Cd4778D4293a2bDe3)
 */
export const disputeKitClassicNeoImplementationAddress = {
  42161: "0x86Ac67e5550F837a650B4B0Cd4778D4293a2bDe3",
} as const;

/**
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x86Ac67e5550F837a650B4B0Cd4778D4293a2bDe3)
 */
export const disputeKitClassicNeoImplementationConfig = {
  address: disputeKitClassicNeoImplementationAddress,
  abi: disputeKitClassicNeoImplementationAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DisputeKitClassicNeo_Proxy
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0xb7c292cD9Fd3d20De84a71AE1caF054eEB6374A9)
 */
export const disputeKitClassicNeoProxyAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "_implementation", internalType: "address", type: "address" },
      { name: "_data", internalType: "bytes", type: "bytes" },
    ],
    stateMutability: "nonpayable",
  },
  { type: "fallback", stateMutability: "payable" },
  { type: "receive", stateMutability: "payable" },
] as const;

/**
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0xb7c292cD9Fd3d20De84a71AE1caF054eEB6374A9)
 */
export const disputeKitClassicNeoProxyAddress = {
  42161: "0xb7c292cD9Fd3d20De84a71AE1caF054eEB6374A9",
} as const;

/**
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0xb7c292cD9Fd3d20De84a71AE1caF054eEB6374A9)
 */
export const disputeKitClassicNeoProxyConfig = {
  address: disputeKitClassicNeoProxyAddress,
  abi: disputeKitClassicNeoProxyAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DisputeResolverNeo
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x95eCE455bD817D6adB92F2383617d36eBE10D6EB)
 */
export const disputeResolverNeoAbi = [
  {
    type: "constructor",
    inputs: [
      {
        name: "_arbitrator",
        internalType: "contract IArbitratorV2",
        type: "address",
      },
      {
        name: "_templateRegistry",
        internalType: "contract IDisputeTemplateRegistry",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
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
    type: "function",
    inputs: [],
    name: "arbitrator",
    outputs: [{ name: "", internalType: "contract IArbitratorV2", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    name: "arbitratorDisputeIDToLocalID",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      {
        name: "_arbitrator",
        internalType: "contract IArbitratorV2",
        type: "address",
      },
    ],
    name: "changeArbitrator",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "_governor", internalType: "address", type: "address" }],
    name: "changeGovernor",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "_templateRegistry",
        internalType: "contract IDisputeTemplateRegistry",
        type: "address",
      },
    ],
    name: "changeTemplateRegistry",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_arbitratorExtraData", internalType: "bytes", type: "bytes" },
      { name: "_disputeTemplate", internalType: "string", type: "string" },
      {
        name: "_disputeTemplateDataMappings",
        internalType: "string",
        type: "string",
      },
      {
        name: "_numberOfRulingOptions",
        internalType: "uint256",
        type: "uint256",
      },
    ],
    name: "createDisputeForTemplate",
    outputs: [{ name: "disputeID", internalType: "uint256", type: "uint256" }],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [
      { name: "_arbitratorExtraData", internalType: "bytes", type: "bytes" },
      { name: "_disputeTemplateUri", internalType: "string", type: "string" },
      {
        name: "_numberOfRulingOptions",
        internalType: "uint256",
        type: "uint256",
      },
    ],
    name: "createDisputeForTemplateUri",
    outputs: [{ name: "disputeID", internalType: "uint256", type: "uint256" }],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    name: "disputes",
    outputs: [
      { name: "arbitratorExtraData", internalType: "bytes", type: "bytes" },
      { name: "isRuled", internalType: "bool", type: "bool" },
      { name: "ruling", internalType: "uint256", type: "uint256" },
      {
        name: "numberOfRulingOptions",
        internalType: "uint256",
        type: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "governor",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      {
        name: "_arbitratorDisputeID",
        internalType: "uint256",
        type: "uint256",
      },
      { name: "_ruling", internalType: "uint256", type: "uint256" },
    ],
    name: "rule",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "templateRegistry",
    outputs: [
      {
        name: "",
        internalType: "contract IDisputeTemplateRegistry",
        type: "address",
      },
    ],
    stateMutability: "view",
  },
] as const;

/**
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x95eCE455bD817D6adB92F2383617d36eBE10D6EB)
 */
export const disputeResolverNeoAddress = {
  42161: "0x95eCE455bD817D6adB92F2383617d36eBE10D6EB",
} as const;

/**
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x95eCE455bD817D6adB92F2383617d36eBE10D6EB)
 */
export const disputeResolverNeoConfig = {
  address: disputeResolverNeoAddress,
  abi: disputeResolverNeoAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DisputeTemplateRegistry
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x52c9f5634361eD3641016e5d9783310f9EFf9e25)
 */
export const disputeTemplateRegistryAbi = [
  { type: "fallback", stateMutability: "payable" },
  { type: "receive", stateMutability: "payable" },
  { type: "error", inputs: [], name: "AlreadyInitialized" },
  { type: "error", inputs: [], name: "FailedDelegateCall" },
  {
    type: "error",
    inputs: [{ name: "implementation", internalType: "address", type: "address" }],
    name: "InvalidImplementation",
  },
  { type: "error", inputs: [], name: "NotInitializing" },
  { type: "error", inputs: [], name: "UUPSUnauthorizedCallContext" },
  {
    type: "error",
    inputs: [{ name: "slot", internalType: "bytes32", type: "bytes32" }],
    name: "UUPSUnsupportedProxiableUUID",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "_templateId",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "_templateTag",
        internalType: "string",
        type: "string",
        indexed: true,
      },
      {
        name: "_templateData",
        internalType: "string",
        type: "string",
        indexed: false,
      },
      {
        name: "_templateDataMappings",
        internalType: "string",
        type: "string",
        indexed: false,
      },
    ],
    name: "DisputeTemplate",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "version",
        internalType: "uint64",
        type: "uint64",
        indexed: false,
      },
    ],
    name: "Initialized",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "newImplementation",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "Upgraded",
  },
  {
    type: "function",
    inputs: [{ name: "_governor", internalType: "address", type: "address" }],
    name: "changeGovernor",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "governor",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "_governor", internalType: "address", type: "address" }],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "proxiableUUID",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_templateTag", internalType: "string", type: "string" },
      { name: "_templateData", internalType: "string", type: "string" },
      { name: "_templateDataMappings", internalType: "string", type: "string" },
    ],
    name: "setDisputeTemplate",
    outputs: [{ name: "templateId", internalType: "uint256", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "templates",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "newImplementation", internalType: "address", type: "address" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "upgradeToAndCall",
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "constructor",
    inputs: [
      { name: "_implementation", internalType: "address", type: "address" },
      { name: "_data", internalType: "bytes", type: "bytes" },
    ],
    stateMutability: "nonpayable",
  },
] as const;

/**
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x52c9f5634361eD3641016e5d9783310f9EFf9e25)
 */
export const disputeTemplateRegistryAddress = {
  42161: "0x52c9f5634361eD3641016e5d9783310f9EFf9e25",
} as const;

/**
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x52c9f5634361eD3641016e5d9783310f9EFf9e25)
 */
export const disputeTemplateRegistryConfig = {
  address: disputeTemplateRegistryAddress,
  abi: disputeTemplateRegistryAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DisputeTemplateRegistry_Implementation
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x4Ce87329d40f15509D5F9bF4D9Ce1A081A80CeFb)
 */
export const disputeTemplateRegistryImplementationAbi = [
  { type: "constructor", inputs: [], stateMutability: "nonpayable" },
  { type: "error", inputs: [], name: "AlreadyInitialized" },
  { type: "error", inputs: [], name: "FailedDelegateCall" },
  {
    type: "error",
    inputs: [{ name: "implementation", internalType: "address", type: "address" }],
    name: "InvalidImplementation",
  },
  { type: "error", inputs: [], name: "NotInitializing" },
  { type: "error", inputs: [], name: "UUPSUnauthorizedCallContext" },
  {
    type: "error",
    inputs: [{ name: "slot", internalType: "bytes32", type: "bytes32" }],
    name: "UUPSUnsupportedProxiableUUID",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "_templateId",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "_templateTag",
        internalType: "string",
        type: "string",
        indexed: true,
      },
      {
        name: "_templateData",
        internalType: "string",
        type: "string",
        indexed: false,
      },
      {
        name: "_templateDataMappings",
        internalType: "string",
        type: "string",
        indexed: false,
      },
    ],
    name: "DisputeTemplate",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "version",
        internalType: "uint64",
        type: "uint64",
        indexed: false,
      },
    ],
    name: "Initialized",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "newImplementation",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "Upgraded",
  },
  {
    type: "function",
    inputs: [{ name: "_governor", internalType: "address", type: "address" }],
    name: "changeGovernor",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "governor",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "_governor", internalType: "address", type: "address" }],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "proxiableUUID",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_templateTag", internalType: "string", type: "string" },
      { name: "_templateData", internalType: "string", type: "string" },
      { name: "_templateDataMappings", internalType: "string", type: "string" },
    ],
    name: "setDisputeTemplate",
    outputs: [{ name: "templateId", internalType: "uint256", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "templates",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "newImplementation", internalType: "address", type: "address" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "upgradeToAndCall",
    outputs: [],
    stateMutability: "payable",
  },
] as const;

/**
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x4Ce87329d40f15509D5F9bF4D9Ce1A081A80CeFb)
 */
export const disputeTemplateRegistryImplementationAddress = {
  42161: "0x4Ce87329d40f15509D5F9bF4D9Ce1A081A80CeFb",
} as const;

/**
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x4Ce87329d40f15509D5F9bF4D9Ce1A081A80CeFb)
 */
export const disputeTemplateRegistryImplementationConfig = {
  address: disputeTemplateRegistryImplementationAddress,
  abi: disputeTemplateRegistryImplementationAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DisputeTemplateRegistry_Proxy
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x52c9f5634361eD3641016e5d9783310f9EFf9e25)
 */
export const disputeTemplateRegistryProxyAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "_implementation", internalType: "address", type: "address" },
      { name: "_data", internalType: "bytes", type: "bytes" },
    ],
    stateMutability: "nonpayable",
  },
  { type: "fallback", stateMutability: "payable" },
  { type: "receive", stateMutability: "payable" },
] as const;

/**
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x52c9f5634361eD3641016e5d9783310f9EFf9e25)
 */
export const disputeTemplateRegistryProxyAddress = {
  42161: "0x52c9f5634361eD3641016e5d9783310f9EFf9e25",
} as const;

/**
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x52c9f5634361eD3641016e5d9783310f9EFf9e25)
 */
export const disputeTemplateRegistryProxyConfig = {
  address: disputeTemplateRegistryProxyAddress,
  abi: disputeTemplateRegistryProxyAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// EvidenceModule
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0xe62B776498F48061ef9425fCEf30F3d1370DB005)
 */
export const evidenceModuleAbi = [
  { type: "fallback", stateMutability: "payable" },
  { type: "receive", stateMutability: "payable" },
  { type: "error", inputs: [], name: "AlreadyInitialized" },
  { type: "error", inputs: [], name: "FailedDelegateCall" },
  {
    type: "error",
    inputs: [{ name: "implementation", internalType: "address", type: "address" }],
    name: "InvalidImplementation",
  },
  { type: "error", inputs: [], name: "NotInitializing" },
  { type: "error", inputs: [], name: "UUPSUnauthorizedCallContext" },
  {
    type: "error",
    inputs: [{ name: "slot", internalType: "bytes32", type: "bytes32" }],
    name: "UUPSUnsupportedProxiableUUID",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "_externalDisputeID",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "_party",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "_evidence",
        internalType: "string",
        type: "string",
        indexed: false,
      },
    ],
    name: "Evidence",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "version",
        internalType: "uint64",
        type: "uint64",
        indexed: false,
      },
    ],
    name: "Initialized",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "newImplementation",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "Upgraded",
  },
  {
    type: "function",
    inputs: [],
    name: "governor",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "_governor", internalType: "address", type: "address" }],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "proxiableUUID",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_externalDisputeID", internalType: "uint256", type: "uint256" },
      { name: "_evidence", internalType: "string", type: "string" },
    ],
    name: "submitEvidence",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "newImplementation", internalType: "address", type: "address" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "upgradeToAndCall",
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "constructor",
    inputs: [
      { name: "_implementation", internalType: "address", type: "address" },
      { name: "_data", internalType: "bytes", type: "bytes" },
    ],
    stateMutability: "nonpayable",
  },
] as const;

/**
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0xe62B776498F48061ef9425fCEf30F3d1370DB005)
 */
export const evidenceModuleAddress = {
  42161: "0xe62B776498F48061ef9425fCEf30F3d1370DB005",
} as const;

/**
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0xe62B776498F48061ef9425fCEf30F3d1370DB005)
 */
export const evidenceModuleConfig = {
  address: evidenceModuleAddress,
  abi: evidenceModuleAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// EvidenceModule_Implementation
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x827411b3e98bAe8c441efBf26842A1670f8f378F)
 */
export const evidenceModuleImplementationAbi = [
  { type: "constructor", inputs: [], stateMutability: "nonpayable" },
  { type: "error", inputs: [], name: "AlreadyInitialized" },
  { type: "error", inputs: [], name: "FailedDelegateCall" },
  {
    type: "error",
    inputs: [{ name: "implementation", internalType: "address", type: "address" }],
    name: "InvalidImplementation",
  },
  { type: "error", inputs: [], name: "NotInitializing" },
  { type: "error", inputs: [], name: "UUPSUnauthorizedCallContext" },
  {
    type: "error",
    inputs: [{ name: "slot", internalType: "bytes32", type: "bytes32" }],
    name: "UUPSUnsupportedProxiableUUID",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "_externalDisputeID",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "_party",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "_evidence",
        internalType: "string",
        type: "string",
        indexed: false,
      },
    ],
    name: "Evidence",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "version",
        internalType: "uint64",
        type: "uint64",
        indexed: false,
      },
    ],
    name: "Initialized",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "newImplementation",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "Upgraded",
  },
  {
    type: "function",
    inputs: [],
    name: "governor",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "_governor", internalType: "address", type: "address" }],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "proxiableUUID",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_externalDisputeID", internalType: "uint256", type: "uint256" },
      { name: "_evidence", internalType: "string", type: "string" },
    ],
    name: "submitEvidence",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "newImplementation", internalType: "address", type: "address" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "upgradeToAndCall",
    outputs: [],
    stateMutability: "payable",
  },
] as const;

/**
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x827411b3e98bAe8c441efBf26842A1670f8f378F)
 */
export const evidenceModuleImplementationAddress = {
  42161: "0x827411b3e98bAe8c441efBf26842A1670f8f378F",
} as const;

/**
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x827411b3e98bAe8c441efBf26842A1670f8f378F)
 */
export const evidenceModuleImplementationConfig = {
  address: evidenceModuleImplementationAddress,
  abi: evidenceModuleImplementationAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// EvidenceModule_Proxy
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0xe62B776498F48061ef9425fCEf30F3d1370DB005)
 */
export const evidenceModuleProxyAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "_implementation", internalType: "address", type: "address" },
      { name: "_data", internalType: "bytes", type: "bytes" },
    ],
    stateMutability: "nonpayable",
  },
  { type: "fallback", stateMutability: "payable" },
  { type: "receive", stateMutability: "payable" },
] as const;

/**
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0xe62B776498F48061ef9425fCEf30F3d1370DB005)
 */
export const evidenceModuleProxyAddress = {
  42161: "0xe62B776498F48061ef9425fCEf30F3d1370DB005",
} as const;

/**
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0xe62B776498F48061ef9425fCEf30F3d1370DB005)
 */
export const evidenceModuleProxyConfig = {
  address: evidenceModuleProxyAddress,
  abi: evidenceModuleProxyAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IHomeGateway
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iHomeGatewayAbi = [
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
    type: "function",
    inputs: [{ name: "_disputeHash", internalType: "bytes32", type: "bytes32" }],
    name: "disputeHashToHomeID",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "feeToken",
    outputs: [{ name: "", internalType: "contract IERC20", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "foreignChainID",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "foreignGateway",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "receiverGateway",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
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
    stateMutability: "nonpayable",
  },
  {
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
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [
      { name: "_disputeID", internalType: "uint256", type: "uint256" },
      { name: "_ruling", internalType: "uint256", type: "uint256" },
    ],
    name: "rule",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "veaInbox",
    outputs: [{ name: "", internalType: "contract IVeaInbox", type: "address" }],
    stateMutability: "view",
  },
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// KlerosCoreNeo
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0xCd415C03dfa85B02646C7e2977F22a480c4354F1)
 */
export const klerosCoreNeoAbi = [
  { type: "fallback", stateMutability: "payable" },
  { type: "receive", stateMutability: "payable" },
  { type: "error", inputs: [], name: "AlreadyInitialized" },
  { type: "error", inputs: [], name: "AppealFeesNotEnough" },
  { type: "error", inputs: [], name: "AppealPeriodNotPassed" },
  { type: "error", inputs: [], name: "ArbitrableNotWhitelisted" },
  { type: "error", inputs: [], name: "ArbitrationFeesNotEnough" },
  { type: "error", inputs: [], name: "ArraysLengthMismatch" },
  { type: "error", inputs: [], name: "CannotDisableClassicDK" },
  { type: "error", inputs: [], name: "CommitPeriodNotPassed" },
  { type: "error", inputs: [], name: "DepthLevelMax" },
  { type: "error", inputs: [], name: "DisputeKitNotSupportedByCourt" },
  { type: "error", inputs: [], name: "DisputeKitOnly" },
  { type: "error", inputs: [], name: "DisputeNotAppealable" },
  { type: "error", inputs: [], name: "DisputePeriodIsFinal" },
  { type: "error", inputs: [], name: "DisputeStillDrawing" },
  { type: "error", inputs: [], name: "EvidenceNotPassedAndNotAppeal" },
  { type: "error", inputs: [], name: "FailedDelegateCall" },
  { type: "error", inputs: [], name: "GovernorOnly" },
  { type: "error", inputs: [], name: "GuardianOrGovernorOnly" },
  { type: "error", inputs: [], name: "InvalidDisputKitParent" },
  { type: "error", inputs: [], name: "InvalidForkingCourtAsParent" },
  {
    type: "error",
    inputs: [{ name: "implementation", internalType: "address", type: "address" }],
    name: "InvalidImplementation",
  },
  { type: "error", inputs: [], name: "MinStakeLowerThanParentCourt" },
  { type: "error", inputs: [], name: "MustSupportDisputeKitClassic" },
  { type: "error", inputs: [], name: "NotEligibleForStaking" },
  { type: "error", inputs: [], name: "NotEvidencePeriod" },
  { type: "error", inputs: [], name: "NotExecutionPeriod" },
  { type: "error", inputs: [], name: "NotInitializing" },
  { type: "error", inputs: [], name: "RulingAlreadyExecuted" },
  { type: "error", inputs: [], name: "SortitionModuleOnly" },
  { type: "error", inputs: [], name: "StakingInTooManyCourts" },
  { type: "error", inputs: [], name: "StakingLessThanCourtMinStake" },
  { type: "error", inputs: [], name: "StakingMoreThanMaxStakePerJuror" },
  { type: "error", inputs: [], name: "StakingMoreThanMaxTotalStaked" },
  { type: "error", inputs: [], name: "StakingNotPossibeInThisCourt" },
  { type: "error", inputs: [], name: "StakingTransferFailed" },
  { type: "error", inputs: [], name: "TokenNotAccepted" },
  { type: "error", inputs: [], name: "TransferFailed" },
  { type: "error", inputs: [], name: "UUPSUnauthorizedCallContext" },
  {
    type: "error",
    inputs: [{ name: "slot", internalType: "bytes32", type: "bytes32" }],
    name: "UUPSUnsupportedProxiableUUID",
  },
  { type: "error", inputs: [], name: "UnstakingTransferFailed" },
  { type: "error", inputs: [], name: "UnsuccessfulCall" },
  { type: "error", inputs: [], name: "UnsupportedDisputeKit" },
  { type: "error", inputs: [], name: "VotePeriodNotPassed" },
  { type: "error", inputs: [], name: "WhenNotPausedOnly" },
  { type: "error", inputs: [], name: "WhenPausedOnly" },
  { type: "error", inputs: [], name: "WrongDisputeKitIndex" },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "_token",
        internalType: "contract IERC20",
        type: "address",
        indexed: true,
      },
      { name: "_accepted", internalType: "bool", type: "bool", indexed: true },
    ],
    name: "AcceptedFeeToken",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "_disputeID",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "_arbitrable",
        internalType: "contract IArbitrableV2",
        type: "address",
        indexed: true,
      },
    ],
    name: "AppealDecision",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "_disputeID",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "_arbitrable",
        internalType: "contract IArbitrableV2",
        type: "address",
        indexed: true,
      },
    ],
    name: "AppealPossible",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "_courtID",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "_parent",
        internalType: "uint96",
        type: "uint96",
        indexed: true,
      },
      {
        name: "_hiddenVotes",
        internalType: "bool",
        type: "bool",
        indexed: false,
      },
      {
        name: "_minStake",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "_alpha",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "_feeForJuror",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "_jurorsForCourtJump",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "_timesPerPeriod",
        internalType: "uint256[4]",
        type: "uint256[4]",
        indexed: false,
      },
      {
        name: "_supportedDisputeKits",
        internalType: "uint256[]",
        type: "uint256[]",
        indexed: false,
      },
    ],
    name: "CourtCreated",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "_disputeID",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "_roundID",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "_fromCourtID",
        internalType: "uint96",
        type: "uint96",
        indexed: true,
      },
      {
        name: "_toCourtID",
        internalType: "uint96",
        type: "uint96",
        indexed: false,
      },
    ],
    name: "CourtJump",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "_courtID",
        internalType: "uint96",
        type: "uint96",
        indexed: true,
      },
      {
        name: "_hiddenVotes",
        internalType: "bool",
        type: "bool",
        indexed: false,
      },
      {
        name: "_minStake",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "_alpha",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "_feeForJuror",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "_jurorsForCourtJump",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "_timesPerPeriod",
        internalType: "uint256[4]",
        type: "uint256[4]",
        indexed: false,
      },
    ],
    name: "CourtModified",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "_disputeID",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "_arbitrable",
        internalType: "contract IArbitrableV2",
        type: "address",
        indexed: true,
      },
    ],
    name: "DisputeCreation",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "_disputeKitID",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "_disputeKitAddress",
        internalType: "contract IDisputeKit",
        type: "address",
        indexed: true,
      },
    ],
    name: "DisputeKitCreated",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "_courtID",
        internalType: "uint96",
        type: "uint96",
        indexed: true,
      },
      {
        name: "_disputeKitID",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      { name: "_enable", internalType: "bool", type: "bool", indexed: true },
    ],
    name: "DisputeKitEnabled",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "_disputeID",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "_roundID",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "_fromDisputeKitID",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "_toDisputeKitID",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "DisputeKitJump",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "_address",
        internalType: "address",
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
        name: "_roundID",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "_voteID",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "Draw",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "version",
        internalType: "uint64",
        type: "uint64",
        indexed: false,
      },
    ],
    name: "Initialized",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "_disputeID",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "_roundID",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "_pnkAmount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "_feeAmount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "_feeToken",
        internalType: "contract IERC20",
        type: "address",
        indexed: false,
      },
    ],
    name: "LeftoverRewardSent",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "_feeToken",
        internalType: "contract IERC20",
        type: "address",
        indexed: true,
      },
      {
        name: "_rateInEth",
        internalType: "uint64",
        type: "uint64",
        indexed: false,
      },
      {
        name: "_rateDecimals",
        internalType: "uint8",
        type: "uint8",
        indexed: false,
      },
    ],
    name: "NewCurrencyRate",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "_disputeID",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "_period",
        internalType: "enum KlerosCoreBase.Period",
        type: "uint8",
        indexed: false,
      },
    ],
    name: "NewPeriod",
  },
  { type: "event", anonymous: false, inputs: [], name: "Paused" },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "_arbitrable",
        internalType: "contract IArbitrableV2",
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
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "_account",
        internalType: "address",
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
        name: "_roundID",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "_degreeOfCoherency",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "_pnkAmount",
        internalType: "int256",
        type: "int256",
        indexed: false,
      },
      {
        name: "_feeAmount",
        internalType: "int256",
        type: "int256",
        indexed: false,
      },
      {
        name: "_feeToken",
        internalType: "contract IERC20",
        type: "address",
        indexed: false,
      },
    ],
    name: "TokenAndETHShift",
  },
  { type: "event", anonymous: false, inputs: [], name: "Unpaused" },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "newImplementation",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "Upgraded",
  },
  {
    type: "function",
    inputs: [
      {
        name: "_disputeKitAddress",
        internalType: "contract IDisputeKit",
        type: "address",
      },
    ],
    name: "addNewDisputeKit",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_disputeID", internalType: "uint256", type: "uint256" },
      { name: "_numberOfChoices", internalType: "uint256", type: "uint256" },
      { name: "_extraData", internalType: "bytes", type: "bytes" },
    ],
    name: "appeal",
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [{ name: "_disputeID", internalType: "uint256", type: "uint256" }],
    name: "appealCost",
    outputs: [{ name: "cost", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "_disputeID", internalType: "uint256", type: "uint256" }],
    name: "appealPeriod",
    outputs: [
      { name: "start", internalType: "uint256", type: "uint256" },
      { name: "end", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "arbitrableWhitelist",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_extraData", internalType: "bytes", type: "bytes" },
      { name: "_feeToken", internalType: "contract IERC20", type: "address" },
    ],
    name: "arbitrationCost",
    outputs: [{ name: "cost", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "_extraData", internalType: "bytes", type: "bytes" }],
    name: "arbitrationCost",
    outputs: [{ name: "cost", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_feeToken", internalType: "contract IERC20", type: "address" },
      { name: "_accepted", internalType: "bool", type: "bool" },
    ],
    name: "changeAcceptedFeeTokens",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_arbitrable", internalType: "address", type: "address" },
      { name: "_allowed", internalType: "bool", type: "bool" },
    ],
    name: "changeArbitrableWhitelist",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_courtID", internalType: "uint96", type: "uint96" },
      { name: "_hiddenVotes", internalType: "bool", type: "bool" },
      { name: "_minStake", internalType: "uint256", type: "uint256" },
      { name: "_alpha", internalType: "uint256", type: "uint256" },
      { name: "_feeForJuror", internalType: "uint256", type: "uint256" },
      { name: "_jurorsForCourtJump", internalType: "uint256", type: "uint256" },
      {
        name: "_timesPerPeriod",
        internalType: "uint256[4]",
        type: "uint256[4]",
      },
    ],
    name: "changeCourtParameters",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_feeToken", internalType: "contract IERC20", type: "address" },
      { name: "_rateInEth", internalType: "uint64", type: "uint64" },
      { name: "_rateDecimals", internalType: "uint8", type: "uint8" },
    ],
    name: "changeCurrencyRates",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "_governor", internalType: "address payable", type: "address" }],
    name: "changeGovernor",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "_guardian", internalType: "address", type: "address" }],
    name: "changeGuardian",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "_jurorNft", internalType: "contract IERC721", type: "address" }],
    name: "changeJurorNft",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "_jurorProsecutionModule",
        internalType: "address",
        type: "address",
      },
    ],
    name: "changeJurorProsecutionModule",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "_pinakion", internalType: "contract IERC20", type: "address" }],
    name: "changePinakion",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "_sortitionModule",
        internalType: "contract ISortitionModule",
        type: "address",
      },
    ],
    name: "changeSortitionModule",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_toToken", internalType: "contract IERC20", type: "address" },
      { name: "_amountInEth", internalType: "uint256", type: "uint256" },
    ],
    name: "convertEthToTokenAmount",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    name: "courts",
    outputs: [
      { name: "parent", internalType: "uint96", type: "uint96" },
      { name: "hiddenVotes", internalType: "bool", type: "bool" },
      { name: "minStake", internalType: "uint256", type: "uint256" },
      { name: "alpha", internalType: "uint256", type: "uint256" },
      { name: "feeForJuror", internalType: "uint256", type: "uint256" },
      { name: "jurorsForCourtJump", internalType: "uint256", type: "uint256" },
      { name: "disabled", internalType: "bool", type: "bool" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_parent", internalType: "uint96", type: "uint96" },
      { name: "_hiddenVotes", internalType: "bool", type: "bool" },
      { name: "_minStake", internalType: "uint256", type: "uint256" },
      { name: "_alpha", internalType: "uint256", type: "uint256" },
      { name: "_feeForJuror", internalType: "uint256", type: "uint256" },
      { name: "_jurorsForCourtJump", internalType: "uint256", type: "uint256" },
      {
        name: "_timesPerPeriod",
        internalType: "uint256[4]",
        type: "uint256[4]",
      },
      { name: "_sortitionExtraData", internalType: "bytes", type: "bytes" },
      {
        name: "_supportedDisputeKits",
        internalType: "uint256[]",
        type: "uint256[]",
      },
    ],
    name: "createCourt",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_numberOfChoices", internalType: "uint256", type: "uint256" },
      { name: "_extraData", internalType: "bytes", type: "bytes" },
    ],
    name: "createDispute",
    outputs: [{ name: "disputeID", internalType: "uint256", type: "uint256" }],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [
      { name: "_numberOfChoices", internalType: "uint256", type: "uint256" },
      { name: "_extraData", internalType: "bytes", type: "bytes" },
      { name: "_feeToken", internalType: "contract IERC20", type: "address" },
      { name: "_feeAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "createDispute",
    outputs: [{ name: "disputeID", internalType: "uint256", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "contract IERC20", type: "address" }],
    name: "currencyRates",
    outputs: [
      { name: "feePaymentAccepted", internalType: "bool", type: "bool" },
      { name: "rateInEth", internalType: "uint64", type: "uint64" },
      { name: "rateDecimals", internalType: "uint8", type: "uint8" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "_disputeID", internalType: "uint256", type: "uint256" }],
    name: "currentRuling",
    outputs: [
      { name: "ruling", internalType: "uint256", type: "uint256" },
      { name: "tied", internalType: "bool", type: "bool" },
      { name: "overridden", internalType: "bool", type: "bool" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    name: "disputeKits",
    outputs: [{ name: "", internalType: "contract IDisputeKit", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    name: "disputes",
    outputs: [
      { name: "courtID", internalType: "uint96", type: "uint96" },
      {
        name: "arbitrated",
        internalType: "contract IArbitrableV2",
        type: "address",
      },
      {
        name: "period",
        internalType: "enum KlerosCoreBase.Period",
        type: "uint8",
      },
      { name: "ruled", internalType: "bool", type: "bool" },
      { name: "lastPeriodChange", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_disputeID", internalType: "uint256", type: "uint256" },
      { name: "_iterations", internalType: "uint256", type: "uint256" },
    ],
    name: "draw",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_courtID", internalType: "uint96", type: "uint96" },
      { name: "_disputeKitIDs", internalType: "uint256[]", type: "uint256[]" },
      { name: "_enable", internalType: "bool", type: "bool" },
    ],
    name: "enableDisputeKits",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_disputeID", internalType: "uint256", type: "uint256" },
      { name: "_round", internalType: "uint256", type: "uint256" },
      { name: "_iterations", internalType: "uint256", type: "uint256" },
    ],
    name: "execute",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_destination", internalType: "address", type: "address" },
      { name: "_amount", internalType: "uint256", type: "uint256" },
      { name: "_data", internalType: "bytes", type: "bytes" },
    ],
    name: "executeGovernorProposal",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "_disputeID", internalType: "uint256", type: "uint256" }],
    name: "executeRuling",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "getDisputeKitsLength",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "_disputeID", internalType: "uint256", type: "uint256" }],
    name: "getNumberOfRounds",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "_disputeID", internalType: "uint256", type: "uint256" }],
    name: "getNumberOfVotes",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_disputeID", internalType: "uint256", type: "uint256" },
      { name: "_round", internalType: "uint256", type: "uint256" },
    ],
    name: "getRoundInfo",
    outputs: [
      {
        name: "",
        internalType: "struct KlerosCoreBase.Round",
        type: "tuple",
        components: [
          { name: "disputeKitID", internalType: "uint256", type: "uint256" },
          {
            name: "pnkAtStakePerJuror",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "totalFeesForJurors",
            internalType: "uint256",
            type: "uint256",
          },
          { name: "nbVotes", internalType: "uint256", type: "uint256" },
          { name: "repartitions", internalType: "uint256", type: "uint256" },
          { name: "pnkPenalties", internalType: "uint256", type: "uint256" },
          { name: "drawnJurors", internalType: "address[]", type: "address[]" },
          {
            name: "sumFeeRewardPaid",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "sumPnkRewardPaid",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "feeToken",
            internalType: "contract IERC20",
            type: "address",
          },
          { name: "drawIterations", internalType: "uint256", type: "uint256" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "_courtID", internalType: "uint96", type: "uint96" }],
    name: "getTimesPerPeriod",
    outputs: [
      {
        name: "timesPerPeriod",
        internalType: "uint256[4]",
        type: "uint256[4]",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "governor",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "guardian",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_governor", internalType: "address", type: "address" },
      { name: "_guardian", internalType: "address", type: "address" },
      { name: "_pinakion", internalType: "contract IERC20", type: "address" },
      {
        name: "_jurorProsecutionModule",
        internalType: "address",
        type: "address",
      },
      {
        name: "_disputeKit",
        internalType: "contract IDisputeKit",
        type: "address",
      },
      { name: "_hiddenVotes", internalType: "bool", type: "bool" },
      {
        name: "_courtParameters",
        internalType: "uint256[4]",
        type: "uint256[4]",
      },
      {
        name: "_timesPerPeriod",
        internalType: "uint256[4]",
        type: "uint256[4]",
      },
      { name: "_sortitionExtraData", internalType: "bytes", type: "bytes" },
      {
        name: "_sortitionModuleAddress",
        internalType: "contract ISortitionModule",
        type: "address",
      },
      { name: "_jurorNft", internalType: "contract IERC721", type: "address" },
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "_disputeID", internalType: "uint256", type: "uint256" }],
    name: "isDisputeKitJumping",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_courtID", internalType: "uint96", type: "uint96" },
      { name: "_disputeKitID", internalType: "uint256", type: "uint256" },
    ],
    name: "isSupported",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "jurorNft",
    outputs: [{ name: "", internalType: "contract IERC721", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "jurorProsecutionModule",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "_disputeID", internalType: "uint256", type: "uint256" }],
    name: "passPeriod",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "pause",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "paused",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "pinakion",
    outputs: [{ name: "", internalType: "contract IERC20", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "proxiableUUID",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_courtID", internalType: "uint96", type: "uint96" },
      { name: "_newStake", internalType: "uint256", type: "uint256" },
    ],
    name: "setStake",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_account", internalType: "address", type: "address" },
      { name: "_courtID", internalType: "uint96", type: "uint96" },
      { name: "_newStake", internalType: "uint256", type: "uint256" },
      { name: "_alreadyTransferred", internalType: "bool", type: "bool" },
    ],
    name: "setStakeBySortitionModule",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "sortitionModule",
    outputs: [{ name: "", internalType: "contract ISortitionModule", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "unpause",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "newImplementation", internalType: "address", type: "address" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "upgradeToAndCall",
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "constructor",
    inputs: [
      { name: "_implementation", internalType: "address", type: "address" },
      { name: "_data", internalType: "bytes", type: "bytes" },
    ],
    stateMutability: "nonpayable",
  },
] as const;

/**
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0xCd415C03dfa85B02646C7e2977F22a480c4354F1)
 */
export const klerosCoreNeoAddress = {
  42161: "0xCd415C03dfa85B02646C7e2977F22a480c4354F1",
} as const;

/**
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0xCd415C03dfa85B02646C7e2977F22a480c4354F1)
 */
export const klerosCoreNeoConfig = {
  address: klerosCoreNeoAddress,
  abi: klerosCoreNeoAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// KlerosCoreNeo_Implementation
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x4DD8B69958eF1D7d5dA9347E9d9F57ADFC3dc284)
 */
export const klerosCoreNeoImplementationAbi = [
  { type: "constructor", inputs: [], stateMutability: "nonpayable" },
  { type: "error", inputs: [], name: "AlreadyInitialized" },
  { type: "error", inputs: [], name: "AppealFeesNotEnough" },
  { type: "error", inputs: [], name: "AppealPeriodNotPassed" },
  { type: "error", inputs: [], name: "ArbitrableNotWhitelisted" },
  { type: "error", inputs: [], name: "ArbitrationFeesNotEnough" },
  { type: "error", inputs: [], name: "ArraysLengthMismatch" },
  { type: "error", inputs: [], name: "CannotDisableClassicDK" },
  { type: "error", inputs: [], name: "CommitPeriodNotPassed" },
  { type: "error", inputs: [], name: "DepthLevelMax" },
  { type: "error", inputs: [], name: "DisputeKitNotSupportedByCourt" },
  { type: "error", inputs: [], name: "DisputeKitOnly" },
  { type: "error", inputs: [], name: "DisputeNotAppealable" },
  { type: "error", inputs: [], name: "DisputePeriodIsFinal" },
  { type: "error", inputs: [], name: "DisputeStillDrawing" },
  { type: "error", inputs: [], name: "EvidenceNotPassedAndNotAppeal" },
  { type: "error", inputs: [], name: "FailedDelegateCall" },
  { type: "error", inputs: [], name: "GovernorOnly" },
  { type: "error", inputs: [], name: "GuardianOrGovernorOnly" },
  { type: "error", inputs: [], name: "InvalidDisputKitParent" },
  { type: "error", inputs: [], name: "InvalidForkingCourtAsParent" },
  {
    type: "error",
    inputs: [{ name: "implementation", internalType: "address", type: "address" }],
    name: "InvalidImplementation",
  },
  { type: "error", inputs: [], name: "MinStakeLowerThanParentCourt" },
  { type: "error", inputs: [], name: "MustSupportDisputeKitClassic" },
  { type: "error", inputs: [], name: "NotEligibleForStaking" },
  { type: "error", inputs: [], name: "NotEvidencePeriod" },
  { type: "error", inputs: [], name: "NotExecutionPeriod" },
  { type: "error", inputs: [], name: "NotInitializing" },
  { type: "error", inputs: [], name: "RulingAlreadyExecuted" },
  { type: "error", inputs: [], name: "SortitionModuleOnly" },
  { type: "error", inputs: [], name: "StakingInTooManyCourts" },
  { type: "error", inputs: [], name: "StakingLessThanCourtMinStake" },
  { type: "error", inputs: [], name: "StakingMoreThanMaxStakePerJuror" },
  { type: "error", inputs: [], name: "StakingMoreThanMaxTotalStaked" },
  { type: "error", inputs: [], name: "StakingNotPossibeInThisCourt" },
  { type: "error", inputs: [], name: "StakingTransferFailed" },
  { type: "error", inputs: [], name: "TokenNotAccepted" },
  { type: "error", inputs: [], name: "TransferFailed" },
  { type: "error", inputs: [], name: "UUPSUnauthorizedCallContext" },
  {
    type: "error",
    inputs: [{ name: "slot", internalType: "bytes32", type: "bytes32" }],
    name: "UUPSUnsupportedProxiableUUID",
  },
  { type: "error", inputs: [], name: "UnstakingTransferFailed" },
  { type: "error", inputs: [], name: "UnsuccessfulCall" },
  { type: "error", inputs: [], name: "UnsupportedDisputeKit" },
  { type: "error", inputs: [], name: "VotePeriodNotPassed" },
  { type: "error", inputs: [], name: "WhenNotPausedOnly" },
  { type: "error", inputs: [], name: "WhenPausedOnly" },
  { type: "error", inputs: [], name: "WrongDisputeKitIndex" },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "_token",
        internalType: "contract IERC20",
        type: "address",
        indexed: true,
      },
      { name: "_accepted", internalType: "bool", type: "bool", indexed: true },
    ],
    name: "AcceptedFeeToken",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "_disputeID",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "_arbitrable",
        internalType: "contract IArbitrableV2",
        type: "address",
        indexed: true,
      },
    ],
    name: "AppealDecision",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "_disputeID",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "_arbitrable",
        internalType: "contract IArbitrableV2",
        type: "address",
        indexed: true,
      },
    ],
    name: "AppealPossible",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "_courtID",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "_parent",
        internalType: "uint96",
        type: "uint96",
        indexed: true,
      },
      {
        name: "_hiddenVotes",
        internalType: "bool",
        type: "bool",
        indexed: false,
      },
      {
        name: "_minStake",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "_alpha",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "_feeForJuror",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "_jurorsForCourtJump",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "_timesPerPeriod",
        internalType: "uint256[4]",
        type: "uint256[4]",
        indexed: false,
      },
      {
        name: "_supportedDisputeKits",
        internalType: "uint256[]",
        type: "uint256[]",
        indexed: false,
      },
    ],
    name: "CourtCreated",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "_disputeID",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "_roundID",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "_fromCourtID",
        internalType: "uint96",
        type: "uint96",
        indexed: true,
      },
      {
        name: "_toCourtID",
        internalType: "uint96",
        type: "uint96",
        indexed: false,
      },
    ],
    name: "CourtJump",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "_courtID",
        internalType: "uint96",
        type: "uint96",
        indexed: true,
      },
      {
        name: "_hiddenVotes",
        internalType: "bool",
        type: "bool",
        indexed: false,
      },
      {
        name: "_minStake",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "_alpha",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "_feeForJuror",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "_jurorsForCourtJump",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "_timesPerPeriod",
        internalType: "uint256[4]",
        type: "uint256[4]",
        indexed: false,
      },
    ],
    name: "CourtModified",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "_disputeID",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "_arbitrable",
        internalType: "contract IArbitrableV2",
        type: "address",
        indexed: true,
      },
    ],
    name: "DisputeCreation",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "_disputeKitID",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "_disputeKitAddress",
        internalType: "contract IDisputeKit",
        type: "address",
        indexed: true,
      },
    ],
    name: "DisputeKitCreated",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "_courtID",
        internalType: "uint96",
        type: "uint96",
        indexed: true,
      },
      {
        name: "_disputeKitID",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      { name: "_enable", internalType: "bool", type: "bool", indexed: true },
    ],
    name: "DisputeKitEnabled",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "_disputeID",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "_roundID",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "_fromDisputeKitID",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "_toDisputeKitID",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "DisputeKitJump",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "_address",
        internalType: "address",
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
        name: "_roundID",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "_voteID",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "Draw",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "version",
        internalType: "uint64",
        type: "uint64",
        indexed: false,
      },
    ],
    name: "Initialized",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "_disputeID",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "_roundID",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "_pnkAmount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "_feeAmount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "_feeToken",
        internalType: "contract IERC20",
        type: "address",
        indexed: false,
      },
    ],
    name: "LeftoverRewardSent",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "_feeToken",
        internalType: "contract IERC20",
        type: "address",
        indexed: true,
      },
      {
        name: "_rateInEth",
        internalType: "uint64",
        type: "uint64",
        indexed: false,
      },
      {
        name: "_rateDecimals",
        internalType: "uint8",
        type: "uint8",
        indexed: false,
      },
    ],
    name: "NewCurrencyRate",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "_disputeID",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "_period",
        internalType: "enum KlerosCoreBase.Period",
        type: "uint8",
        indexed: false,
      },
    ],
    name: "NewPeriod",
  },
  { type: "event", anonymous: false, inputs: [], name: "Paused" },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "_arbitrable",
        internalType: "contract IArbitrableV2",
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
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "_account",
        internalType: "address",
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
        name: "_roundID",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "_degreeOfCoherency",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "_pnkAmount",
        internalType: "int256",
        type: "int256",
        indexed: false,
      },
      {
        name: "_feeAmount",
        internalType: "int256",
        type: "int256",
        indexed: false,
      },
      {
        name: "_feeToken",
        internalType: "contract IERC20",
        type: "address",
        indexed: false,
      },
    ],
    name: "TokenAndETHShift",
  },
  { type: "event", anonymous: false, inputs: [], name: "Unpaused" },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "newImplementation",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "Upgraded",
  },
  {
    type: "function",
    inputs: [
      {
        name: "_disputeKitAddress",
        internalType: "contract IDisputeKit",
        type: "address",
      },
    ],
    name: "addNewDisputeKit",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_disputeID", internalType: "uint256", type: "uint256" },
      { name: "_numberOfChoices", internalType: "uint256", type: "uint256" },
      { name: "_extraData", internalType: "bytes", type: "bytes" },
    ],
    name: "appeal",
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [{ name: "_disputeID", internalType: "uint256", type: "uint256" }],
    name: "appealCost",
    outputs: [{ name: "cost", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "_disputeID", internalType: "uint256", type: "uint256" }],
    name: "appealPeriod",
    outputs: [
      { name: "start", internalType: "uint256", type: "uint256" },
      { name: "end", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "arbitrableWhitelist",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_extraData", internalType: "bytes", type: "bytes" },
      { name: "_feeToken", internalType: "contract IERC20", type: "address" },
    ],
    name: "arbitrationCost",
    outputs: [{ name: "cost", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "_extraData", internalType: "bytes", type: "bytes" }],
    name: "arbitrationCost",
    outputs: [{ name: "cost", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_feeToken", internalType: "contract IERC20", type: "address" },
      { name: "_accepted", internalType: "bool", type: "bool" },
    ],
    name: "changeAcceptedFeeTokens",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_arbitrable", internalType: "address", type: "address" },
      { name: "_allowed", internalType: "bool", type: "bool" },
    ],
    name: "changeArbitrableWhitelist",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_courtID", internalType: "uint96", type: "uint96" },
      { name: "_hiddenVotes", internalType: "bool", type: "bool" },
      { name: "_minStake", internalType: "uint256", type: "uint256" },
      { name: "_alpha", internalType: "uint256", type: "uint256" },
      { name: "_feeForJuror", internalType: "uint256", type: "uint256" },
      { name: "_jurorsForCourtJump", internalType: "uint256", type: "uint256" },
      {
        name: "_timesPerPeriod",
        internalType: "uint256[4]",
        type: "uint256[4]",
      },
    ],
    name: "changeCourtParameters",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_feeToken", internalType: "contract IERC20", type: "address" },
      { name: "_rateInEth", internalType: "uint64", type: "uint64" },
      { name: "_rateDecimals", internalType: "uint8", type: "uint8" },
    ],
    name: "changeCurrencyRates",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "_governor", internalType: "address payable", type: "address" }],
    name: "changeGovernor",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "_guardian", internalType: "address", type: "address" }],
    name: "changeGuardian",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "_jurorNft", internalType: "contract IERC721", type: "address" }],
    name: "changeJurorNft",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "_jurorProsecutionModule",
        internalType: "address",
        type: "address",
      },
    ],
    name: "changeJurorProsecutionModule",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "_pinakion", internalType: "contract IERC20", type: "address" }],
    name: "changePinakion",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "_sortitionModule",
        internalType: "contract ISortitionModule",
        type: "address",
      },
    ],
    name: "changeSortitionModule",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_toToken", internalType: "contract IERC20", type: "address" },
      { name: "_amountInEth", internalType: "uint256", type: "uint256" },
    ],
    name: "convertEthToTokenAmount",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    name: "courts",
    outputs: [
      { name: "parent", internalType: "uint96", type: "uint96" },
      { name: "hiddenVotes", internalType: "bool", type: "bool" },
      { name: "minStake", internalType: "uint256", type: "uint256" },
      { name: "alpha", internalType: "uint256", type: "uint256" },
      { name: "feeForJuror", internalType: "uint256", type: "uint256" },
      { name: "jurorsForCourtJump", internalType: "uint256", type: "uint256" },
      { name: "disabled", internalType: "bool", type: "bool" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_parent", internalType: "uint96", type: "uint96" },
      { name: "_hiddenVotes", internalType: "bool", type: "bool" },
      { name: "_minStake", internalType: "uint256", type: "uint256" },
      { name: "_alpha", internalType: "uint256", type: "uint256" },
      { name: "_feeForJuror", internalType: "uint256", type: "uint256" },
      { name: "_jurorsForCourtJump", internalType: "uint256", type: "uint256" },
      {
        name: "_timesPerPeriod",
        internalType: "uint256[4]",
        type: "uint256[4]",
      },
      { name: "_sortitionExtraData", internalType: "bytes", type: "bytes" },
      {
        name: "_supportedDisputeKits",
        internalType: "uint256[]",
        type: "uint256[]",
      },
    ],
    name: "createCourt",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_numberOfChoices", internalType: "uint256", type: "uint256" },
      { name: "_extraData", internalType: "bytes", type: "bytes" },
    ],
    name: "createDispute",
    outputs: [{ name: "disputeID", internalType: "uint256", type: "uint256" }],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [
      { name: "_numberOfChoices", internalType: "uint256", type: "uint256" },
      { name: "_extraData", internalType: "bytes", type: "bytes" },
      { name: "_feeToken", internalType: "contract IERC20", type: "address" },
      { name: "_feeAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "createDispute",
    outputs: [{ name: "disputeID", internalType: "uint256", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "contract IERC20", type: "address" }],
    name: "currencyRates",
    outputs: [
      { name: "feePaymentAccepted", internalType: "bool", type: "bool" },
      { name: "rateInEth", internalType: "uint64", type: "uint64" },
      { name: "rateDecimals", internalType: "uint8", type: "uint8" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "_disputeID", internalType: "uint256", type: "uint256" }],
    name: "currentRuling",
    outputs: [
      { name: "ruling", internalType: "uint256", type: "uint256" },
      { name: "tied", internalType: "bool", type: "bool" },
      { name: "overridden", internalType: "bool", type: "bool" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    name: "disputeKits",
    outputs: [{ name: "", internalType: "contract IDisputeKit", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    name: "disputes",
    outputs: [
      { name: "courtID", internalType: "uint96", type: "uint96" },
      {
        name: "arbitrated",
        internalType: "contract IArbitrableV2",
        type: "address",
      },
      {
        name: "period",
        internalType: "enum KlerosCoreBase.Period",
        type: "uint8",
      },
      { name: "ruled", internalType: "bool", type: "bool" },
      { name: "lastPeriodChange", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_disputeID", internalType: "uint256", type: "uint256" },
      { name: "_iterations", internalType: "uint256", type: "uint256" },
    ],
    name: "draw",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_courtID", internalType: "uint96", type: "uint96" },
      { name: "_disputeKitIDs", internalType: "uint256[]", type: "uint256[]" },
      { name: "_enable", internalType: "bool", type: "bool" },
    ],
    name: "enableDisputeKits",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_disputeID", internalType: "uint256", type: "uint256" },
      { name: "_round", internalType: "uint256", type: "uint256" },
      { name: "_iterations", internalType: "uint256", type: "uint256" },
    ],
    name: "execute",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_destination", internalType: "address", type: "address" },
      { name: "_amount", internalType: "uint256", type: "uint256" },
      { name: "_data", internalType: "bytes", type: "bytes" },
    ],
    name: "executeGovernorProposal",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "_disputeID", internalType: "uint256", type: "uint256" }],
    name: "executeRuling",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "getDisputeKitsLength",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "_disputeID", internalType: "uint256", type: "uint256" }],
    name: "getNumberOfRounds",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "_disputeID", internalType: "uint256", type: "uint256" }],
    name: "getNumberOfVotes",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_disputeID", internalType: "uint256", type: "uint256" },
      { name: "_round", internalType: "uint256", type: "uint256" },
    ],
    name: "getRoundInfo",
    outputs: [
      {
        name: "",
        internalType: "struct KlerosCoreBase.Round",
        type: "tuple",
        components: [
          { name: "disputeKitID", internalType: "uint256", type: "uint256" },
          {
            name: "pnkAtStakePerJuror",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "totalFeesForJurors",
            internalType: "uint256",
            type: "uint256",
          },
          { name: "nbVotes", internalType: "uint256", type: "uint256" },
          { name: "repartitions", internalType: "uint256", type: "uint256" },
          { name: "pnkPenalties", internalType: "uint256", type: "uint256" },
          { name: "drawnJurors", internalType: "address[]", type: "address[]" },
          {
            name: "sumFeeRewardPaid",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "sumPnkRewardPaid",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "feeToken",
            internalType: "contract IERC20",
            type: "address",
          },
          { name: "drawIterations", internalType: "uint256", type: "uint256" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "_courtID", internalType: "uint96", type: "uint96" }],
    name: "getTimesPerPeriod",
    outputs: [
      {
        name: "timesPerPeriod",
        internalType: "uint256[4]",
        type: "uint256[4]",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "governor",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "guardian",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_governor", internalType: "address", type: "address" },
      { name: "_guardian", internalType: "address", type: "address" },
      { name: "_pinakion", internalType: "contract IERC20", type: "address" },
      {
        name: "_jurorProsecutionModule",
        internalType: "address",
        type: "address",
      },
      {
        name: "_disputeKit",
        internalType: "contract IDisputeKit",
        type: "address",
      },
      { name: "_hiddenVotes", internalType: "bool", type: "bool" },
      {
        name: "_courtParameters",
        internalType: "uint256[4]",
        type: "uint256[4]",
      },
      {
        name: "_timesPerPeriod",
        internalType: "uint256[4]",
        type: "uint256[4]",
      },
      { name: "_sortitionExtraData", internalType: "bytes", type: "bytes" },
      {
        name: "_sortitionModuleAddress",
        internalType: "contract ISortitionModule",
        type: "address",
      },
      { name: "_jurorNft", internalType: "contract IERC721", type: "address" },
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "_disputeID", internalType: "uint256", type: "uint256" }],
    name: "isDisputeKitJumping",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_courtID", internalType: "uint96", type: "uint96" },
      { name: "_disputeKitID", internalType: "uint256", type: "uint256" },
    ],
    name: "isSupported",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "jurorNft",
    outputs: [{ name: "", internalType: "contract IERC721", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "jurorProsecutionModule",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "_disputeID", internalType: "uint256", type: "uint256" }],
    name: "passPeriod",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "pause",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "paused",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "pinakion",
    outputs: [{ name: "", internalType: "contract IERC20", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "proxiableUUID",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_courtID", internalType: "uint96", type: "uint96" },
      { name: "_newStake", internalType: "uint256", type: "uint256" },
    ],
    name: "setStake",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_account", internalType: "address", type: "address" },
      { name: "_courtID", internalType: "uint96", type: "uint96" },
      { name: "_newStake", internalType: "uint256", type: "uint256" },
      { name: "_alreadyTransferred", internalType: "bool", type: "bool" },
    ],
    name: "setStakeBySortitionModule",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "sortitionModule",
    outputs: [{ name: "", internalType: "contract ISortitionModule", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "unpause",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "newImplementation", internalType: "address", type: "address" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "upgradeToAndCall",
    outputs: [],
    stateMutability: "payable",
  },
] as const;

/**
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x4DD8B69958eF1D7d5dA9347E9d9F57ADFC3dc284)
 */
export const klerosCoreNeoImplementationAddress = {
  42161: "0x4DD8B69958eF1D7d5dA9347E9d9F57ADFC3dc284",
} as const;

/**
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x4DD8B69958eF1D7d5dA9347E9d9F57ADFC3dc284)
 */
export const klerosCoreNeoImplementationConfig = {
  address: klerosCoreNeoImplementationAddress,
  abi: klerosCoreNeoImplementationAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// KlerosCoreNeo_Proxy
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0xCd415C03dfa85B02646C7e2977F22a480c4354F1)
 */
export const klerosCoreNeoProxyAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "_implementation", internalType: "address", type: "address" },
      { name: "_data", internalType: "bytes", type: "bytes" },
    ],
    stateMutability: "nonpayable",
  },
  { type: "fallback", stateMutability: "payable" },
  { type: "receive", stateMutability: "payable" },
] as const;

/**
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0xCd415C03dfa85B02646C7e2977F22a480c4354F1)
 */
export const klerosCoreNeoProxyAddress = {
  42161: "0xCd415C03dfa85B02646C7e2977F22a480c4354F1",
} as const;

/**
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0xCd415C03dfa85B02646C7e2977F22a480c4354F1)
 */
export const klerosCoreNeoProxyConfig = {
  address: klerosCoreNeoProxyAddress,
  abi: klerosCoreNeoProxyAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// KlerosV2NeoEarlyUser
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0xfE34a72c55e512601E7d491A9c5b36373cE34d63)
 */
export const klerosV2NeoEarlyUserAbi = [
  { type: "constructor", inputs: [], stateMutability: "nonpayable" },
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
        name: "approved",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "tokenId",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
    ],
    name: "Approval",
  },
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
        name: "operator",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      { name: "approved", internalType: "bool", type: "bool", indexed: false },
    ],
    name: "ApprovalForAll",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "newMinter",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "EventMinterAdded",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "oldMinter",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "EventMinterRemoved",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "previousOwner",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "newOwner",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "OwnershipTransferred",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "from", internalType: "address", type: "address", indexed: true },
      { name: "to", internalType: "address", type: "address", indexed: true },
      {
        name: "tokenId",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
    ],
    name: "Transfer",
  },
  {
    type: "function",
    inputs: [{ name: "minter", internalType: "address", type: "address" }],
    name: "addMinter",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "to", internalType: "address", type: "address" },
      { name: "tokenId", internalType: "uint256", type: "uint256" },
    ],
    name: "approve",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "owner", internalType: "address", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "baseURI",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "account", internalType: "address", type: "address" },
      { name: "id", internalType: "uint256", type: "uint256" },
    ],
    name: "burn",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "account", internalType: "address", type: "address" },
      { name: "ids", internalType: "uint256[]", type: "uint256[]" },
    ],
    name: "burnBatch",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "tokenId", internalType: "uint256", type: "uint256" }],
    name: "cid",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "tokenId", internalType: "uint256", type: "uint256" }],
    name: "getApproved",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getNumMinted",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "owner", internalType: "address", type: "address" },
      { name: "operator", internalType: "address", type: "address" },
    ],
    name: "isApprovedForAll",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "account", internalType: "address", type: "address" },
      { name: "id", internalType: "uint256", type: "uint256" },
    ],
    name: "isOwnerOf",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "account", internalType: "address", type: "address" },
      { name: "cid", internalType: "uint256", type: "uint256" },
    ],
    name: "mint",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "account", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "cidArr", internalType: "uint256[]", type: "uint256[]" },
    ],
    name: "mintBatch",
    outputs: [{ name: "", internalType: "uint256[]", type: "uint256[]" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "account", internalType: "address", type: "address" }],
    name: "minters",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "name",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "owner",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "tokenId", internalType: "uint256", type: "uint256" }],
    name: "ownerOf",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "minter", internalType: "address", type: "address" }],
    name: "removeMinter",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "from", internalType: "address", type: "address" },
      { name: "to", internalType: "address", type: "address" },
      { name: "tokenId", internalType: "uint256", type: "uint256" },
    ],
    name: "safeTransferFrom",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "from", internalType: "address", type: "address" },
      { name: "to", internalType: "address", type: "address" },
      { name: "tokenId", internalType: "uint256", type: "uint256" },
      { name: "_data", internalType: "bytes", type: "bytes" },
    ],
    name: "safeTransferFrom",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "operator", internalType: "address", type: "address" },
      { name: "approved", internalType: "bool", type: "bool" },
    ],
    name: "setApprovalForAll",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "newName", internalType: "string", type: "string" }],
    name: "setName",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "newSymbol", internalType: "string", type: "string" }],
    name: "setSymbol",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "transferable", internalType: "bool", type: "bool" }],
    name: "setTransferable",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "newURI", internalType: "string", type: "string" }],
    name: "setURI",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "interfaceId", internalType: "bytes4", type: "bytes4" }],
    name: "supportsInterface",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "owner", internalType: "address", type: "address" },
      { name: "index", internalType: "uint256", type: "uint256" },
    ],
    name: "tokenOfOwnerByIndex",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "tokenId", internalType: "uint256", type: "uint256" }],
    name: "tokenURI",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "totalSupply",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "from", internalType: "address", type: "address" },
      { name: "to", internalType: "address", type: "address" },
      { name: "tokenId", internalType: "uint256", type: "uint256" },
    ],
    name: "transferFrom",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "newOwner", internalType: "address", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "transferable",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
] as const;

/**
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0xfE34a72c55e512601E7d491A9c5b36373cE34d63)
 */
export const klerosV2NeoEarlyUserAddress = {
  42161: "0xfE34a72c55e512601E7d491A9c5b36373cE34d63",
} as const;

/**
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0xfE34a72c55e512601E7d491A9c5b36373cE34d63)
 */
export const klerosV2NeoEarlyUserConfig = {
  address: klerosV2NeoEarlyUserAddress,
  abi: klerosV2NeoEarlyUserAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PNK
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x330bD769382cFc6d50175903434CCC8D206DCAE5)
 */
export const pnkAbi = [
  { type: "constructor", inputs: [], stateMutability: "nonpayable" },
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
    type: "function",
    inputs: [
      { name: "owner", internalType: "address", type: "address" },
      { name: "spender", internalType: "address", type: "address" },
    ],
    name: "allowance",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "spender", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "account", internalType: "address", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "spender", internalType: "address", type: "address" },
      { name: "subtractedValue", internalType: "uint256", type: "uint256" },
    ],
    name: "decreaseAllowance",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "spender", internalType: "address", type: "address" },
      { name: "addedValue", internalType: "uint256", type: "uint256" },
    ],
    name: "increaseAllowance",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "name",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "totalSupply",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "to", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "from", internalType: "address", type: "address" },
      { name: "to", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
    ],
    name: "transferFrom",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
] as const;

/**
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x330bD769382cFc6d50175903434CCC8D206DCAE5)
 */
export const pnkAddress = {
  42161: "0x330bD769382cFc6d50175903434CCC8D206DCAE5",
} as const;

/**
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x330bD769382cFc6d50175903434CCC8D206DCAE5)
 */
export const pnkConfig = { address: pnkAddress, abi: pnkAbi } as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PNKFaucet
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x0000000000000000000000000000000000000000)
 */
export const pnkFaucetAbi = [
  {
    type: "constructor",
    inputs: [{ name: "_token", internalType: "contract IERC20", type: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "amount",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "balance",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "_amount", internalType: "uint256", type: "uint256" }],
    name: "changeAmount",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "_governor", internalType: "address", type: "address" }],
    name: "changeGovernor",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "governor",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "request",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "token",
    outputs: [{ name: "", internalType: "contract IERC20", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "withdrewAlready",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
] as const;

/**
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x0000000000000000000000000000000000000000)
 */
export const pnkFaucetAddress = {
  42161: "0x0000000000000000000000000000000000000000",
} as const;

/**
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x0000000000000000000000000000000000000000)
 */
export const pnkFaucetConfig = {
  address: pnkFaucetAddress,
  abi: pnkFaucetAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Pinakion
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x330bD769382cFc6d50175903434CCC8D206DCAE5)
 */
export const pinakionAbi = [
  { type: "constructor", inputs: [], stateMutability: "nonpayable" },
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
    type: "function",
    inputs: [
      { name: "owner", internalType: "address", type: "address" },
      { name: "spender", internalType: "address", type: "address" },
    ],
    name: "allowance",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "spender", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "account", internalType: "address", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "spender", internalType: "address", type: "address" },
      { name: "subtractedValue", internalType: "uint256", type: "uint256" },
    ],
    name: "decreaseAllowance",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "spender", internalType: "address", type: "address" },
      { name: "addedValue", internalType: "uint256", type: "uint256" },
    ],
    name: "increaseAllowance",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "name",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "totalSupply",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "to", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "from", internalType: "address", type: "address" },
      { name: "to", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
    ],
    name: "transferFrom",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
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
  abi: pinakionAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PolicyRegistry
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * - [__View Contract on Gnosis Gnosis Chain Explorer__](https://blockscout.com/xdai/mainnet/address/0x9d494768936b6bDaabc46733b8D53A937A6c6D7e)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x26c1980120F1C82cF611D666CE81D2b54d018547)
 */
export const policyRegistryAbi = [
  { type: "fallback", stateMutability: "payable" },
  { type: "receive", stateMutability: "payable" },
  { type: "error", inputs: [], name: "AlreadyInitialized" },
  { type: "error", inputs: [], name: "FailedDelegateCall" },
  {
    type: "error",
    inputs: [{ name: "implementation", internalType: "address", type: "address" }],
    name: "InvalidImplementation",
  },
  { type: "error", inputs: [], name: "NotInitializing" },
  { type: "error", inputs: [], name: "UUPSUnauthorizedCallContext" },
  {
    type: "error",
    inputs: [{ name: "slot", internalType: "bytes32", type: "bytes32" }],
    name: "UUPSUnsupportedProxiableUUID",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "version",
        internalType: "uint64",
        type: "uint64",
        indexed: false,
      },
    ],
    name: "Initialized",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "_courtID",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "_courtName",
        internalType: "string",
        type: "string",
        indexed: false,
      },
      {
        name: "_policy",
        internalType: "string",
        type: "string",
        indexed: false,
      },
    ],
    name: "PolicyUpdate",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "newImplementation",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "Upgraded",
  },
  {
    type: "function",
    inputs: [{ name: "_governor", internalType: "address", type: "address" }],
    name: "changeGovernor",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "governor",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "_governor", internalType: "address", type: "address" }],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    name: "policies",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "proxiableUUID",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_courtID", internalType: "uint256", type: "uint256" },
      { name: "_courtName", internalType: "string", type: "string" },
      { name: "_policy", internalType: "string", type: "string" },
    ],
    name: "setPolicy",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "newImplementation", internalType: "address", type: "address" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "upgradeToAndCall",
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "constructor",
    inputs: [
      { name: "_implementation", internalType: "address", type: "address" },
      { name: "_data", internalType: "bytes", type: "bytes" },
    ],
    stateMutability: "nonpayable",
  },
] as const;

/**
 * - [__View Contract on Gnosis Gnosis Chain Explorer__](https://blockscout.com/xdai/mainnet/address/0x9d494768936b6bDaabc46733b8D53A937A6c6D7e)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x26c1980120F1C82cF611D666CE81D2b54d018547)
 */
export const policyRegistryAddress = {
  100: "0x9d494768936b6bDaabc46733b8D53A937A6c6D7e",
  42161: "0x26c1980120F1C82cF611D666CE81D2b54d018547",
} as const;

/**
 * - [__View Contract on Gnosis Gnosis Chain Explorer__](https://blockscout.com/xdai/mainnet/address/0x9d494768936b6bDaabc46733b8D53A937A6c6D7e)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x26c1980120F1C82cF611D666CE81D2b54d018547)
 */
export const policyRegistryConfig = {
  address: policyRegistryAddress,
  abi: policyRegistryAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PolicyRegistry_Implementation
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x2AC2EdFD336732bc6963f1AD03ED98B22dB949da)
 */
export const policyRegistryImplementationAbi = [
  { type: "constructor", inputs: [], stateMutability: "nonpayable" },
  { type: "error", inputs: [], name: "AlreadyInitialized" },
  { type: "error", inputs: [], name: "FailedDelegateCall" },
  {
    type: "error",
    inputs: [{ name: "implementation", internalType: "address", type: "address" }],
    name: "InvalidImplementation",
  },
  { type: "error", inputs: [], name: "NotInitializing" },
  { type: "error", inputs: [], name: "UUPSUnauthorizedCallContext" },
  {
    type: "error",
    inputs: [{ name: "slot", internalType: "bytes32", type: "bytes32" }],
    name: "UUPSUnsupportedProxiableUUID",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "version",
        internalType: "uint64",
        type: "uint64",
        indexed: false,
      },
    ],
    name: "Initialized",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "_courtID",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "_courtName",
        internalType: "string",
        type: "string",
        indexed: false,
      },
      {
        name: "_policy",
        internalType: "string",
        type: "string",
        indexed: false,
      },
    ],
    name: "PolicyUpdate",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "newImplementation",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "Upgraded",
  },
  {
    type: "function",
    inputs: [{ name: "_governor", internalType: "address", type: "address" }],
    name: "changeGovernor",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "governor",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "_governor", internalType: "address", type: "address" }],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    name: "policies",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "proxiableUUID",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_courtID", internalType: "uint256", type: "uint256" },
      { name: "_courtName", internalType: "string", type: "string" },
      { name: "_policy", internalType: "string", type: "string" },
    ],
    name: "setPolicy",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "newImplementation", internalType: "address", type: "address" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "upgradeToAndCall",
    outputs: [],
    stateMutability: "payable",
  },
] as const;

/**
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x2AC2EdFD336732bc6963f1AD03ED98B22dB949da)
 */
export const policyRegistryImplementationAddress = {
  42161: "0x2AC2EdFD336732bc6963f1AD03ED98B22dB949da",
} as const;

/**
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x2AC2EdFD336732bc6963f1AD03ED98B22dB949da)
 */
export const policyRegistryImplementationConfig = {
  address: policyRegistryImplementationAddress,
  abi: policyRegistryImplementationAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PolicyRegistry_Proxy
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x26c1980120F1C82cF611D666CE81D2b54d018547)
 */
export const policyRegistryProxyAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "_implementation", internalType: "address", type: "address" },
      { name: "_data", internalType: "bytes", type: "bytes" },
    ],
    stateMutability: "nonpayable",
  },
  { type: "fallback", stateMutability: "payable" },
  { type: "receive", stateMutability: "payable" },
] as const;

/**
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x26c1980120F1C82cF611D666CE81D2b54d018547)
 */
export const policyRegistryProxyAddress = {
  42161: "0x26c1980120F1C82cF611D666CE81D2b54d018547",
} as const;

/**
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x26c1980120F1C82cF611D666CE81D2b54d018547)
 */
export const policyRegistryProxyConfig = {
  address: policyRegistryProxyAddress,
  abi: policyRegistryProxyAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// RandomizerOracle
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x5b8bB80f2d72D0C85caB8fB169e8170A05C94bAF)
 */
export const randomizerOracleAbi = [] as const;

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
  abi: randomizerOracleAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// RandomizerRNG
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0xC3dB344755b15c8Edfd834db79af4f8860029FB4)
 */
export const randomizerRngAbi = [
  { type: "fallback", stateMutability: "payable" },
  { type: "receive", stateMutability: "payable" },
  { type: "error", inputs: [], name: "AlreadyInitialized" },
  { type: "error", inputs: [], name: "FailedDelegateCall" },
  {
    type: "error",
    inputs: [{ name: "implementation", internalType: "address", type: "address" }],
    name: "InvalidImplementation",
  },
  { type: "error", inputs: [], name: "NotInitializing" },
  { type: "error", inputs: [], name: "UUPSUnauthorizedCallContext" },
  {
    type: "error",
    inputs: [{ name: "slot", internalType: "bytes32", type: "bytes32" }],
    name: "UUPSUnsupportedProxiableUUID",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "version",
        internalType: "uint64",
        type: "uint64",
        indexed: false,
      },
    ],
    name: "Initialized",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "newImplementation",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "Upgraded",
  },
  {
    type: "function",
    inputs: [],
    name: "callbackGasLimit",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "_governor", internalType: "address", type: "address" }],
    name: "changeGovernor",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "governor",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      {
        name: "_randomizer",
        internalType: "contract IRandomizer",
        type: "address",
      },
      { name: "_governor", internalType: "address", type: "address" },
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "proxiableUUID",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    name: "randomNumbers",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "randomizer",
    outputs: [{ name: "", internalType: "contract IRandomizer", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_id", internalType: "uint256", type: "uint256" },
      { name: "_value", internalType: "bytes32", type: "bytes32" },
    ],
    name: "randomizerCallback",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "_amount", internalType: "uint256", type: "uint256" }],
    name: "randomizerWithdraw",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    name: "receiveRandomness",
    outputs: [{ name: "randomNumber", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    name: "requestRandomness",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "requesterToID",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "_callbackGasLimit", internalType: "uint256", type: "uint256" }],
    name: "setCallbackGasLimit",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "_randomizer", internalType: "address", type: "address" }],
    name: "setRandomizer",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "newImplementation", internalType: "address", type: "address" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "upgradeToAndCall",
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "constructor",
    inputs: [
      { name: "_implementation", internalType: "address", type: "address" },
      { name: "_data", internalType: "bytes", type: "bytes" },
    ],
    stateMutability: "nonpayable",
  },
] as const;

/**
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0xC3dB344755b15c8Edfd834db79af4f8860029FB4)
 */
export const randomizerRngAddress = {
  42161: "0xC3dB344755b15c8Edfd834db79af4f8860029FB4",
} as const;

/**
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0xC3dB344755b15c8Edfd834db79af4f8860029FB4)
 */
export const randomizerRngConfig = {
  address: randomizerRngAddress,
  abi: randomizerRngAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// RandomizerRNG_Implementation
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0xA995C172d286f8F4eE137CC662e2844E59Cf4836)
 */
export const randomizerRngImplementationAbi = [
  { type: "constructor", inputs: [], stateMutability: "nonpayable" },
  { type: "error", inputs: [], name: "AlreadyInitialized" },
  { type: "error", inputs: [], name: "FailedDelegateCall" },
  {
    type: "error",
    inputs: [{ name: "implementation", internalType: "address", type: "address" }],
    name: "InvalidImplementation",
  },
  { type: "error", inputs: [], name: "NotInitializing" },
  { type: "error", inputs: [], name: "UUPSUnauthorizedCallContext" },
  {
    type: "error",
    inputs: [{ name: "slot", internalType: "bytes32", type: "bytes32" }],
    name: "UUPSUnsupportedProxiableUUID",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "version",
        internalType: "uint64",
        type: "uint64",
        indexed: false,
      },
    ],
    name: "Initialized",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "newImplementation",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "Upgraded",
  },
  {
    type: "function",
    inputs: [],
    name: "callbackGasLimit",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "_governor", internalType: "address", type: "address" }],
    name: "changeGovernor",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "governor",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      {
        name: "_randomizer",
        internalType: "contract IRandomizer",
        type: "address",
      },
      { name: "_governor", internalType: "address", type: "address" },
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "proxiableUUID",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    name: "randomNumbers",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "randomizer",
    outputs: [{ name: "", internalType: "contract IRandomizer", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_id", internalType: "uint256", type: "uint256" },
      { name: "_value", internalType: "bytes32", type: "bytes32" },
    ],
    name: "randomizerCallback",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "_amount", internalType: "uint256", type: "uint256" }],
    name: "randomizerWithdraw",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    name: "receiveRandomness",
    outputs: [{ name: "randomNumber", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    name: "requestRandomness",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "requesterToID",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "_callbackGasLimit", internalType: "uint256", type: "uint256" }],
    name: "setCallbackGasLimit",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "_randomizer", internalType: "address", type: "address" }],
    name: "setRandomizer",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "newImplementation", internalType: "address", type: "address" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "upgradeToAndCall",
    outputs: [],
    stateMutability: "payable",
  },
] as const;

/**
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0xA995C172d286f8F4eE137CC662e2844E59Cf4836)
 */
export const randomizerRngImplementationAddress = {
  42161: "0xA995C172d286f8F4eE137CC662e2844E59Cf4836",
} as const;

/**
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0xA995C172d286f8F4eE137CC662e2844E59Cf4836)
 */
export const randomizerRngImplementationConfig = {
  address: randomizerRngImplementationAddress,
  abi: randomizerRngImplementationAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// RandomizerRNG_Proxy
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0xC3dB344755b15c8Edfd834db79af4f8860029FB4)
 */
export const randomizerRngProxyAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "_implementation", internalType: "address", type: "address" },
      { name: "_data", internalType: "bytes", type: "bytes" },
    ],
    stateMutability: "nonpayable",
  },
  { type: "fallback", stateMutability: "payable" },
  { type: "receive", stateMutability: "payable" },
] as const;

/**
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0xC3dB344755b15c8Edfd834db79af4f8860029FB4)
 */
export const randomizerRngProxyAddress = {
  42161: "0xC3dB344755b15c8Edfd834db79af4f8860029FB4",
} as const;

/**
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0xC3dB344755b15c8Edfd834db79af4f8860029FB4)
 */
export const randomizerRngProxyConfig = {
  address: randomizerRngProxyAddress,
  abi: randomizerRngProxyAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SortitionModuleNeo
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x614498118850184c62f82d08261109334bFB050f)
 */
export const sortitionModuleNeoAbi = [
  { type: "fallback", stateMutability: "payable" },
  { type: "receive", stateMutability: "payable" },
  { type: "error", inputs: [], name: "AlreadyInitialized" },
  { type: "error", inputs: [], name: "FailedDelegateCall" },
  {
    type: "error",
    inputs: [{ name: "implementation", internalType: "address", type: "address" }],
    name: "InvalidImplementation",
  },
  { type: "error", inputs: [], name: "NotInitializing" },
  { type: "error", inputs: [], name: "UUPSUnauthorizedCallContext" },
  {
    type: "error",
    inputs: [{ name: "slot", internalType: "bytes32", type: "bytes32" }],
    name: "UUPSUnsupportedProxiableUUID",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "version",
        internalType: "uint64",
        type: "uint64",
        indexed: false,
      },
    ],
    name: "Initialized",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "_phase",
        internalType: "enum ISortitionModule.Phase",
        type: "uint8",
        indexed: false,
      },
    ],
    name: "NewPhase",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "_address",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "_courtID",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "_amount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "StakeDelayedAlreadyTransferred",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "_address",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "_courtID",
        internalType: "uint96",
        type: "uint96",
        indexed: true,
      },
      {
        name: "_amount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "StakeDelayedAlreadyTransferredWithdrawn",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "_address",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "_courtID",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "_amount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "StakeDelayedNotTransferred",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "_address",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "_relativeAmount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      { name: "_unlock", internalType: "bool", type: "bool", indexed: false },
    ],
    name: "StakeLocked",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "_address",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "_courtID",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "_amount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "StakeSet",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "newImplementation",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "Upgraded",
  },
  {
    type: "function",
    inputs: [{ name: "_maxDrawingTime", internalType: "uint256", type: "uint256" }],
    name: "changeMaxDrawingTime",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "_maxStakePerJuror", internalType: "uint256", type: "uint256" }],
    name: "changeMaxStakePerJuror",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "_maxTotalStaked", internalType: "uint256", type: "uint256" }],
    name: "changeMaxTotalStaked",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "_minStakingTime", internalType: "uint256", type: "uint256" }],
    name: "changeMinStakingTime",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_rng", internalType: "contract RNG", type: "address" },
      { name: "_rngLookahead", internalType: "uint256", type: "uint256" },
    ],
    name: "changeRandomNumberGenerator",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "core",
    outputs: [{ name: "", internalType: "contract KlerosCore", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "uint256", type: "uint256" },
    ],
    name: "createDisputeHook",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_key", internalType: "bytes32", type: "bytes32" },
      { name: "_extraData", internalType: "bytes", type: "bytes" },
    ],
    name: "createTree",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "delayedStakeReadIndex",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "delayedStakeWriteIndex",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    name: "delayedStakes",
    outputs: [
      { name: "account", internalType: "address", type: "address" },
      { name: "courtID", internalType: "uint96", type: "uint96" },
      { name: "stake", internalType: "uint256", type: "uint256" },
      { name: "alreadyTransferred", internalType: "bool", type: "bool" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "disputesWithoutJurors",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_key", internalType: "bytes32", type: "bytes32" },
      { name: "_coreDisputeID", internalType: "uint256", type: "uint256" },
      { name: "_nonce", internalType: "uint256", type: "uint256" },
    ],
    name: "draw",
    outputs: [{ name: "drawnAddress", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "_iterations", internalType: "uint256", type: "uint256" }],
    name: "executeDelayedStakes",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_juror", internalType: "address", type: "address" },
      { name: "_courtID", internalType: "uint96", type: "uint96" },
    ],
    name: "getJurorBalance",
    outputs: [
      { name: "totalStaked", internalType: "uint256", type: "uint256" },
      { name: "totalLocked", internalType: "uint256", type: "uint256" },
      { name: "stakedInCourt", internalType: "uint256", type: "uint256" },
      { name: "nbCourts", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "_juror", internalType: "address", type: "address" }],
    name: "getJurorCourtIDs",
    outputs: [{ name: "", internalType: "uint96[]", type: "uint96[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "governor",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_governor", internalType: "address", type: "address" },
      { name: "_core", internalType: "contract KlerosCore", type: "address" },
      { name: "_minStakingTime", internalType: "uint256", type: "uint256" },
      { name: "_maxDrawingTime", internalType: "uint256", type: "uint256" },
      { name: "_rng", internalType: "contract RNG", type: "address" },
      { name: "_rngLookahead", internalType: "uint256", type: "uint256" },
      { name: "_maxStakePerJuror", internalType: "uint256", type: "uint256" },
      { name: "_maxTotalStaked", internalType: "uint256", type: "uint256" },
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "_juror", internalType: "address", type: "address" }],
    name: "isJurorStaked",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "jurors",
    outputs: [
      { name: "stakedPnk", internalType: "uint256", type: "uint256" },
      { name: "lockedPnk", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "lastPhaseChange",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "", internalType: "address", type: "address" },
      { name: "", internalType: "uint96", type: "uint96" },
    ],
    name: "latestDelayedStakeIndex",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_account", internalType: "address", type: "address" },
      { name: "_relativeAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "lockStake",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "maxDrawingTime",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "maxStakePerJuror",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "maxTotalStaked",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "minStakingTime",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "_randomNumber", internalType: "uint256", type: "uint256" }],
    name: "notifyRandomNumber",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "passPhase",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_account", internalType: "address", type: "address" },
      { name: "_relativeAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "penalizeStake",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "phase",
    outputs: [{ name: "", internalType: "enum ISortitionModule.Phase", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "uint256", type: "uint256" },
    ],
    name: "postDrawHook",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "proxiableUUID",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "randomNumber",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "randomNumberRequestBlock",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "rng",
    outputs: [{ name: "", internalType: "contract RNG", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "rngLookahead",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "_account", internalType: "address", type: "address" }],
    name: "setJurorInactive",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_account", internalType: "address", type: "address" },
      { name: "_courtID", internalType: "uint96", type: "uint96" },
      { name: "_newStake", internalType: "uint256", type: "uint256" },
      { name: "_alreadyTransferred", internalType: "bool", type: "bool" },
    ],
    name: "setStake",
    outputs: [
      { name: "pnkDeposit", internalType: "uint256", type: "uint256" },
      { name: "pnkWithdrawal", internalType: "uint256", type: "uint256" },
      {
        name: "stakingResult",
        internalType: "enum StakingResult",
        type: "uint8",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_key", internalType: "bytes32", type: "bytes32" },
      { name: "_ID", internalType: "bytes32", type: "bytes32" },
    ],
    name: "stakeOf",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_juror", internalType: "address", type: "address" },
      { name: "_courtID", internalType: "uint96", type: "uint96" },
    ],
    name: "stakeOf",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "totalStaked",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_account", internalType: "address", type: "address" },
      { name: "_relativeAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "unlockStake",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "newImplementation", internalType: "address", type: "address" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "upgradeToAndCall",
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "constructor",
    inputs: [
      { name: "_implementation", internalType: "address", type: "address" },
      { name: "_data", internalType: "bytes", type: "bytes" },
    ],
    stateMutability: "nonpayable",
  },
] as const;

/**
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x614498118850184c62f82d08261109334bFB050f)
 */
export const sortitionModuleNeoAddress = {
  42161: "0x614498118850184c62f82d08261109334bFB050f",
} as const;

/**
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x614498118850184c62f82d08261109334bFB050f)
 */
export const sortitionModuleNeoConfig = {
  address: sortitionModuleNeoAddress,
  abi: sortitionModuleNeoAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SortitionModuleNeo_Implementation
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0xf327200420F21BAafce8F1C03B1EEdF926074B95)
 */
export const sortitionModuleNeoImplementationAbi = [
  { type: "constructor", inputs: [], stateMutability: "nonpayable" },
  { type: "error", inputs: [], name: "AlreadyInitialized" },
  { type: "error", inputs: [], name: "FailedDelegateCall" },
  {
    type: "error",
    inputs: [{ name: "implementation", internalType: "address", type: "address" }],
    name: "InvalidImplementation",
  },
  { type: "error", inputs: [], name: "NotInitializing" },
  { type: "error", inputs: [], name: "UUPSUnauthorizedCallContext" },
  {
    type: "error",
    inputs: [{ name: "slot", internalType: "bytes32", type: "bytes32" }],
    name: "UUPSUnsupportedProxiableUUID",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "version",
        internalType: "uint64",
        type: "uint64",
        indexed: false,
      },
    ],
    name: "Initialized",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "_phase",
        internalType: "enum ISortitionModule.Phase",
        type: "uint8",
        indexed: false,
      },
    ],
    name: "NewPhase",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "_address",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "_courtID",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "_amount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "StakeDelayedAlreadyTransferred",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "_address",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "_courtID",
        internalType: "uint96",
        type: "uint96",
        indexed: true,
      },
      {
        name: "_amount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "StakeDelayedAlreadyTransferredWithdrawn",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "_address",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "_courtID",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "_amount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "StakeDelayedNotTransferred",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "_address",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "_relativeAmount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      { name: "_unlock", internalType: "bool", type: "bool", indexed: false },
    ],
    name: "StakeLocked",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "_address",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "_courtID",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "_amount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "StakeSet",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "newImplementation",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "Upgraded",
  },
  {
    type: "function",
    inputs: [{ name: "_maxDrawingTime", internalType: "uint256", type: "uint256" }],
    name: "changeMaxDrawingTime",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "_maxStakePerJuror", internalType: "uint256", type: "uint256" }],
    name: "changeMaxStakePerJuror",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "_maxTotalStaked", internalType: "uint256", type: "uint256" }],
    name: "changeMaxTotalStaked",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "_minStakingTime", internalType: "uint256", type: "uint256" }],
    name: "changeMinStakingTime",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_rng", internalType: "contract RNG", type: "address" },
      { name: "_rngLookahead", internalType: "uint256", type: "uint256" },
    ],
    name: "changeRandomNumberGenerator",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "core",
    outputs: [{ name: "", internalType: "contract KlerosCore", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "uint256", type: "uint256" },
    ],
    name: "createDisputeHook",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_key", internalType: "bytes32", type: "bytes32" },
      { name: "_extraData", internalType: "bytes", type: "bytes" },
    ],
    name: "createTree",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "delayedStakeReadIndex",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "delayedStakeWriteIndex",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    name: "delayedStakes",
    outputs: [
      { name: "account", internalType: "address", type: "address" },
      { name: "courtID", internalType: "uint96", type: "uint96" },
      { name: "stake", internalType: "uint256", type: "uint256" },
      { name: "alreadyTransferred", internalType: "bool", type: "bool" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "disputesWithoutJurors",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_key", internalType: "bytes32", type: "bytes32" },
      { name: "_coreDisputeID", internalType: "uint256", type: "uint256" },
      { name: "_nonce", internalType: "uint256", type: "uint256" },
    ],
    name: "draw",
    outputs: [{ name: "drawnAddress", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "_iterations", internalType: "uint256", type: "uint256" }],
    name: "executeDelayedStakes",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_juror", internalType: "address", type: "address" },
      { name: "_courtID", internalType: "uint96", type: "uint96" },
    ],
    name: "getJurorBalance",
    outputs: [
      { name: "totalStaked", internalType: "uint256", type: "uint256" },
      { name: "totalLocked", internalType: "uint256", type: "uint256" },
      { name: "stakedInCourt", internalType: "uint256", type: "uint256" },
      { name: "nbCourts", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "_juror", internalType: "address", type: "address" }],
    name: "getJurorCourtIDs",
    outputs: [{ name: "", internalType: "uint96[]", type: "uint96[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "governor",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_governor", internalType: "address", type: "address" },
      { name: "_core", internalType: "contract KlerosCore", type: "address" },
      { name: "_minStakingTime", internalType: "uint256", type: "uint256" },
      { name: "_maxDrawingTime", internalType: "uint256", type: "uint256" },
      { name: "_rng", internalType: "contract RNG", type: "address" },
      { name: "_rngLookahead", internalType: "uint256", type: "uint256" },
      { name: "_maxStakePerJuror", internalType: "uint256", type: "uint256" },
      { name: "_maxTotalStaked", internalType: "uint256", type: "uint256" },
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "_juror", internalType: "address", type: "address" }],
    name: "isJurorStaked",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "jurors",
    outputs: [
      { name: "stakedPnk", internalType: "uint256", type: "uint256" },
      { name: "lockedPnk", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "lastPhaseChange",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "", internalType: "address", type: "address" },
      { name: "", internalType: "uint96", type: "uint96" },
    ],
    name: "latestDelayedStakeIndex",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_account", internalType: "address", type: "address" },
      { name: "_relativeAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "lockStake",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "maxDrawingTime",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "maxStakePerJuror",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "maxTotalStaked",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "minStakingTime",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "_randomNumber", internalType: "uint256", type: "uint256" }],
    name: "notifyRandomNumber",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "passPhase",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_account", internalType: "address", type: "address" },
      { name: "_relativeAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "penalizeStake",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "phase",
    outputs: [{ name: "", internalType: "enum ISortitionModule.Phase", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "uint256", type: "uint256" },
    ],
    name: "postDrawHook",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "proxiableUUID",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "randomNumber",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "randomNumberRequestBlock",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "rng",
    outputs: [{ name: "", internalType: "contract RNG", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "rngLookahead",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "_account", internalType: "address", type: "address" }],
    name: "setJurorInactive",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_account", internalType: "address", type: "address" },
      { name: "_courtID", internalType: "uint96", type: "uint96" },
      { name: "_newStake", internalType: "uint256", type: "uint256" },
      { name: "_alreadyTransferred", internalType: "bool", type: "bool" },
    ],
    name: "setStake",
    outputs: [
      { name: "pnkDeposit", internalType: "uint256", type: "uint256" },
      { name: "pnkWithdrawal", internalType: "uint256", type: "uint256" },
      {
        name: "stakingResult",
        internalType: "enum StakingResult",
        type: "uint8",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_key", internalType: "bytes32", type: "bytes32" },
      { name: "_ID", internalType: "bytes32", type: "bytes32" },
    ],
    name: "stakeOf",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_juror", internalType: "address", type: "address" },
      { name: "_courtID", internalType: "uint96", type: "uint96" },
    ],
    name: "stakeOf",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "totalStaked",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_account", internalType: "address", type: "address" },
      { name: "_relativeAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "unlockStake",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "newImplementation", internalType: "address", type: "address" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "upgradeToAndCall",
    outputs: [],
    stateMutability: "payable",
  },
] as const;

/**
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0xf327200420F21BAafce8F1C03B1EEdF926074B95)
 */
export const sortitionModuleNeoImplementationAddress = {
  42161: "0xf327200420F21BAafce8F1C03B1EEdF926074B95",
} as const;

/**
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0xf327200420F21BAafce8F1C03B1EEdF926074B95)
 */
export const sortitionModuleNeoImplementationConfig = {
  address: sortitionModuleNeoImplementationAddress,
  abi: sortitionModuleNeoImplementationAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SortitionModuleNeo_Proxy
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x614498118850184c62f82d08261109334bFB050f)
 */
export const sortitionModuleNeoProxyAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "_implementation", internalType: "address", type: "address" },
      { name: "_data", internalType: "bytes", type: "bytes" },
    ],
    stateMutability: "nonpayable",
  },
  { type: "fallback", stateMutability: "payable" },
  { type: "receive", stateMutability: "payable" },
] as const;

/**
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x614498118850184c62f82d08261109334bFB050f)
 */
export const sortitionModuleNeoProxyAddress = {
  42161: "0x614498118850184c62f82d08261109334bFB050f",
} as const;

/**
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x614498118850184c62f82d08261109334bFB050f)
 */
export const sortitionModuleNeoProxyConfig = {
  address: sortitionModuleNeoProxyAddress,
  abi: sortitionModuleNeoProxyAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// TokenBridge
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Gnosis Gnosis Chain Explorer__](https://blockscout.com/xdai/mainnet/address/0xf6A78083ca3e2a662D6dd1703c939c8aCE2e268d)
 */
export const tokenBridgeAbi = [
  {
    constant: false,
    payable: false,
    type: "function",
    inputs: [
      { name: "version", type: "uint256" },
      { name: "implementation", type: "address" },
    ],
    name: "upgradeTo",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    constant: true,
    payable: false,
    type: "function",
    inputs: [],
    name: "version",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    constant: true,
    payable: false,
    type: "function",
    inputs: [],
    name: "implementation",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
  },
  {
    constant: true,
    payable: false,
    type: "function",
    inputs: [],
    name: "upgradeabilityOwner",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
  },
  {
    constant: false,
    payable: true,
    type: "function",
    inputs: [
      { name: "version", type: "uint256" },
      { name: "implementation", type: "address" },
      { name: "data", type: "bytes" },
    ],
    name: "upgradeToAndCall",
    outputs: [],
    stateMutability: "payable",
  },
  {
    constant: false,
    payable: false,
    type: "function",
    inputs: [{ name: "newOwner", type: "address" }],
    name: "transferProxyOwnership",
    outputs: [],
    stateMutability: "nonpayable",
  },
  { payable: true, type: "fallback", stateMutability: "payable" },
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
 * [__View Contract on Gnosis Gnosis Chain Explorer__](https://blockscout.com/xdai/mainnet/address/0xf6A78083ca3e2a662D6dd1703c939c8aCE2e268d)
 */
export const tokenBridgeAddress = {
  100: "0xf6A78083ca3e2a662D6dd1703c939c8aCE2e268d",
} as const;

/**
 * [__View Contract on Gnosis Gnosis Chain Explorer__](https://blockscout.com/xdai/mainnet/address/0xf6A78083ca3e2a662D6dd1703c939c8aCE2e268d)
 */
export const tokenBridgeConfig = {
  address: tokenBridgeAddress,
  abi: tokenBridgeAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// TransactionBatcher
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Gnosis Gnosis Chain Explorer__](https://blockscout.com/xdai/mainnet/address/0x6426800F8508b15AED271337498fa5e7D0794d46)
 */
export const transactionBatcherAbi = [
  {
    type: "function",
    inputs: [
      { name: "targets", internalType: "address[]", type: "address[]" },
      { name: "values", internalType: "uint256[]", type: "uint256[]" },
      { name: "datas", internalType: "bytes[]", type: "bytes[]" },
    ],
    name: "batchSend",
    outputs: [],
    stateMutability: "payable",
  },
] as const;

/**
 * [__View Contract on Gnosis Gnosis Chain Explorer__](https://blockscout.com/xdai/mainnet/address/0x6426800F8508b15AED271337498fa5e7D0794d46)
 */
export const transactionBatcherAddress = {
  100: "0x6426800F8508b15AED271337498fa5e7D0794d46",
} as const;

/**
 * [__View Contract on Gnosis Gnosis Chain Explorer__](https://blockscout.com/xdai/mainnet/address/0x6426800F8508b15AED271337498fa5e7D0794d46)
 */
export const transactionBatcherConfig = {
  address: transactionBatcherAddress,
  abi: transactionBatcherAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// WETH
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * - [__View Contract on Gnosis Gnosis Chain Explorer__](https://blockscout.com/xdai/mainnet/address/0x6A023CCd1ff6F2045C3309768eAd9E68F978f6e1)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x82aF49447D8a07e3bd95BD0d56f35241523fBab1)
 */
export const wethAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "_logic", internalType: "address", type: "address" },
      { name: "admin_", internalType: "address", type: "address" },
      { name: "_data", internalType: "bytes", type: "bytes" },
    ],
    stateMutability: "payable",
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
  { type: "fallback", stateMutability: "payable" },
  {
    type: "function",
    inputs: [],
    name: "admin",
    outputs: [{ name: "admin_", internalType: "address", type: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "newAdmin", internalType: "address", type: "address" }],
    name: "changeAdmin",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "implementation",
    outputs: [{ name: "implementation_", internalType: "address", type: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "newImplementation", internalType: "address", type: "address" }],
    name: "upgradeTo",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "newImplementation", internalType: "address", type: "address" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "upgradeToAndCall",
    outputs: [],
    stateMutability: "payable",
  },
  { type: "receive", stateMutability: "payable" },
] as const;

/**
 * - [__View Contract on Gnosis Gnosis Chain Explorer__](https://blockscout.com/xdai/mainnet/address/0x6A023CCd1ff6F2045C3309768eAd9E68F978f6e1)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x82aF49447D8a07e3bd95BD0d56f35241523fBab1)
 */
export const wethAddress = {
  100: "0x6A023CCd1ff6F2045C3309768eAd9E68F978f6e1",
  42161: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
} as const;

/**
 * - [__View Contract on Gnosis Gnosis Chain Explorer__](https://blockscout.com/xdai/mainnet/address/0x6A023CCd1ff6F2045C3309768eAd9E68F978f6e1)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x82aF49447D8a07e3bd95BD0d56f35241523fBab1)
 */
export const wethConfig = { address: wethAddress, abi: wethAbi } as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// WrappedPinakion
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Gnosis Gnosis Chain Explorer__](https://blockscout.com/xdai/mainnet/address/0xcb3231aBA3b451343e0Fddfc45883c842f223846)
 */
export const wrappedPinakionAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "_logic", internalType: "address", type: "address" },
      { name: "_admin", internalType: "address", type: "address" },
      { name: "_data", internalType: "bytes", type: "bytes" },
    ],
    stateMutability: "payable",
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
  { type: "fallback", stateMutability: "payable" },
  {
    type: "function",
    inputs: [],
    name: "admin",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "newAdmin", internalType: "address", type: "address" }],
    name: "changeAdmin",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "implementation",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "newImplementation", internalType: "address", type: "address" }],
    name: "upgradeTo",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "newImplementation", internalType: "address", type: "address" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "upgradeToAndCall",
    outputs: [],
    stateMutability: "payable",
  },
  { type: "receive", stateMutability: "payable" },
] as const;

/**
 * [__View Contract on Gnosis Gnosis Chain Explorer__](https://blockscout.com/xdai/mainnet/address/0xcb3231aBA3b451343e0Fddfc45883c842f223846)
 */
export const wrappedPinakionAddress = {
  100: "0xcb3231aBA3b451343e0Fddfc45883c842f223846",
} as const;

/**
 * [__View Contract on Gnosis Gnosis Chain Explorer__](https://blockscout.com/xdai/mainnet/address/0xcb3231aBA3b451343e0Fddfc45883c842f223846)
 */
export const wrappedPinakionConfig = {
  address: wrappedPinakionAddress,
  abi: wrappedPinakionAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// xKlerosLiquid
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Gnosis Gnosis Chain Explorer__](https://blockscout.com/xdai/mainnet/address/0x9C1dA9A04925bDfDedf0f6421bC7EEa8305F9002)
 */
export const xKlerosLiquidAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "_logic", internalType: "address", type: "address" },
      { name: "_admin", internalType: "address", type: "address" },
      { name: "_data", internalType: "bytes", type: "bytes" },
    ],
    stateMutability: "payable",
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
  { type: "fallback", stateMutability: "payable" },
  {
    type: "function",
    inputs: [],
    name: "admin",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "newAdmin", internalType: "address", type: "address" }],
    name: "changeAdmin",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "implementation",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "newImplementation", internalType: "address", type: "address" }],
    name: "upgradeTo",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "newImplementation", internalType: "address", type: "address" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "upgradeToAndCall",
    outputs: [],
    stateMutability: "payable",
  },
  { type: "receive", stateMutability: "payable" },
] as const;

/**
 * [__View Contract on Gnosis Gnosis Chain Explorer__](https://blockscout.com/xdai/mainnet/address/0x9C1dA9A04925bDfDedf0f6421bC7EEa8305F9002)
 */
export const xKlerosLiquidAddress = {
  100: "0x9C1dA9A04925bDfDedf0f6421bC7EEa8305F9002",
} as const;

/**
 * [__View Contract on Gnosis Gnosis Chain Explorer__](https://blockscout.com/xdai/mainnet/address/0x9C1dA9A04925bDfDedf0f6421bC7EEa8305F9002)
 */
export const xKlerosLiquidConfig = {
  address: xKlerosLiquidAddress,
  abi: xKlerosLiquidAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// xPNK
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Gnosis Gnosis Chain Explorer__](https://blockscout.com/xdai/mainnet/address/0x37b60f4E9A31A64cCc0024dce7D0fD07eAA0F7B3)
 */
export const xPnkAbi = [] as const;

/**
 * [__View Contract on Gnosis Gnosis Chain Explorer__](https://blockscout.com/xdai/mainnet/address/0x37b60f4E9A31A64cCc0024dce7D0fD07eAA0F7B3)
 */
export const xPnkAddress = {
  100: "0x37b60f4E9A31A64cCc0024dce7D0fD07eAA0F7B3",
} as const;

/**
 * [__View Contract on Gnosis Gnosis Chain Explorer__](https://blockscout.com/xdai/mainnet/address/0x37b60f4E9A31A64cCc0024dce7D0fD07eAA0F7B3)
 */
export const xPnkConfig = { address: xPnkAddress, abi: xPnkAbi } as const;
