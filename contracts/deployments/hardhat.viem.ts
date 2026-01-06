//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ArbitrableExample
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Gnosis Chiado Blockscout__](https://blockscout.chiadochain.net/address/0xB56A23b396E0eae85414Ce5815da448ba529Cb4A)
 */
export const arbitrableExampleAbi = [
  {
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
    stateMutability: "nonpayable",
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
    type: "function",
    inputs: [],
    name: "arbitrator",
    outputs: [{ name: "", internalType: "contract IArbitratorV2", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "arbitratorExtraData",
    outputs: [{ name: "", internalType: "bytes", type: "bytes" }],
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
    inputs: [{ name: "_arbitratorExtraData", internalType: "bytes", type: "bytes" }],
    name: "changeArbitratorExtraData",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_templateData", internalType: "string", type: "string" },
      { name: "_templateDataMappings", internalType: "string", type: "string" },
    ],
    name: "changeDisputeTemplate",
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
      { name: "_action", internalType: "string", type: "string" },
      { name: "_feeInWeth", internalType: "uint256", type: "uint256" },
    ],
    name: "createDispute",
    outputs: [{ name: "disputeID", internalType: "uint256", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "_action", internalType: "string", type: "string" }],
    name: "createDispute",
    outputs: [{ name: "disputeID", internalType: "uint256", type: "uint256" }],
    stateMutability: "payable",
  },
  {
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
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    name: "externalIDtoLocalID",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
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
      { name: "_externalDisputeID", internalType: "uint256", type: "uint256" },
      { name: "_ruling", internalType: "uint256", type: "uint256" },
    ],
    name: "rule",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "templateId",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
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
  {
    type: "function",
    inputs: [],
    name: "weth",
    outputs: [{ name: "", internalType: "contract IERC20", type: "address" }],
    stateMutability: "view",
  },
] as const;

/**
 * [__View Contract on Gnosis Chiado Blockscout__](https://blockscout.chiadochain.net/address/0xB56A23b396E0eae85414Ce5815da448ba529Cb4A)
 */
export const arbitrableExampleAddress = {
  10200: "0xB56A23b396E0eae85414Ce5815da448ba529Cb4A",
} as const;

/**
 * [__View Contract on Gnosis Chiado Blockscout__](https://blockscout.chiadochain.net/address/0xB56A23b396E0eae85414Ce5815da448ba529Cb4A)
 */
export const arbitrableExampleConfig = {
  address: arbitrableExampleAddress,
  abi: arbitrableExampleAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ChainlinkRNG
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const chainlinkRngAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "_owner", internalType: "address", type: "address" },
      { name: "_consumer", internalType: "address", type: "address" },
      { name: "_vrfCoordinator", internalType: "address", type: "address" },
      { name: "_keyHash", internalType: "bytes32", type: "bytes32" },
      { name: "_subscriptionId", internalType: "uint256", type: "uint256" },
      { name: "_requestConfirmations", internalType: "uint16", type: "uint16" },
      { name: "_callbackGasLimit", internalType: "uint32", type: "uint32" },
    ],
    stateMutability: "nonpayable",
  },
  { type: "error", inputs: [], name: "ConsumerOnly" },
  {
    type: "error",
    inputs: [
      { name: "have", internalType: "address", type: "address" },
      { name: "want", internalType: "address", type: "address" },
    ],
    name: "OnlyCoordinatorCanFulfill",
  },
  {
    type: "error",
    inputs: [
      { name: "have", internalType: "address", type: "address" },
      { name: "owner", internalType: "address", type: "address" },
      { name: "coordinator", internalType: "address", type: "address" },
    ],
    name: "OnlyOwnerOrCoordinator",
  },
  { type: "error", inputs: [], name: "OwnerOnly" },
  { type: "error", inputs: [], name: "ZeroAddress" },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "vrfCoordinator",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "CoordinatorSet",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "_requestId",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "_randomWord",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "RequestFulfilled",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "_requestId",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
    ],
    name: "RequestSent",
  },
  {
    type: "function",
    inputs: [],
    name: "callbackGasLimit",
    outputs: [{ name: "", internalType: "uint32", type: "uint32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "_callbackGasLimit", internalType: "uint32", type: "uint32" }],
    name: "changeCallbackGasLimit",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "_consumer", internalType: "address", type: "address" }],
    name: "changeConsumer",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "_keyHash", internalType: "bytes32", type: "bytes32" }],
    name: "changeKeyHash",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "_owner", internalType: "address", type: "address" }],
    name: "changeOwner",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "_requestConfirmations", internalType: "uint16", type: "uint16" }],
    name: "changeRequestConfirmations",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "_subscriptionId", internalType: "uint256", type: "uint256" }],
    name: "changeSubscriptionId",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "_vrfCoordinator", internalType: "address", type: "address" }],
    name: "changeVrfCoordinator",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "consumer",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "keyHash",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "lastRequestId",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
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
    inputs: [{ name: "requestId", internalType: "uint256", type: "uint256" }],
    name: "randomNumbers",
    outputs: [{ name: "number", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "requestId", internalType: "uint256", type: "uint256" },
      { name: "randomWords", internalType: "uint256[]", type: "uint256[]" },
    ],
    name: "rawFulfillRandomWords",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "receiveRandomness",
    outputs: [{ name: "randomNumber", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "requestConfirmations",
    outputs: [{ name: "", internalType: "uint16", type: "uint16" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "requestRandomness",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "s_vrfCoordinator",
    outputs: [
      {
        name: "",
        internalType: "contract IVRFCoordinatorV2Plus",
        type: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "_vrfCoordinator", internalType: "address", type: "address" }],
    name: "setCoordinator",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "subscriptionId",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
] as const;

/**
 *
 */
export const chainlinkRngAddress = {
  1337: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
} as const;

/**
 *
 */
export const chainlinkRngConfig = {
  address: chainlinkRngAddress,
  abi: chainlinkRngAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ChainlinkVRFCoordinator
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const chainlinkVrfCoordinatorAbi = [
  { type: "error", inputs: [], name: "InvalidRandomWords" },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "requestId",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      { name: "success", internalType: "bool", type: "bool", indexed: false },
    ],
    name: "RandomWordsFulfilled",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "keyHash",
        internalType: "bytes32",
        type: "bytes32",
        indexed: true,
      },
      {
        name: "requestId",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "subId",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "minimumRequestConfirmations",
        internalType: "uint16",
        type: "uint16",
        indexed: false,
      },
      {
        name: "callbackGasLimit",
        internalType: "uint32",
        type: "uint32",
        indexed: false,
      },
      {
        name: "numWords",
        internalType: "uint32",
        type: "uint32",
        indexed: false,
      },
      {
        name: "sender",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "RandomWordsRequested",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    name: "acceptSubscriptionOwnerTransfer",
    outputs: [],
    stateMutability: "pure",
  },
  {
    type: "function",
    inputs: [
      { name: "", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "address", type: "address" },
    ],
    name: "addConsumer",
    outputs: [],
    stateMutability: "pure",
  },
  {
    type: "function",
    inputs: [
      { name: "", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "address", type: "address" },
    ],
    name: "cancelSubscription",
    outputs: [],
    stateMutability: "pure",
  },
  {
    type: "function",
    inputs: [],
    name: "createSubscription",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "pure",
  },
  {
    type: "function",
    inputs: [
      { name: "_requestId", internalType: "uint256", type: "uint256" },
      { name: "_consumer", internalType: "address", type: "address" },
      { name: "_words", internalType: "uint256[]", type: "uint256[]" },
    ],
    name: "fulfillRandomWords",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "uint96", type: "uint96" },
    ],
    name: "fundSubscription",
    outputs: [],
    stateMutability: "pure",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    name: "fundSubscriptionWithNative",
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [
      { name: "", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "uint256", type: "uint256" },
    ],
    name: "getActiveSubscriptionIds",
    outputs: [{ name: "", internalType: "uint256[]", type: "uint256[]" }],
    stateMutability: "pure",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    name: "getSubscription",
    outputs: [
      { name: "", internalType: "uint96", type: "uint96" },
      { name: "", internalType: "uint96", type: "uint96" },
      { name: "", internalType: "uint64", type: "uint64" },
      { name: "", internalType: "address", type: "address" },
      { name: "", internalType: "address[]", type: "address[]" },
    ],
    stateMutability: "pure",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    name: "pendingRequestExists",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "pure",
  },
  {
    type: "function",
    inputs: [
      { name: "", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "address", type: "address" },
    ],
    name: "removeConsumer",
    outputs: [],
    stateMutability: "pure",
  },
  {
    type: "function",
    inputs: [
      {
        name: "req",
        internalType: "struct VRFV2PlusClient.RandomWordsRequest",
        type: "tuple",
        components: [
          { name: "keyHash", internalType: "bytes32", type: "bytes32" },
          { name: "subId", internalType: "uint256", type: "uint256" },
          {
            name: "requestConfirmations",
            internalType: "uint16",
            type: "uint16",
          },
          { name: "callbackGasLimit", internalType: "uint32", type: "uint32" },
          { name: "numWords", internalType: "uint32", type: "uint32" },
          { name: "extraArgs", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    name: "requestRandomWords",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "address", type: "address" },
    ],
    name: "requestSubscriptionOwnerTransfer",
    outputs: [],
    stateMutability: "pure",
  },
] as const;

/**
 *
 */
export const chainlinkVrfCoordinatorAddress = {
  1337: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
} as const;

/**
 *
 */
export const chainlinkVrfCoordinatorConfig = {
  address: chainlinkVrfCoordinatorAddress,
  abi: chainlinkVrfCoordinatorAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DAI
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const daiAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "_name", internalType: "string", type: "string" },
      { name: "_symbol", internalType: "string", type: "string" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "error",
    inputs: [
      { name: "spender", internalType: "address", type: "address" },
      { name: "allowance", internalType: "uint256", type: "uint256" },
      { name: "needed", internalType: "uint256", type: "uint256" },
    ],
    name: "ERC20InsufficientAllowance",
  },
  {
    type: "error",
    inputs: [
      { name: "sender", internalType: "address", type: "address" },
      { name: "balance", internalType: "uint256", type: "uint256" },
      { name: "needed", internalType: "uint256", type: "uint256" },
    ],
    name: "ERC20InsufficientBalance",
  },
  {
    type: "error",
    inputs: [{ name: "approver", internalType: "address", type: "address" }],
    name: "ERC20InvalidApprover",
  },
  {
    type: "error",
    inputs: [{ name: "receiver", internalType: "address", type: "address" }],
    name: "ERC20InvalidReceiver",
  },
  {
    type: "error",
    inputs: [{ name: "sender", internalType: "address", type: "address" }],
    name: "ERC20InvalidSender",
  },
  {
    type: "error",
    inputs: [{ name: "spender", internalType: "address", type: "address" }],
    name: "ERC20InvalidSpender",
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
      { name: "value", internalType: "uint256", type: "uint256" },
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
] as const;

/**
 *
 */
export const daiAddress = {
  1337: "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853",
} as const;

/**
 *
 */
export const daiConfig = { address: daiAddress, abi: daiAbi } as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DAIFaucet
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const daiFaucetAbi = [
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
    inputs: [{ name: "_owner", internalType: "address", type: "address" }],
    name: "changeOwner",
    outputs: [],
    stateMutability: "nonpayable",
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
 *
 */
export const daiFaucetAddress = {
  1337: "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6",
} as const;

/**
 *
 */
export const daiFaucetConfig = {
  address: daiFaucetAddress,
  abi: daiFaucetAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DisputeKitClassic
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const disputeKitClassicAbi = [
  { type: "fallback", stateMutability: "payable" },
  { type: "receive", stateMutability: "payable" },
  { type: "error", inputs: [], name: "AlreadyInitialized" },
  { type: "error", inputs: [], name: "AppealFeeIsAlreadyPaid" },
  { type: "error", inputs: [], name: "ChoiceCommitmentMismatch" },
  { type: "error", inputs: [], name: "ChoiceOutOfBounds" },
  { type: "error", inputs: [], name: "CoreIsPaused" },
  { type: "error", inputs: [], name: "DisputeJumpedToAnotherDisputeKit" },
  { type: "error", inputs: [], name: "DisputeNotResolved" },
  { type: "error", inputs: [], name: "DisputeUnknownInThisDisputeKit" },
  { type: "error", inputs: [], name: "EmptyCommit" },
  { type: "error", inputs: [], name: "EmptyVoteIDs" },
  { type: "error", inputs: [], name: "FailedDelegateCall" },
  {
    type: "error",
    inputs: [{ name: "implementation", internalType: "address", type: "address" }],
    name: "InvalidImplementation",
  },
  { type: "error", inputs: [], name: "JurorHasToOwnTheVote" },
  { type: "error", inputs: [], name: "KlerosCoreOnly" },
  { type: "error", inputs: [], name: "NotAppealPeriod" },
  { type: "error", inputs: [], name: "NotAppealPeriodForLoser" },
  { type: "error", inputs: [], name: "NotCommitPeriod" },
  { type: "error", inputs: [], name: "NotInitializing" },
  { type: "error", inputs: [], name: "NotVotePeriod" },
  { type: "error", inputs: [], name: "OwnerOnly" },
  { type: "error", inputs: [], name: "UUPSUnauthorizedCallContext" },
  {
    type: "error",
    inputs: [{ name: "slot", internalType: "bytes32", type: "bytes32" }],
    name: "UUPSUnsupportedProxiableUUID",
  },
  { type: "error", inputs: [], name: "UnsuccessfulCall" },
  { type: "error", inputs: [], name: "VoteAlreadyCast" },
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
        name: "_courtID",
        internalType: "uint96",
        type: "uint96",
        indexed: true,
      },
      {
        name: "_nextRoundSettings",
        internalType: "struct DisputeKitClassicBase.NextRoundSettings",
        type: "tuple",
        components: [
          { name: "enabled", internalType: "bool", type: "bool" },
          { name: "jumpCourtID", internalType: "uint96", type: "uint96" },
          {
            name: "jumpDisputeKitID",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "jumpDisputeKitIDOnCourtJump",
            internalType: "uint256",
            type: "uint256",
          },
          { name: "nbVotes", internalType: "uint256", type: "uint256" },
        ],
        indexed: false,
      },
    ],
    name: "NextRoundSettingsChanged",
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
    inputs: [
      { name: "_courtID", internalType: "uint96", type: "uint96" },
      {
        name: "_nextRoundSettings",
        internalType: "struct DisputeKitClassicBase.NextRoundSettings",
        type: "tuple",
        components: [
          { name: "enabled", internalType: "bool", type: "bool" },
          { name: "jumpCourtID", internalType: "uint96", type: "uint96" },
          {
            name: "jumpDisputeKitID",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "jumpDisputeKitIDOnCourtJump",
            internalType: "uint256",
            type: "uint256",
          },
          { name: "nbVotes", internalType: "uint256", type: "uint256" },
        ],
      },
    ],
    name: "changeNextRoundSettings",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "_owner", internalType: "address payable", type: "address" }],
    name: "changeOwner",
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
    inputs: [{ name: "coreDisputeID", internalType: "uint256", type: "uint256" }],
    name: "coreDisputeIDToActive",
    outputs: [
      { name: "dispute", internalType: "bool", type: "bool" },
      { name: "currentRound", internalType: "bool", type: "bool" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "coreDisputeID", internalType: "uint256", type: "uint256" }],
    name: "coreDisputeIDToLocal",
    outputs: [{ name: "localDisputeID", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "currentCourtID", internalType: "uint96", type: "uint96" }],
    name: "courtIDToNextRoundSettings",
    outputs: [
      { name: "enabled", internalType: "bool", type: "bool" },
      { name: "jumpCourtID", internalType: "uint96", type: "uint96" },
      { name: "jumpDisputeKitID", internalType: "uint256", type: "uint256" },
      {
        name: "jumpDisputeKitIDOnCourtJump",
        internalType: "uint256",
        type: "uint256",
      },
      { name: "nbVotes", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_coreDisputeID", internalType: "uint256", type: "uint256" },
      { name: "_coreRoundID", internalType: "uint256", type: "uint256" },
      { name: "_numberOfChoices", internalType: "uint256", type: "uint256" },
      { name: "_extraData", internalType: "bytes", type: "bytes" },
      { name: "", internalType: "uint256", type: "uint256" },
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
      { name: "extraData", internalType: "bytes", type: "bytes" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_coreDisputeID", internalType: "uint256", type: "uint256" },
      { name: "_nonce", internalType: "uint256", type: "uint256" },
      { name: "_roundNbVotes", internalType: "uint256", type: "uint256" },
    ],
    name: "draw",
    outputs: [
      { name: "drawnAddress", internalType: "address", type: "address" },
      { name: "fromSubcourtID", internalType: "uint96", type: "uint96" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_destination", internalType: "address", type: "address" },
      { name: "_amount", internalType: "uint256", type: "uint256" },
      { name: "_data", internalType: "bytes", type: "bytes" },
    ],
    name: "executeOwnerProposal",
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
    name: "getDegreeOfCoherencePenalty",
    outputs: [{ name: "pnkCoherence", internalType: "uint256", type: "uint256" }],
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
    name: "getDegreeOfCoherenceReward",
    outputs: [
      { name: "pnkCoherence", internalType: "uint256", type: "uint256" },
      { name: "feeCoherence", internalType: "uint256", type: "uint256" },
    ],
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
    ],
    name: "getLocalDisputeRoundID",
    outputs: [
      { name: "localDisputeID", internalType: "uint256", type: "uint256" },
      { name: "localRoundID", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "", internalType: "uint256", type: "uint256" },
      { name: "_currentCourtID", internalType: "uint96", type: "uint96" },
      { name: "_parentCourtID", internalType: "uint96", type: "uint96" },
      {
        name: "_currentCourtJurorsForJump",
        internalType: "uint256",
        type: "uint256",
      },
      {
        name: "_currentDisputeKitID",
        internalType: "uint256",
        type: "uint256",
      },
      {
        name: "_currentRoundNbVotes",
        internalType: "uint256",
        type: "uint256",
      },
    ],
    name: "getNextRoundSettings",
    outputs: [
      { name: "newCourtID", internalType: "uint96", type: "uint96" },
      { name: "newDisputeKitID", internalType: "uint256", type: "uint256" },
      { name: "newRoundNbVotes", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "_localDisputeID", internalType: "uint256", type: "uint256" }],
    name: "getNumberOfRounds",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
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
      { name: "totalCommitted", internalType: "uint256", type: "uint256" },
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
    inputs: [
      { name: "_choice", internalType: "uint256", type: "uint256" },
      { name: "_salt", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "string", type: "string" },
    ],
    name: "hashVote",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_owner", internalType: "address", type: "address" },
      { name: "_core", internalType: "contract KlerosCore", type: "address" },
      { name: "_wNative", internalType: "address", type: "address" },
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "_coreDisputeID", internalType: "uint256", type: "uint256" }],
    name: "isAppealFunded",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
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
    name: "owner",
    outputs: [{ name: "", internalType: "address", type: "address" }],
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
    inputs: [],
    name: "singleDrawPerJuror",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
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
    inputs: [],
    name: "version",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "wNative",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
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
 *
 */
export const disputeKitClassicAddress = {
  1337: "0x59b670e9fA9D0A427751Af201D676719a970857b",
} as const;

/**
 *
 */
export const disputeKitClassicConfig = {
  address: disputeKitClassicAddress,
  abi: disputeKitClassicAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DisputeKitClassic_Implementation
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const disputeKitClassicImplementationAbi = [
  { type: "constructor", inputs: [], stateMutability: "nonpayable" },
  { type: "error", inputs: [], name: "AlreadyInitialized" },
  { type: "error", inputs: [], name: "AppealFeeIsAlreadyPaid" },
  { type: "error", inputs: [], name: "ChoiceCommitmentMismatch" },
  { type: "error", inputs: [], name: "ChoiceOutOfBounds" },
  { type: "error", inputs: [], name: "CoreIsPaused" },
  { type: "error", inputs: [], name: "DisputeJumpedToAnotherDisputeKit" },
  { type: "error", inputs: [], name: "DisputeNotResolved" },
  { type: "error", inputs: [], name: "DisputeUnknownInThisDisputeKit" },
  { type: "error", inputs: [], name: "EmptyCommit" },
  { type: "error", inputs: [], name: "EmptyVoteIDs" },
  { type: "error", inputs: [], name: "FailedDelegateCall" },
  {
    type: "error",
    inputs: [{ name: "implementation", internalType: "address", type: "address" }],
    name: "InvalidImplementation",
  },
  { type: "error", inputs: [], name: "JurorHasToOwnTheVote" },
  { type: "error", inputs: [], name: "KlerosCoreOnly" },
  { type: "error", inputs: [], name: "NotAppealPeriod" },
  { type: "error", inputs: [], name: "NotAppealPeriodForLoser" },
  { type: "error", inputs: [], name: "NotCommitPeriod" },
  { type: "error", inputs: [], name: "NotInitializing" },
  { type: "error", inputs: [], name: "NotVotePeriod" },
  { type: "error", inputs: [], name: "OwnerOnly" },
  { type: "error", inputs: [], name: "UUPSUnauthorizedCallContext" },
  {
    type: "error",
    inputs: [{ name: "slot", internalType: "bytes32", type: "bytes32" }],
    name: "UUPSUnsupportedProxiableUUID",
  },
  { type: "error", inputs: [], name: "UnsuccessfulCall" },
  { type: "error", inputs: [], name: "VoteAlreadyCast" },
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
        name: "_courtID",
        internalType: "uint96",
        type: "uint96",
        indexed: true,
      },
      {
        name: "_nextRoundSettings",
        internalType: "struct DisputeKitClassicBase.NextRoundSettings",
        type: "tuple",
        components: [
          { name: "enabled", internalType: "bool", type: "bool" },
          { name: "jumpCourtID", internalType: "uint96", type: "uint96" },
          {
            name: "jumpDisputeKitID",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "jumpDisputeKitIDOnCourtJump",
            internalType: "uint256",
            type: "uint256",
          },
          { name: "nbVotes", internalType: "uint256", type: "uint256" },
        ],
        indexed: false,
      },
    ],
    name: "NextRoundSettingsChanged",
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
    inputs: [
      { name: "_courtID", internalType: "uint96", type: "uint96" },
      {
        name: "_nextRoundSettings",
        internalType: "struct DisputeKitClassicBase.NextRoundSettings",
        type: "tuple",
        components: [
          { name: "enabled", internalType: "bool", type: "bool" },
          { name: "jumpCourtID", internalType: "uint96", type: "uint96" },
          {
            name: "jumpDisputeKitID",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "jumpDisputeKitIDOnCourtJump",
            internalType: "uint256",
            type: "uint256",
          },
          { name: "nbVotes", internalType: "uint256", type: "uint256" },
        ],
      },
    ],
    name: "changeNextRoundSettings",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "_owner", internalType: "address payable", type: "address" }],
    name: "changeOwner",
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
    inputs: [{ name: "coreDisputeID", internalType: "uint256", type: "uint256" }],
    name: "coreDisputeIDToActive",
    outputs: [
      { name: "dispute", internalType: "bool", type: "bool" },
      { name: "currentRound", internalType: "bool", type: "bool" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "coreDisputeID", internalType: "uint256", type: "uint256" }],
    name: "coreDisputeIDToLocal",
    outputs: [{ name: "localDisputeID", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "currentCourtID", internalType: "uint96", type: "uint96" }],
    name: "courtIDToNextRoundSettings",
    outputs: [
      { name: "enabled", internalType: "bool", type: "bool" },
      { name: "jumpCourtID", internalType: "uint96", type: "uint96" },
      { name: "jumpDisputeKitID", internalType: "uint256", type: "uint256" },
      {
        name: "jumpDisputeKitIDOnCourtJump",
        internalType: "uint256",
        type: "uint256",
      },
      { name: "nbVotes", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_coreDisputeID", internalType: "uint256", type: "uint256" },
      { name: "_coreRoundID", internalType: "uint256", type: "uint256" },
      { name: "_numberOfChoices", internalType: "uint256", type: "uint256" },
      { name: "_extraData", internalType: "bytes", type: "bytes" },
      { name: "", internalType: "uint256", type: "uint256" },
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
      { name: "extraData", internalType: "bytes", type: "bytes" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_coreDisputeID", internalType: "uint256", type: "uint256" },
      { name: "_nonce", internalType: "uint256", type: "uint256" },
      { name: "_roundNbVotes", internalType: "uint256", type: "uint256" },
    ],
    name: "draw",
    outputs: [
      { name: "drawnAddress", internalType: "address", type: "address" },
      { name: "fromSubcourtID", internalType: "uint96", type: "uint96" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_destination", internalType: "address", type: "address" },
      { name: "_amount", internalType: "uint256", type: "uint256" },
      { name: "_data", internalType: "bytes", type: "bytes" },
    ],
    name: "executeOwnerProposal",
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
    name: "getDegreeOfCoherencePenalty",
    outputs: [{ name: "pnkCoherence", internalType: "uint256", type: "uint256" }],
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
    name: "getDegreeOfCoherenceReward",
    outputs: [
      { name: "pnkCoherence", internalType: "uint256", type: "uint256" },
      { name: "feeCoherence", internalType: "uint256", type: "uint256" },
    ],
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
    ],
    name: "getLocalDisputeRoundID",
    outputs: [
      { name: "localDisputeID", internalType: "uint256", type: "uint256" },
      { name: "localRoundID", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "", internalType: "uint256", type: "uint256" },
      { name: "_currentCourtID", internalType: "uint96", type: "uint96" },
      { name: "_parentCourtID", internalType: "uint96", type: "uint96" },
      {
        name: "_currentCourtJurorsForJump",
        internalType: "uint256",
        type: "uint256",
      },
      {
        name: "_currentDisputeKitID",
        internalType: "uint256",
        type: "uint256",
      },
      {
        name: "_currentRoundNbVotes",
        internalType: "uint256",
        type: "uint256",
      },
    ],
    name: "getNextRoundSettings",
    outputs: [
      { name: "newCourtID", internalType: "uint96", type: "uint96" },
      { name: "newDisputeKitID", internalType: "uint256", type: "uint256" },
      { name: "newRoundNbVotes", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "_localDisputeID", internalType: "uint256", type: "uint256" }],
    name: "getNumberOfRounds",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
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
      { name: "totalCommitted", internalType: "uint256", type: "uint256" },
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
    inputs: [
      { name: "_choice", internalType: "uint256", type: "uint256" },
      { name: "_salt", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "string", type: "string" },
    ],
    name: "hashVote",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_owner", internalType: "address", type: "address" },
      { name: "_core", internalType: "contract KlerosCore", type: "address" },
      { name: "_wNative", internalType: "address", type: "address" },
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "_coreDisputeID", internalType: "uint256", type: "uint256" }],
    name: "isAppealFunded",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
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
    name: "owner",
    outputs: [{ name: "", internalType: "address", type: "address" }],
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
    inputs: [],
    name: "singleDrawPerJuror",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
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
    inputs: [],
    name: "version",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "wNative",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
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
      { name: "_choice", internalType: "uint256", type: "uint256" },
    ],
    name: "withdrawFeesAndRewards",
    outputs: [{ name: "amount", internalType: "uint256", type: "uint256" }],
    stateMutability: "nonpayable",
  },
] as const;

