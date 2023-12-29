//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ArbitrableExample
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Gnosis Chiado Blockscout__](https://blockscout.chiadochain.net/address/0xB56A23b396E0eae85414Ce5815da448ba529Cb4A)
 */
export const arbitrableExampleABI = [
  {
    stateMutability: "nonpayable",
    type: "constructor",
    inputs: [
      {
        name: "_arbitrator",
        internalType: "contract IArbitratorV2",
        type: "address",
      },
      { name: "_templateData", internalType: "string", type: "string" },
      { name: "_templateDataMappings", internalType: "string", type: "string" },
      { name: "_arbitratorExtraData", internalType: "bytes", type: "bytes" },
      {
        name: "_templateRegistry",
        internalType: "contract IDisputeTemplateRegistry",
        type: "address",
      },
      { name: "_weth", internalType: "contract IERC20", type: "address" },
    ],
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "_action",
        internalType: "string",
        type: "string",
        indexed: true,
      },
    ],
    name: "Action",
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
    inputs: [],
    name: "arbitrator",
    outputs: [{ name: "", internalType: "contract IArbitratorV2", type: "address" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "arbitratorExtraData",
    outputs: [{ name: "", internalType: "bytes", type: "bytes" }],
  },
  {
    stateMutability: "nonpayable",
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
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_arbitratorExtraData", internalType: "bytes", type: "bytes" }],
    name: "changeArbitratorExtraData",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "_templateData", internalType: "string", type: "string" },
      { name: "_templateDataMappings", internalType: "string", type: "string" },
    ],
    name: "changeDisputeTemplate",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
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
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "_action", internalType: "string", type: "string" },
      { name: "_feeInWeth", internalType: "uint256", type: "uint256" },
    ],
    name: "createDispute",
    outputs: [{ name: "disputeID", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "payable",
    type: "function",
    inputs: [{ name: "_action", internalType: "string", type: "string" }],
    name: "createDispute",
    outputs: [{ name: "disputeID", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    name: "disputes",
    outputs: [
      { name: "isRuled", internalType: "bool", type: "bool" },
      { name: "ruling", internalType: "uint256", type: "uint256" },
      {
        name: "numberOfRulingOptions",
        internalType: "uint256",
        type: "uint256",
      },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    name: "externalIDtoLocalID",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "governor",
    outputs: [{ name: "", internalType: "address", type: "address" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "_externalDisputeID", internalType: "uint256", type: "uint256" },
      { name: "_ruling", internalType: "uint256", type: "uint256" },
    ],
    name: "rule",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "templateId",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
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
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "weth",
    outputs: [{ name: "", internalType: "contract IERC20", type: "address" }],
  },
] as const;

/**
 * [__View Contract on Gnosis Chiado Blockscout__](https://blockscout.chiadochain.net/address/0xB56A23b396E0eae85414Ce5815da448ba529Cb4A)
 */
export const arbitrableExampleAddress = {
  10200: "0xB56A23b396E0eae85414Ce5815da448ba529Cb4A",
  421614: "0xe48488AE09022a4F32c528d7EbfF92870225AcBf",
} as const;

/**
 * [__View Contract on Gnosis Chiado Blockscout__](https://blockscout.chiadochain.net/address/0xB56A23b396E0eae85414Ce5815da448ba529Cb4A)
 */
export const arbitrableExampleConfig = {
  address: arbitrableExampleAddress,
  abi: arbitrableExampleABI,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// BlockHashRNG
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const blockHashRngABI = [
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    name: "randomNumbers",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_block", internalType: "uint256", type: "uint256" }],
    name: "receiveRandomness",
    outputs: [{ name: "randomNumber", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_block", internalType: "uint256", type: "uint256" }],
    name: "requestRandomness",
    outputs: [],
  },
] as const;

/**
 *
 */
export const blockHashRngAddress = {
  421614: "0x56d6d65Fe202232714794B5D5e4ed9894466Ee01",
} as const;

/**
 *
 */
export const blockHashRngConfig = {
  address: blockHashRngAddress,
  abi: blockHashRngABI,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DAI
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const daiABI = [
  {
    stateMutability: "nonpayable",
    type: "constructor",
    inputs: [
      { name: "_name", internalType: "string", type: "string" },
      { name: "_symbol", internalType: "string", type: "string" },
    ],
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
 *
 */
export const daiAddress = {
  421614: "0x593e89704D285B0c3fbF157c7CF2537456CE64b5",
} as const;

/**
 *
 */
export const daiConfig = { address: daiAddress, abi: daiABI } as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DAIFaucet
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const daiFaucetABI = [
  {
    stateMutability: "nonpayable",
    type: "constructor",
    inputs: [{ name: "_token", internalType: "contract IERC20", type: "address" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "amount",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "balance",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_amount", internalType: "uint256", type: "uint256" }],
    name: "changeAmount",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_governor", internalType: "address", type: "address" }],
    name: "changeGovernor",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "governor",
    outputs: [{ name: "", internalType: "address", type: "address" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [],
    name: "request",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "token",
    outputs: [{ name: "", internalType: "contract IERC20", type: "address" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [],
    name: "withdraw",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "withdrewAlready",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
  },
] as const;

/**
 *
 */
export const daiFaucetAddress = {
  421614: "0xB5b39A1bcD2D7097A8824B3cC18Ebd2dFb0D9B5E",
} as const;

/**
 *
 */
export const daiFaucetConfig = {
  address: daiFaucetAddress,
  abi: daiFaucetABI,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DisputeKitClassic
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const disputeKitClassicABI = [
  { stateMutability: "payable", type: "fallback" },
  { stateMutability: "payable", type: "receive" },
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
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "LOSER_APPEAL_PERIOD_MULTIPLIER",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "LOSER_STAKE_MULTIPLIER",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "ONE_BASIS_POINT",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "WINNER_STAKE_MULTIPLIER",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "_coreDisputeID", internalType: "uint256", type: "uint256" }],
    name: "areCommitsAllCast",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "_coreDisputeID", internalType: "uint256", type: "uint256" }],
    name: "areVotesAllCast",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "_coreDisputeID", internalType: "uint256", type: "uint256" },
      { name: "_voteIDs", internalType: "uint256[]", type: "uint256[]" },
      { name: "_commit", internalType: "bytes32", type: "bytes32" },
    ],
    name: "castCommit",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
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
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_core", internalType: "address", type: "address" }],
    name: "changeCore",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_governor", internalType: "address payable", type: "address" }],
    name: "changeGovernor",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "core",
    outputs: [{ name: "", internalType: "contract KlerosCore", type: "address" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    name: "coreDisputeIDToLocal",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "_coreDisputeID", internalType: "uint256", type: "uint256" },
      { name: "_numberOfChoices", internalType: "uint256", type: "uint256" },
      { name: "_extraData", internalType: "bytes", type: "bytes" },
      { name: "_nbVotes", internalType: "uint256", type: "uint256" },
    ],
    name: "createDispute",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "_coreDisputeID", internalType: "uint256", type: "uint256" }],
    name: "currentRuling",
    outputs: [
      { name: "ruling", internalType: "uint256", type: "uint256" },
      { name: "tied", internalType: "bool", type: "bool" },
      { name: "overridden", internalType: "bool", type: "bool" },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    name: "disputes",
    outputs: [
      { name: "numberOfChoices", internalType: "uint256", type: "uint256" },
      { name: "jumped", internalType: "bool", type: "bool" },
      { name: "extraData", internalType: "bytes", type: "bytes" },
    ],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "_coreDisputeID", internalType: "uint256", type: "uint256" },
      { name: "_nonce", internalType: "uint256", type: "uint256" },
    ],
    name: "draw",
    outputs: [{ name: "drawnAddress", internalType: "address", type: "address" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "_destination", internalType: "address", type: "address" },
      { name: "_amount", internalType: "uint256", type: "uint256" },
      { name: "_data", internalType: "bytes", type: "bytes" },
    ],
    name: "executeGovernorProposal",
    outputs: [],
  },
  {
    stateMutability: "payable",
    type: "function",
    inputs: [
      { name: "_coreDisputeID", internalType: "uint256", type: "uint256" },
      { name: "_choice", internalType: "uint256", type: "uint256" },
    ],
    name: "fundAppeal",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [
      { name: "_coreDisputeID", internalType: "uint256", type: "uint256" },
      { name: "_coreRoundID", internalType: "uint256", type: "uint256" },
    ],
    name: "getCoherentCount",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [
      { name: "_coreDisputeID", internalType: "uint256", type: "uint256" },
      { name: "_coreRoundID", internalType: "uint256", type: "uint256" },
      { name: "_voteID", internalType: "uint256", type: "uint256" },
    ],
    name: "getDegreeOfCoherence",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "_coreDisputeID", internalType: "uint256", type: "uint256" }],
    name: "getFundedChoices",
    outputs: [{ name: "fundedChoices", internalType: "uint256[]", type: "uint256[]" }],
  },
  {
    stateMutability: "view",
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
  },
  {
    stateMutability: "view",
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
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "governor",
    outputs: [{ name: "", internalType: "address", type: "address" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "_governor", internalType: "address", type: "address" },
      { name: "_core", internalType: "contract KlerosCore", type: "address" },
    ],
    name: "initialize",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [
      { name: "_coreDisputeID", internalType: "uint256", type: "uint256" },
      { name: "_coreRoundID", internalType: "uint256", type: "uint256" },
      { name: "_voteID", internalType: "uint256", type: "uint256" },
    ],
    name: "isVoteActive",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "proxiableUUID",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
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
  {
    stateMutability: "nonpayable",
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
  },
  {
    stateMutability: "nonpayable",
    type: "constructor",
    inputs: [
      { name: "_implementation", internalType: "address", type: "address" },
      { name: "_data", internalType: "bytes", type: "bytes" },
    ],
  },
] as const;

/**
 *
 */
export const disputeKitClassicAddress = {
  421614: "0x9426F127116C3652A262AE1eA48391AC8F44D35b",
} as const;

/**
 *
 */
export const disputeKitClassicConfig = {
  address: disputeKitClassicAddress,
  abi: disputeKitClassicABI,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DisputeKitClassic_Implementation
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const disputeKitClassicImplementationABI = [
  { stateMutability: "nonpayable", type: "constructor", inputs: [] },
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
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "LOSER_APPEAL_PERIOD_MULTIPLIER",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "LOSER_STAKE_MULTIPLIER",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "ONE_BASIS_POINT",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "WINNER_STAKE_MULTIPLIER",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "_coreDisputeID", internalType: "uint256", type: "uint256" }],
    name: "areCommitsAllCast",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "_coreDisputeID", internalType: "uint256", type: "uint256" }],
    name: "areVotesAllCast",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "_coreDisputeID", internalType: "uint256", type: "uint256" },
      { name: "_voteIDs", internalType: "uint256[]", type: "uint256[]" },
      { name: "_commit", internalType: "bytes32", type: "bytes32" },
    ],
    name: "castCommit",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
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
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_core", internalType: "address", type: "address" }],
    name: "changeCore",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_governor", internalType: "address payable", type: "address" }],
    name: "changeGovernor",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "core",
    outputs: [{ name: "", internalType: "contract KlerosCore", type: "address" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    name: "coreDisputeIDToLocal",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "_coreDisputeID", internalType: "uint256", type: "uint256" },
      { name: "_numberOfChoices", internalType: "uint256", type: "uint256" },
      { name: "_extraData", internalType: "bytes", type: "bytes" },
      { name: "_nbVotes", internalType: "uint256", type: "uint256" },
    ],
    name: "createDispute",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "_coreDisputeID", internalType: "uint256", type: "uint256" }],
    name: "currentRuling",
    outputs: [
      { name: "ruling", internalType: "uint256", type: "uint256" },
      { name: "tied", internalType: "bool", type: "bool" },
      { name: "overridden", internalType: "bool", type: "bool" },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    name: "disputes",
    outputs: [
      { name: "numberOfChoices", internalType: "uint256", type: "uint256" },
      { name: "jumped", internalType: "bool", type: "bool" },
      { name: "extraData", internalType: "bytes", type: "bytes" },
    ],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "_coreDisputeID", internalType: "uint256", type: "uint256" },
      { name: "_nonce", internalType: "uint256", type: "uint256" },
    ],
    name: "draw",
    outputs: [{ name: "drawnAddress", internalType: "address", type: "address" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "_destination", internalType: "address", type: "address" },
      { name: "_amount", internalType: "uint256", type: "uint256" },
      { name: "_data", internalType: "bytes", type: "bytes" },
    ],
    name: "executeGovernorProposal",
    outputs: [],
  },
  {
    stateMutability: "payable",
    type: "function",
    inputs: [
      { name: "_coreDisputeID", internalType: "uint256", type: "uint256" },
      { name: "_choice", internalType: "uint256", type: "uint256" },
    ],
    name: "fundAppeal",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [
      { name: "_coreDisputeID", internalType: "uint256", type: "uint256" },
      { name: "_coreRoundID", internalType: "uint256", type: "uint256" },
    ],
    name: "getCoherentCount",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [
      { name: "_coreDisputeID", internalType: "uint256", type: "uint256" },
      { name: "_coreRoundID", internalType: "uint256", type: "uint256" },
      { name: "_voteID", internalType: "uint256", type: "uint256" },
    ],
    name: "getDegreeOfCoherence",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "_coreDisputeID", internalType: "uint256", type: "uint256" }],
    name: "getFundedChoices",
    outputs: [{ name: "fundedChoices", internalType: "uint256[]", type: "uint256[]" }],
  },
  {
    stateMutability: "view",
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
  },
  {
    stateMutability: "view",
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
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "governor",
    outputs: [{ name: "", internalType: "address", type: "address" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "_governor", internalType: "address", type: "address" },
      { name: "_core", internalType: "contract KlerosCore", type: "address" },
    ],
    name: "initialize",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [
      { name: "_coreDisputeID", internalType: "uint256", type: "uint256" },
      { name: "_coreRoundID", internalType: "uint256", type: "uint256" },
      { name: "_voteID", internalType: "uint256", type: "uint256" },
    ],
    name: "isVoteActive",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "proxiableUUID",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
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
  {
    stateMutability: "nonpayable",
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
  },
] as const;