/**
 *
 */
export const disputeKitClassicImplementationAddress = {
  1337: "0xc6e7DF5E7b4f2A278906862b61205850344D4e7d",
} as const;

/**
 *
 */
export const disputeKitClassicImplementationConfig = {
  address: disputeKitClassicImplementationAddress,
  abi: disputeKitClassicImplementationAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DisputeKitClassic_Proxy
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const disputeKitClassicProxyAbi = [
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
 *
 */
export const disputeKitClassicProxyAddress = {
  1337: "0x59b670e9fA9D0A427751Af201D676719a970857b",
} as const;

/**
 *
 */
export const disputeKitClassicProxyConfig = {
  address: disputeKitClassicProxyAddress,
  abi: disputeKitClassicProxyAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DisputeKitGated
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const disputeKitGatedAbi = [
  { type: "fallback", stateMutability: "payable" },
  { type: "receive", stateMutability: "payable" },
  { type: "error", inputs: [], name: "AlreadyInitialized" },
  { type: "error", inputs: [], name: "AppealFeeIsAlreadyPaid" },
  { type: "error", inputs: [], name: "ChoiceCommitmentMismatch" },
  { type: "error", inputs: [], name: "ChoiceOutOfBounds" },
  { type: "error", inputs: [], name: "CoreIsPaused" },
  { type: "error", inputs: [], name: "DisputeJumpedToAnotherDisputeKit" },
  { type: "error", inputs: [], name: "DisputeNotResolved" },
  { type: "error", inputs: [], name: "DisputeUnknownInThisDisputeKit" },
  { type: "error", inputs: [], name: "EmptyCommit" },
  { type: "error", inputs: [], name: "EmptyVoteIDs" },
  { type: "error", inputs: [], name: "FailedDelegateCall" },
  {
    type: "error",
    inputs: [{ name: "implementation", internalType: "address", type: "address" }],
    name: "InvalidImplementation",
  },
  { type: "error", inputs: [], name: "JurorHasToOwnTheVote" },
  { type: "error", inputs: [], name: "KlerosCoreOnly" },
  { type: "error", inputs: [], name: "NotAppealPeriod" },
  { type: "error", inputs: [], name: "NotAppealPeriodForLoser" },
  { type: "error", inputs: [], name: "NotCommitPeriod" },
  { type: "error", inputs: [], name: "NotInitializing" },
  { type: "error", inputs: [], name: "NotVotePeriod" },
  { type: "error", inputs: [], name: "OwnerOnly" },
  {
    type: "error",
    inputs: [{ name: "tokenGate", internalType: "address", type: "address" }],
    name: "TokenNotSupported",
  },
  { type: "error", inputs: [], name: "UUPSUnauthorizedCallContext" },
  {
    type: "error",
    inputs: [{ name: "slot", internalType: "bytes32", type: "bytes32" }],
    name: "UUPSUnsupportedProxiableUUID",
  },
  { type: "error", inputs: [], name: "UnsuccessfulCall" },
  { type: "error", inputs: [], name: "VoteAlreadyCast" },
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
        name: "_courtID",
        internalType: "uint96",
        type: "uint96",
        indexed: true,
      },
      {
        name: "_nextRoundSettings",
        internalType: "struct DisputeKitClassicBase.NextRoundSettings",
        type: "tuple",
        components: [
          { name: "enabled", internalType: "bool", type: "bool" },
          { name: "jumpCourtID", internalType: "uint96", type: "uint96" },
          {
            name: "jumpDisputeKitID",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "jumpDisputeKitIDOnCourtJump",
            internalType: "uint256",
            type: "uint256",
          },
          { name: "nbVotes", internalType: "uint256", type: "uint256" },
        ],
        indexed: false,
      },
    ],
    name: "NextRoundSettingsChanged",
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
    inputs: [
      { name: "_courtID", internalType: "uint96", type: "uint96" },
      {
        name: "_nextRoundSettings",
        internalType: "struct DisputeKitClassicBase.NextRoundSettings",
        type: "tuple",
        components: [
          { name: "enabled", internalType: "bool", type: "bool" },
          { name: "jumpCourtID", internalType: "uint96", type: "uint96" },
          {
            name: "jumpDisputeKitID",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "jumpDisputeKitIDOnCourtJump",
            internalType: "uint256",
            type: "uint256",
          },
          { name: "nbVotes", internalType: "uint256", type: "uint256" },
        ],
      },
    ],
    name: "changeNextRoundSettings",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "_owner", internalType: "address payable", type: "address" }],
    name: "changeOwner",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_tokens", internalType: "address[]", type: "address[]" },
      { name: "_supported", internalType: "bool", type: "bool" },
    ],
    name: "changeSupportedTokens",
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
    inputs: [{ name: "coreDisputeID", internalType: "uint256", type: "uint256" }],
    name: "coreDisputeIDToActive",
    outputs: [
      { name: "dispute", internalType: "bool", type: "bool" },
      { name: "currentRound", internalType: "bool", type: "bool" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "coreDisputeID", internalType: "uint256", type: "uint256" }],
    name: "coreDisputeIDToLocal",
    outputs: [{ name: "localDisputeID", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "currentCourtID", internalType: "uint96", type: "uint96" }],
    name: "courtIDToNextRoundSettings",
    outputs: [
      { name: "enabled", internalType: "bool", type: "bool" },
      { name: "jumpCourtID", internalType: "uint96", type: "uint96" },
      { name: "jumpDisputeKitID", internalType: "uint256", type: "uint256" },
      {
        name: "jumpDisputeKitIDOnCourtJump",
        internalType: "uint256",
        type: "uint256",
      },
      { name: "nbVotes", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_coreDisputeID", internalType: "uint256", type: "uint256" },
      { name: "_coreRoundID", internalType: "uint256", type: "uint256" },
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
      { name: "extraData", internalType: "bytes", type: "bytes" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_coreDisputeID", internalType: "uint256", type: "uint256" },
      { name: "_nonce", internalType: "uint256", type: "uint256" },
      { name: "_roundNbVotes", internalType: "uint256", type: "uint256" },
    ],
    name: "draw",
    outputs: [
      { name: "drawnAddress", internalType: "address", type: "address" },
      { name: "fromSubcourtID", internalType: "uint96", type: "uint96" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_destination", internalType: "address", type: "address" },
      { name: "_amount", internalType: "uint256", type: "uint256" },
      { name: "_data", internalType: "bytes", type: "bytes" },
    ],
    name: "executeOwnerProposal",
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
    name: "getDegreeOfCoherencePenalty",
    outputs: [{ name: "pnkCoherence", internalType: "uint256", type: "uint256" }],
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
    name: "getDegreeOfCoherenceReward",
    outputs: [
      { name: "pnkCoherence", internalType: "uint256", type: "uint256" },
      { name: "feeCoherence", internalType: "uint256", type: "uint256" },
    ],
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
    ],
    name: "getLocalDisputeRoundID",
    outputs: [
      { name: "localDisputeID", internalType: "uint256", type: "uint256" },
      { name: "localRoundID", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "", internalType: "uint256", type: "uint256" },
      { name: "_currentCourtID", internalType: "uint96", type: "uint96" },
      { name: "_parentCourtID", internalType: "uint96", type: "uint96" },
      {
        name: "_currentCourtJurorsForJump",
        internalType: "uint256",
        type: "uint256",
      },
      {
        name: "_currentDisputeKitID",
        internalType: "uint256",
        type: "uint256",
      },
      {
        name: "_currentRoundNbVotes",
        internalType: "uint256",
        type: "uint256",
      },
    ],
    name: "getNextRoundSettings",
    outputs: [
      { name: "newCourtID", internalType: "uint96", type: "uint96" },
      { name: "newDisputeKitID", internalType: "uint256", type: "uint256" },
      { name: "newRoundNbVotes", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "_localDisputeID", internalType: "uint256", type: "uint256" }],
    name: "getNumberOfRounds",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
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
      { name: "totalCommitted", internalType: "uint256", type: "uint256" },
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
    inputs: [
      { name: "_choice", internalType: "uint256", type: "uint256" },
      { name: "_salt", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "string", type: "string" },
    ],
    name: "hashVote",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_owner", internalType: "address", type: "address" },
      { name: "_core", internalType: "contract KlerosCore", type: "address" },
      { name: "_wNative", internalType: "address", type: "address" },
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "_coreDisputeID", internalType: "uint256", type: "uint256" }],
    name: "isAppealFunded",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
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
    name: "owner",
    outputs: [{ name: "", internalType: "address", type: "address" }],
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
    inputs: [],
    name: "singleDrawPerJuror",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "supportedTokens",
    outputs: [{ name: "supported", internalType: "bool", type: "bool" }],
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
    inputs: [],
    name: "version",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "wNative",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
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
 *
 */
export const disputeKitGatedAddress = {
  1337: "0x998abeb3E57409262aE5b751f60747921B33613E",
} as const;

/**
 *
 */
export const disputeKitGatedConfig = {
  address: disputeKitGatedAddress,
  abi: disputeKitGatedAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DisputeKitGatedShutter
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const disputeKitGatedShutterAbi = [
  { type: "fallback", stateMutability: "payable" },
  { type: "receive", stateMutability: "payable" },
  { type: "error", inputs: [], name: "AlreadyInitialized" },
  { type: "error", inputs: [], name: "AppealFeeIsAlreadyPaid" },
  { type: "error", inputs: [], name: "ChoiceCommitmentMismatch" },
  { type: "error", inputs: [], name: "ChoiceOutOfBounds" },
  { type: "error", inputs: [], name: "CoreIsPaused" },
  { type: "error", inputs: [], name: "DisputeJumpedToAnotherDisputeKit" },
  { type: "error", inputs: [], name: "DisputeNotResolved" },
  { type: "error", inputs: [], name: "DisputeUnknownInThisDisputeKit" },
  { type: "error", inputs: [], name: "EmptyCommit" },
  { type: "error", inputs: [], name: "EmptyJustificationCommit" },
  { type: "error", inputs: [], name: "EmptyVoteIDs" },
  { type: "error", inputs: [], name: "FailedDelegateCall" },
  {
    type: "error",
    inputs: [{ name: "implementation", internalType: "address", type: "address" }],
    name: "InvalidImplementation",
  },
  { type: "error", inputs: [], name: "JurorHasToOwnTheVote" },
  { type: "error", inputs: [], name: "JustificationCommitmentMismatch" },
  { type: "error", inputs: [], name: "KlerosCoreOnly" },
  { type: "error", inputs: [], name: "NotAppealPeriod" },
  { type: "error", inputs: [], name: "NotAppealPeriodForLoser" },
  { type: "error", inputs: [], name: "NotCommitPeriod" },
  { type: "error", inputs: [], name: "NotInitializing" },
  { type: "error", inputs: [], name: "NotVotePeriod" },
  { type: "error", inputs: [], name: "OwnerOnly" },
  {
    type: "error",
    inputs: [{ name: "tokenGate", internalType: "address", type: "address" }],
    name: "TokenNotSupported",
  },
  { type: "error", inputs: [], name: "UUPSUnauthorizedCallContext" },
  {
    type: "error",
    inputs: [{ name: "slot", internalType: "bytes32", type: "bytes32" }],
    name: "UUPSUnsupportedProxiableUUID",
  },
  { type: "error", inputs: [], name: "UnsuccessfulCall" },
  { type: "error", inputs: [], name: "VoteAlreadyCast" },
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
        name: "_juror",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "_choiceCommit",
        internalType: "bytes32",
        type: "bytes32",
        indexed: true,
      },
      {
        name: "_justificationCommit",
        internalType: "bytes32",
        type: "bytes32",
        indexed: false,
      },
      {
        name: "_identity",
        internalType: "bytes32",
        type: "bytes32",
        indexed: false,
      },
      {
        name: "_encryptedVote",
        internalType: "bytes",
        type: "bytes",
        indexed: false,
      },
    ],
    name: "CommitCastShutter",
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
        name: "_courtID",
        internalType: "uint96",
        type: "uint96",
        indexed: true,
      },
      {
        name: "_nextRoundSettings",
        internalType: "struct DisputeKitClassicBase.NextRoundSettings",
        type: "tuple",
        components: [
          { name: "enabled", internalType: "bool", type: "bool" },
          { name: "jumpCourtID", internalType: "uint96", type: "uint96" },
          {
            name: "jumpDisputeKitID",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "jumpDisputeKitIDOnCourtJump",
            internalType: "uint256",
            type: "uint256",
          },
          { name: "nbVotes", internalType: "uint256", type: "uint256" },
        ],
        indexed: false,
      },
    ],
    name: "NextRoundSettingsChanged",
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
      { name: "_choiceCommit", internalType: "bytes32", type: "bytes32" },
      {
        name: "_justificationCommit",
        internalType: "bytes32",
        type: "bytes32",
      },
      { name: "_identity", internalType: "bytes32", type: "bytes32" },
      { name: "_encryptedVote", internalType: "bytes", type: "bytes" },
    ],
    name: "castCommitShutter",
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
    inputs: [
      { name: "_coreDisputeID", internalType: "uint256", type: "uint256" },
      { name: "_voteIDs", internalType: "uint256[]", type: "uint256[]" },
      { name: "_choice", internalType: "uint256", type: "uint256" },
      { name: "_salt", internalType: "uint256", type: "uint256" },
      { name: "_justification", internalType: "string", type: "string" },
    ],
    name: "castVoteShutter",
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
    inputs: [
      { name: "_courtID", internalType: "uint96", type: "uint96" },
      {
        name: "_nextRoundSettings",
        internalType: "struct DisputeKitClassicBase.NextRoundSettings",
        type: "tuple",
        components: [
          { name: "enabled", internalType: "bool", type: "bool" },
          { name: "jumpCourtID", internalType: "uint96", type: "uint96" },
          {
            name: "jumpDisputeKitID",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "jumpDisputeKitIDOnCourtJump",
            internalType: "uint256",
            type: "uint256",
          },
          { name: "nbVotes", internalType: "uint256", type: "uint256" },
        ],
      },
    ],
    name: "changeNextRoundSettings",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "_owner", internalType: "address payable", type: "address" }],
    name: "changeOwner",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_tokens", internalType: "address[]", type: "address[]" },
      { name: "_supported", internalType: "bool", type: "bool" },
    ],
    name: "changeSupportedTokens",
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
    inputs: [{ name: "coreDisputeID", internalType: "uint256", type: "uint256" }],
    name: "coreDisputeIDToActive",
    outputs: [
      { name: "dispute", internalType: "bool", type: "bool" },
      { name: "currentRound", internalType: "bool", type: "bool" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "coreDisputeID", internalType: "uint256", type: "uint256" }],
    name: "coreDisputeIDToLocal",
    outputs: [{ name: "localDisputeID", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "currentCourtID", internalType: "uint96", type: "uint96" }],
    name: "courtIDToNextRoundSettings",
    outputs: [
      { name: "enabled", internalType: "bool", type: "bool" },
      { name: "jumpCourtID", internalType: "uint96", type: "uint96" },
      { name: "jumpDisputeKitID", internalType: "uint256", type: "uint256" },
      {
        name: "jumpDisputeKitIDOnCourtJump",
        internalType: "uint256",
        type: "uint256",
      },
      { name: "nbVotes", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_coreDisputeID", internalType: "uint256", type: "uint256" },
      { name: "_coreRoundID", internalType: "uint256", type: "uint256" },
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
      { name: "extraData", internalType: "bytes", type: "bytes" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_coreDisputeID", internalType: "uint256", type: "uint256" },
      { name: "_nonce", internalType: "uint256", type: "uint256" },
      { name: "_roundNbVotes", internalType: "uint256", type: "uint256" },
    ],
    name: "draw",
    outputs: [
      { name: "drawnAddress", internalType: "address", type: "address" },
      { name: "fromSubcourtID", internalType: "uint96", type: "uint96" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_destination", internalType: "address", type: "address" },
      { name: "_amount", internalType: "uint256", type: "uint256" },
      { name: "_data", internalType: "bytes", type: "bytes" },
    ],
    name: "executeOwnerProposal",
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
    name: "getDegreeOfCoherencePenalty",
    outputs: [{ name: "pnkCoherence", internalType: "uint256", type: "uint256" }],
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
    name: "getDegreeOfCoherenceReward",
    outputs: [
      { name: "pnkCoherence", internalType: "uint256", type: "uint256" },
      { name: "feeCoherence", internalType: "uint256", type: "uint256" },
    ],
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
    ],
    name: "getLocalDisputeRoundID",
    outputs: [
      { name: "localDisputeID", internalType: "uint256", type: "uint256" },
      { name: "localRoundID", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "", internalType: "uint256", type: "uint256" },
      { name: "_currentCourtID", internalType: "uint96", type: "uint96" },
      { name: "_parentCourtID", internalType: "uint96", type: "uint96" },
      {
        name: "_currentCourtJurorsForJump",
        internalType: "uint256",
        type: "uint256",
      },
      {
        name: "_currentDisputeKitID",
        internalType: "uint256",
        type: "uint256",
      },
      {
        name: "_currentRoundNbVotes",
        internalType: "uint256",
        type: "uint256",
      },
    ],
    name: "getNextRoundSettings",
    outputs: [
      { name: "newCourtID", internalType: "uint96", type: "uint96" },
      { name: "newDisputeKitID", internalType: "uint256", type: "uint256" },
      { name: "newRoundNbVotes", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "_localDisputeID", internalType: "uint256", type: "uint256" }],
    name: "getNumberOfRounds",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
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
      { name: "totalCommitted", internalType: "uint256", type: "uint256" },
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
    inputs: [
      { name: "_salt", internalType: "uint256", type: "uint256" },
      { name: "_justification", internalType: "string", type: "string" },
    ],
    name: "hashJustification",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "pure",
  },
  {
    type: "function",
    inputs: [
      { name: "_choice", internalType: "uint256", type: "uint256" },
      { name: "_salt", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "string", type: "string" },
    ],
    name: "hashVote",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_owner", internalType: "address", type: "address" },
      { name: "_core", internalType: "contract KlerosCore", type: "address" },
      { name: "_wNative", internalType: "address", type: "address" },
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "_coreDisputeID", internalType: "uint256", type: "uint256" }],
    name: "isAppealFunded",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
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
    inputs: [
      { name: "localDisputeID", internalType: "uint256", type: "uint256" },
      { name: "localRoundID", internalType: "uint256", type: "uint256" },
      { name: "voteID", internalType: "uint256", type: "uint256" },
    ],
    name: "justificationCommitments",
    outputs: [
      {
        name: "justificationCommitment",
        internalType: "bytes32",
        type: "bytes32",
      },
    ],
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
    inputs: [],
    name: "proxiableUUID",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "singleDrawPerJuror",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "supportedTokens",
    outputs: [{ name: "supported", internalType: "bool", type: "bool" }],
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
    inputs: [],
    name: "version",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "wNative",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
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
 *
 */
export const disputeKitGatedShutterAddress = {
  1337: "0x0E801D84Fa97b50751Dbf25036d067dCf18858bF",
} as const;

/**
 *
 */