/**
 *
 */
export const disputeKitClassicImplementationAddress = {
  421614: "0x692CC78F2570181FFB99297965FeAA8352ab12E8",
} as const;

/**
 *
 */
export const disputeKitClassicImplementationConfig = {
  address: disputeKitClassicImplementationAddress,
  abi: disputeKitClassicImplementationABI,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DisputeKitClassic_Proxy
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const disputeKitClassicProxyABI = [
  {
    stateMutability: "nonpayable",
    type: "constructor",
    inputs: [
      { name: "_implementation", internalType: "address", type: "address" },
      { name: "_data", internalType: "bytes", type: "bytes" },
    ],
  },
  { stateMutability: "payable", type: "fallback" },
  { stateMutability: "payable", type: "receive" },
] as const;

/**
 *
 */
export const disputeKitClassicProxyAddress = {
  421614: "0x9426F127116C3652A262AE1eA48391AC8F44D35b",
} as const;

/**
 *
 */
export const disputeKitClassicProxyConfig = {
  address: disputeKitClassicProxyAddress,
  abi: disputeKitClassicProxyABI,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DisputeResolver
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Gnosis Chiado Blockscout__](https://blockscout.chiadochain.net/address/0x16f20604a51Ac1e68c9aAd1C0E53e951B62CC1Cb)
 */
export const disputeResolverABI = [
  {
    stateMutability: "nonpayable",
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
    inputs: [],
    name: "arbitrator",
    outputs: [{ name: "", internalType: "contract IArbitratorV2", type: "address" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    name: "arbitratorDisputeIDToLocalID",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "nonpayable",
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
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_governor", internalType: "address", type: "address" }],
    name: "changeGovernor",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
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
  },
  {
    stateMutability: "payable",
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
  },
  {
    stateMutability: "payable",
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
  },
  {
    stateMutability: "view",
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
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "governor",
    outputs: [{ name: "", internalType: "address", type: "address" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "_externalDisputeID", internalType: "uint256", type: "uint256" },
      { name: "_ruling", internalType: "uint256", type: "uint256" },
    ],
    name: "rule",
    outputs: [],
  },
  {
    stateMutability: "view",
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
  },
] as const;

/**
 * [__View Contract on Gnosis Chiado Blockscout__](https://blockscout.chiadochain.net/address/0x16f20604a51Ac1e68c9aAd1C0E53e951B62CC1Cb)
 */
export const disputeResolverAddress = {
  10200: "0x16f20604a51Ac1e68c9aAd1C0E53e951B62CC1Cb",
  421614: "0xB8B36CC43f852f9F0484f53Eb38CaBBA28a81bF6",
} as const;

/**
 * [__View Contract on Gnosis Chiado Blockscout__](https://blockscout.chiadochain.net/address/0x16f20604a51Ac1e68c9aAd1C0E53e951B62CC1Cb)
 */
export const disputeResolverConfig = {
  address: disputeResolverAddress,
  abi: disputeResolverABI,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DisputeTemplateRegistry
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Gnosis Chiado Blockscout__](https://blockscout.chiadochain.net/address/0x96E49552669ea81B8E9cE8694F7E4A55D8bFb957)
 */
export const disputeTemplateRegistryABI = [
  { stateMutability: "payable", type: "fallback" },
  { stateMutability: "payable", type: "receive" },
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
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_governor", internalType: "address", type: "address" }],
    name: "changeGovernor",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "governor",
    outputs: [{ name: "", internalType: "address", type: "address" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_governor", internalType: "address", type: "address" }],
    name: "initialize",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "proxiableUUID",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "_templateTag", internalType: "string", type: "string" },
      { name: "_templateData", internalType: "string", type: "string" },
      { name: "_templateDataMappings", internalType: "string", type: "string" },
    ],
    name: "setDisputeTemplate",
    outputs: [{ name: "templateId", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "templates",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
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
  {
    stateMutability: "nonpayable",
    type: "constructor",
    inputs: [
      { name: "_implementation", internalType: "address", type: "address" },
      { name: "_data", internalType: "bytes", type: "bytes" },
    ],
  },
] as const;

/**
 * [__View Contract on Gnosis Chiado Blockscout__](https://blockscout.chiadochain.net/address/0x96E49552669ea81B8E9cE8694F7E4A55D8bFb957)
 */
export const disputeTemplateRegistryAddress = {
  10200: "0x96E49552669ea81B8E9cE8694F7E4A55D8bFb957",
  421614: "0x596D3B09E684D62217682216e9b7a0De75933391",
} as const;

/**
 * [__View Contract on Gnosis Chiado Blockscout__](https://blockscout.chiadochain.net/address/0x96E49552669ea81B8E9cE8694F7E4A55D8bFb957)
 */
export const disputeTemplateRegistryConfig = {
  address: disputeTemplateRegistryAddress,
  abi: disputeTemplateRegistryABI,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DisputeTemplateRegistry_Implementation
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const disputeTemplateRegistryImplementationABI = [
  { stateMutability: "nonpayable", type: "constructor", inputs: [] },
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
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_governor", internalType: "address", type: "address" }],
    name: "changeGovernor",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "governor",
    outputs: [{ name: "", internalType: "address", type: "address" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_governor", internalType: "address", type: "address" }],
    name: "initialize",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "proxiableUUID",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "_templateTag", internalType: "string", type: "string" },
      { name: "_templateData", internalType: "string", type: "string" },
      { name: "_templateDataMappings", internalType: "string", type: "string" },
    ],
    name: "setDisputeTemplate",
    outputs: [{ name: "templateId", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "templates",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
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
] as const;

/**
 *
 */
export const disputeTemplateRegistryImplementationAddress = {
  421614: "0xc53b813ed94AaEb6F5518D60bf6a8109954bE3f6",
} as const;

/**
 *
 */
export const disputeTemplateRegistryImplementationConfig = {
  address: disputeTemplateRegistryImplementationAddress,
  abi: disputeTemplateRegistryImplementationABI,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DisputeTemplateRegistry_Proxy
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const disputeTemplateRegistryProxyABI = [
  {
    stateMutability: "nonpayable",
    type: "constructor",
    inputs: [
      { name: "_implementation", internalType: "address", type: "address" },
      { name: "_data", internalType: "bytes", type: "bytes" },
    ],
  },
  { stateMutability: "payable", type: "fallback" },
  { stateMutability: "payable", type: "receive" },
] as const;

/**
 *
 */
export const disputeTemplateRegistryProxyAddress = {
  421614: "0x596D3B09E684D62217682216e9b7a0De75933391",
} as const;

/**
 *
 */
export const disputeTemplateRegistryProxyConfig = {
  address: disputeTemplateRegistryProxyAddress,
  abi: disputeTemplateRegistryProxyABI,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Escrow
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const escrowABI = [
  {
    stateMutability: "nonpayable",
    type: "constructor",
    inputs: [
      {
        name: "_arbitrator",
        internalType: "contract IArbitratorV2",
        type: "address",
      },
      { name: "_arbitratorExtraData", internalType: "bytes", type: "bytes" },
      { name: "_templateData", internalType: "string", type: "string" },
      { name: "_templateDataMappings", internalType: "string", type: "string" },
      {
        name: "_templateRegistry",
        internalType: "contract IDisputeTemplateRegistry",
        type: "address",
      },
      { name: "_feeTimeout", internalType: "uint256", type: "uint256" },
    ],
  },
  { type: "error", inputs: [], name: "ArbitratorOnly" },
  { type: "error", inputs: [], name: "BuyerFeeNotCoverArbitrationCosts" },
  { type: "error", inputs: [], name: "BuyerOnly" },
  { type: "error", inputs: [], name: "DeadlineNotPassed" },
  {
    type: "error",
    inputs: [],
    name: "DisputeAlreadyCreatedOrTransactionAlreadyExecuted",
  },
  { type: "error", inputs: [], name: "DisputeAlreadyResolved" },
  { type: "error", inputs: [], name: "GovernorOnly" },
  { type: "error", inputs: [], name: "InvalidRuling" },
  { type: "error", inputs: [], name: "MaximumPaymentAmountExceeded" },
  { type: "error", inputs: [], name: "NotWaitingForBuyerFees" },
  { type: "error", inputs: [], name: "NotWaitingForSellerFees" },
  { type: "error", inputs: [], name: "SellerFeeNotCoverArbitrationCosts" },
  { type: "error", inputs: [], name: "SellerOnly" },
  { type: "error", inputs: [], name: "TimeoutNotPassed" },
  { type: "error", inputs: [], name: "TransactionDisputed" },
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
        name: "_transactionID",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "_party",
        internalType: "enum Escrow.Party",
        type: "uint8",
        indexed: false,
      },
    ],
    name: "HasToPayFee",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "_transactionID",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "_amount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "_party",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "Payment",
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
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "_transactionID",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "_buyer",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "_seller",
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
    name: "TransactionCreated",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "_transactionID",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "_resolution",
        internalType: "enum Escrow.Resolution",
        type: "uint8",
        indexed: true,
      },
    ],
    name: "TransactionResolved",
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "AMOUNT_OF_CHOICES",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "arbitrator",
    outputs: [{ name: "", internalType: "contract IArbitratorV2", type: "address" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "arbitratorExtraData",
    outputs: [{ name: "", internalType: "bytes", type: "bytes" }],
  },
  {
    stateMutability: "nonpayable",
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
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_arbitratorExtraData", internalType: "bytes", type: "bytes" }],
    name: "changeArbitratorExtraData",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "_templateData", internalType: "string", type: "string" },
      { name: "_templateDataMappings", internalType: "string", type: "string" },
    ],
    name: "changeDisputeTemplate",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
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
  },
  {
    stateMutability: "payable",
    type: "function",
    inputs: [
      { name: "_timeoutPayment", internalType: "uint256", type: "uint256" },
      { name: "_seller", internalType: "address payable", type: "address" },
      { name: "_templateData", internalType: "string", type: "string" },
      { name: "_templateDataMappings", internalType: "string", type: "string" },
    ],
    name: "createTransaction",
    outputs: [{ name: "transactionID", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    name: "disputeIDtoTransactionID",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_transactionID", internalType: "uint256", type: "uint256" }],
    name: "executeTransaction",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "feeTimeout",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "getCountTransactions",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "governor",
    outputs: [{ name: "", internalType: "address", type: "address" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "_transactionID", internalType: "uint256", type: "uint256" },
      { name: "_amount", internalType: "uint256", type: "uint256" },
    ],
    name: "pay",
    outputs: [],
  },
  {
    stateMutability: "payable",
    type: "function",
    inputs: [{ name: "_transactionID", internalType: "uint256", type: "uint256" }],
    name: "payArbitrationFeeByBuyer",
    outputs: [],
  },
  {
    stateMutability: "payable",
    type: "function",
    inputs: [{ name: "_transactionID", internalType: "uint256", type: "uint256" }],
    name: "payArbitrationFeeBySeller",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "_transactionID", internalType: "uint256", type: "uint256" },
      { name: "_amountReimbursed", internalType: "uint256", type: "uint256" },
    ],
    name: "reimburse",
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
    name: "templateId",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
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
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_transactionID", internalType: "uint256", type: "uint256" }],
    name: "timeOutByBuyer",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_transactionID", internalType: "uint256", type: "uint256" }],
    name: "timeOutBySeller",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    name: "transactions",
    outputs: [
      { name: "buyer", internalType: "address payable", type: "address" },
      { name: "seller", internalType: "address payable", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "deadline", internalType: "uint256", type: "uint256" },
      { name: "disputeID", internalType: "uint256", type: "uint256" },
      { name: "buyerFee", internalType: "uint256", type: "uint256" },
      { name: "sellerFee", internalType: "uint256", type: "uint256" },
      { name: "lastFeePaymentTime", internalType: "uint256", type: "uint256" },
      { name: "templateData", internalType: "string", type: "string" },
      { name: "templateDataMappings", internalType: "string", type: "string" },
      { name: "status", internalType: "enum Escrow.Status", type: "uint8" },
    ],
  },
] as const;

/**
 *
 */
export const escrowAddress = {
  421614: "0xdaf749DABE7be6C6894950AE69af35c20a00ABd9",
} as const;

/**
 *
 */
export const escrowConfig = { address: escrowAddress, abi: escrowABI } as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// EvidenceModule
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const evidenceModuleABI = [
  { stateMutability: "payable", type: "fallback" },
  { stateMutability: "payable", type: "receive" },
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
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "governor",
    outputs: [{ name: "", internalType: "address", type: "address" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_governor", internalType: "address", type: "address" }],
    name: "initialize",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "proxiableUUID",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "_externalDisputeID", internalType: "uint256", type: "uint256" },
      { name: "_evidence", internalType: "string", type: "string" },
    ],
    name: "submitEvidence",
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
  {
    stateMutability: "nonpayable",
    type: "constructor",
    inputs: [
      { name: "_implementation", internalType: "address", type: "address" },
      { name: "_data", internalType: "bytes", type: "bytes" },
    ],
  },
] as const;

/**
 *
 */
export const evidenceModuleAddress = {
  421614: "0x57fd453FB0d16f8ca174E7386102D7170E17Be09",
} as const;

/**
 *
 */
export const evidenceModuleConfig = {
  address: evidenceModuleAddress,
  abi: evidenceModuleABI,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// EvidenceModule_Implementation
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const evidenceModuleImplementationABI = [
  { stateMutability: "nonpayable", type: "constructor", inputs: [] },
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
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "governor",
    outputs: [{ name: "", internalType: "address", type: "address" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_governor", internalType: "address", type: "address" }],
    name: "initialize",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "proxiableUUID",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "_externalDisputeID", internalType: "uint256", type: "uint256" },
      { name: "_evidence", internalType: "string", type: "string" },
    ],
    name: "submitEvidence",
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
] as const;

/**
 *
 */
export const evidenceModuleImplementationAddress = {
  421614: "0x05AD81f245209b7f91885fd96e57c9da90554824",
} as const;

/**
 *
 */
export const evidenceModuleImplementationConfig = {
  address: evidenceModuleImplementationAddress,
  abi: evidenceModuleImplementationABI,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// EvidenceModule_Proxy
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const evidenceModuleProxyABI = [
  {
    stateMutability: "nonpayable",
    type: "constructor",
    inputs: [
      { name: "_implementation", internalType: "address", type: "address" },
      { name: "_data", internalType: "bytes", type: "bytes" },
    ],
  },
  { stateMutability: "payable", type: "fallback" },
  { stateMutability: "payable", type: "receive" },
] as const;

/**
 *
 */
export const evidenceModuleProxyAddress = {
  421614: "0x57fd453FB0d16f8ca174E7386102D7170E17Be09",
} as const;

/**
 *
 */
export const evidenceModuleProxyConfig = {
  address: evidenceModuleProxyAddress,
  abi: evidenceModuleProxyABI,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ForeignGatewayOnGnosis
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Gnosis Chiado Blockscout__](https://blockscout.chiadochain.net/address/0x078dAd05373d19d7fd6829735b765F12242a4300)
 */
export const foreignGatewayOnGnosisABI = [
  { stateMutability: "payable", type: "fallback" },
  { stateMutability: "payable", type: "receive" },
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
        name: "_courtID",
        internalType: "uint96",
        type: "uint96",
        indexed: true,
      },
      {
        name: "_feeForJuror",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "ArbitrationCostModified",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "_foreignBlockHash",
        internalType: "bytes32",
        type: "bytes32",
        indexed: false,
      },
      {
        name: "_foreignArbitrable",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "_foreignDisputeID",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "_choices",
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
    name: "CrossChainDisputeOutgoing",
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
        name: "newImplementation",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "Upgraded",
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "DEFAULT_NB_OF_JURORS",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "pure",
    type: "function",
    inputs: [
      { name: "", internalType: "bytes", type: "bytes" },
      { name: "", internalType: "contract IERC20", type: "address" },
    ],
    name: "arbitrationCost",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "_extraData", internalType: "bytes", type: "bytes" }],
    name: "arbitrationCost",
    outputs: [{ name: "cost", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "_courtID", internalType: "uint96", type: "uint96" },
      { name: "_feeForJuror", internalType: "uint256", type: "uint256" },
    ],
    name: "changeCourtJurorFee",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_governor", internalType: "address", type: "address" }],
    name: "changeGovernor",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_homeGateway", internalType: "address", type: "address" }],
    name: "changeHomeGateway",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "_veaOutbox", internalType: "address", type: "address" },
      { name: "_gracePeriod", internalType: "uint256", type: "uint256" },
    ],
    name: "changeVea",
    outputs: [],
  },
  {
    stateMutability: "payable",
    type: "function",
    inputs: [
      { name: "_choices", internalType: "uint256", type: "uint256" },
      { name: "_extraData", internalType: "bytes", type: "bytes" },
    ],
    name: "createDispute",
    outputs: [{ name: "disputeID", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "pure",
    type: "function",
    inputs: [
      { name: "", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "bytes", type: "bytes" },
      { name: "", internalType: "contract IERC20", type: "address" },
      { name: "", internalType: "uint256", type: "uint256" },
    ],
    name: "createDispute",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "pure",
    type: "function",
    inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    name: "currentRuling",
    outputs: [
      { name: "", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "bool", type: "bool" },
      { name: "", internalType: "bool", type: "bool" },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "deprecatedVeaOutbox",
    outputs: [{ name: "", internalType: "address", type: "address" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "deprecatedVeaOutboxExpiration",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "_disputeHash", internalType: "bytes32", type: "bytes32" }],
    name: "disputeHashToForeignID",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    name: "disputeHashtoDisputeData",
    outputs: [
      { name: "id", internalType: "uint248", type: "uint248" },
      { name: "ruled", internalType: "bool", type: "bool" },
      { name: "arbitrable", internalType: "address", type: "address" },
      { name: "paid", internalType: "uint256", type: "uint256" },
      { name: "relayer", internalType: "address", type: "address" },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "", internalType: "uint96", type: "uint96" }],
    name: "feeForJuror",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "governor",
    outputs: [{ name: "", internalType: "address", type: "address" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "homeChainID",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "homeGateway",
    outputs: [{ name: "", internalType: "address", type: "address" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "_governor", internalType: "address", type: "address" },
      { name: "_veaOutbox", internalType: "address", type: "address" },
      { name: "_homeChainID", internalType: "uint256", type: "uint256" },
      { name: "_homeGateway", internalType: "address", type: "address" },
    ],
    name: "initialize",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "proxiableUUID",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "_messageSender", internalType: "address", type: "address" },
      { name: "_disputeHash", internalType: "bytes32", type: "bytes32" },
      { name: "_ruling", internalType: "uint256", type: "uint256" },
      { name: "_relayer", internalType: "address", type: "address" },
    ],
    name: "relayRule",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "senderGateway",
    outputs: [{ name: "", internalType: "address", type: "address" }],
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
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "veaOutbox",
    outputs: [{ name: "", internalType: "address", type: "address" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_disputeHash", internalType: "bytes32", type: "bytes32" }],
    name: "withdrawFees",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "constructor",
    inputs: [
      { name: "_implementation", internalType: "address", type: "address" },
      { name: "_data", internalType: "bytes", type: "bytes" },
    ],
  },
] as const;

/**
 * [__View Contract on Gnosis Chiado Blockscout__](https://blockscout.chiadochain.net/address/0x078dAd05373d19d7fd6829735b765F12242a4300)
 */
export const foreignGatewayOnGnosisAddress = {
  10200: "0x078dAd05373d19d7fd6829735b765F12242a4300",
} as const;

/**
 * [__View Contract on Gnosis Chiado Blockscout__](https://blockscout.chiadochain.net/address/0x078dAd05373d19d7fd6829735b765F12242a4300)
 */
export const foreignGatewayOnGnosisConfig = {
  address: foreignGatewayOnGnosisAddress,
  abi: foreignGatewayOnGnosisABI,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ForeignGatewayOnGnosis_Implementation
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Gnosis Chiado Blockscout__](https://blockscout.chiadochain.net/address/0xA4096fDA5291D5bbDD5Ed0D6CF2AF98229168Ace)
 */
export const foreignGatewayOnGnosisImplementationABI = [
  { stateMutability: "nonpayable", type: "constructor", inputs: [] },
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
        name: "_courtID",
        internalType: "uint96",
        type: "uint96",
        indexed: true,
      },
      {
        name: "_feeForJuror",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "ArbitrationCostModified",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "_foreignBlockHash",
        internalType: "bytes32",
        type: "bytes32",
        indexed: false,
      },
      {
        name: "_foreignArbitrable",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "_foreignDisputeID",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "_choices",
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
    name: "CrossChainDisputeOutgoing",
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
        name: "newImplementation",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "Upgraded",
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "DEFAULT_NB_OF_JURORS",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "pure",
    type: "function",
    inputs: [
      { name: "", internalType: "bytes", type: "bytes" },
      { name: "", internalType: "contract IERC20", type: "address" },
    ],
    name: "arbitrationCost",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "_extraData", internalType: "bytes", type: "bytes" }],
    name: "arbitrationCost",
    outputs: [{ name: "cost", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "_courtID", internalType: "uint96", type: "uint96" },
      { name: "_feeForJuror", internalType: "uint256", type: "uint256" },
    ],
    name: "changeCourtJurorFee",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_governor", internalType: "address", type: "address" }],
    name: "changeGovernor",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_homeGateway", internalType: "address", type: "address" }],
    name: "changeHomeGateway",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "_veaOutbox", internalType: "address", type: "address" },
      { name: "_gracePeriod", internalType: "uint256", type: "uint256" },
    ],
    name: "changeVea",
    outputs: [],
  },
  {
    stateMutability: "payable",
    type: "function",
    inputs: [
      { name: "_choices", internalType: "uint256", type: "uint256" },
      { name: "_extraData", internalType: "bytes", type: "bytes" },
    ],
    name: "createDispute",
    outputs: [{ name: "disputeID", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "pure",
    type: "function",
    inputs: [
      { name: "", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "bytes", type: "bytes" },
      { name: "", internalType: "contract IERC20", type: "address" },
      { name: "", internalType: "uint256", type: "uint256" },
    ],
    name: "createDispute",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "pure",
    type: "function",
    inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    name: "currentRuling",
    outputs: [
      { name: "", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "bool", type: "bool" },
      { name: "", internalType: "bool", type: "bool" },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "deprecatedVeaOutbox",
    outputs: [{ name: "", internalType: "address", type: "address" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "deprecatedVeaOutboxExpiration",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "_disputeHash", internalType: "bytes32", type: "bytes32" }],
    name: "disputeHashToForeignID",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    name: "disputeHashtoDisputeData",
    outputs: [
      { name: "id", internalType: "uint248", type: "uint248" },
      { name: "ruled", internalType: "bool", type: "bool" },
      { name: "arbitrable", internalType: "address", type: "address" },
      { name: "paid", internalType: "uint256", type: "uint256" },
      { name: "relayer", internalType: "address", type: "address" },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "", internalType: "uint96", type: "uint96" }],
    name: "feeForJuror",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "governor",
    outputs: [{ name: "", internalType: "address", type: "address" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "homeChainID",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "homeGateway",
    outputs: [{ name: "", internalType: "address", type: "address" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "_governor", internalType: "address", type: "address" },
      { name: "_veaOutbox", internalType: "address", type: "address" },
      { name: "_homeChainID", internalType: "uint256", type: "uint256" },
      { name: "_homeGateway", internalType: "address", type: "address" },
    ],
    name: "initialize",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "proxiableUUID",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "_messageSender", internalType: "address", type: "address" },
      { name: "_disputeHash", internalType: "bytes32", type: "bytes32" },
      { name: "_ruling", internalType: "uint256", type: "uint256" },
      { name: "_relayer", internalType: "address", type: "address" },
    ],
    name: "relayRule",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "senderGateway",
    outputs: [{ name: "", internalType: "address", type: "address" }],
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
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "veaOutbox",
    outputs: [{ name: "", internalType: "address", type: "address" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_disputeHash", internalType: "bytes32", type: "bytes32" }],
    name: "withdrawFees",
    outputs: [],
  },
] as const;

/**
 * [__View Contract on Gnosis Chiado Blockscout__](https://blockscout.chiadochain.net/address/0xA4096fDA5291D5bbDD5Ed0D6CF2AF98229168Ace)
 */
export const foreignGatewayOnGnosisImplementationAddress = {
  10200: "0xA4096fDA5291D5bbDD5Ed0D6CF2AF98229168Ace",
} as const;

/**
 * [__View Contract on Gnosis Chiado Blockscout__](https://blockscout.chiadochain.net/address/0xA4096fDA5291D5bbDD5Ed0D6CF2AF98229168Ace)
 */
export const foreignGatewayOnGnosisImplementationConfig = {
  address: foreignGatewayOnGnosisImplementationAddress,
  abi: foreignGatewayOnGnosisImplementationABI,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ForeignGatewayOnGnosis_Proxy
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Gnosis Chiado Blockscout__](https://blockscout.chiadochain.net/address/0x078dAd05373d19d7fd6829735b765F12242a4300)
 */
export const foreignGatewayOnGnosisProxyABI = [
  {
    stateMutability: "nonpayable",
    type: "constructor",
    inputs: [
      { name: "_implementation", internalType: "address", type: "address" },
      { name: "_data", internalType: "bytes", type: "bytes" },
    ],
  },
  { stateMutability: "payable", type: "fallback" },
  { stateMutability: "payable", type: "receive" },
] as const;

/**
 * [__View Contract on Gnosis Chiado Blockscout__](https://blockscout.chiadochain.net/address/0x078dAd05373d19d7fd6829735b765F12242a4300)
 */
export const foreignGatewayOnGnosisProxyAddress = {
  10200: "0x078dAd05373d19d7fd6829735b765F12242a4300",
} as const;

/**
 * [__View Contract on Gnosis Chiado Blockscout__](https://blockscout.chiadochain.net/address/0x078dAd05373d19d7fd6829735b765F12242a4300)
 */
export const foreignGatewayOnGnosisProxyConfig = {
  address: foreignGatewayOnGnosisProxyAddress,
  abi: foreignGatewayOnGnosisProxyABI,
} as const;

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
// KlerosCore
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const klerosCoreABI = [
  { stateMutability: "payable", type: "fallback" },
  { stateMutability: "payable", type: "receive" },
  { type: "error", inputs: [], name: "AlreadyInitialized" },
  { type: "error", inputs: [], name: "AppealFeesNotEnough" },
  { type: "error", inputs: [], name: "AppealPeriodNotPassed" },
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
  { type: "error", inputs: [], name: "InvalidDisputKitParent" },
  { type: "error", inputs: [], name: "InvalidForkingCourtAsParent" },
  {
    type: "error",
    inputs: [{ name: "implementation", internalType: "address", type: "address" }],
    name: "InvalidImplementation",
  },
  { type: "error", inputs: [], name: "MinStakeLowerThanParentCourt" },
  { type: "error", inputs: [], name: "MustSupportDisputeKitClassic" },
  { type: "error", inputs: [], name: "NotEvidencePeriod" },
  { type: "error", inputs: [], name: "NotExecutionPeriod" },
  { type: "error", inputs: [], name: "NotInitializing" },
  { type: "error", inputs: [], name: "RulingAlreadyExecuted" },
  { type: "error", inputs: [], name: "SortitionModuleOnly" },
  { type: "error", inputs: [], name: "StakingFailed" },
  { type: "error", inputs: [], name: "TokenNotAccepted" },
  { type: "error", inputs: [], name: "TransferFailed" },
  { type: "error", inputs: [], name: "UUPSUnauthorizedCallContext" },
  {
    type: "error",
    inputs: [{ name: "slot", internalType: "bytes32", type: "bytes32" }],
    name: "UUPSUnsupportedProxiableUUID",
  },
  { type: "error", inputs: [], name: "UnsuccessfulCall" },
  { type: "error", inputs: [], name: "UnsupportedDisputeKit" },
  { type: "error", inputs: [], name: "VotePeriodNotPassed" },
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
        internalType: "enum KlerosCore.Period",
        type: "uint8",
        indexed: false,
      },
    ],
    name: "NewPeriod",
  },
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
    stateMutability: "nonpayable",
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
  },
  {
    stateMutability: "payable",
    type: "function",
    inputs: [
      { name: "_disputeID", internalType: "uint256", type: "uint256" },
      { name: "_numberOfChoices", internalType: "uint256", type: "uint256" },
      { name: "_extraData", internalType: "bytes", type: "bytes" },
    ],
    name: "appeal",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "_disputeID", internalType: "uint256", type: "uint256" }],
    name: "appealCost",
    outputs: [{ name: "cost", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "_disputeID", internalType: "uint256", type: "uint256" }],
    name: "appealPeriod",
    outputs: [
      { name: "start", internalType: "uint256", type: "uint256" },
      { name: "end", internalType: "uint256", type: "uint256" },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [
      { name: "_extraData", internalType: "bytes", type: "bytes" },
      { name: "_feeToken", internalType: "contract IERC20", type: "address" },
    ],
    name: "arbitrationCost",
    outputs: [{ name: "cost", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "_extraData", internalType: "bytes", type: "bytes" }],
    name: "arbitrationCost",
    outputs: [{ name: "cost", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "_feeToken", internalType: "contract IERC20", type: "address" },
      { name: "_accepted", internalType: "bool", type: "bool" },
    ],
    name: "changeAcceptedFeeTokens",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
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
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "_feeToken", internalType: "contract IERC20", type: "address" },
      { name: "_rateInEth", internalType: "uint64", type: "uint64" },
      { name: "_rateDecimals", internalType: "uint8", type: "uint8" },
    ],
    name: "changeCurrencyRates",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_governor", internalType: "address payable", type: "address" }],
    name: "changeGovernor",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
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
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_pinakion", internalType: "contract IERC20", type: "address" }],
    name: "changePinakion",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
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
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [
      { name: "_toToken", internalType: "contract IERC20", type: "address" },
      { name: "_amountInEth", internalType: "uint256", type: "uint256" },
    ],
    name: "convertEthToTokenAmount",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
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
  },
  {
    stateMutability: "nonpayable",
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
  },
  {
    stateMutability: "payable",
    type: "function",
    inputs: [
      { name: "_numberOfChoices", internalType: "uint256", type: "uint256" },
      { name: "_extraData", internalType: "bytes", type: "bytes" },
    ],
    name: "createDispute",
    outputs: [{ name: "disputeID", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "_numberOfChoices", internalType: "uint256", type: "uint256" },
      { name: "_extraData", internalType: "bytes", type: "bytes" },
      { name: "_feeToken", internalType: "contract IERC20", type: "address" },
      { name: "_feeAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "createDispute",
    outputs: [{ name: "disputeID", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "", internalType: "contract IERC20", type: "address" }],
    name: "currencyRates",
    outputs: [
      { name: "feePaymentAccepted", internalType: "bool", type: "bool" },
      { name: "rateInEth", internalType: "uint64", type: "uint64" },
      { name: "rateDecimals", internalType: "uint8", type: "uint8" },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "_disputeID", internalType: "uint256", type: "uint256" }],
    name: "currentRuling",
    outputs: [
      { name: "ruling", internalType: "uint256", type: "uint256" },
      { name: "tied", internalType: "bool", type: "bool" },
      { name: "overridden", internalType: "bool", type: "bool" },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    name: "disputeKits",
    outputs: [{ name: "", internalType: "contract IDisputeKit", type: "address" }],
  },
  {
    stateMutability: "view",
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
      { name: "period", internalType: "enum KlerosCore.Period", type: "uint8" },
      { name: "ruled", internalType: "bool", type: "bool" },
      { name: "lastPeriodChange", internalType: "uint256", type: "uint256" },
    ],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "_disputeID", internalType: "uint256", type: "uint256" },
      { name: "_iterations", internalType: "uint256", type: "uint256" },
    ],
    name: "draw",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "_courtID", internalType: "uint96", type: "uint96" },
      { name: "_disputeKitIDs", internalType: "uint256[]", type: "uint256[]" },
      { name: "_enable", internalType: "bool", type: "bool" },
    ],
    name: "enableDisputeKits",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "_disputeID", internalType: "uint256", type: "uint256" },
      { name: "_round", internalType: "uint256", type: "uint256" },
      { name: "_iterations", internalType: "uint256", type: "uint256" },
    ],
    name: "execute",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "_destination", internalType: "address", type: "address" },
      { name: "_amount", internalType: "uint256", type: "uint256" },
      { name: "_data", internalType: "bytes", type: "bytes" },
    ],
    name: "executeGovernorProposal",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_disputeID", internalType: "uint256", type: "uint256" }],
    name: "executeRuling",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "getDisputeKitsLength",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "_disputeID", internalType: "uint256", type: "uint256" }],
    name: "getNumberOfRounds",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "_disputeID", internalType: "uint256", type: "uint256" }],
    name: "getNumberOfVotes",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [
      { name: "_disputeID", internalType: "uint256", type: "uint256" },
      { name: "_round", internalType: "uint256", type: "uint256" },
    ],
    name: "getRoundInfo",
    outputs: [
      {
        name: "",
        internalType: "struct KlerosCore.Round",
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
  },
  {
    stateMutability: "view",
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
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "governor",
    outputs: [{ name: "", internalType: "address", type: "address" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "_governor", internalType: "address", type: "address" },
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
    ],
    name: "initialize",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "_disputeID", internalType: "uint256", type: "uint256" }],
    name: "isDisputeKitJumping",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [
      { name: "_courtID", internalType: "uint96", type: "uint96" },
      { name: "_disputeKitID", internalType: "uint256", type: "uint256" },
    ],
    name: "isSupported",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "jurorProsecutionModule",
    outputs: [{ name: "", internalType: "address", type: "address" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_disputeID", internalType: "uint256", type: "uint256" }],
    name: "passPeriod",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "pinakion",
    outputs: [{ name: "", internalType: "contract IERC20", type: "address" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "proxiableUUID",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "_courtID", internalType: "uint96", type: "uint96" },
      { name: "_newStake", internalType: "uint256", type: "uint256" },
    ],
    name: "setStake",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "_account", internalType: "address", type: "address" },
      { name: "_courtID", internalType: "uint96", type: "uint96" },
      { name: "_newStake", internalType: "uint256", type: "uint256" },
      { name: "_alreadyTransferred", internalType: "bool", type: "bool" },
    ],
    name: "setStakeBySortitionModule",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "sortitionModule",
    outputs: [{ name: "", internalType: "contract ISortitionModule", type: "address" }],
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
  {
    stateMutability: "nonpayable",
    type: "constructor",
    inputs: [
      { name: "_implementation", internalType: "address", type: "address" },
      { name: "_data", internalType: "bytes", type: "bytes" },
    ],
  },
] as const;