export const disputeKitGatedShutterConfig = {
  address: disputeKitGatedShutterAddress,
  abi: disputeKitGatedShutterAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DisputeKitGatedShutter_Implementation
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const disputeKitGatedShutterImplementationAbi = [
  { type: "constructor", inputs: [], stateMutability: "nonpayable" },
  { type: "error", inputs: [], name: "AlreadyInitialized" },
  { type: "error", inputs: [], name: "AppealFeeIsAlreadyPaid" },
  { type: "error", inputs: [], name: "ChoiceCommitmentMismatch" },
  { type: "error", inputs: [], name: "ChoiceOutOfBounds" },
  { type: "error", inputs: [], name: "CoreIsPaused" },
  { type: "error", inputs: [], name: "DisputeJumpedToAnotherDisputeKit" },
  { type: "error", inputs: [], name: "DisputeNotResolved" },
  { type: "error", inputs: [], name: "DisputeUnknownInThisDisputeKit" },
  { type: "error", inputs: [], name: "EmptyCommit" },
  { type: "error", inputs: [], name: "EmptyJustificationCommit" },
  { type: "error", inputs: [], name: "EmptyVoteIDs" },
  { type: "error", inputs: [], name: "FailedDelegateCall" },
  {
    type: "error",
    inputs: [{ name: "implementation", internalType: "address", type: "address" }],
    name: "InvalidImplementation",
  },
  { type: "error", inputs: [], name: "JurorHasToOwnTheVote" },
  { type: "error", inputs: [], name: "JustificationCommitmentMismatch" },
  { type: "error", inputs: [], name: "KlerosCoreOnly" },
  { type: "error", inputs: [], name: "NotAppealPeriod" },
  { type: "error", inputs: [], name: "NotAppealPeriodForLoser" },
  { type: "error", inputs: [], name: "NotCommitPeriod" },
  { type: "error", inputs: [], name: "NotInitializing" },
  { type: "error", inputs: [], name: "NotVotePeriod" },
  { type: "error", inputs: [], name: "OwnerOnly" },
  {
    type: "error",
    inputs: [{ name: "tokenGate", internalType: "address", type: "address" }],
    name: "TokenNotSupported",
  },
  { type: "error", inputs: [], name: "UUPSUnauthorizedCallContext" },
  {
    type: "error",
    inputs: [{ name: "slot", internalType: "bytes32", type: "bytes32" }],
    name: "UUPSUnsupportedProxiableUUID",
  },
  { type: "error", inputs: [], name: "UnsuccessfulCall" },
  { type: "error", inputs: [], name: "VoteAlreadyCast" },
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
        name: "_juror",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "_choiceCommit",
        internalType: "bytes32",
        type: "bytes32",
        indexed: true,
      },
      {
        name: "_justificationCommit",
        internalType: "bytes32",
        type: "bytes32",
        indexed: false,
      },
      {
        name: "_identity",
        internalType: "bytes32",
        type: "bytes32",
        indexed: false,
      },
      {
        name: "_encryptedVote",
        internalType: "bytes",
        type: "bytes",
        indexed: false,
      },
    ],
    name: "CommitCastShutter",
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
        name: "_courtID",
        internalType: "uint96",
        type: "uint96",
        indexed: true,
      },
      {
        name: "_nextRoundSettings",
        internalType: "struct DisputeKitClassicBase.NextRoundSettings",
        type: "tuple",
        components: [
          { name: "enabled", internalType: "bool", type: "bool" },
          { name: "jumpCourtID", internalType: "uint96", type: "uint96" },
          {
            name: "jumpDisputeKitID",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "jumpDisputeKitIDOnCourtJump",
            internalType: "uint256",
            type: "uint256",
          },
          { name: "nbVotes", internalType: "uint256", type: "uint256" },
        ],
        indexed: false,
      },
    ],
    name: "NextRoundSettingsChanged",
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
      { name: "_choiceCommit", internalType: "bytes32", type: "bytes32" },
      {
        name: "_justificationCommit",
        internalType: "bytes32",
        type: "bytes32",
      },
      { name: "_identity", internalType: "bytes32", type: "bytes32" },
      { name: "_encryptedVote", internalType: "bytes", type: "bytes" },
    ],
    name: "castCommitShutter",
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
    inputs: [
      { name: "_coreDisputeID", internalType: "uint256", type: "uint256" },
      { name: "_voteIDs", internalType: "uint256[]", type: "uint256[]" },
      { name: "_choice", internalType: "uint256", type: "uint256" },
      { name: "_salt", internalType: "uint256", type: "uint256" },
      { name: "_justification", internalType: "string", type: "string" },
    ],
    name: "castVoteShutter",
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
    inputs: [
      { name: "_courtID", internalType: "uint96", type: "uint96" },
      {
        name: "_nextRoundSettings",
        internalType: "struct DisputeKitClassicBase.NextRoundSettings",
        type: "tuple",
        components: [
          { name: "enabled", internalType: "bool", type: "bool" },
          { name: "jumpCourtID", internalType: "uint96", type: "uint96" },
          {
            name: "jumpDisputeKitID",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "jumpDisputeKitIDOnCourtJump",
            internalType: "uint256",
            type: "uint256",
          },
          { name: "nbVotes", internalType: "uint256", type: "uint256" },
        ],
      },
    ],
    name: "changeNextRoundSettings",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "_owner", internalType: "address payable", type: "address" }],
    name: "changeOwner",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_tokens", internalType: "address[]", type: "address[]" },
      { name: "_supported", internalType: "bool", type: "bool" },
    ],
    name: "changeSupportedTokens",
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
    inputs: [{ name: "coreDisputeID", internalType: "uint256", type: "uint256" }],
    name: "coreDisputeIDToActive",
    outputs: [
      { name: "dispute", internalType: "bool", type: "bool" },
      { name: "currentRound", internalType: "bool", type: "bool" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "coreDisputeID", internalType: "uint256", type: "uint256" }],
    name: "coreDisputeIDToLocal",
    outputs: [{ name: "localDisputeID", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "currentCourtID", internalType: "uint96", type: "uint96" }],
    name: "courtIDToNextRoundSettings",
    outputs: [
      { name: "enabled", internalType: "bool", type: "bool" },
      { name: "jumpCourtID", internalType: "uint96", type: "uint96" },
      { name: "jumpDisputeKitID", internalType: "uint256", type: "uint256" },
      {
        name: "jumpDisputeKitIDOnCourtJump",
        internalType: "uint256",
        type: "uint256",
      },
      { name: "nbVotes", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_coreDisputeID", internalType: "uint256", type: "uint256" },
      { name: "_coreRoundID", internalType: "uint256", type: "uint256" },
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
      { name: "extraData", internalType: "bytes", type: "bytes" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_coreDisputeID", internalType: "uint256", type: "uint256" },
      { name: "_nonce", internalType: "uint256", type: "uint256" },
      { name: "_roundNbVotes", internalType: "uint256", type: "uint256" },
    ],
    name: "draw",
    outputs: [
      { name: "drawnAddress", internalType: "address", type: "address" },
      { name: "fromSubcourtID", internalType: "uint96", type: "uint96" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_destination", internalType: "address", type: "address" },
      { name: "_amount", internalType: "uint256", type: "uint256" },
      { name: "_data", internalType: "bytes", type: "bytes" },
    ],
    name: "executeOwnerProposal",
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
    name: "getDegreeOfCoherencePenalty",
    outputs: [{ name: "pnkCoherence", internalType: "uint256", type: "uint256" }],
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
    name: "getDegreeOfCoherenceReward",
    outputs: [
      { name: "pnkCoherence", internalType: "uint256", type: "uint256" },
      { name: "feeCoherence", internalType: "uint256", type: "uint256" },
    ],
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
    ],
    name: "getLocalDisputeRoundID",
    outputs: [
      { name: "localDisputeID", internalType: "uint256", type: "uint256" },
      { name: "localRoundID", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "", internalType: "uint256", type: "uint256" },
      { name: "_currentCourtID", internalType: "uint96", type: "uint96" },
      { name: "_parentCourtID", internalType: "uint96", type: "uint96" },
      {
        name: "_currentCourtJurorsForJump",
        internalType: "uint256",
        type: "uint256",
      },
      {
        name: "_currentDisputeKitID",
        internalType: "uint256",
        type: "uint256",
      },
      {
        name: "_currentRoundNbVotes",
        internalType: "uint256",
        type: "uint256",
      },
    ],
    name: "getNextRoundSettings",
    outputs: [
      { name: "newCourtID", internalType: "uint96", type: "uint96" },
      { name: "newDisputeKitID", internalType: "uint256", type: "uint256" },
      { name: "newRoundNbVotes", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "_localDisputeID", internalType: "uint256", type: "uint256" }],
    name: "getNumberOfRounds",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
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
      { name: "totalCommitted", internalType: "uint256", type: "uint256" },
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
    inputs: [
      { name: "_salt", internalType: "uint256", type: "uint256" },
      { name: "_justification", internalType: "string", type: "string" },
    ],
    name: "hashJustification",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "pure",
  },
  {
    type: "function",
    inputs: [
      { name: "_choice", internalType: "uint256", type: "uint256" },
      { name: "_salt", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "string", type: "string" },
    ],
    name: "hashVote",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_owner", internalType: "address", type: "address" },
      { name: "_core", internalType: "contract KlerosCore", type: "address" },
      { name: "_wNative", internalType: "address", type: "address" },
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "_coreDisputeID", internalType: "uint256", type: "uint256" }],
    name: "isAppealFunded",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
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
    inputs: [
      { name: "localDisputeID", internalType: "uint256", type: "uint256" },
      { name: "localRoundID", internalType: "uint256", type: "uint256" },
      { name: "voteID", internalType: "uint256", type: "uint256" },
    ],
    name: "justificationCommitments",
    outputs: [
      {
        name: "justificationCommitment",
        internalType: "bytes32",
        type: "bytes32",
      },
    ],
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
    inputs: [],
    name: "proxiableUUID",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "singleDrawPerJuror",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "supportedTokens",
    outputs: [{ name: "supported", internalType: "bool", type: "bool" }],
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
    inputs: [],
    name: "version",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "wNative",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
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
      { name: "_choice", internalType: "uint256", type: "uint256" },
    ],
    name: "withdrawFeesAndRewards",
    outputs: [{ name: "amount", internalType: "uint256", type: "uint256" }],
    stateMutability: "nonpayable",
  },
] as const;

/**
 *
 */
export const disputeKitGatedShutterImplementationAddress = {
  1337: "0x99bbA657f2BbC93c02D617f8bA121cB8Fc104Acf",
} as const;

/**
 *
 */
export const disputeKitGatedShutterImplementationConfig = {
  address: disputeKitGatedShutterImplementationAddress,
  abi: disputeKitGatedShutterImplementationAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DisputeKitGatedShutter_Proxy
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const disputeKitGatedShutterProxyAbi = [
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
 *
 */
export const disputeKitGatedShutterProxyAddress = {
  1337: "0x0E801D84Fa97b50751Dbf25036d067dCf18858bF",
} as const;

/**
 *
 */
export const disputeKitGatedShutterProxyConfig = {
  address: disputeKitGatedShutterProxyAddress,
  abi: disputeKitGatedShutterProxyAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DisputeKitGated_Implementation
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const disputeKitGatedImplementationAbi = [
  { type: "constructor", inputs: [], stateMutability: "nonpayable" },
  { type: "error", inputs: [], name: "AlreadyInitialized" },
  { type: "error", inputs: [], name: "AppealFeeIsAlreadyPaid" },
  { type: "error", inputs: [], name: "ChoiceCommitmentMismatch" },
  { type: "error", inputs: [], name: "ChoiceOutOfBounds" },
  { type: "error", inputs: [], name: "CoreIsPaused" },
  { type: "error", inputs: [], name: "DisputeJumpedToAnotherDisputeKit" },
  { type: "error", inputs: [], name: "DisputeNotResolved" },
  { type: "error", inputs: [], name: "DisputeUnknownInThisDisputeKit" },
  { type: "error", inputs: [], name: "EmptyCommit" },
  { type: "error", inputs: [], name: "EmptyVoteIDs" },
  { type: "error", inputs: [], name: "FailedDelegateCall" },
  {
    type: "error",
    inputs: [{ name: "implementation", internalType: "address", type: "address" }],
    name: "InvalidImplementation",
  },
  { type: "error", inputs: [], name: "JurorHasToOwnTheVote" },
  { type: "error", inputs: [], name: "KlerosCoreOnly" },
  { type: "error", inputs: [], name: "NotAppealPeriod" },
  { type: "error", inputs: [], name: "NotAppealPeriodForLoser" },
  { type: "error", inputs: [], name: "NotCommitPeriod" },
  { type: "error", inputs: [], name: "NotInitializing" },
  { type: "error", inputs: [], name: "NotVotePeriod" },
  { type: "error", inputs: [], name: "OwnerOnly" },
  {
    type: "error",
    inputs: [{ name: "tokenGate", internalType: "address", type: "address" }],
    name: "TokenNotSupported",
  },
  { type: "error", inputs: [], name: "UUPSUnauthorizedCallContext" },
  {
    type: "error",
    inputs: [{ name: "slot", internalType: "bytes32", type: "bytes32" }],
    name: "UUPSUnsupportedProxiableUUID",
  },
  { type: "error", inputs: [], name: "UnsuccessfulCall" },
  { type: "error", inputs: [], name: "VoteAlreadyCast" },
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
        name: "_courtID",
        internalType: "uint96",
        type: "uint96",
        indexed: true,
      },
      {
        name: "_nextRoundSettings",
        internalType: "struct DisputeKitClassicBase.NextRoundSettings",
        type: "tuple",
        components: [
          { name: "enabled", internalType: "bool", type: "bool" },
          { name: "jumpCourtID", internalType: "uint96", type: "uint96" },
          {
            name: "jumpDisputeKitID",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "jumpDisputeKitIDOnCourtJump",
            internalType: "uint256",
            type: "uint256",
          },
          { name: "nbVotes", internalType: "uint256", type: "uint256" },
        ],
        indexed: false,
      },
    ],
    name: "NextRoundSettingsChanged",
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
    inputs: [
      { name: "_courtID", internalType: "uint96", type: "uint96" },
      {
        name: "_nextRoundSettings",
        internalType: "struct DisputeKitClassicBase.NextRoundSettings",
        type: "tuple",
        components: [
          { name: "enabled", internalType: "bool", type: "bool" },
          { name: "jumpCourtID", internalType: "uint96", type: "uint96" },
          {
            name: "jumpDisputeKitID",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "jumpDisputeKitIDOnCourtJump",
            internalType: "uint256",
            type: "uint256",
          },
          { name: "nbVotes", internalType: "uint256", type: "uint256" },
        ],
      },
    ],
    name: "changeNextRoundSettings",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "_owner", internalType: "address payable", type: "address" }],
    name: "changeOwner",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_tokens", internalType: "address[]", type: "address[]" },
      { name: "_supported", internalType: "bool", type: "bool" },
    ],
    name: "changeSupportedTokens",
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
    inputs: [{ name: "coreDisputeID", internalType: "uint256", type: "uint256" }],
    name: "coreDisputeIDToActive",
    outputs: [
      { name: "dispute", internalType: "bool", type: "bool" },
      { name: "currentRound", internalType: "bool", type: "bool" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "coreDisputeID", internalType: "uint256", type: "uint256" }],
    name: "coreDisputeIDToLocal",
    outputs: [{ name: "localDisputeID", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "currentCourtID", internalType: "uint96", type: "uint96" }],
    name: "courtIDToNextRoundSettings",
    outputs: [
      { name: "enabled", internalType: "bool", type: "bool" },
      { name: "jumpCourtID", internalType: "uint96", type: "uint96" },
      { name: "jumpDisputeKitID", internalType: "uint256", type: "uint256" },
      {
        name: "jumpDisputeKitIDOnCourtJump",
        internalType: "uint256",
        type: "uint256",
      },
      { name: "nbVotes", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_coreDisputeID", internalType: "uint256", type: "uint256" },
      { name: "_coreRoundID", internalType: "uint256", type: "uint256" },
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
      { name: "extraData", internalType: "bytes", type: "bytes" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_coreDisputeID", internalType: "uint256", type: "uint256" },
      { name: "_nonce", internalType: "uint256", type: "uint256" },
      { name: "_roundNbVotes", internalType: "uint256", type: "uint256" },
    ],
    name: "draw",
    outputs: [
      { name: "drawnAddress", internalType: "address", type: "address" },
      { name: "fromSubcourtID", internalType: "uint96", type: "uint96" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_destination", internalType: "address", type: "address" },
      { name: "_amount", internalType: "uint256", type: "uint256" },
      { name: "_data", internalType: "bytes", type: "bytes" },
    ],
    name: "executeOwnerProposal",
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
    name: "getDegreeOfCoherencePenalty",
    outputs: [{ name: "pnkCoherence", internalType: "uint256", type: "uint256" }],
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
    name: "getDegreeOfCoherenceReward",
    outputs: [
      { name: "pnkCoherence", internalType: "uint256", type: "uint256" },
      { name: "feeCoherence", internalType: "uint256", type: "uint256" },
    ],
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
    ],
    name: "getLocalDisputeRoundID",
    outputs: [
      { name: "localDisputeID", internalType: "uint256", type: "uint256" },
      { name: "localRoundID", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "", internalType: "uint256", type: "uint256" },
      { name: "_currentCourtID", internalType: "uint96", type: "uint96" },
      { name: "_parentCourtID", internalType: "uint96", type: "uint96" },
      {
        name: "_currentCourtJurorsForJump",
        internalType: "uint256",
        type: "uint256",
      },
      {
        name: "_currentDisputeKitID",
        internalType: "uint256",
        type: "uint256",
      },
      {
        name: "_currentRoundNbVotes",
        internalType: "uint256",
        type: "uint256",
      },
    ],
    name: "getNextRoundSettings",
    outputs: [
      { name: "newCourtID", internalType: "uint96", type: "uint96" },
      { name: "newDisputeKitID", internalType: "uint256", type: "uint256" },
      { name: "newRoundNbVotes", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "_localDisputeID", internalType: "uint256", type: "uint256" }],
    name: "getNumberOfRounds",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
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
      { name: "totalCommitted", internalType: "uint256", type: "uint256" },
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
    inputs: [
      { name: "_choice", internalType: "uint256", type: "uint256" },
      { name: "_salt", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "string", type: "string" },
    ],
    name: "hashVote",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_owner", internalType: "address", type: "address" },
      { name: "_core", internalType: "contract KlerosCore", type: "address" },
      { name: "_wNative", internalType: "address", type: "address" },
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "_coreDisputeID", internalType: "uint256", type: "uint256" }],
    name: "isAppealFunded",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
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
    name: "owner",
    outputs: [{ name: "", internalType: "address", type: "address" }],
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
    inputs: [],
    name: "singleDrawPerJuror",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "supportedTokens",
    outputs: [{ name: "supported", internalType: "bool", type: "bool" }],
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
    inputs: [],
    name: "version",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "wNative",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
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
      { name: "_choice", internalType: "uint256", type: "uint256" },
    ],
    name: "withdrawFeesAndRewards",
    outputs: [{ name: "amount", internalType: "uint256", type: "uint256" }],
    stateMutability: "nonpayable",
  },
] as const;

/**
 *
 */
export const disputeKitGatedImplementationAddress = {
  1337: "0x95401dc811bb5740090279Ba06cfA8fcF6113778",
} as const;

/**
 *
 */
export const disputeKitGatedImplementationConfig = {
  address: disputeKitGatedImplementationAddress,
  abi: disputeKitGatedImplementationAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DisputeKitGated_Proxy
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const disputeKitGatedProxyAbi = [
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
 *
 */
export const disputeKitGatedProxyAddress = {
  1337: "0x998abeb3E57409262aE5b751f60747921B33613E",
} as const;

/**
 *
 */
export const disputeKitGatedProxyConfig = {
  address: disputeKitGatedProxyAddress,
  abi: disputeKitGatedProxyAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DisputeKitShutter
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const disputeKitShutterAbi = [
  { type: "fallback", stateMutability: "payable" },
  { type: "receive", stateMutability: "payable" },
  { type: "error", inputs: [], name: "AlreadyInitialized" },
  { type: "error", inputs: [], name: "AppealFeeIsAlreadyPaid" },
  { type: "error", inputs: [], name: "ChoiceCommitmentMismatch" },
  { type: "error", inputs: [], name: "ChoiceOutOfBounds" },
  { type: "error", inputs: [], name: "CoreIsPaused" },
  { type: "error", inputs: [], name: "DisputeJumpedToAnotherDisputeKit" },
  { type: "error", inputs: [], name: "DisputeNotResolved" },
  { type: "error", inputs: [], name: "DisputeUnknownInThisDisputeKit" },
  { type: "error", inputs: [], name: "EmptyCommit" },
  { type: "error", inputs: [], name: "EmptyJustificationCommit" },
  { type: "error", inputs: [], name: "EmptyVoteIDs" },
  { type: "error", inputs: [], name: "FailedDelegateCall" },
  {
    type: "error",
    inputs: [{ name: "implementation", internalType: "address", type: "address" }],
    name: "InvalidImplementation",
  },
  { type: "error", inputs: [], name: "JurorHasToOwnTheVote" },
  { type: "error", inputs: [], name: "JustificationCommitmentMismatch" },
  { type: "error", inputs: [], name: "KlerosCoreOnly" },
  { type: "error", inputs: [], name: "NotAppealPeriod" },
  { type: "error", inputs: [], name: "NotAppealPeriodForLoser" },
  { type: "error", inputs: [], name: "NotCommitPeriod" },
  { type: "error", inputs: [], name: "NotInitializing" },
  { type: "error", inputs: [], name: "NotVotePeriod" },
  { type: "error", inputs: [], name: "OwnerOnly" },
  { type: "error", inputs: [], name: "UUPSUnauthorizedCallContext" },
  {
    type: "error",
    inputs: [{ name: "slot", internalType: "bytes32", type: "bytes32" }],
    name: "UUPSUnsupportedProxiableUUID",
  },
  { type: "error", inputs: [], name: "UnsuccessfulCall" },
  { type: "error", inputs: [], name: "VoteAlreadyCast" },
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
        name: "_juror",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "_choiceCommit",
        internalType: "bytes32",
        type: "bytes32",
        indexed: true,
      },
      {
        name: "_justificationCommit",
        internalType: "bytes32",
        type: "bytes32",
        indexed: false,
      },
      {
        name: "_identity",
        internalType: "bytes32",
        type: "bytes32",
        indexed: false,
      },
      {
        name: "_encryptedVote",
        internalType: "bytes",
        type: "bytes",
        indexed: false,
      },
    ],
    name: "CommitCastShutter",
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
        name: "_courtID",
        internalType: "uint96",
        type: "uint96",
        indexed: true,
      },
      {
        name: "_nextRoundSettings",
        internalType: "struct DisputeKitClassicBase.NextRoundSettings",
        type: "tuple",
        components: [
          { name: "enabled", internalType: "bool", type: "bool" },
          { name: "jumpCourtID", internalType: "uint96", type: "uint96" },
          {
            name: "jumpDisputeKitID",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "jumpDisputeKitIDOnCourtJump",
            internalType: "uint256",
            type: "uint256",
          },
          { name: "nbVotes", internalType: "uint256", type: "uint256" },
        ],
        indexed: false,
      },
    ],
    name: "NextRoundSettingsChanged",
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
      { name: "_choiceCommit", internalType: "bytes32", type: "bytes32" },
      {
        name: "_justificationCommit",
        internalType: "bytes32",
        type: "bytes32",
      },
      { name: "_identity", internalType: "bytes32", type: "bytes32" },
      { name: "_encryptedVote", internalType: "bytes", type: "bytes" },
    ],
    name: "castCommitShutter",
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
    inputs: [
      { name: "_coreDisputeID", internalType: "uint256", type: "uint256" },
      { name: "_voteIDs", internalType: "uint256[]", type: "uint256[]" },
      { name: "_choice", internalType: "uint256", type: "uint256" },
      { name: "_salt", internalType: "uint256", type: "uint256" },
      { name: "_justification", internalType: "string", type: "string" },
    ],
    name: "castVoteShutter",
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
    inputs: [
      { name: "_courtID", internalType: "uint96", type: "uint96" },
      {
        name: "_nextRoundSettings",
        internalType: "struct DisputeKitClassicBase.NextRoundSettings",
        type: "tuple",
        components: [
          { name: "enabled", internalType: "bool", type: "bool" },
          { name: "jumpCourtID", internalType: "uint96", type: "uint96" },
          {
            name: "jumpDisputeKitID",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "jumpDisputeKitIDOnCourtJump",
            internalType: "uint256",
            type: "uint256",
          },
          { name: "nbVotes", internalType: "uint256", type: "uint256" },
        ],
      },
    ],
    name: "changeNextRoundSettings",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "_owner", internalType: "address payable", type: "address" }],
    name: "changeOwner",
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
    inputs: [{ name: "coreDisputeID", internalType: "uint256", type: "uint256" }],
    name: "coreDisputeIDToActive",
    outputs: [
      { name: "dispute", internalType: "bool", type: "bool" },
      { name: "currentRound", internalType: "bool", type: "bool" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "coreDisputeID", internalType: "uint256", type: "uint256" }],
    name: "coreDisputeIDToLocal",
    outputs: [{ name: "localDisputeID", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "currentCourtID", internalType: "uint96", type: "uint96" }],
    name: "courtIDToNextRoundSettings",
    outputs: [
      { name: "enabled", internalType: "bool", type: "bool" },
      { name: "jumpCourtID", internalType: "uint96", type: "uint96" },
      { name: "jumpDisputeKitID", internalType: "uint256", type: "uint256" },
      {
        name: "jumpDisputeKitIDOnCourtJump",
        internalType: "uint256",
        type: "uint256",
      },
      { name: "nbVotes", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_coreDisputeID", internalType: "uint256", type: "uint256" },
      { name: "_coreRoundID", internalType: "uint256", type: "uint256" },
      { name: "_numberOfChoices", internalType: "uint256", type: "uint256" },
      { name: "_extraData", internalType: "bytes", type: "bytes" },
      { name: "", internalType: "uint256", type: "uint256" },
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
      { name: "extraData", internalType: "bytes", type: "bytes" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_coreDisputeID", internalType: "uint256", type: "uint256" },
      { name: "_nonce", internalType: "uint256", type: "uint256" },
      { name: "_roundNbVotes", internalType: "uint256", type: "uint256" },
    ],
    name: "draw",
    outputs: [
      { name: "drawnAddress", internalType: "address", type: "address" },
      { name: "fromSubcourtID", internalType: "uint96", type: "uint96" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_destination", internalType: "address", type: "address" },
      { name: "_amount", internalType: "uint256", type: "uint256" },
      { name: "_data", internalType: "bytes", type: "bytes" },
    ],
    name: "executeOwnerProposal",
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
    name: "getDegreeOfCoherencePenalty",
    outputs: [{ name: "pnkCoherence", internalType: "uint256", type: "uint256" }],
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
    name: "getDegreeOfCoherenceReward",
    outputs: [
      { name: "pnkCoherence", internalType: "uint256", type: "uint256" },
      { name: "feeCoherence", internalType: "uint256", type: "uint256" },
    ],
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
    ],
    name: "getLocalDisputeRoundID",
    outputs: [
      { name: "localDisputeID", internalType: "uint256", type: "uint256" },
      { name: "localRoundID", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "", internalType: "uint256", type: "uint256" },
      { name: "_currentCourtID", internalType: "uint96", type: "uint96" },
      { name: "_parentCourtID", internalType: "uint96", type: "uint96" },
      {
        name: "_currentCourtJurorsForJump",
        internalType: "uint256",
        type: "uint256",
      },
      {
        name: "_currentDisputeKitID",
        internalType: "uint256",
        type: "uint256",
      },
      {
        name: "_currentRoundNbVotes",
        internalType: "uint256",
        type: "uint256",
      },
    ],
    name: "getNextRoundSettings",
    outputs: [
      { name: "newCourtID", internalType: "uint96", type: "uint96" },
      { name: "newDisputeKitID", internalType: "uint256", type: "uint256" },
      { name: "newRoundNbVotes", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "_localDisputeID", internalType: "uint256", type: "uint256" }],
    name: "getNumberOfRounds",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
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
      { name: "totalCommitted", internalType: "uint256", type: "uint256" },
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
    inputs: [
      { name: "_salt", internalType: "uint256", type: "uint256" },
      { name: "_justification", internalType: "string", type: "string" },
    ],
    name: "hashJustification",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "pure",
  },
  {
    type: "function",
    inputs: [
      { name: "_choice", internalType: "uint256", type: "uint256" },
      { name: "_salt", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "string", type: "string" },
    ],
    name: "hashVote",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_owner", internalType: "address", type: "address" },
      { name: "_core", internalType: "contract KlerosCore", type: "address" },
      { name: "_wNative", internalType: "address", type: "address" },
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "_coreDisputeID", internalType: "uint256", type: "uint256" }],
    name: "isAppealFunded",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
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
    inputs: [
      { name: "localDisputeID", internalType: "uint256", type: "uint256" },
      { name: "localRoundID", internalType: "uint256", type: "uint256" },
      { name: "voteID", internalType: "uint256", type: "uint256" },
    ],
    name: "justificationCommitments",
    outputs: [
      {
        name: "justificationCommitment",
        internalType: "bytes32",
        type: "bytes32",
      },
    ],
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
    inputs: [],
    name: "proxiableUUID",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "singleDrawPerJuror",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
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
    inputs: [],
    name: "version",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "wNative",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
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
 *
 */
export const disputeKitShutterAddress = {
  1337: "0x1613beB3B2C4f22Ee086B2b38C1476A3cE7f78E8",
} as const;

/**
 *
 */
export const disputeKitShutterConfig = {
  address: disputeKitShutterAddress,
  abi: disputeKitShutterAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DisputeKitShutter_Implementation
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const disputeKitShutterImplementationAbi = [
  { type: "constructor", inputs: [], stateMutability: "nonpayable" },
  { type: "error", inputs: [], name: "AlreadyInitialized" },
  { type: "error", inputs: [], name: "AppealFeeIsAlreadyPaid" },
  { type: "error", inputs: [], name: "ChoiceCommitmentMismatch" },
  { type: "error", inputs: [], name: "ChoiceOutOfBounds" },
  { type: "error", inputs: [], name: "CoreIsPaused" },
  { type: "error", inputs: [], name: "DisputeJumpedToAnotherDisputeKit" },
  { type: "error", inputs: [], name: "DisputeNotResolved" },
  { type: "error", inputs: [], name: "DisputeUnknownInThisDisputeKit" },
  { type: "error", inputs: [], name: "EmptyCommit" },
  { type: "error", inputs: [], name: "EmptyJustificationCommit" },
  { type: "error", inputs: [], name: "EmptyVoteIDs" },
  { type: "error", inputs: [], name: "FailedDelegateCall" },
  {
    type: "error",
    inputs: [{ name: "implementation", internalType: "address", type: "address" }],
    name: "InvalidImplementation",
  },
  { type: "error", inputs: [], name: "JurorHasToOwnTheVote" },
  { type: "error", inputs: [], name: "JustificationCommitmentMismatch" },
  { type: "error", inputs: [], name: "KlerosCoreOnly" },
  { type: "error", inputs: [], name: "NotAppealPeriod" },
  { type: "error", inputs: [], name: "NotAppealPeriodForLoser" },
  { type: "error", inputs: [], name: "NotCommitPeriod" },
  { type: "error", inputs: [], name: "NotInitializing" },
  { type: "error", inputs: [], name: "NotVotePeriod" },
  { type: "error", inputs: [], name: "OwnerOnly" },
  { type: "error", inputs: [], name: "UUPSUnauthorizedCallContext" },
  {
    type: "error",
    inputs: [{ name: "slot", internalType: "bytes32", type: "bytes32" }],
    name: "UUPSUnsupportedProxiableUUID",
  },
  { type: "error", inputs: [], name: "UnsuccessfulCall" },
  { type: "error", inputs: [], name: "VoteAlreadyCast" },
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
        name: "_juror",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "_choiceCommit",
        internalType: "bytes32",
        type: "bytes32",
        indexed: true,
      },
      {
        name: "_justificationCommit",
        internalType: "bytes32",
        type: "bytes32",
        indexed: false,
      },
      {
        name: "_identity",
        internalType: "bytes32",
        type: "bytes32",
        indexed: false,
      },
      {
        name: "_encryptedVote",
        internalType: "bytes",
        type: "bytes",
        indexed: false,
      },
    ],
    name: "CommitCastShutter",
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
        name: "_courtID",
        internalType: "uint96",
        type: "uint96",
        indexed: true,
      },
      {
        name: "_nextRoundSettings",
        internalType: "struct DisputeKitClassicBase.NextRoundSettings",
        type: "tuple",
        components: [
          { name: "enabled", internalType: "bool", type: "bool" },
          { name: "jumpCourtID", internalType: "uint96", type: "uint96" },
          {
            name: "jumpDisputeKitID",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "jumpDisputeKitIDOnCourtJump",
            internalType: "uint256",
            type: "uint256",
          },
          { name: "nbVotes", internalType: "uint256", type: "uint256" },
        ],
        indexed: false,
      },
    ],
    name: "NextRoundSettingsChanged",
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
      { name: "_choiceCommit", internalType: "bytes32", type: "bytes32" },
      {
        name: "_justificationCommit",
        internalType: "bytes32",
        type: "bytes32",
      },
      { name: "_identity", internalType: "bytes32", type: "bytes32" },
      { name: "_encryptedVote", internalType: "bytes", type: "bytes" },
    ],
    name: "castCommitShutter",
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
    inputs: [
      { name: "_coreDisputeID", internalType: "uint256", type: "uint256" },
      { name: "_voteIDs", internalType: "uint256[]", type: "uint256[]" },
      { name: "_choice", internalType: "uint256", type: "uint256" },
      { name: "_salt", internalType: "uint256", type: "uint256" },
      { name: "_justification", internalType: "string", type: "string" },
    ],
    name: "castVoteShutter",
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
    inputs: [
      { name: "_courtID", internalType: "uint96", type: "uint96" },
      {
        name: "_nextRoundSettings",
        internalType: "struct DisputeKitClassicBase.NextRoundSettings",
        type: "tuple",
        components: [
          { name: "enabled", internalType: "bool", type: "bool" },
          { name: "jumpCourtID", internalType: "uint96", type: "uint96" },
          {
            name: "jumpDisputeKitID",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "jumpDisputeKitIDOnCourtJump",
            internalType: "uint256",
            type: "uint256",
          },
          { name: "nbVotes", internalType: "uint256", type: "uint256" },
        ],
      },
    ],
    name: "changeNextRoundSettings",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "_owner", internalType: "address payable", type: "address" }],
    name: "changeOwner",
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
    inputs: [{ name: "coreDisputeID", internalType: "uint256", type: "uint256" }],
    name: "coreDisputeIDToActive",
    outputs: [
      { name: "dispute", internalType: "bool", type: "bool" },
      { name: "currentRound", internalType: "bool", type: "bool" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "coreDisputeID", internalType: "uint256", type: "uint256" }],
    name: "coreDisputeIDToLocal",
    outputs: [{ name: "localDisputeID", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "currentCourtID", internalType: "uint96", type: "uint96" }],
    name: "courtIDToNextRoundSettings",
    outputs: [
      { name: "enabled", internalType: "bool", type: "bool" },
      { name: "jumpCourtID", internalType: "uint96", type: "uint96" },
      { name: "jumpDisputeKitID", internalType: "uint256", type: "uint256" },
      {
        name: "jumpDisputeKitIDOnCourtJump",
        internalType: "uint256",
        type: "uint256",
      },
      { name: "nbVotes", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_coreDisputeID", internalType: "uint256", type: "uint256" },
      { name: "_coreRoundID", internalType: "uint256", type: "uint256" },
      { name: "_numberOfChoices", internalType: "uint256", type: "uint256" },
      { name: "_extraData", internalType: "bytes", type: "bytes" },
      { name: "", internalType: "uint256", type: "uint256" },
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
      { name: "extraData", internalType: "bytes", type: "bytes" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_coreDisputeID", internalType: "uint256", type: "uint256" },
      { name: "_nonce", internalType: "uint256", type: "uint256" },
      { name: "_roundNbVotes", internalType: "uint256", type: "uint256" },
    ],
    name: "draw",
    outputs: [
      { name: "drawnAddress", internalType: "address", type: "address" },
      { name: "fromSubcourtID", internalType: "uint96", type: "uint96" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_destination", internalType: "address", type: "address" },
      { name: "_amount", internalType: "uint256", type: "uint256" },
      { name: "_data", internalType: "bytes", type: "bytes" },
    ],
    name: "executeOwnerProposal",
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
    name: "getDegreeOfCoherencePenalty",
    outputs: [{ name: "pnkCoherence", internalType: "uint256", type: "uint256" }],
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
    name: "getDegreeOfCoherenceReward",
    outputs: [
      { name: "pnkCoherence", internalType: "uint256", type: "uint256" },
      { name: "feeCoherence", internalType: "uint256", type: "uint256" },
    ],
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
    ],
    name: "getLocalDisputeRoundID",
    outputs: [
      { name: "localDisputeID", internalType: "uint256", type: "uint256" },
      { name: "localRoundID", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "", internalType: "uint256", type: "uint256" },
      { name: "_currentCourtID", internalType: "uint96", type: "uint96" },
      { name: "_parentCourtID", internalType: "uint96", type: "uint96" },
      {
        name: "_currentCourtJurorsForJump",
        internalType: "uint256",
        type: "uint256",
      },
      {
        name: "_currentDisputeKitID",
        internalType: "uint256",
        type: "uint256",
      },
      {
        name: "_currentRoundNbVotes",
        internalType: "uint256",
        type: "uint256",
      },
    ],
    name: "getNextRoundSettings",
    outputs: [
      { name: "newCourtID", internalType: "uint96", type: "uint96" },
      { name: "newDisputeKitID", internalType: "uint256", type: "uint256" },
      { name: "newRoundNbVotes", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "_localDisputeID", internalType: "uint256", type: "uint256" }],
    name: "getNumberOfRounds",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
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
      { name: "totalCommitted", internalType: "uint256", type: "uint256" },
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
    inputs: [
      { name: "_salt", internalType: "uint256", type: "uint256" },
      { name: "_justification", internalType: "string", type: "string" },
    ],
    name: "hashJustification",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "pure",
  },
  {
    type: "function",
    inputs: [
      { name: "_choice", internalType: "uint256", type: "uint256" },
      { name: "_salt", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "string", type: "string" },
    ],
    name: "hashVote",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_owner", internalType: "address", type: "address" },
      { name: "_core", internalType: "contract KlerosCore", type: "address" },
      { name: "_wNative", internalType: "address", type: "address" },
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "_coreDisputeID", internalType: "uint256", type: "uint256" }],
    name: "isAppealFunded",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
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
    inputs: [
      { name: "localDisputeID", internalType: "uint256", type: "uint256" },
      { name: "localRoundID", internalType: "uint256", type: "uint256" },
      { name: "voteID", internalType: "uint256", type: "uint256" },
    ],
    name: "justificationCommitments",
    outputs: [
      {
        name: "justificationCommitment",
        internalType: "bytes32",
        type: "bytes32",
      },
    ],
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
    inputs: [],
    name: "proxiableUUID",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "singleDrawPerJuror",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
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
    inputs: [],
    name: "version",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "wNative",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
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
      { name: "_choice", internalType: "uint256", type: "uint256" },
    ],
    name: "withdrawFeesAndRewards",
    outputs: [{ name: "amount", internalType: "uint256", type: "uint256" }],
    stateMutability: "nonpayable",
  },
] as const;