/**
 *
 */
export const klerosCoreAddress = {
  421614: "0xA54e7A16d7460e38a8F324eF46782FB520d58CE8",
} as const;

/**
 *
 */
export const klerosCoreConfig = {
  address: klerosCoreAddress,
  abi: klerosCoreABI,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// KlerosCore_Implementation
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const klerosCoreImplementationABI = [
  { stateMutability: "nonpayable", type: "constructor", inputs: [] },
  { type: "error", inputs: [], name: "AlreadyInitialized" },
  { type: "error", inputs: [], name: "AppealFeesNotEnough" },
  { type: "error", inputs: [], name: "AppealPeriodNotPassed" },
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
  { type: "error", inputs: [], name: "InvalidDisputKitParent" },
  { type: "error", inputs: [], name: "InvalidForkingCourtAsParent" },
  {
    type: "error",
    inputs: [{ name: "implementation", internalType: "address", type: "address" }],
    name: "InvalidImplementation",
  },
  { type: "error", inputs: [], name: "MinStakeLowerThanParentCourt" },
  { type: "error", inputs: [], name: "MustSupportDisputeKitClassic" },
  { type: "error", inputs: [], name: "NotEvidencePeriod" },
  { type: "error", inputs: [], name: "NotExecutionPeriod" },
  { type: "error", inputs: [], name: "NotInitializing" },
  { type: "error", inputs: [], name: "RulingAlreadyExecuted" },
  { type: "error", inputs: [], name: "SortitionModuleOnly" },
  { type: "error", inputs: [], name: "StakingFailed" },
  { type: "error", inputs: [], name: "TokenNotAccepted" },
  { type: "error", inputs: [], name: "TransferFailed" },
  { type: "error", inputs: [], name: "UUPSUnauthorizedCallContext" },
  {
    type: "error",
    inputs: [{ name: "slot", internalType: "bytes32", type: "bytes32" }],
    name: "UUPSUnsupportedProxiableUUID",
  },
  { type: "error", inputs: [], name: "UnsuccessfulCall" },
  { type: "error", inputs: [], name: "UnsupportedDisputeKit" },
  { type: "error", inputs: [], name: "VotePeriodNotPassed" },
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
        internalType: "enum KlerosCore.Period",
        type: "uint8",
        indexed: false,
      },
    ],
    name: "NewPeriod",
  },
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
    stateMutability: "nonpayable",
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
  },
  {
    stateMutability: "payable",
    type: "function",
    inputs: [
      { name: "_disputeID", internalType: "uint256", type: "uint256" },
      { name: "_numberOfChoices", internalType: "uint256", type: "uint256" },
      { name: "_extraData", internalType: "bytes", type: "bytes" },
    ],
    name: "appeal",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "_disputeID", internalType: "uint256", type: "uint256" }],
    name: "appealCost",
    outputs: [{ name: "cost", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "_disputeID", internalType: "uint256", type: "uint256" }],
    name: "appealPeriod",
    outputs: [
      { name: "start", internalType: "uint256", type: "uint256" },
      { name: "end", internalType: "uint256", type: "uint256" },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [
      { name: "_extraData", internalType: "bytes", type: "bytes" },
      { name: "_feeToken", internalType: "contract IERC20", type: "address" },
    ],
    name: "arbitrationCost",
    outputs: [{ name: "cost", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "_extraData", internalType: "bytes", type: "bytes" }],
    name: "arbitrationCost",
    outputs: [{ name: "cost", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "_feeToken", internalType: "contract IERC20", type: "address" },
      { name: "_accepted", internalType: "bool", type: "bool" },
    ],
    name: "changeAcceptedFeeTokens",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
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
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "_feeToken", internalType: "contract IERC20", type: "address" },
      { name: "_rateInEth", internalType: "uint64", type: "uint64" },
      { name: "_rateDecimals", internalType: "uint8", type: "uint8" },
    ],
    name: "changeCurrencyRates",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_governor", internalType: "address payable", type: "address" }],
    name: "changeGovernor",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
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
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_pinakion", internalType: "contract IERC20", type: "address" }],
    name: "changePinakion",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
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
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [
      { name: "_toToken", internalType: "contract IERC20", type: "address" },
      { name: "_amountInEth", internalType: "uint256", type: "uint256" },
    ],
    name: "convertEthToTokenAmount",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
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
  },
  {
    stateMutability: "nonpayable",
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
  },
  {
    stateMutability: "payable",
    type: "function",
    inputs: [
      { name: "_numberOfChoices", internalType: "uint256", type: "uint256" },
      { name: "_extraData", internalType: "bytes", type: "bytes" },
    ],
    name: "createDispute",
    outputs: [{ name: "disputeID", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "_numberOfChoices", internalType: "uint256", type: "uint256" },
      { name: "_extraData", internalType: "bytes", type: "bytes" },
      { name: "_feeToken", internalType: "contract IERC20", type: "address" },
      { name: "_feeAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "createDispute",
    outputs: [{ name: "disputeID", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "", internalType: "contract IERC20", type: "address" }],
    name: "currencyRates",
    outputs: [
      { name: "feePaymentAccepted", internalType: "bool", type: "bool" },
      { name: "rateInEth", internalType: "uint64", type: "uint64" },
      { name: "rateDecimals", internalType: "uint8", type: "uint8" },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "_disputeID", internalType: "uint256", type: "uint256" }],
    name: "currentRuling",
    outputs: [
      { name: "ruling", internalType: "uint256", type: "uint256" },
      { name: "tied", internalType: "bool", type: "bool" },
      { name: "overridden", internalType: "bool", type: "bool" },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    name: "disputeKits",
    outputs: [{ name: "", internalType: "contract IDisputeKit", type: "address" }],
  },
  {
    stateMutability: "view",
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
      { name: "period", internalType: "enum KlerosCore.Period", type: "uint8" },
      { name: "ruled", internalType: "bool", type: "bool" },
      { name: "lastPeriodChange", internalType: "uint256", type: "uint256" },
    ],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "_disputeID", internalType: "uint256", type: "uint256" },
      { name: "_iterations", internalType: "uint256", type: "uint256" },
    ],
    name: "draw",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "_courtID", internalType: "uint96", type: "uint96" },
      { name: "_disputeKitIDs", internalType: "uint256[]", type: "uint256[]" },
      { name: "_enable", internalType: "bool", type: "bool" },
    ],
    name: "enableDisputeKits",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "_disputeID", internalType: "uint256", type: "uint256" },
      { name: "_round", internalType: "uint256", type: "uint256" },
      { name: "_iterations", internalType: "uint256", type: "uint256" },
    ],
    name: "execute",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "_destination", internalType: "address", type: "address" },
      { name: "_amount", internalType: "uint256", type: "uint256" },
      { name: "_data", internalType: "bytes", type: "bytes" },
    ],
    name: "executeGovernorProposal",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_disputeID", internalType: "uint256", type: "uint256" }],
    name: "executeRuling",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "getDisputeKitsLength",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "_disputeID", internalType: "uint256", type: "uint256" }],
    name: "getNumberOfRounds",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "_disputeID", internalType: "uint256", type: "uint256" }],
    name: "getNumberOfVotes",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [
      { name: "_disputeID", internalType: "uint256", type: "uint256" },
      { name: "_round", internalType: "uint256", type: "uint256" },
    ],
    name: "getRoundInfo",
    outputs: [
      {
        name: "",
        internalType: "struct KlerosCore.Round",
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
  },
  {
    stateMutability: "view",
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
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "governor",
    outputs: [{ name: "", internalType: "address", type: "address" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "_governor", internalType: "address", type: "address" },
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
    ],
    name: "initialize",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "_disputeID", internalType: "uint256", type: "uint256" }],
    name: "isDisputeKitJumping",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [
      { name: "_courtID", internalType: "uint96", type: "uint96" },
      { name: "_disputeKitID", internalType: "uint256", type: "uint256" },
    ],
    name: "isSupported",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "jurorProsecutionModule",
    outputs: [{ name: "", internalType: "address", type: "address" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_disputeID", internalType: "uint256", type: "uint256" }],
    name: "passPeriod",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "pinakion",
    outputs: [{ name: "", internalType: "contract IERC20", type: "address" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "proxiableUUID",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "_courtID", internalType: "uint96", type: "uint96" },
      { name: "_newStake", internalType: "uint256", type: "uint256" },
    ],
    name: "setStake",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "_account", internalType: "address", type: "address" },
      { name: "_courtID", internalType: "uint96", type: "uint96" },
      { name: "_newStake", internalType: "uint256", type: "uint256" },
      { name: "_alreadyTransferred", internalType: "bool", type: "bool" },
    ],
    name: "setStakeBySortitionModule",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "sortitionModule",
    outputs: [{ name: "", internalType: "contract ISortitionModule", type: "address" }],
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
] as const;

/**
 *
 */
export const klerosCoreImplementationAddress = {
  421614: "0x91a373BBdE0532F86410682F362e2Cf685e95085",
} as const;

/**
 *
 */
export const klerosCoreImplementationConfig = {
  address: klerosCoreImplementationAddress,
  abi: klerosCoreImplementationABI,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// KlerosCore_Proxy
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const klerosCoreProxyABI = [
  {
    stateMutability: "nonpayable",
    type: "constructor",
    inputs: [
      { name: "_implementation", internalType: "address", type: "address" },
      { name: "_data", internalType: "bytes", type: "bytes" },
    ],
  },
  { stateMutability: "payable", type: "fallback" },
  { stateMutability: "payable", type: "receive" },
] as const;

/**
 *
 */
export const klerosCoreProxyAddress = {
  421614: "0xA54e7A16d7460e38a8F324eF46782FB520d58CE8",
} as const;

/**
 *
 */
export const klerosCoreProxyConfig = {
  address: klerosCoreProxyAddress,
  abi: klerosCoreProxyABI,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PNK
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const pnkABI = [
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
 *
 */
export const pnkAddress = {
  421614: "0x34B944D42cAcfC8266955D07A80181D2054aa225",
} as const;

/**
 *
 */
export const pnkConfig = { address: pnkAddress, abi: pnkABI } as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PNKFaucet
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const pnkFaucetABI = [
  {
    stateMutability: "nonpayable",
    type: "constructor",
    inputs: [{ name: "_token", internalType: "contract IERC20", type: "address" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "amount",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "balance",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_amount", internalType: "uint256", type: "uint256" }],
    name: "changeAmount",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_governor", internalType: "address", type: "address" }],
    name: "changeGovernor",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "governor",
    outputs: [{ name: "", internalType: "address", type: "address" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [],
    name: "request",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "token",
    outputs: [{ name: "", internalType: "contract IERC20", type: "address" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [],
    name: "withdraw",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "withdrewAlready",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
  },
] as const;

/**
 *
 */
export const pnkFaucetAddress = {
  421614: "0x7EFE468003Ad6A858b5350CDE0A67bBED58739dD",
} as const;

/**
 *
 */
export const pnkFaucetConfig = {
  address: pnkFaucetAddress,
  abi: pnkFaucetABI,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PinakionV2
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x593e89704D285B0c3fbF157c7CF2537456CE64b5)
 */
export const pinakionV2ABI = [
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
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x593e89704D285B0c3fbF157c7CF2537456CE64b5)
 */
export const pinakionV2Address = {
  421614: "0x34B944D42cAcfC8266955D07A80181D2054aa225",
  11155111: "0x593e89704D285B0c3fbF157c7CF2537456CE64b5",
} as const;

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x593e89704D285B0c3fbF157c7CF2537456CE64b5)
 */
export const pinakionV2Config = {
  address: pinakionV2Address,
  abi: pinakionV2ABI,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PolicyRegistry
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const policyRegistryABI = [
  { stateMutability: "payable", type: "fallback" },
  { stateMutability: "payable", type: "receive" },
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
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_governor", internalType: "address", type: "address" }],
    name: "changeGovernor",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "governor",
    outputs: [{ name: "", internalType: "address", type: "address" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_governor", internalType: "address", type: "address" }],
    name: "initialize",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    name: "policies",
    outputs: [{ name: "", internalType: "string", type: "string" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "proxiableUUID",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "_courtID", internalType: "uint256", type: "uint256" },
      { name: "_courtName", internalType: "string", type: "string" },
      { name: "_policy", internalType: "string", type: "string" },
    ],
    name: "setPolicy",
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
  {
    stateMutability: "nonpayable",
    type: "constructor",
    inputs: [
      { name: "_implementation", internalType: "address", type: "address" },
      { name: "_data", internalType: "bytes", type: "bytes" },
    ],
  },
] as const;

/**
 *
 */
export const policyRegistryAddress = {
  421614: "0x2AC2EdFD336732bc6963f1AD03ED98B22dB949da",
} as const;

/**
 *
 */
export const policyRegistryConfig = {
  address: policyRegistryAddress,
  abi: policyRegistryABI,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PolicyRegistry_Implementation
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const policyRegistryImplementationABI = [
  { stateMutability: "nonpayable", type: "constructor", inputs: [] },
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
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_governor", internalType: "address", type: "address" }],
    name: "changeGovernor",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "governor",
    outputs: [{ name: "", internalType: "address", type: "address" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_governor", internalType: "address", type: "address" }],
    name: "initialize",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    name: "policies",
    outputs: [{ name: "", internalType: "string", type: "string" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "proxiableUUID",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "_courtID", internalType: "uint256", type: "uint256" },
      { name: "_courtName", internalType: "string", type: "string" },
      { name: "_policy", internalType: "string", type: "string" },
    ],
    name: "setPolicy",
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
] as const;

/**
 *
 */
export const policyRegistryImplementationAddress = {
  421614: "0xAA637C9E2831614158d7eB193D03af4a7223C56E",
} as const;

/**
 *
 */
export const policyRegistryImplementationConfig = {
  address: policyRegistryImplementationAddress,
  abi: policyRegistryImplementationABI,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PolicyRegistry_Proxy
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const policyRegistryProxyABI = [
  {
    stateMutability: "nonpayable",
    type: "constructor",
    inputs: [
      { name: "_implementation", internalType: "address", type: "address" },
      { name: "_data", internalType: "bytes", type: "bytes" },
    ],
  },
  { stateMutability: "payable", type: "fallback" },
  { stateMutability: "payable", type: "receive" },
] as const;

/**
 *
 */
export const policyRegistryProxyAddress = {
  421614: "0x2AC2EdFD336732bc6963f1AD03ED98B22dB949da",
} as const;

/**
 *
 */
export const policyRegistryProxyConfig = {
  address: policyRegistryProxyAddress,
  abi: policyRegistryProxyABI,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// RandomizerOracle
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const randomizerOracleABI = [] as const;

/**
 *
 */
export const randomizerOracleAddress = {
  421614: "0xE775D7fde1d0D09ae627C0131040012ccBcC4b9b",
} as const;

/**
 *
 */
export const randomizerOracleConfig = {
  address: randomizerOracleAddress,
  abi: randomizerOracleABI,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// RandomizerRNG
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const randomizerRngABI = [
  { stateMutability: "payable", type: "fallback" },
  { stateMutability: "payable", type: "receive" },
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
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "callbackGasLimit",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_governor", internalType: "address", type: "address" }],
    name: "changeGovernor",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "governor",
    outputs: [{ name: "", internalType: "address", type: "address" }],
  },
  {
    stateMutability: "nonpayable",
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
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "proxiableUUID",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    name: "randomNumbers",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "randomizer",
    outputs: [{ name: "", internalType: "contract IRandomizer", type: "address" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "_id", internalType: "uint256", type: "uint256" },
      { name: "_value", internalType: "bytes32", type: "bytes32" },
    ],
    name: "randomizerCallback",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_amount", internalType: "uint256", type: "uint256" }],
    name: "randomizerWithdraw",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    name: "receiveRandomness",
    outputs: [{ name: "randomNumber", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    name: "requestRandomness",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "requesterToID",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_callbackGasLimit", internalType: "uint256", type: "uint256" }],
    name: "setCallbackGasLimit",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_randomizer", internalType: "address", type: "address" }],
    name: "setRandomizer",
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
  {
    stateMutability: "nonpayable",
    type: "constructor",
    inputs: [
      { name: "_implementation", internalType: "address", type: "address" },
      { name: "_data", internalType: "bytes", type: "bytes" },
    ],
  },
] as const;

/**
 *
 */
export const randomizerRngAddress = {
  421614: "0xA995C172d286f8F4eE137CC662e2844E59Cf4836",
} as const;

/**
 *
 */
export const randomizerRngConfig = {
  address: randomizerRngAddress,
  abi: randomizerRngABI,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// RandomizerRNG_Implementation
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const randomizerRngImplementationABI = [
  { stateMutability: "nonpayable", type: "constructor", inputs: [] },
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
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "callbackGasLimit",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_governor", internalType: "address", type: "address" }],
    name: "changeGovernor",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "governor",
    outputs: [{ name: "", internalType: "address", type: "address" }],
  },
  {
    stateMutability: "nonpayable",
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
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "proxiableUUID",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    name: "randomNumbers",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "randomizer",
    outputs: [{ name: "", internalType: "contract IRandomizer", type: "address" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "_id", internalType: "uint256", type: "uint256" },
      { name: "_value", internalType: "bytes32", type: "bytes32" },
    ],
    name: "randomizerCallback",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_amount", internalType: "uint256", type: "uint256" }],
    name: "randomizerWithdraw",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    name: "receiveRandomness",
    outputs: [{ name: "randomNumber", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    name: "requestRandomness",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "requesterToID",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_callbackGasLimit", internalType: "uint256", type: "uint256" }],
    name: "setCallbackGasLimit",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_randomizer", internalType: "address", type: "address" }],
    name: "setRandomizer",
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
] as const;

/**
 *
 */
export const randomizerRngImplementationAddress = {
  421614: "0xe62B776498F48061ef9425fCEf30F3d1370DB005",
} as const;

/**
 *
 */
export const randomizerRngImplementationConfig = {
  address: randomizerRngImplementationAddress,
  abi: randomizerRngImplementationABI,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// RandomizerRNG_Proxy
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const randomizerRngProxyABI = [
  {
    stateMutability: "nonpayable",
    type: "constructor",
    inputs: [
      { name: "_implementation", internalType: "address", type: "address" },
      { name: "_data", internalType: "bytes", type: "bytes" },
    ],
  },
  { stateMutability: "payable", type: "fallback" },
  { stateMutability: "payable", type: "receive" },
] as const;

/**
 *
 */
export const randomizerRngProxyAddress = {
  421614: "0xA995C172d286f8F4eE137CC662e2844E59Cf4836",
} as const;

/**
 *
 */
export const randomizerRngProxyConfig = {
  address: randomizerRngProxyAddress,
  abi: randomizerRngProxyABI,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SortitionModule
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const sortitionModuleABI = [
  { stateMutability: "payable", type: "fallback" },
  { stateMutability: "payable", type: "receive" },
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
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "DEFAULT_K",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "MAX_STAKE_PATHS",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_maxDrawingTime", internalType: "uint256", type: "uint256" }],
    name: "changeMaxDrawingTime",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_minStakingTime", internalType: "uint256", type: "uint256" }],
    name: "changeMinStakingTime",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "_rng", internalType: "contract RNG", type: "address" },
      { name: "_rngLookahead", internalType: "uint256", type: "uint256" },
    ],
    name: "changeRandomNumberGenerator",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "core",
    outputs: [{ name: "", internalType: "contract KlerosCore", type: "address" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "uint256", type: "uint256" },
    ],
    name: "createDisputeHook",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "_key", internalType: "bytes32", type: "bytes32" },
      { name: "_extraData", internalType: "bytes", type: "bytes" },
    ],
    name: "createTree",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "delayedStakeReadIndex",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "delayedStakeWriteIndex",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    name: "delayedStakes",
    outputs: [
      { name: "account", internalType: "address", type: "address" },
      { name: "courtID", internalType: "uint96", type: "uint96" },
      { name: "stake", internalType: "uint256", type: "uint256" },
      { name: "alreadyTransferred", internalType: "bool", type: "bool" },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "disputesWithoutJurors",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [
      { name: "_key", internalType: "bytes32", type: "bytes32" },
      { name: "_coreDisputeID", internalType: "uint256", type: "uint256" },
      { name: "_nonce", internalType: "uint256", type: "uint256" },
    ],
    name: "draw",
    outputs: [{ name: "drawnAddress", internalType: "address", type: "address" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_iterations", internalType: "uint256", type: "uint256" }],
    name: "executeDelayedStakes",
    outputs: [],
  },
  {
    stateMutability: "view",
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
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "_juror", internalType: "address", type: "address" }],
    name: "getJurorCourtIDs",
    outputs: [{ name: "", internalType: "uint96[]", type: "uint96[]" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "governor",
    outputs: [{ name: "", internalType: "address", type: "address" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "_governor", internalType: "address", type: "address" },
      { name: "_core", internalType: "contract KlerosCore", type: "address" },
      { name: "_minStakingTime", internalType: "uint256", type: "uint256" },
      { name: "_maxDrawingTime", internalType: "uint256", type: "uint256" },
      { name: "_rng", internalType: "contract RNG", type: "address" },
      { name: "_rngLookahead", internalType: "uint256", type: "uint256" },
    ],
    name: "initialize",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "_juror", internalType: "address", type: "address" }],
    name: "isJurorStaked",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "jurors",
    outputs: [
      { name: "stakedPnk", internalType: "uint256", type: "uint256" },
      { name: "lockedPnk", internalType: "uint256", type: "uint256" },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "lastPhaseChange",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [
      { name: "", internalType: "address", type: "address" },
      { name: "", internalType: "uint96", type: "uint96" },
    ],
    name: "latestDelayedStakeIndex",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "_account", internalType: "address", type: "address" },
      { name: "_relativeAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "lockStake",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "maxDrawingTime",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "minStakingTime",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_randomNumber", internalType: "uint256", type: "uint256" }],
    name: "notifyRandomNumber",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [],
    name: "passPhase",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "_account", internalType: "address", type: "address" },
      { name: "_relativeAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "penalizeStake",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "phase",
    outputs: [{ name: "", internalType: "enum ISortitionModule.Phase", type: "uint8" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "uint256", type: "uint256" },
    ],
    name: "postDrawHook",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "proxiableUUID",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "randomNumber",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "randomNumberRequestBlock",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "rng",
    outputs: [{ name: "", internalType: "contract RNG", type: "address" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "rngLookahead",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_account", internalType: "address", type: "address" }],
    name: "setJurorInactive",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
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
      { name: "succeeded", internalType: "bool", type: "bool" },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [
      { name: "_key", internalType: "bytes32", type: "bytes32" },
      { name: "_ID", internalType: "bytes32", type: "bytes32" },
    ],
    name: "stakeOf",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [
      { name: "_juror", internalType: "address", type: "address" },
      { name: "_courtID", internalType: "uint96", type: "uint96" },
    ],
    name: "stakeOf",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "_account", internalType: "address", type: "address" },
      { name: "_relativeAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "unlockStake",
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
  {
    stateMutability: "nonpayable",
    type: "constructor",
    inputs: [
      { name: "_implementation", internalType: "address", type: "address" },
      { name: "_data", internalType: "bytes", type: "bytes" },
    ],
  },
] as const;

/**
 *
 */
export const sortitionModuleAddress = {
  421614: "0x19cb28BAB40C3585955798f5EEabd71Eec14471C",
} as const;

/**
 *
 */
export const sortitionModuleConfig = {
  address: sortitionModuleAddress,
  abi: sortitionModuleABI,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SortitionModule_Implementation
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const sortitionModuleImplementationABI = [
  { stateMutability: "nonpayable", type: "constructor", inputs: [] },
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
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "DEFAULT_K",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "MAX_STAKE_PATHS",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_maxDrawingTime", internalType: "uint256", type: "uint256" }],
    name: "changeMaxDrawingTime",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_minStakingTime", internalType: "uint256", type: "uint256" }],
    name: "changeMinStakingTime",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "_rng", internalType: "contract RNG", type: "address" },
      { name: "_rngLookahead", internalType: "uint256", type: "uint256" },
    ],
    name: "changeRandomNumberGenerator",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "core",
    outputs: [{ name: "", internalType: "contract KlerosCore", type: "address" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "uint256", type: "uint256" },
    ],
    name: "createDisputeHook",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "_key", internalType: "bytes32", type: "bytes32" },
      { name: "_extraData", internalType: "bytes", type: "bytes" },
    ],
    name: "createTree",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "delayedStakeReadIndex",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "delayedStakeWriteIndex",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    name: "delayedStakes",
    outputs: [
      { name: "account", internalType: "address", type: "address" },
      { name: "courtID", internalType: "uint96", type: "uint96" },
      { name: "stake", internalType: "uint256", type: "uint256" },
      { name: "alreadyTransferred", internalType: "bool", type: "bool" },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "disputesWithoutJurors",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [
      { name: "_key", internalType: "bytes32", type: "bytes32" },
      { name: "_coreDisputeID", internalType: "uint256", type: "uint256" },
      { name: "_nonce", internalType: "uint256", type: "uint256" },
    ],
    name: "draw",
    outputs: [{ name: "drawnAddress", internalType: "address", type: "address" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_iterations", internalType: "uint256", type: "uint256" }],
    name: "executeDelayedStakes",
    outputs: [],
  },
  {
    stateMutability: "view",
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
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "_juror", internalType: "address", type: "address" }],
    name: "getJurorCourtIDs",
    outputs: [{ name: "", internalType: "uint96[]", type: "uint96[]" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "governor",
    outputs: [{ name: "", internalType: "address", type: "address" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "_governor", internalType: "address", type: "address" },
      { name: "_core", internalType: "contract KlerosCore", type: "address" },
      { name: "_minStakingTime", internalType: "uint256", type: "uint256" },
      { name: "_maxDrawingTime", internalType: "uint256", type: "uint256" },
      { name: "_rng", internalType: "contract RNG", type: "address" },
      { name: "_rngLookahead", internalType: "uint256", type: "uint256" },
    ],
    name: "initialize",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "_juror", internalType: "address", type: "address" }],
    name: "isJurorStaked",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "jurors",
    outputs: [
      { name: "stakedPnk", internalType: "uint256", type: "uint256" },
      { name: "lockedPnk", internalType: "uint256", type: "uint256" },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "lastPhaseChange",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [
      { name: "", internalType: "address", type: "address" },
      { name: "", internalType: "uint96", type: "uint96" },
    ],
    name: "latestDelayedStakeIndex",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "_account", internalType: "address", type: "address" },
      { name: "_relativeAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "lockStake",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "maxDrawingTime",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "minStakingTime",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_randomNumber", internalType: "uint256", type: "uint256" }],
    name: "notifyRandomNumber",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [],
    name: "passPhase",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "_account", internalType: "address", type: "address" },
      { name: "_relativeAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "penalizeStake",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "phase",
    outputs: [{ name: "", internalType: "enum ISortitionModule.Phase", type: "uint8" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "uint256", type: "uint256" },
    ],
    name: "postDrawHook",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "proxiableUUID",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "randomNumber",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "randomNumberRequestBlock",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "rng",
    outputs: [{ name: "", internalType: "contract RNG", type: "address" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "rngLookahead",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_account", internalType: "address", type: "address" }],
    name: "setJurorInactive",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
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
      { name: "succeeded", internalType: "bool", type: "bool" },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [
      { name: "_key", internalType: "bytes32", type: "bytes32" },
      { name: "_ID", internalType: "bytes32", type: "bytes32" },
    ],
    name: "stakeOf",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [
      { name: "_juror", internalType: "address", type: "address" },
      { name: "_courtID", internalType: "uint96", type: "uint96" },
    ],
    name: "stakeOf",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "_account", internalType: "address", type: "address" },
      { name: "_relativeAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "unlockStake",
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
] as const;

/**
 *
 */
export const sortitionModuleImplementationAddress = {
  421614: "0xBC82B29e5aE8a749D82b7919118Ab7C0D41fA3D3",
} as const;

/**
 *
 */
export const sortitionModuleImplementationConfig = {
  address: sortitionModuleImplementationAddress,
  abi: sortitionModuleImplementationABI,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SortitionModule_Proxy
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const sortitionModuleProxyABI = [
  {
    stateMutability: "nonpayable",
    type: "constructor",
    inputs: [
      { name: "_implementation", internalType: "address", type: "address" },
      { name: "_data", internalType: "bytes", type: "bytes" },
    ],
  },
  { stateMutability: "payable", type: "fallback" },
  { stateMutability: "payable", type: "receive" },
] as const;

/**
 *
 */
export const sortitionModuleProxyAddress = {
  421614: "0x19cb28BAB40C3585955798f5EEabd71Eec14471C",
} as const;

/**
 *
 */
export const sortitionModuleProxyConfig = {
  address: sortitionModuleProxyAddress,
  abi: sortitionModuleProxyABI,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// WETH
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Gnosis Chiado Blockscout__](https://blockscout.chiadochain.net/address/0x2DFC9c3141268e6eac04a7D6d98Fbf64BDe836a8)
 */
export const wethABI = [
  {
    stateMutability: "nonpayable",
    type: "constructor",
    inputs: [
      { name: "_name", internalType: "string", type: "string" },
      { name: "_symbol", internalType: "string", type: "string" },
    ],
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
 * [__View Contract on Gnosis Chiado Blockscout__](https://blockscout.chiadochain.net/address/0x2DFC9c3141268e6eac04a7D6d98Fbf64BDe836a8)
 */
export const wethAddress = {
  10200: "0x2DFC9c3141268e6eac04a7D6d98Fbf64BDe836a8",
  421614: "0x3829A2486d53ee984a0ca2D76552715726b77138",
} as const;

/**
 * [__View Contract on Gnosis Chiado Blockscout__](https://blockscout.chiadochain.net/address/0x2DFC9c3141268e6eac04a7D6d98Fbf64BDe836a8)
 */
export const wethConfig = { address: wethAddress, abi: wethABI } as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// WETHFaucet
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Gnosis Chiado Blockscout__](https://blockscout.chiadochain.net/address/0x22CB016c4b57413ca4DF5F1AC44a0E0d3c69811F)
 */
export const wethFaucetABI = [
  {
    stateMutability: "nonpayable",
    type: "constructor",
    inputs: [{ name: "_token", internalType: "contract IERC20", type: "address" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "amount",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "balance",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_amount", internalType: "uint256", type: "uint256" }],
    name: "changeAmount",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_governor", internalType: "address", type: "address" }],
    name: "changeGovernor",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "governor",
    outputs: [{ name: "", internalType: "address", type: "address" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [],
    name: "request",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "token",
    outputs: [{ name: "", internalType: "contract IERC20", type: "address" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [],
    name: "withdraw",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "withdrewAlready",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
  },
] as const;

/**
 * [__View Contract on Gnosis Chiado Blockscout__](https://blockscout.chiadochain.net/address/0x22CB016c4b57413ca4DF5F1AC44a0E0d3c69811F)
 */
export const wethFaucetAddress = {
  10200: "0x22CB016c4b57413ca4DF5F1AC44a0E0d3c69811F",
  421614: "0x6F8C10E0030aDf5B8030a5E282F026ADdB6525fd",
} as const;

/**
 * [__View Contract on Gnosis Chiado Blockscout__](https://blockscout.chiadochain.net/address/0x22CB016c4b57413ca4DF5F1AC44a0E0d3c69811F)
 */
export const wethFaucetConfig = {
  address: wethFaucetAddress,
  abi: wethFaucetABI,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// WPNKFaucet
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Gnosis Chiado Blockscout__](https://blockscout.chiadochain.net/address/0x5898aeE045A25B276369914c3448B72a41758B2c)
 */
export const wpnkFaucetABI = [
  {
    stateMutability: "nonpayable",
    type: "constructor",
    inputs: [{ name: "_token", internalType: "contract IERC20", type: "address" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "balance",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [],
    name: "request",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "token",
    outputs: [{ name: "", internalType: "contract IERC20", type: "address" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "withdrewAlready",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
  },
] as const;

/**
 * [__View Contract on Gnosis Chiado Blockscout__](https://blockscout.chiadochain.net/address/0x5898aeE045A25B276369914c3448B72a41758B2c)
 */
export const wpnkFaucetAddress = {
  10200: "0x5898aeE045A25B276369914c3448B72a41758B2c",
} as const;

/**
 * [__View Contract on Gnosis Chiado Blockscout__](https://blockscout.chiadochain.net/address/0x5898aeE045A25B276369914c3448B72a41758B2c)
 */
export const wpnkFaucetConfig = {
  address: wpnkFaucetAddress,
  abi: wpnkFaucetABI,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// WrappedPinakionV2
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Gnosis Chiado Blockscout__](https://blockscout.chiadochain.net/address/0xD75E27A56AaF9eE7F8d9A472a8C2EF2f65a764dd)
 */
export const wrappedPinakionV2ABI = [
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
 * [__View Contract on Gnosis Chiado Blockscout__](https://blockscout.chiadochain.net/address/0xD75E27A56AaF9eE7F8d9A472a8C2EF2f65a764dd)
 */
export const wrappedPinakionV2Address = {
  10200: "0xD75E27A56AaF9eE7F8d9A472a8C2EF2f65a764dd",
} as const;

/**
 * [__View Contract on Gnosis Chiado Blockscout__](https://blockscout.chiadochain.net/address/0xD75E27A56AaF9eE7F8d9A472a8C2EF2f65a764dd)
 */
export const wrappedPinakionV2Config = {
  address: wrappedPinakionV2Address,
  abi: wrappedPinakionV2ABI,
} as const;