/**
 *
 */
export const disputeKitShutterImplementationAddress = {
  1337: "0xa82fF9aFd8f496c3d6ac40E2a0F282E47488CFc9",
} as const;

/**
 *
 */
export const disputeKitShutterImplementationConfig = {
  address: disputeKitShutterImplementationAddress,
  abi: disputeKitShutterImplementationAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DisputeKitShutter_Proxy
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const disputeKitShutterProxyAbi = [
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
 *
 */
export const disputeKitShutterProxyAddress = {
  1337: "0x1613beB3B2C4f22Ee086B2b38C1476A3cE7f78E8",
} as const;

/**
 *
 */
export const disputeKitShutterProxyConfig = {
  address: disputeKitShutterProxyAddress,
  abi: disputeKitShutterProxyAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DisputeResolver
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * -
 * - [__View Contract on Gnosis Chiado Blockscout__](https://blockscout.chiadochain.net/address/0x16f20604a51Ac1e68c9aAd1C0E53e951B62CC1Cb)
 */
export const disputeResolverAbi = [
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
  { type: "error", inputs: [], name: "ArbitratorOnly" },
  { type: "error", inputs: [], name: "DisputeAlreadyRuled" },
  { type: "error", inputs: [], name: "OwnerOnly" },
  { type: "error", inputs: [], name: "RulingOutOfBounds" },
  { type: "error", inputs: [], name: "ShouldBeAtLeastTwoRulingOptions" },
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
        name: "_arbitratorDisputeID",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "_templateId",
        internalType: "uint256",
        type: "uint256",
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
    inputs: [{ name: "_owner", internalType: "address", type: "address" }],
    name: "changeOwner",
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
    name: "owner",
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
 * -
 * - [__View Contract on Gnosis Chiado Blockscout__](https://blockscout.chiadochain.net/address/0x16f20604a51Ac1e68c9aAd1C0E53e951B62CC1Cb)
 */
export const disputeResolverAddress = {
  1337: "0x36C02dA8a0983159322a80FFE9F24b1acfF8B570",
  10200: "0x16f20604a51Ac1e68c9aAd1C0E53e951B62CC1Cb",
} as const;

/**
 * -
 * - [__View Contract on Gnosis Chiado Blockscout__](https://blockscout.chiadochain.net/address/0x16f20604a51Ac1e68c9aAd1C0E53e951B62CC1Cb)
 */
export const disputeResolverConfig = {
  address: disputeResolverAddress,
  abi: disputeResolverAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DisputeTemplateRegistry
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * -
 * - [__View Contract on Gnosis Chiado Blockscout__](https://blockscout.chiadochain.net/address/0x96E49552669ea81B8E9cE8694F7E4A55D8bFb957)
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
  { type: "error", inputs: [], name: "OwnerOnly" },
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
    inputs: [{ name: "_owner", internalType: "address", type: "address" }],
    name: "changeOwner",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "_owner", internalType: "address", type: "address" }],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
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
    type: "function",
    inputs: [],
    name: "version",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
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
 * -
 * - [__View Contract on Gnosis Chiado Blockscout__](https://blockscout.chiadochain.net/address/0x96E49552669ea81B8E9cE8694F7E4A55D8bFb957)
 */
export const disputeTemplateRegistryAddress = {
  1337: "0x3Aa5ebB10DC797CAC828524e59A333d0A371443c",
  10200: "0x96E49552669ea81B8E9cE8694F7E4A55D8bFb957",
} as const;

/**
 * -
 * - [__View Contract on Gnosis Chiado Blockscout__](https://blockscout.chiadochain.net/address/0x96E49552669ea81B8E9cE8694F7E4A55D8bFb957)
 */
export const disputeTemplateRegistryConfig = {
  address: disputeTemplateRegistryAddress,
  abi: disputeTemplateRegistryAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DisputeTemplateRegistry_Implementation
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
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
  { type: "error", inputs: [], name: "OwnerOnly" },
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
    inputs: [{ name: "_owner", internalType: "address", type: "address" }],
    name: "changeOwner",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "_owner", internalType: "address", type: "address" }],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
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
    type: "function",
    inputs: [],
    name: "version",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
] as const;

/**
 *
 */
export const disputeTemplateRegistryImplementationAddress = {
  1337: "0x68B1D87F95878fE05B998F19b66F4baba5De1aed",
} as const;

/**
 *
 */
export const disputeTemplateRegistryImplementationConfig = {
  address: disputeTemplateRegistryImplementationAddress,
  abi: disputeTemplateRegistryImplementationAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DisputeTemplateRegistry_Proxy
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
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
 *
 */
export const disputeTemplateRegistryProxyAddress = {
  1337: "0x3Aa5ebB10DC797CAC828524e59A333d0A371443c",
} as const;

/**
 *
 */
export const disputeTemplateRegistryProxyConfig = {
  address: disputeTemplateRegistryProxyAddress,
  abi: disputeTemplateRegistryProxyAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// EvidenceModule
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
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
  { type: "error", inputs: [], name: "OwnerOnly" },
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
        name: "_arbitratorDisputeID",
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
    inputs: [{ name: "_owner", internalType: "address", type: "address" }],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
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
    inputs: [],
    name: "proxiableUUID",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
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
    type: "function",
    inputs: [],
    name: "version",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
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
 *
 */
export const evidenceModuleAddress = {
  1337: "0x9A9f2CCfdE556A7E9Ff0848998Aa4a0CFD8863AE",
} as const;

/**
 *
 */
export const evidenceModuleConfig = {
  address: evidenceModuleAddress,
  abi: evidenceModuleAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// EvidenceModule_Implementation
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
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
  { type: "error", inputs: [], name: "OwnerOnly" },
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
        name: "_arbitratorDisputeID",
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
    inputs: [{ name: "_owner", internalType: "address", type: "address" }],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
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
    inputs: [],
    name: "proxiableUUID",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
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
    type: "function",
    inputs: [],
    name: "version",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
] as const;

/**
 *
 */
export const evidenceModuleImplementationAddress = {
  1337: "0x959922bE3CAee4b8Cd9a407cc3ac1C251C2007B1",
} as const;

/**
 *
 */
export const evidenceModuleImplementationConfig = {
  address: evidenceModuleImplementationAddress,
  abi: evidenceModuleImplementationAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// EvidenceModule_Proxy
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
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
 *
 */
export const evidenceModuleProxyAddress = {
  1337: "0x9A9f2CCfdE556A7E9Ff0848998Aa4a0CFD8863AE",
} as const;

/**
 *
 */
export const evidenceModuleProxyConfig = {
  address: evidenceModuleProxyAddress,
  abi: evidenceModuleProxyAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ForeignGatewayOnGnosis
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Gnosis Chiado Blockscout__](https://blockscout.chiadochain.net/address/0x078dAd05373d19d7fd6829735b765F12242a4300)
 */
export const foreignGatewayOnGnosisAbi = [
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
    type: "function",
    inputs: [],
    name: "DEFAULT_NB_OF_JURORS",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "", internalType: "bytes", type: "bytes" },
      { name: "", internalType: "contract IERC20", type: "address" },
    ],
    name: "arbitrationCost",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "pure",
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
      { name: "_courtID", internalType: "uint96", type: "uint96" },
      { name: "_feeForJuror", internalType: "uint256", type: "uint256" },
    ],
    name: "changeCourtJurorFee",
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
    inputs: [{ name: "_homeGateway", internalType: "address", type: "address" }],
    name: "changeHomeGateway",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_veaOutbox", internalType: "address", type: "address" },
      { name: "_gracePeriod", internalType: "uint256", type: "uint256" },
    ],
    name: "changeVea",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_choices", internalType: "uint256", type: "uint256" },
      { name: "_extraData", internalType: "bytes", type: "bytes" },
    ],
    name: "createDispute",
    outputs: [{ name: "disputeID", internalType: "uint256", type: "uint256" }],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [
      { name: "", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "bytes", type: "bytes" },
      { name: "", internalType: "contract IERC20", type: "address" },
      { name: "", internalType: "uint256", type: "uint256" },
    ],
    name: "createDispute",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "pure",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    name: "currentRuling",
    outputs: [
      { name: "", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "bool", type: "bool" },
      { name: "", internalType: "bool", type: "bool" },
    ],
    stateMutability: "pure",
  },
  {
    type: "function",
    inputs: [],
    name: "deprecatedVeaOutbox",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "deprecatedVeaOutboxExpiration",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "_disputeHash", internalType: "bytes32", type: "bytes32" }],
    name: "disputeHashToForeignID",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
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
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "uint96", type: "uint96" }],
    name: "feeForJuror",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
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
    name: "homeChainID",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "homeGateway",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_governor", internalType: "address", type: "address" },
      { name: "_veaOutbox", internalType: "address", type: "address" },
      { name: "_homeChainID", internalType: "uint256", type: "uint256" },
      { name: "_homeGateway", internalType: "address", type: "address" },
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
    inputs: [
      { name: "_messageSender", internalType: "address", type: "address" },
      { name: "_disputeHash", internalType: "bytes32", type: "bytes32" },
      { name: "_ruling", internalType: "uint256", type: "uint256" },
      { name: "_relayer", internalType: "address", type: "address" },
    ],
    name: "relayRule",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "senderGateway",
    outputs: [{ name: "", internalType: "address", type: "address" }],
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
    inputs: [],
    name: "veaOutbox",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "_disputeHash", internalType: "bytes32", type: "bytes32" }],
    name: "withdrawFees",
    outputs: [],
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
  abi: foreignGatewayOnGnosisAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ForeignGatewayOnGnosis_Implementation
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Gnosis Chiado Blockscout__](https://blockscout.chiadochain.net/address/0xA4096fDA5291D5bbDD5Ed0D6CF2AF98229168Ace)
 */
export const foreignGatewayOnGnosisImplementationAbi = [
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
    type: "function",
    inputs: [],
    name: "DEFAULT_NB_OF_JURORS",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "", internalType: "bytes", type: "bytes" },
      { name: "", internalType: "contract IERC20", type: "address" },
    ],
    name: "arbitrationCost",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "pure",
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
      { name: "_courtID", internalType: "uint96", type: "uint96" },
      { name: "_feeForJuror", internalType: "uint256", type: "uint256" },
    ],
    name: "changeCourtJurorFee",
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
    inputs: [{ name: "_homeGateway", internalType: "address", type: "address" }],
    name: "changeHomeGateway",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_veaOutbox", internalType: "address", type: "address" },
      { name: "_gracePeriod", internalType: "uint256", type: "uint256" },
    ],
    name: "changeVea",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_choices", internalType: "uint256", type: "uint256" },
      { name: "_extraData", internalType: "bytes", type: "bytes" },
    ],
    name: "createDispute",
    outputs: [{ name: "disputeID", internalType: "uint256", type: "uint256" }],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [
      { name: "", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "bytes", type: "bytes" },
      { name: "", internalType: "contract IERC20", type: "address" },
      { name: "", internalType: "uint256", type: "uint256" },
    ],
    name: "createDispute",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "pure",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    name: "currentRuling",
    outputs: [
      { name: "", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "bool", type: "bool" },
      { name: "", internalType: "bool", type: "bool" },
    ],
    stateMutability: "pure",
  },
  {
    type: "function",
    inputs: [],
    name: "deprecatedVeaOutbox",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "deprecatedVeaOutboxExpiration",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "_disputeHash", internalType: "bytes32", type: "bytes32" }],
    name: "disputeHashToForeignID",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
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
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "uint96", type: "uint96" }],
    name: "feeForJuror",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
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
    name: "homeChainID",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "homeGateway",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_governor", internalType: "address", type: "address" },
      { name: "_veaOutbox", internalType: "address", type: "address" },
      { name: "_homeChainID", internalType: "uint256", type: "uint256" },
      { name: "_homeGateway", internalType: "address", type: "address" },
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
    inputs: [
      { name: "_messageSender", internalType: "address", type: "address" },
      { name: "_disputeHash", internalType: "bytes32", type: "bytes32" },
      { name: "_ruling", internalType: "uint256", type: "uint256" },
      { name: "_relayer", internalType: "address", type: "address" },
    ],
    name: "relayRule",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "senderGateway",
    outputs: [{ name: "", internalType: "address", type: "address" }],
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
    inputs: [],
    name: "veaOutbox",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "_disputeHash", internalType: "bytes32", type: "bytes32" }],
    name: "withdrawFees",
    outputs: [],
    stateMutability: "nonpayable",
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
  abi: foreignGatewayOnGnosisImplementationAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ForeignGatewayOnGnosis_Proxy
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Gnosis Chiado Blockscout__](https://blockscout.chiadochain.net/address/0x078dAd05373d19d7fd6829735b765F12242a4300)
 */
export const foreignGatewayOnGnosisProxyAbi = [
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
  abi: foreignGatewayOnGnosisProxyAbi,
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
        name: "_templateId",
        internalType: "uint256",
        type: "uint256",
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
        name: "_arbitratorDisputeID",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "_templateId",
        internalType: "uint256",
        type: "uint256",
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
          { name: "templateId", internalType: "uint256", type: "uint256" },
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
          { name: "templateId", internalType: "uint256", type: "uint256" },
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
// KlerosCore
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const klerosCoreAbi = [
  { type: "fallback", stateMutability: "payable" },
  { type: "receive", stateMutability: "payable" },
  { type: "error", inputs: [], name: "AlreadyInitialized" },
  { type: "error", inputs: [], name: "AppealFeesNotEnough" },
  { type: "error", inputs: [], name: "AppealPeriodNotPassed" },
  { type: "error", inputs: [], name: "ArbitrableNotWhitelisted" },
  { type: "error", inputs: [], name: "ArbitrationFeesNotEnough" },
  { type: "error", inputs: [], name: "CannotDisableClassicDK" },
  { type: "error", inputs: [], name: "CommitPeriodNotPassed" },
  { type: "error", inputs: [], name: "DisputeKitNotSupportedByCourt" },
  { type: "error", inputs: [], name: "DisputeKitOnly" },
  { type: "error", inputs: [], name: "DisputeNotAppealable" },
  { type: "error", inputs: [], name: "DisputePeriodIsFinal" },
  { type: "error", inputs: [], name: "DisputeStillDrawing" },
  { type: "error", inputs: [], name: "EvidenceNotPassedAndNotAppeal" },
  { type: "error", inputs: [], name: "FailedDelegateCall" },
  { type: "error", inputs: [], name: "GuardianOrOwnerOnly" },
  { type: "error", inputs: [], name: "InvalidDisputeKitParent" },
  { type: "error", inputs: [], name: "InvalidForkingCourtAsParent" },
  {
    type: "error",
    inputs: [{ name: "implementation", internalType: "address", type: "address" }],
    name: "InvalidImplementation",
  },
  {
    type: "error",
    inputs: [{ name: "_childCourtID", internalType: "uint256", type: "uint256" }],
    name: "MinStakeHigherThanChildCourt",
  },
  { type: "error", inputs: [], name: "MinStakeLowerThanParentCourt" },
  { type: "error", inputs: [], name: "MustSupportDisputeKitClassic" },
  { type: "error", inputs: [], name: "NotEligibleForStaking" },
  { type: "error", inputs: [], name: "NotEvidencePeriod" },
  { type: "error", inputs: [], name: "NotExecutionPeriod" },
  { type: "error", inputs: [], name: "NotInitializing" },
  { type: "error", inputs: [], name: "OwnerOnly" },
  { type: "error", inputs: [], name: "RulingAlreadyExecuted" },
  { type: "error", inputs: [], name: "SortitionModuleOnly" },
  { type: "error", inputs: [], name: "StakingInTooManyCourts" },
  { type: "error", inputs: [], name: "StakingLessThanCourtMinStake" },
  { type: "error", inputs: [], name: "StakingMoreThanMaxStakePerJuror" },
  { type: "error", inputs: [], name: "StakingMoreThanMaxTotalStaked" },
  { type: "error", inputs: [], name: "StakingNotPossibleInThisCourt" },
  { type: "error", inputs: [], name: "StakingTransferFailed" },
  { type: "error", inputs: [], name: "StakingZeroWhenNoStake" },
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
        internalType: "uint96",
        type: "uint96",
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
        name: "_degreeOfCoherencyPnk",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "_degreeOfCoherencyFee",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "_amountPnk",
        internalType: "int256",
        type: "int256",
        indexed: false,
      },
      {
        name: "_amountFee",
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
    name: "JurorRewardPenalty",
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
        name: "_amountPnk",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "_amountFee",
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
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
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
    inputs: [],
    name: "arbitrableWhitelistEnabled",
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
    inputs: [{ name: "_enabled", internalType: "bool", type: "bool" }],
    name: "changeArbitrableWhitelistEnabled",
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
    inputs: [{ name: "_owner", internalType: "address payable", type: "address" }],
    name: "changeOwner",
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
      { name: "period", internalType: "enum KlerosCore.Period", type: "uint8" },
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
    outputs: [{ name: "nbDrawnJurors", internalType: "uint256", type: "uint256" }],
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
    name: "executeOwnerProposal",
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
    inputs: [{ name: "_disputeID", internalType: "uint256", type: "uint256" }],
    name: "getCourtAndDisputeKitJumps",
    outputs: [
      { name: "newCourtID", internalType: "uint96", type: "uint96" },
      { name: "newDisputeKitID", internalType: "uint256", type: "uint256" },
      { name: "newRoundNbVotes", internalType: "uint256", type: "uint256" },
      { name: "courtJump", internalType: "bool", type: "bool" },
      { name: "disputeKitJump", internalType: "bool", type: "bool" },
    ],
    stateMutability: "view",
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
    name: "getPnkAtStakePerJuror",
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
            name: "drawnJurorFromCourtIDs",
            internalType: "uint96[]",
            type: "uint96[]",
          },
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
          { name: "__gap", internalType: "uint256[10]", type: "uint256[10]" },
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
    name: "guardian",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_owner", internalType: "address", type: "address" },
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
      { name: "_wNative", internalType: "address", type: "address" },
      { name: "_jurorNft", internalType: "contract IERC721", type: "address" },
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
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
    inputs: [],
    name: "owner",
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
    ],
    name: "setStakeBySortitionModule",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
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
    inputs: [
      { name: "_account", internalType: "address", type: "address" },
      { name: "_amount", internalType: "uint256", type: "uint256" },
    ],
    name: "transferBySortitionModule",
    outputs: [],
    stateMutability: "nonpayable",
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
    type: "function",
    inputs: [],
    name: "version",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "wNative",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
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
 *
 */
export const klerosCoreAddress = {
  1337: "0x4A679253410272dd5232B3Ff7cF5dbB88f295319",
} as const;

/**
 *
 */
export const klerosCoreConfig = {
  address: klerosCoreAddress,
  abi: klerosCoreAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// KlerosCoreSnapshotProxy
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const klerosCoreSnapshotProxyAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "_owner", internalType: "address", type: "address" },
      { name: "_core", internalType: "contract IKlerosCore", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  { type: "error", inputs: [], name: "OwnerOnly" },
  {
    type: "function",
    inputs: [{ name: "_account", internalType: "address", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "totalStaked", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "_core", internalType: "contract IKlerosCore", type: "address" }],
    name: "changeCore",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "_owner", internalType: "address", type: "address" }],
    name: "changeOwner",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "core",
    outputs: [{ name: "", internalType: "contract IKlerosCore", type: "address" }],
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
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
] as const;

/**
 *
 */
export const klerosCoreSnapshotProxyAddress = {
  1337: "0x5eb3Bc0a489C5A8288765d2336659EbCA68FCd00",
} as const;

/**
 *
 */
export const klerosCoreSnapshotProxyConfig = {
  address: klerosCoreSnapshotProxyAddress,
  abi: klerosCoreSnapshotProxyAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// KlerosCore_Implementation
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const klerosCoreImplementationAbi = [
  { type: "constructor", inputs: [], stateMutability: "nonpayable" },
  { type: "error", inputs: [], name: "AlreadyInitialized" },
  { type: "error", inputs: [], name: "AppealFeesNotEnough" },
  { type: "error", inputs: [], name: "AppealPeriodNotPassed" },
  { type: "error", inputs: [], name: "ArbitrableNotWhitelisted" },
  { type: "error", inputs: [], name: "ArbitrationFeesNotEnough" },
  { type: "error", inputs: [], name: "CannotDisableClassicDK" },
  { type: "error", inputs: [], name: "CommitPeriodNotPassed" },
  { type: "error", inputs: [], name: "DisputeKitNotSupportedByCourt" },
  { type: "error", inputs: [], name: "DisputeKitOnly" },
  { type: "error", inputs: [], name: "DisputeNotAppealable" },
  { type: "error", inputs: [], name: "DisputePeriodIsFinal" },
  { type: "error", inputs: [], name: "DisputeStillDrawing" },
  { type: "error", inputs: [], name: "EvidenceNotPassedAndNotAppeal" },
  { type: "error", inputs: [], name: "FailedDelegateCall" },
  { type: "error", inputs: [], name: "GuardianOrOwnerOnly" },
  { type: "error", inputs: [], name: "InvalidDisputeKitParent" },
  { type: "error", inputs: [], name: "InvalidForkingCourtAsParent" },
  {
    type: "error",
    inputs: [{ name: "implementation", internalType: "address", type: "address" }],
    name: "InvalidImplementation",
  },
  {
    type: "error",
    inputs: [{ name: "_childCourtID", internalType: "uint256", type: "uint256" }],
    name: "MinStakeHigherThanChildCourt",
  },
  { type: "error", inputs: [], name: "MinStakeLowerThanParentCourt" },
  { type: "error", inputs: [], name: "MustSupportDisputeKitClassic" },
  { type: "error", inputs: [], name: "NotEligibleForStaking" },
  { type: "error", inputs: [], name: "NotEvidencePeriod" },
  { type: "error", inputs: [], name: "NotExecutionPeriod" },
  { type: "error", inputs: [], name: "NotInitializing" },
  { type: "error", inputs: [], name: "OwnerOnly" },
  { type: "error", inputs: [], name: "RulingAlreadyExecuted" },
  { type: "error", inputs: [], name: "SortitionModuleOnly" },
  { type: "error", inputs: [], name: "StakingInTooManyCourts" },
  { type: "error", inputs: [], name: "StakingLessThanCourtMinStake" },
  { type: "error", inputs: [], name: "StakingMoreThanMaxStakePerJuror" },
  { type: "error", inputs: [], name: "StakingMoreThanMaxTotalStaked" },
  { type: "error", inputs: [], name: "StakingNotPossibleInThisCourt" },
  { type: "error", inputs: [], name: "StakingTransferFailed" },
  { type: "error", inputs: [], name: "StakingZeroWhenNoStake" },
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
        internalType: "uint96",
        type: "uint96",
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
        name: "_degreeOfCoherencyPnk",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "_degreeOfCoherencyFee",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "_amountPnk",
        internalType: "int256",
        type: "int256",
        indexed: false,
      },
      {
        name: "_amountFee",
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
    name: "JurorRewardPenalty",
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
        name: "_amountPnk",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "_amountFee",
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
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
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
    inputs: [],
    name: "arbitrableWhitelistEnabled",
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
    inputs: [{ name: "_enabled", internalType: "bool", type: "bool" }],
    name: "changeArbitrableWhitelistEnabled",
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
    inputs: [{ name: "_owner", internalType: "address payable", type: "address" }],
    name: "changeOwner",
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
      { name: "period", internalType: "enum KlerosCore.Period", type: "uint8" },
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
    outputs: [{ name: "nbDrawnJurors", internalType: "uint256", type: "uint256" }],
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
    name: "executeOwnerProposal",
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
    inputs: [{ name: "_disputeID", internalType: "uint256", type: "uint256" }],
    name: "getCourtAndDisputeKitJumps",
    outputs: [
      { name: "newCourtID", internalType: "uint96", type: "uint96" },
      { name: "newDisputeKitID", internalType: "uint256", type: "uint256" },
      { name: "newRoundNbVotes", internalType: "uint256", type: "uint256" },
      { name: "courtJump", internalType: "bool", type: "bool" },
      { name: "disputeKitJump", internalType: "bool", type: "bool" },
    ],
    stateMutability: "view",
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
    name: "getPnkAtStakePerJuror",
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
            name: "drawnJurorFromCourtIDs",
            internalType: "uint96[]",
            type: "uint96[]",
          },
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
          { name: "__gap", internalType: "uint256[10]", type: "uint256[10]" },
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
    name: "guardian",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_owner", internalType: "address", type: "address" },
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
      { name: "_wNative", internalType: "address", type: "address" },
      { name: "_jurorNft", internalType: "contract IERC721", type: "address" },
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
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
    inputs: [],
    name: "owner",
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
    ],
    name: "setStakeBySortitionModule",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
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
    inputs: [
      { name: "_account", internalType: "address", type: "address" },
      { name: "_amount", internalType: "uint256", type: "uint256" },
    ],
    name: "transferBySortitionModule",
    outputs: [],
    stateMutability: "nonpayable",
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
    type: "function",
    inputs: [],
    name: "version",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "wNative",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
] as const;

/**
 *
 */
export const klerosCoreImplementationAddress = {
  1337: "0xa85233C63b9Ee964Add6F2cffe00Fd84eb32338f",
} as const;

/**
 *
 */
export const klerosCoreImplementationConfig = {
  address: klerosCoreImplementationAddress,
  abi: klerosCoreImplementationAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// KlerosCore_Proxy
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const klerosCoreProxyAbi = [
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
 *
 */
export const klerosCoreProxyAddress = {
  1337: "0x4A679253410272dd5232B3Ff7cF5dbB88f295319",
} as const;

/**
 *
 */
export const klerosCoreProxyConfig = {
  address: klerosCoreProxyAddress,
  abi: klerosCoreProxyAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PNK
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const pnkAbi = [
  { type: "constructor", inputs: [], stateMutability: "nonpayable" },
  {
    type: "error",
    inputs: [
      { name: "spender", internalType: "address", type: "address" },
      { name: "allowance", internalType: "uint256", type: "uint256" },
      { name: "needed", internalType: "uint256", type: "uint256" },
    ],
    name: "ERC20InsufficientAllowance",
  },
  {
    type: "error",
    inputs: [
      { name: "sender", internalType: "address", type: "address" },
      { name: "balance", internalType: "uint256", type: "uint256" },
      { name: "needed", internalType: "uint256", type: "uint256" },
    ],
    name: "ERC20InsufficientBalance",
  },
  {
    type: "error",
    inputs: [{ name: "approver", internalType: "address", type: "address" }],
    name: "ERC20InvalidApprover",
  },
  {
    type: "error",
    inputs: [{ name: "receiver", internalType: "address", type: "address" }],
    name: "ERC20InvalidReceiver",
  },
  {
    type: "error",
    inputs: [{ name: "sender", internalType: "address", type: "address" }],
    name: "ERC20InvalidSender",
  },
  {
    type: "error",
    inputs: [{ name: "spender", internalType: "address", type: "address" }],
    name: "ERC20InvalidSpender",
  },
  {
    type: "error",
    inputs: [{ name: "owner", internalType: "address", type: "address" }],
    name: "OwnableInvalidOwner",
  },
  {
    type: "error",
    inputs: [{ name: "account", internalType: "address", type: "address" }],
    name: "OwnableUnauthorizedAccount",
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
      { name: "value", internalType: "uint256", type: "uint256" },
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
    inputs: [{ name: "value", internalType: "uint256", type: "uint256" }],
    name: "burn",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "account", internalType: "address", type: "address" },
      { name: "value", internalType: "uint256", type: "uint256" },
    ],
    name: "burnFrom",
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
      { name: "amount", internalType: "uint256", type: "uint256" },
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
    inputs: [],
    name: "owner",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "_token", internalType: "address", type: "address" }],
    name: "recoverTokens",
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
    inputs: [{ name: "newOwner", internalType: "address", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;

/**
 *
 */
export const pnkAddress = {
  1337: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",
} as const;

/**
 *
 */
export const pnkConfig = { address: pnkAddress, abi: pnkAbi } as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PNKFaucet
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
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
    inputs: [{ name: "_owner", internalType: "address", type: "address" }],
    name: "changeOwner",
    outputs: [],
    stateMutability: "nonpayable",
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
 *
 */
export const pnkFaucetAddress = {
  1337: "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707",
} as const;

/**
 *
 */
export const pnkFaucetConfig = {
  address: pnkFaucetAddress,
  abi: pnkFaucetAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PinakionV2
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x593e89704D285B0c3fbF157c7CF2537456CE64b5)
 */
export const pinakionV2Abi = [
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
    inputs: [{ name: "amount", internalType: "uint256", type: "uint256" }],
    name: "burn",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "account", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
    ],
    name: "burnFrom",
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
      { name: "amount", internalType: "uint256", type: "uint256" },
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
    inputs: [],
    name: "owner",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "_token", internalType: "address", type: "address" }],
    name: "recoverTokens",
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
  {
    type: "function",
    inputs: [{ name: "newOwner", internalType: "address", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x593e89704D285B0c3fbF157c7CF2537456CE64b5)
 */
export const pinakionV2Address = {
  11155111: "0x593e89704D285B0c3fbF157c7CF2537456CE64b5",
} as const;

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x593e89704D285B0c3fbF157c7CF2537456CE64b5)
 */
export const pinakionV2Config = {
  address: pinakionV2Address,
  abi: pinakionV2Abi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PolicyRegistry
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
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
  { type: "error", inputs: [], name: "OwnerOnly" },
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
    inputs: [{ name: "_owner", internalType: "address", type: "address" }],
    name: "changeOwner",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "_owner", internalType: "address", type: "address" }],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
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
    type: "function",
    inputs: [],
    name: "version",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
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
 *
 */
export const policyRegistryAddress = {
  1337: "0x0B306BF915C4d645ff596e518fAf3F9669b97016",
} as const;

/**
 *
 */
export const policyRegistryConfig = {
  address: policyRegistryAddress,
  abi: policyRegistryAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PolicyRegistry_Implementation
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
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
  { type: "error", inputs: [], name: "OwnerOnly" },
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
    inputs: [{ name: "_owner", internalType: "address", type: "address" }],
    name: "changeOwner",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "_owner", internalType: "address", type: "address" }],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
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
    type: "function",
    inputs: [],
    name: "version",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
] as const;

/**
 *
 */
export const policyRegistryImplementationAddress = {
  1337: "0x9A676e781A523b5d0C0e43731313A708CB607508",
} as const;

/**
 *
 */
export const policyRegistryImplementationConfig = {
  address: policyRegistryImplementationAddress,
  abi: policyRegistryImplementationAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PolicyRegistry_Proxy
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
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
 *
 */
export const policyRegistryProxyAddress = {
  1337: "0x0B306BF915C4d645ff596e518fAf3F9669b97016",
} as const;

/**
 *
 */
export const policyRegistryProxyConfig = {
  address: policyRegistryProxyAddress,
  abi: policyRegistryProxyAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// RNGWithFallback
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const rngWithFallbackAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "_owner", internalType: "address", type: "address" },
      { name: "_consumer", internalType: "address", type: "address" },
      {
        name: "_fallbackTimeoutSeconds",
        internalType: "uint256",
        type: "uint256",
      },
      { name: "_rng", internalType: "contract IRNG", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  { type: "error", inputs: [], name: "ConsumerOnly" },
  { type: "error", inputs: [], name: "InvalidDefaultRNG" },
  { type: "error", inputs: [], name: "OwnerOnly" },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "_newTimeout",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "FallbackTimeoutChanged",
  },
  { type: "event", anonymous: false, inputs: [], name: "RNGFallback" },
  {
    type: "function",
    inputs: [{ name: "_consumer", internalType: "address", type: "address" }],
    name: "changeConsumer",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "_fallbackTimeoutSeconds",
        internalType: "uint256",
        type: "uint256",
      },
    ],
    name: "changeFallbackTimeout",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "_newOwner", internalType: "address", type: "address" }],
    name: "changeOwner",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "consumer",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "fallbackTimeoutSeconds",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
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
    inputs: [],
    name: "receiveRandomness",
    outputs: [{ name: "randomNumber", internalType: "uint256", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "requestRandomness",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "requestTimestamp",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "rng",
    outputs: [{ name: "", internalType: "contract IRNG", type: "address" }],
    stateMutability: "view",
  },
] as const;

/**
 *
 */
export const rngWithFallbackAddress = {
  1337: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
} as const;

/**
 *
 */
export const rngWithFallbackConfig = {
  address: rngWithFallbackAddress,
  abi: rngWithFallbackAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SortitionModule
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const sortitionModuleAbi = [
  { type: "fallback", stateMutability: "payable" },
  { type: "receive", stateMutability: "payable" },
  { type: "error", inputs: [], name: "AlreadyInitialized" },
  {
    type: "error",
    inputs: [],
    name: "DisputesWithoutJurorsAndMaxDrawingTimeNotPassed",
  },
  { type: "error", inputs: [], name: "FailedDelegateCall" },
  {
    type: "error",
    inputs: [{ name: "implementation", internalType: "address", type: "address" }],
    name: "InvalidImplementation",
  },
  { type: "error", inputs: [], name: "KMustBeGreaterThanOne" },
  { type: "error", inputs: [], name: "KlerosCoreOnly" },
  { type: "error", inputs: [], name: "MinStakingTimeNotPassed" },
  { type: "error", inputs: [], name: "NoDelayedStakeToExecute" },
  { type: "error", inputs: [], name: "NoDisputesThatNeedJurors" },
  { type: "error", inputs: [], name: "NotDrawingPhase" },
  { type: "error", inputs: [], name: "NotEligibleForWithdrawal" },
  { type: "error", inputs: [], name: "NotInitializing" },
  { type: "error", inputs: [], name: "NotStakingPhase" },
  { type: "error", inputs: [], name: "OwnerOnly" },
  { type: "error", inputs: [], name: "RandomNumberNotReady" },
  { type: "error", inputs: [], name: "TreeAlreadyExists" },
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
        name: "_account",
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
    name: "LeftoverPNK",
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
        name: "_amount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "LeftoverPNKWithdrawn",
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
    name: "StakeDelayed",
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
    name: "StakeDelayedExecutionFailed",
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
      {
        name: "_amountAllCourts",
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
    inputs: [{ name: "_owner", internalType: "address", type: "address" }],
    name: "changeOwner",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "_rng", internalType: "contract IRNG", type: "address" }],
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
      { name: "_courtID", internalType: "uint96", type: "uint96" },
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
      { name: "_courtID", internalType: "uint96", type: "uint96" },
      { name: "_coreDisputeID", internalType: "uint256", type: "uint256" },
      { name: "_nonce", internalType: "uint256", type: "uint256" },
    ],
    name: "draw",
    outputs: [
      { name: "drawnAddress", internalType: "address", type: "address" },
      { name: "fromSubcourtID", internalType: "uint96", type: "uint96" },
    ],
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
      { name: "_account", internalType: "address", type: "address" },
      { name: "_courtID", internalType: "uint96", type: "uint96" },
    ],
    name: "forcedUnstake",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "_account", internalType: "address", type: "address" }],
    name: "forcedUnstakeAllCourts",
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
      { name: "totalStakedPnk", internalType: "uint256", type: "uint256" },
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
    inputs: [{ name: "_juror", internalType: "address", type: "address" }],
    name: "getJurorLeftoverPNK",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_owner", internalType: "address", type: "address" },
      { name: "_core", internalType: "contract KlerosCore", type: "address" },
      { name: "_minStakingTime", internalType: "uint256", type: "uint256" },
      { name: "_maxDrawingTime", internalType: "uint256", type: "uint256" },
      { name: "_rng", internalType: "contract IRNG", type: "address" },
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
    inputs: [{ name: "account", internalType: "address", type: "address" }],
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
    inputs: [],
    name: "owner",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
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
    name: "rng",
    outputs: [{ name: "", internalType: "contract IRNG", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_account", internalType: "address", type: "address" },
      { name: "_courtID", internalType: "uint96", type: "uint96" },
      { name: "_pnkDeposit", internalType: "uint256", type: "uint256" },
      { name: "_pnkWithdrawal", internalType: "uint256", type: "uint256" },
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
      { name: "_penalty", internalType: "uint256", type: "uint256" },
    ],
    name: "setStakePenalty",
    outputs: [
      { name: "pnkBalance", internalType: "uint256", type: "uint256" },
      { name: "newCourtStake", internalType: "uint256", type: "uint256" },
      { name: "availablePenalty", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_account", internalType: "address", type: "address" },
      { name: "_courtID", internalType: "uint96", type: "uint96" },
      { name: "_reward", internalType: "uint256", type: "uint256" },
    ],
    name: "setStakeReward",
    outputs: [{ name: "success", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
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
    type: "function",
    inputs: [
      { name: "_account", internalType: "address", type: "address" },
      { name: "_courtID", internalType: "uint96", type: "uint96" },
      { name: "_newStake", internalType: "uint256", type: "uint256" },
      { name: "_noDelay", internalType: "bool", type: "bool" },
    ],
    name: "validateStake",
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
    inputs: [],
    name: "version",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "_account", internalType: "address", type: "address" }],
    name: "withdrawLeftoverPNK",
    outputs: [],
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
 *
 */
export const sortitionModuleAddress = {
  1337: "0x322813Fd9A801c5507c9de605d63CEA4f2CE6c44",
} as const;

/**
 *
 */
export const sortitionModuleConfig = {
  address: sortitionModuleAddress,
  abi: sortitionModuleAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SortitionModule_Implementation
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const sortitionModuleImplementationAbi = [
  { type: "constructor", inputs: [], stateMutability: "nonpayable" },
  { type: "error", inputs: [], name: "AlreadyInitialized" },
  {
    type: "error",
    inputs: [],
    name: "DisputesWithoutJurorsAndMaxDrawingTimeNotPassed",
  },
  { type: "error", inputs: [], name: "FailedDelegateCall" },
  {
    type: "error",
    inputs: [{ name: "implementation", internalType: "address", type: "address" }],
    name: "InvalidImplementation",
  },
  { type: "error", inputs: [], name: "KMustBeGreaterThanOne" },
  { type: "error", inputs: [], name: "KlerosCoreOnly" },
  { type: "error", inputs: [], name: "MinStakingTimeNotPassed" },
  { type: "error", inputs: [], name: "NoDelayedStakeToExecute" },
  { type: "error", inputs: [], name: "NoDisputesThatNeedJurors" },
  { type: "error", inputs: [], name: "NotDrawingPhase" },
  { type: "error", inputs: [], name: "NotEligibleForWithdrawal" },
  { type: "error", inputs: [], name: "NotInitializing" },
  { type: "error", inputs: [], name: "NotStakingPhase" },
  { type: "error", inputs: [], name: "OwnerOnly" },
  { type: "error", inputs: [], name: "RandomNumberNotReady" },
  { type: "error", inputs: [], name: "TreeAlreadyExists" },
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
        name: "_account",
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
    name: "LeftoverPNK",
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
        name: "_amount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "LeftoverPNKWithdrawn",
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
    name: "StakeDelayed",
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
    name: "StakeDelayedExecutionFailed",
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
      {
        name: "_amountAllCourts",
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
    inputs: [{ name: "_owner", internalType: "address", type: "address" }],
    name: "changeOwner",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "_rng", internalType: "contract IRNG", type: "address" }],
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
      { name: "_courtID", internalType: "uint96", type: "uint96" },
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
      { name: "_courtID", internalType: "uint96", type: "uint96" },
      { name: "_coreDisputeID", internalType: "uint256", type: "uint256" },
      { name: "_nonce", internalType: "uint256", type: "uint256" },
    ],
    name: "draw",
    outputs: [
      { name: "drawnAddress", internalType: "address", type: "address" },
      { name: "fromSubcourtID", internalType: "uint96", type: "uint96" },
    ],
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
      { name: "_account", internalType: "address", type: "address" },
      { name: "_courtID", internalType: "uint96", type: "uint96" },
    ],
    name: "forcedUnstake",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "_account", internalType: "address", type: "address" }],
    name: "forcedUnstakeAllCourts",
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
      { name: "totalStakedPnk", internalType: "uint256", type: "uint256" },
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
    inputs: [{ name: "_juror", internalType: "address", type: "address" }],
    name: "getJurorLeftoverPNK",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_owner", internalType: "address", type: "address" },
      { name: "_core", internalType: "contract KlerosCore", type: "address" },
      { name: "_minStakingTime", internalType: "uint256", type: "uint256" },
      { name: "_maxDrawingTime", internalType: "uint256", type: "uint256" },
      { name: "_rng", internalType: "contract IRNG", type: "address" },
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
    inputs: [{ name: "account", internalType: "address", type: "address" }],
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
    inputs: [],
    name: "owner",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
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
    name: "rng",
    outputs: [{ name: "", internalType: "contract IRNG", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_account", internalType: "address", type: "address" },
      { name: "_courtID", internalType: "uint96", type: "uint96" },
      { name: "_pnkDeposit", internalType: "uint256", type: "uint256" },
      { name: "_pnkWithdrawal", internalType: "uint256", type: "uint256" },
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
      { name: "_penalty", internalType: "uint256", type: "uint256" },
    ],
    name: "setStakePenalty",
    outputs: [
      { name: "pnkBalance", internalType: "uint256", type: "uint256" },
      { name: "newCourtStake", internalType: "uint256", type: "uint256" },
      { name: "availablePenalty", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_account", internalType: "address", type: "address" },
      { name: "_courtID", internalType: "uint96", type: "uint96" },
      { name: "_reward", internalType: "uint256", type: "uint256" },
    ],
    name: "setStakeReward",
    outputs: [{ name: "success", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
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
    type: "function",
    inputs: [
      { name: "_account", internalType: "address", type: "address" },
      { name: "_courtID", internalType: "uint96", type: "uint96" },
      { name: "_newStake", internalType: "uint256", type: "uint256" },
      { name: "_noDelay", internalType: "bool", type: "bool" },
    ],
    name: "validateStake",
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
    inputs: [],
    name: "version",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "_account", internalType: "address", type: "address" }],
    name: "withdrawLeftoverPNK",
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;

/**
 *
 */
export const sortitionModuleImplementationAddress = {
  1337: "0x4ed7c70F96B99c776995fB64377f0d4aB3B0e1C1",
} as const;

/**
 *
 */
export const sortitionModuleImplementationConfig = {
  address: sortitionModuleImplementationAddress,
  abi: sortitionModuleImplementationAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SortitionModule_Proxy
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const sortitionModuleProxyAbi = [
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
 *
 */
export const sortitionModuleProxyAddress = {
  1337: "0x322813Fd9A801c5507c9de605d63CEA4f2CE6c44",
} as const;

/**
 *
 */
export const sortitionModuleProxyConfig = {
  address: sortitionModuleProxyAddress,
  abi: sortitionModuleProxyAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// TransactionBatcher
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
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
  {
    type: "function",
    inputs: [
      { name: "targets", internalType: "address[]", type: "address[]" },
      { name: "values", internalType: "uint256[]", type: "uint256[]" },
      { name: "datas", internalType: "bytes[]", type: "bytes[]" },
    ],
    name: "batchSendUnchecked",
    outputs: [],
    stateMutability: "payable",
  },
] as const;

/**
 *
 */
export const transactionBatcherAddress = {
  1337: "0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82",
} as const;

/**
 *
 */
export const transactionBatcherConfig = {
  address: transactionBatcherAddress,
  abi: transactionBatcherAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// WETH
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * -
 * - [__View Contract on Gnosis Chiado Blockscout__](https://blockscout.chiadochain.net/address/0x2DFC9c3141268e6eac04a7D6d98Fbf64BDe836a8)
 */
export const wethAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "_name", internalType: "string", type: "string" },
      { name: "_symbol", internalType: "string", type: "string" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "error",
    inputs: [
      { name: "spender", internalType: "address", type: "address" },
      { name: "allowance", internalType: "uint256", type: "uint256" },
      { name: "needed", internalType: "uint256", type: "uint256" },
    ],
    name: "ERC20InsufficientAllowance",
  },
  {
    type: "error",
    inputs: [
      { name: "sender", internalType: "address", type: "address" },
      { name: "balance", internalType: "uint256", type: "uint256" },
      { name: "needed", internalType: "uint256", type: "uint256" },
    ],
    name: "ERC20InsufficientBalance",
  },
  {
    type: "error",
    inputs: [{ name: "approver", internalType: "address", type: "address" }],
    name: "ERC20InvalidApprover",
  },
  {
    type: "error",
    inputs: [{ name: "receiver", internalType: "address", type: "address" }],
    name: "ERC20InvalidReceiver",
  },
  {
    type: "error",
    inputs: [{ name: "sender", internalType: "address", type: "address" }],
    name: "ERC20InvalidSender",
  },
  {
    type: "error",
    inputs: [{ name: "spender", internalType: "address", type: "address" }],
    name: "ERC20InvalidSpender",
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
      { name: "value", internalType: "uint256", type: "uint256" },
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
] as const;

/**
 * -
 * - [__View Contract on Gnosis Chiado Blockscout__](https://blockscout.chiadochain.net/address/0x2DFC9c3141268e6eac04a7D6d98Fbf64BDe836a8)
 */
export const wethAddress = {
  1337: "0x610178dA211FEF7D417bC0e6FeD39F05609AD788",
  10200: "0x2DFC9c3141268e6eac04a7D6d98Fbf64BDe836a8",
} as const;

/**
 * -
 * - [__View Contract on Gnosis Chiado Blockscout__](https://blockscout.chiadochain.net/address/0x2DFC9c3141268e6eac04a7D6d98Fbf64BDe836a8)
 */
export const wethConfig = { address: wethAddress, abi: wethAbi } as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// WETHFaucet
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * -
 * - [__View Contract on Gnosis Chiado Blockscout__](https://blockscout.chiadochain.net/address/0x22CB016c4b57413ca4DF5F1AC44a0E0d3c69811F)
 */
export const wethFaucetAbi = [
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
    inputs: [{ name: "_owner", internalType: "address", type: "address" }],
    name: "changeOwner",
    outputs: [],
    stateMutability: "nonpayable",
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
 * -
 * - [__View Contract on Gnosis Chiado Blockscout__](https://blockscout.chiadochain.net/address/0x22CB016c4b57413ca4DF5F1AC44a0E0d3c69811F)
 */
export const wethFaucetAddress = {
  1337: "0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e",
  10200: "0x22CB016c4b57413ca4DF5F1AC44a0E0d3c69811F",
} as const;

/**
 * -
 * - [__View Contract on Gnosis Chiado Blockscout__](https://blockscout.chiadochain.net/address/0x22CB016c4b57413ca4DF5F1AC44a0E0d3c69811F)
 */
export const wethFaucetConfig = {
  address: wethFaucetAddress,
  abi: wethFaucetAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// WPNKFaucet
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Gnosis Chiado Blockscout__](https://blockscout.chiadochain.net/address/0x5898aeE045A25B276369914c3448B72a41758B2c)
 */
export const wpnkFaucetAbi = [
  {
    type: "constructor",
    inputs: [{ name: "_token", internalType: "contract IERC20", type: "address" }],
    stateMutability: "nonpayable",
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
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "withdrewAlready",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
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
  abi: wpnkFaucetAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// WrappedPinakionV2
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Gnosis Chiado Blockscout__](https://blockscout.chiadochain.net/address/0xD75E27A56AaF9eE7F8d9A472a8C2EF2f65a764dd)
 */
export const wrappedPinakionV2Abi = [
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
  abi: wrappedPinakionV2Abi,
} as const;
