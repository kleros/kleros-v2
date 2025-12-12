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
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x20f27813CC24fD1Bad20CB9b8d261CE1eE2e125a)
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
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x20f27813CC24fD1Bad20CB9b8d261CE1eE2e125a)
 */
export const chainlinkRngAddress = {
  421614: "0x20f27813CC24fD1Bad20CB9b8d261CE1eE2e125a",
} as const;

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x20f27813CC24fD1Bad20CB9b8d261CE1eE2e125a)
 */
export const chainlinkRngConfig = {
  address: chainlinkRngAddress,
  abi: chainlinkRngAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ChainlinkVRFCoordinator
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x5CE8D5A2BC84beb22a398CCA51996F7930313D61)
 */
export const chainlinkVrfCoordinatorAbi = [
  {
    type: "constructor",
    inputs: [{ name: "blockhashStore", internalType: "address", type: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "error",
    inputs: [
      { name: "internalBalance", internalType: "uint256", type: "uint256" },
      { name: "externalBalance", internalType: "uint256", type: "uint256" },
    ],
    name: "BalanceInvariantViolated",
  },
  {
    type: "error",
    inputs: [{ name: "blockNum", internalType: "uint256", type: "uint256" }],
    name: "BlockhashNotInStore",
  },
  {
    type: "error",
    inputs: [{ name: "coordinatorAddress", internalType: "address", type: "address" }],
    name: "CoordinatorAlreadyRegistered",
  },
  {
    type: "error",
    inputs: [{ name: "coordinatorAddress", internalType: "address", type: "address" }],
    name: "CoordinatorNotRegistered",
  },
  { type: "error", inputs: [], name: "FailedToSendNative" },
  { type: "error", inputs: [], name: "FailedToTransferLink" },
  {
    type: "error",
    inputs: [
      { name: "have", internalType: "uint32", type: "uint32" },
      { name: "want", internalType: "uint32", type: "uint32" },
    ],
    name: "GasLimitTooBig",
  },
  {
    type: "error",
    inputs: [
      { name: "gasPrice", internalType: "uint256", type: "uint256" },
      { name: "maxGas", internalType: "uint256", type: "uint256" },
    ],
    name: "GasPriceExceeded",
  },
  { type: "error", inputs: [], name: "IncorrectCommitment" },
  { type: "error", inputs: [], name: "IndexOutOfRange" },
  { type: "error", inputs: [], name: "InsufficientBalance" },
  { type: "error", inputs: [], name: "InvalidCalldata" },
  {
    type: "error",
    inputs: [
      { name: "subId", internalType: "uint256", type: "uint256" },
      { name: "consumer", internalType: "address", type: "address" },
    ],
    name: "InvalidConsumer",
  },
  { type: "error", inputs: [], name: "InvalidExtraArgsTag" },
  {
    type: "error",
    inputs: [{ name: "linkWei", internalType: "int256", type: "int256" }],
    name: "InvalidLinkWeiPrice",
  },
  {
    type: "error",
    inputs: [
      { name: "premiumPercentage", internalType: "uint8", type: "uint8" },
      { name: "max", internalType: "uint8", type: "uint8" },
    ],
    name: "InvalidPremiumPercentage",
  },
  {
    type: "error",
    inputs: [
      { name: "have", internalType: "uint16", type: "uint16" },
      { name: "min", internalType: "uint16", type: "uint16" },
      { name: "max", internalType: "uint16", type: "uint16" },
    ],
    name: "InvalidRequestConfirmations",
  },
  { type: "error", inputs: [], name: "InvalidSubscription" },
  { type: "error", inputs: [], name: "LinkAlreadySet" },
  {
    type: "error",
    inputs: [
      {
        name: "flatFeeLinkDiscountPPM",
        internalType: "uint32",
        type: "uint32",
      },
      { name: "flatFeeNativePPM", internalType: "uint32", type: "uint32" },
    ],
    name: "LinkDiscountTooHigh",
  },
  { type: "error", inputs: [], name: "LinkNotSet" },
  {
    type: "error",
    inputs: [
      { name: "have", internalType: "uint256", type: "uint256" },
      { name: "max", internalType: "uint32", type: "uint32" },
    ],
    name: "MsgDataTooBig",
  },
  {
    type: "error",
    inputs: [{ name: "proposedOwner", internalType: "address", type: "address" }],
    name: "MustBeRequestedOwner",
  },
  {
    type: "error",
    inputs: [{ name: "owner", internalType: "address", type: "address" }],
    name: "MustBeSubOwner",
  },
  { type: "error", inputs: [], name: "NoCorrespondingRequest" },
  {
    type: "error",
    inputs: [{ name: "keyHash", internalType: "bytes32", type: "bytes32" }],
    name: "NoSuchProvingKey",
  },
  {
    type: "error",
    inputs: [
      { name: "have", internalType: "uint32", type: "uint32" },
      { name: "want", internalType: "uint32", type: "uint32" },
    ],
    name: "NumWordsTooBig",
  },
  { type: "error", inputs: [], name: "OnlyCallableFromLink" },
  { type: "error", inputs: [], name: "PaymentTooLarge" },
  { type: "error", inputs: [], name: "PendingRequestExists" },
  {
    type: "error",
    inputs: [{ name: "keyHash", internalType: "bytes32", type: "bytes32" }],
    name: "ProvingKeyAlreadyRegistered",
  },
  { type: "error", inputs: [], name: "Reentrant" },
  { type: "error", inputs: [], name: "TooManyConsumers" },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "minimumRequestConfirmations",
        internalType: "uint16",
        type: "uint16",
        indexed: false,
      },
      {
        name: "maxGasLimit",
        internalType: "uint32",
        type: "uint32",
        indexed: false,
      },
      {
        name: "stalenessSeconds",
        internalType: "uint32",
        type: "uint32",
        indexed: false,
      },
      {
        name: "gasAfterPaymentCalculation",
        internalType: "uint32",
        type: "uint32",
        indexed: false,
      },
      {
        name: "fallbackWeiPerUnitLink",
        internalType: "int256",
        type: "int256",
        indexed: false,
      },
      {
        name: "fulfillmentFlatFeeNativePPM",
        internalType: "uint32",
        type: "uint32",
        indexed: false,
      },
      {
        name: "fulfillmentFlatFeeLinkDiscountPPM",
        internalType: "uint32",
        type: "uint32",
        indexed: false,
      },
      {
        name: "nativePremiumPercentage",
        internalType: "uint8",
        type: "uint8",
        indexed: false,
      },
      {
        name: "linkPremiumPercentage",
        internalType: "uint8",
        type: "uint8",
        indexed: false,
      },
    ],
    name: "ConfigSet",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "coordinatorAddress",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "CoordinatorDeregistered",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "coordinatorAddress",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "CoordinatorRegistered",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "requestId",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "fallbackWeiPerUnitLink",
        internalType: "int256",
        type: "int256",
        indexed: false,
      },
    ],
    name: "FallbackWeiPerUnitLinkUsed",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "to", internalType: "address", type: "address", indexed: false },
      {
        name: "amount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "FundsRecovered",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "newCoordinator",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "subId",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "MigrationCompleted",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "to", internalType: "address", type: "address", indexed: false },
      {
        name: "amount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "NativeFundsRecovered",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "from", internalType: "address", type: "address", indexed: true },
      { name: "to", internalType: "address", type: "address", indexed: true },
    ],
    name: "OwnershipTransferRequested",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "from", internalType: "address", type: "address", indexed: true },
      { name: "to", internalType: "address", type: "address", indexed: true },
    ],
    name: "OwnershipTransferred",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "keyHash",
        internalType: "bytes32",
        type: "bytes32",
        indexed: false,
      },
      {
        name: "maxGas",
        internalType: "uint64",
        type: "uint64",
        indexed: false,
      },
    ],
    name: "ProvingKeyDeregistered",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "keyHash",
        internalType: "bytes32",
        type: "bytes32",
        indexed: false,
      },
      {
        name: "maxGas",
        internalType: "uint64",
        type: "uint64",
        indexed: false,
      },
    ],
    name: "ProvingKeyRegistered",
  },
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
      {
        name: "outputSeed",
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
        name: "payment",
        internalType: "uint96",
        type: "uint96",
        indexed: false,
      },
      {
        name: "nativePayment",
        internalType: "bool",
        type: "bool",
        indexed: false,
      },
      { name: "success", internalType: "bool", type: "bool", indexed: false },
      {
        name: "onlyPremium",
        internalType: "bool",
        type: "bool",
        indexed: false,
      },
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
        name: "preSeed",
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
        name: "extraArgs",
        internalType: "bytes",
        type: "bytes",
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
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "subId",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      { name: "to", internalType: "address", type: "address", indexed: false },
      {
        name: "amountLink",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "amountNative",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "SubscriptionCanceled",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "subId",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "consumer",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "SubscriptionConsumerAdded",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "subId",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "consumer",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "SubscriptionConsumerRemoved",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "subId",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "owner",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "SubscriptionCreated",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "subId",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "oldBalance",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "newBalance",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "SubscriptionFunded",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "subId",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "oldNativeBalance",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "newNativeBalance",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "SubscriptionFundedWithNative",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "subId",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "from",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      { name: "to", internalType: "address", type: "address", indexed: false },
    ],
    name: "SubscriptionOwnerTransferRequested",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "subId",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "from",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      { name: "to", internalType: "address", type: "address", indexed: false },
    ],
    name: "SubscriptionOwnerTransferred",
  },
  {
    type: "function",
    inputs: [],
    name: "BLOCKHASH_STORE",
    outputs: [
      {
        name: "",
        internalType: "contract BlockhashStoreInterface",
        type: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "LINK",
    outputs: [
      {
        name: "",
        internalType: "contract LinkTokenInterface",
        type: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "LINK_NATIVE_FEED",
    outputs: [
      {
        name: "",
        internalType: "contract AggregatorV3Interface",
        type: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "MAX_CONSUMERS",
    outputs: [{ name: "", internalType: "uint16", type: "uint16" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "MAX_NUM_WORDS",
    outputs: [{ name: "", internalType: "uint32", type: "uint32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "MAX_REQUEST_CONFIRMATIONS",
    outputs: [{ name: "", internalType: "uint16", type: "uint16" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "acceptOwnership",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "subId", internalType: "uint256", type: "uint256" }],
    name: "acceptSubscriptionOwnerTransfer",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "subId", internalType: "uint256", type: "uint256" },
      { name: "consumer", internalType: "address", type: "address" },
    ],
    name: "addConsumer",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "subId", internalType: "uint256", type: "uint256" },
      { name: "to", internalType: "address", type: "address" },
    ],
    name: "cancelSubscription",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "createSubscription",
    outputs: [{ name: "subId", internalType: "uint256", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "target", internalType: "address", type: "address" }],
    name: "deregisterMigratableCoordinator",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "publicProvingKey",
        internalType: "uint256[2]",
        type: "uint256[2]",
      },
    ],
    name: "deregisterProvingKey",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "proof",
        internalType: "struct VRF.Proof",
        type: "tuple",
        components: [
          { name: "pk", internalType: "uint256[2]", type: "uint256[2]" },
          { name: "gamma", internalType: "uint256[2]", type: "uint256[2]" },
          { name: "c", internalType: "uint256", type: "uint256" },
          { name: "s", internalType: "uint256", type: "uint256" },
          { name: "seed", internalType: "uint256", type: "uint256" },
          { name: "uWitness", internalType: "address", type: "address" },
          {
            name: "cGammaWitness",
            internalType: "uint256[2]",
            type: "uint256[2]",
          },
          {
            name: "sHashWitness",
            internalType: "uint256[2]",
            type: "uint256[2]",
          },
          { name: "zInv", internalType: "uint256", type: "uint256" },
        ],
      },
      {
        name: "rc",
        internalType: "struct VRFTypes.RequestCommitmentV2Plus",
        type: "tuple",
        components: [
          { name: "blockNum", internalType: "uint64", type: "uint64" },
          { name: "subId", internalType: "uint256", type: "uint256" },
          { name: "callbackGasLimit", internalType: "uint32", type: "uint32" },
          { name: "numWords", internalType: "uint32", type: "uint32" },
          { name: "sender", internalType: "address", type: "address" },
          { name: "extraArgs", internalType: "bytes", type: "bytes" },
        ],
      },
      { name: "onlyPremium", internalType: "bool", type: "bool" },
    ],
    name: "fulfillRandomWords",
    outputs: [{ name: "payment", internalType: "uint96", type: "uint96" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "subId", internalType: "uint256", type: "uint256" }],
    name: "fundSubscriptionWithNative",
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [
      { name: "startIndex", internalType: "uint256", type: "uint256" },
      { name: "maxCount", internalType: "uint256", type: "uint256" },
    ],
    name: "getActiveSubscriptionIds",
    outputs: [{ name: "ids", internalType: "uint256[]", type: "uint256[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "subId", internalType: "uint256", type: "uint256" }],
    name: "getSubscription",
    outputs: [
      { name: "balance", internalType: "uint96", type: "uint96" },
      { name: "nativeBalance", internalType: "uint96", type: "uint96" },
      { name: "reqCount", internalType: "uint64", type: "uint64" },
      { name: "subOwner", internalType: "address", type: "address" },
      { name: "consumers", internalType: "address[]", type: "address[]" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "publicKey", internalType: "uint256[2]", type: "uint256[2]" }],
    name: "hashOfKey",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "pure",
  },
  {
    type: "function",
    inputs: [
      { name: "subId", internalType: "uint256", type: "uint256" },
      { name: "newCoordinator", internalType: "address", type: "address" },
    ],
    name: "migrate",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "onTokenTransfer",
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
    inputs: [{ name: "subId", internalType: "uint256", type: "uint256" }],
    name: "ownerCancelSubscription",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "subId", internalType: "uint256", type: "uint256" }],
    name: "pendingRequestExists",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "to", internalType: "address", type: "address" }],
    name: "recoverFunds",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "to", internalType: "address payable", type: "address" }],
    name: "recoverNativeFunds",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "target", internalType: "address", type: "address" }],
    name: "registerMigratableCoordinator",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "publicProvingKey",
        internalType: "uint256[2]",
        type: "uint256[2]",
      },
      { name: "maxGas", internalType: "uint64", type: "uint64" },
    ],
    name: "registerProvingKey",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "subId", internalType: "uint256", type: "uint256" },
      { name: "consumer", internalType: "address", type: "address" },
    ],
    name: "removeConsumer",
    outputs: [],
    stateMutability: "nonpayable",
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
    outputs: [{ name: "requestId", internalType: "uint256", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "subId", internalType: "uint256", type: "uint256" },
      { name: "newOwner", internalType: "address", type: "address" },
    ],
    name: "requestSubscriptionOwnerTransfer",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "s_config",
    outputs: [
      {
        name: "minimumRequestConfirmations",
        internalType: "uint16",
        type: "uint16",
      },
      { name: "maxGasLimit", internalType: "uint32", type: "uint32" },
      { name: "reentrancyLock", internalType: "bool", type: "bool" },
      { name: "stalenessSeconds", internalType: "uint32", type: "uint32" },
      {
        name: "gasAfterPaymentCalculation",
        internalType: "uint32",
        type: "uint32",
      },
      {
        name: "fulfillmentFlatFeeNativePPM",
        internalType: "uint32",
        type: "uint32",
      },
      {
        name: "fulfillmentFlatFeeLinkDiscountPPM",
        internalType: "uint32",
        type: "uint32",
      },
      { name: "nativePremiumPercentage", internalType: "uint8", type: "uint8" },
      { name: "linkPremiumPercentage", internalType: "uint8", type: "uint8" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "s_currentSubNonce",
    outputs: [{ name: "", internalType: "uint64", type: "uint64" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "s_fallbackWeiPerUnitLink",
    outputs: [{ name: "", internalType: "int256", type: "int256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    name: "s_provingKeyHashes",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    name: "s_provingKeys",
    outputs: [
      { name: "exists", internalType: "bool", type: "bool" },
      { name: "maxGas", internalType: "uint64", type: "uint64" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    name: "s_requestCommitments",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "s_totalBalance",
    outputs: [{ name: "", internalType: "uint96", type: "uint96" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "s_totalNativeBalance",
    outputs: [{ name: "", internalType: "uint96", type: "uint96" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      {
        name: "minimumRequestConfirmations",
        internalType: "uint16",
        type: "uint16",
      },
      { name: "maxGasLimit", internalType: "uint32", type: "uint32" },
      { name: "stalenessSeconds", internalType: "uint32", type: "uint32" },
      {
        name: "gasAfterPaymentCalculation",
        internalType: "uint32",
        type: "uint32",
      },
      {
        name: "fallbackWeiPerUnitLink",
        internalType: "int256",
        type: "int256",
      },
      {
        name: "fulfillmentFlatFeeNativePPM",
        internalType: "uint32",
        type: "uint32",
      },
      {
        name: "fulfillmentFlatFeeLinkDiscountPPM",
        internalType: "uint32",
        type: "uint32",
      },
      { name: "nativePremiumPercentage", internalType: "uint8", type: "uint8" },
      { name: "linkPremiumPercentage", internalType: "uint8", type: "uint8" },
    ],
    name: "setConfig",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "link", internalType: "address", type: "address" },
      { name: "linkNativeFeed", internalType: "address", type: "address" },
    ],
    name: "setLINKAndLINKNativeFeed",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "to", internalType: "address", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "recipient", internalType: "address", type: "address" }],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "recipient", internalType: "address payable", type: "address" }],
    name: "withdrawNative",
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x5CE8D5A2BC84beb22a398CCA51996F7930313D61)
 */
export const chainlinkVrfCoordinatorAddress = {
  421614: "0x5CE8D5A2BC84beb22a398CCA51996F7930313D61",
} as const;

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x5CE8D5A2BC84beb22a398CCA51996F7930313D61)
 */
export const chainlinkVrfCoordinatorConfig = {
  address: chainlinkVrfCoordinatorAddress,
  abi: chainlinkVrfCoordinatorAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DAI
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x593e89704D285B0c3fbF157c7CF2537456CE64b5)
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
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x593e89704D285B0c3fbF157c7CF2537456CE64b5)
 */
export const daiAddress = {
  421614: "0x593e89704D285B0c3fbF157c7CF2537456CE64b5",
} as const;

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x593e89704D285B0c3fbF157c7CF2537456CE64b5)
 */
export const daiConfig = { address: daiAddress, abi: daiAbi } as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DAIFaucet
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0xB5b39A1bcD2D7097A8824B3cC18Ebd2dFb0D9B5E)
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
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0xB5b39A1bcD2D7097A8824B3cC18Ebd2dFb0D9B5E)
 */
export const daiFaucetAddress = {
  421614: "0xB5b39A1bcD2D7097A8824B3cC18Ebd2dFb0D9B5E",
} as const;

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0xB5b39A1bcD2D7097A8824B3cC18Ebd2dFb0D9B5E)
 */
export const daiFaucetConfig = {
  address: daiFaucetAddress,
  abi: daiFaucetAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DisputeKitClassic
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0xc77c0dFCf6845544dd45734100d385be3D649B02)
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
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0xc77c0dFCf6845544dd45734100d385be3D649B02)
 */
export const disputeKitClassicAddress = {
  421614: "0xc77c0dFCf6845544dd45734100d385be3D649B02",
} as const;

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0xc77c0dFCf6845544dd45734100d385be3D649B02)
 */
export const disputeKitClassicConfig = {
  address: disputeKitClassicAddress,
  abi: disputeKitClassicAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DisputeKitClassicUniversity
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x5545706060fD4334cb5b9220B7474d0294c66F35)
 */
export const disputeKitClassicUniversityAbi = [
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
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x5545706060fD4334cb5b9220B7474d0294c66F35)
 */
export const disputeKitClassicUniversityAddress = {
  421614: "0x5545706060fD4334cb5b9220B7474d0294c66F35",
} as const;

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x5545706060fD4334cb5b9220B7474d0294c66F35)
 */
export const disputeKitClassicUniversityConfig = {
  address: disputeKitClassicUniversityAddress,
  abi: disputeKitClassicUniversityAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DisputeKitClassicUniversity_Implementation
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0xDa2F2e750cefCb86c4594E6531C69cb0Ba0B5dBb)
 */
export const disputeKitClassicUniversityImplementationAbi = [
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
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0xDa2F2e750cefCb86c4594E6531C69cb0Ba0B5dBb)
 */
export const disputeKitClassicUniversityImplementationAddress = {
  421614: "0xDa2F2e750cefCb86c4594E6531C69cb0Ba0B5dBb",
} as const;

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0xDa2F2e750cefCb86c4594E6531C69cb0Ba0B5dBb)
 */
export const disputeKitClassicUniversityImplementationConfig = {
  address: disputeKitClassicUniversityImplementationAddress,
  abi: disputeKitClassicUniversityImplementationAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DisputeKitClassicUniversity_Proxy
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x5545706060fD4334cb5b9220B7474d0294c66F35)
 */
export const disputeKitClassicUniversityProxyAbi = [
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
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x5545706060fD4334cb5b9220B7474d0294c66F35)
 */
export const disputeKitClassicUniversityProxyAddress = {
  421614: "0x5545706060fD4334cb5b9220B7474d0294c66F35",
} as const;

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x5545706060fD4334cb5b9220B7474d0294c66F35)
 */
export const disputeKitClassicUniversityProxyConfig = {
  address: disputeKitClassicUniversityProxyAddress,
  abi: disputeKitClassicUniversityProxyAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DisputeKitClassic_Implementation
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x511C5290853D29b72d561Fd324687D9a6dc6Ff10)
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
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x511C5290853D29b72d561Fd324687D9a6dc6Ff10)
 */
export const disputeKitClassicImplementationAddress = {
  421614: "0x511C5290853D29b72d561Fd324687D9a6dc6Ff10",
} as const;

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x511C5290853D29b72d561Fd324687D9a6dc6Ff10)
 */
export const disputeKitClassicImplementationConfig = {
  address: disputeKitClassicImplementationAddress,
  abi: disputeKitClassicImplementationAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DisputeKitClassic_Proxy
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0xc77c0dFCf6845544dd45734100d385be3D649B02)
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
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0xc77c0dFCf6845544dd45734100d385be3D649B02)
 */
export const disputeKitClassicProxyAddress = {
  421614: "0xc77c0dFCf6845544dd45734100d385be3D649B02",
} as const;

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0xc77c0dFCf6845544dd45734100d385be3D649B02)
 */
export const disputeKitClassicProxyConfig = {
  address: disputeKitClassicProxyAddress,
  abi: disputeKitClassicProxyAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DisputeKitGated
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x648943Cf73b7fa053942Af576C8327fcEfD314d8)
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
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x648943Cf73b7fa053942Af576C8327fcEfD314d8)
 */
export const disputeKitGatedAddress = {
  421614: "0x648943Cf73b7fa053942Af576C8327fcEfD314d8",
} as const;

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x648943Cf73b7fa053942Af576C8327fcEfD314d8)
 */
export const disputeKitGatedConfig = {
  address: disputeKitGatedAddress,
  abi: disputeKitGatedAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DisputeKitGatedShutter
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x476EE17A32363aec1D32DB49ab701E70Ec56a8e6)
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
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x476EE17A32363aec1D32DB49ab701E70Ec56a8e6)
 */
export const disputeKitGatedShutterAddress = {
  421614: "0x476EE17A32363aec1D32DB49ab701E70Ec56a8e6",
} as const;

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x476EE17A32363aec1D32DB49ab701E70Ec56a8e6)
 */
export const disputeKitGatedShutterConfig = {
  address: disputeKitGatedShutterAddress,
  abi: disputeKitGatedShutterAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DisputeKitGatedShutter_Implementation
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x08F37f0151CD8d0Bad46eA6c44A99318CFd52418)
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
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x08F37f0151CD8d0Bad46eA6c44A99318CFd52418)
 */
export const disputeKitGatedShutterImplementationAddress = {
  421614: "0x08F37f0151CD8d0Bad46eA6c44A99318CFd52418",
} as const;

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x08F37f0151CD8d0Bad46eA6c44A99318CFd52418)
 */
export const disputeKitGatedShutterImplementationConfig = {
  address: disputeKitGatedShutterImplementationAddress,
  abi: disputeKitGatedShutterImplementationAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DisputeKitGatedShutter_Proxy
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x476EE17A32363aec1D32DB49ab701E70Ec56a8e6)
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
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x476EE17A32363aec1D32DB49ab701E70Ec56a8e6)
 */
export const disputeKitGatedShutterProxyAddress = {
  421614: "0x476EE17A32363aec1D32DB49ab701E70Ec56a8e6",
} as const;

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x476EE17A32363aec1D32DB49ab701E70Ec56a8e6)
 */
export const disputeKitGatedShutterProxyConfig = {
  address: disputeKitGatedShutterProxyAddress,
  abi: disputeKitGatedShutterProxyAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DisputeKitGated_Implementation
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x654f4A61fF1F390a3A9662B77220ec697040E5CB)
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
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x654f4A61fF1F390a3A9662B77220ec697040E5CB)
 */
export const disputeKitGatedImplementationAddress = {
  421614: "0x654f4A61fF1F390a3A9662B77220ec697040E5CB",
} as const;

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x654f4A61fF1F390a3A9662B77220ec697040E5CB)
 */
export const disputeKitGatedImplementationConfig = {
  address: disputeKitGatedImplementationAddress,
  abi: disputeKitGatedImplementationAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DisputeKitGated_Proxy
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x648943Cf73b7fa053942Af576C8327fcEfD314d8)
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
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x648943Cf73b7fa053942Af576C8327fcEfD314d8)
 */
export const disputeKitGatedProxyAddress = {
  421614: "0x648943Cf73b7fa053942Af576C8327fcEfD314d8",
} as const;

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x648943Cf73b7fa053942Af576C8327fcEfD314d8)
 */
export const disputeKitGatedProxyConfig = {
  address: disputeKitGatedProxyAddress,
  abi: disputeKitGatedProxyAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DisputeKitShutter
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0xD143b4FcdCf5699983fF9Ad7e38DE80Aa7Eb9Ce7)
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
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0xD143b4FcdCf5699983fF9Ad7e38DE80Aa7Eb9Ce7)
 */
export const disputeKitShutterAddress = {
  421614: "0xD143b4FcdCf5699983fF9Ad7e38DE80Aa7Eb9Ce7",
} as const;

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0xD143b4FcdCf5699983fF9Ad7e38DE80Aa7Eb9Ce7)
 */
export const disputeKitShutterConfig = {
  address: disputeKitShutterAddress,
  abi: disputeKitShutterAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DisputeKitShutter_Implementation
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x4a769Fb16A7BAE9b41c25aAe028E51a19F955f65)
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
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x4a769Fb16A7BAE9b41c25aAe028E51a19F955f65)
 */
export const disputeKitShutterImplementationAddress = {
  421614: "0x4a769Fb16A7BAE9b41c25aAe028E51a19F955f65",
} as const;

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x4a769Fb16A7BAE9b41c25aAe028E51a19F955f65)
 */
export const disputeKitShutterImplementationConfig = {
  address: disputeKitShutterImplementationAddress,
  abi: disputeKitShutterImplementationAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DisputeKitShutter_Proxy
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0xD143b4FcdCf5699983fF9Ad7e38DE80Aa7Eb9Ce7)
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
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0xD143b4FcdCf5699983fF9Ad7e38DE80Aa7Eb9Ce7)
 */
export const disputeKitShutterProxyAddress = {
  421614: "0xD143b4FcdCf5699983fF9Ad7e38DE80Aa7Eb9Ce7",
} as const;

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0xD143b4FcdCf5699983fF9Ad7e38DE80Aa7Eb9Ce7)
 */
export const disputeKitShutterProxyConfig = {
  address: disputeKitShutterProxyAddress,
  abi: disputeKitShutterProxyAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DisputeResolver
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * - [__View Contract on Gnosis Chiado Blockscout__](https://blockscout.chiadochain.net/address/0x16f20604a51Ac1e68c9aAd1C0E53e951B62CC1Cb)
 * - [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0xa2aF79F47bb6fc2f2306067f45Ac310D78bf96c8)
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
 * - [__View Contract on Gnosis Chiado Blockscout__](https://blockscout.chiadochain.net/address/0x16f20604a51Ac1e68c9aAd1C0E53e951B62CC1Cb)
 * - [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0xa2aF79F47bb6fc2f2306067f45Ac310D78bf96c8)
 */
export const disputeResolverAddress = {
  10200: "0x16f20604a51Ac1e68c9aAd1C0E53e951B62CC1Cb",
  421614: "0xa2aF79F47bb6fc2f2306067f45Ac310D78bf96c8",
} as const;

/**
 * - [__View Contract on Gnosis Chiado Blockscout__](https://blockscout.chiadochain.net/address/0x16f20604a51Ac1e68c9aAd1C0E53e951B62CC1Cb)
 * - [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0xa2aF79F47bb6fc2f2306067f45Ac310D78bf96c8)
 */
export const disputeResolverConfig = {
  address: disputeResolverAddress,
  abi: disputeResolverAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DisputeResolverUniversity
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0xFA4d648b6cd86c8b7822c1ac40Ef6239463d2e2c)
 */
export const disputeResolverUniversityAbi = [
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
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0xFA4d648b6cd86c8b7822c1ac40Ef6239463d2e2c)
 */
export const disputeResolverUniversityAddress = {
  421614: "0xFA4d648b6cd86c8b7822c1ac40Ef6239463d2e2c",
} as const;

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0xFA4d648b6cd86c8b7822c1ac40Ef6239463d2e2c)
 */
export const disputeResolverUniversityConfig = {
  address: disputeResolverUniversityAddress,
  abi: disputeResolverUniversityAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DisputeTemplateRegistry
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * - [__View Contract on Gnosis Chiado Blockscout__](https://blockscout.chiadochain.net/address/0x96E49552669ea81B8E9cE8694F7E4A55D8bFb957)
 * - [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0xa28cA6364B40537B3e73c395cc2B1Bb6de1F1161)
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
 * - [__View Contract on Gnosis Chiado Blockscout__](https://blockscout.chiadochain.net/address/0x96E49552669ea81B8E9cE8694F7E4A55D8bFb957)
 * - [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0xa28cA6364B40537B3e73c395cc2B1Bb6de1F1161)
 */
export const disputeTemplateRegistryAddress = {
  10200: "0x96E49552669ea81B8E9cE8694F7E4A55D8bFb957",
  421614: "0xa28cA6364B40537B3e73c395cc2B1Bb6de1F1161",
} as const;

/**
 * - [__View Contract on Gnosis Chiado Blockscout__](https://blockscout.chiadochain.net/address/0x96E49552669ea81B8E9cE8694F7E4A55D8bFb957)
 * - [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0xa28cA6364B40537B3e73c395cc2B1Bb6de1F1161)
 */
export const disputeTemplateRegistryConfig = {
  address: disputeTemplateRegistryAddress,
  abi: disputeTemplateRegistryAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DisputeTemplateRegistryUniversity
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0xC72b2FB27eD72cF96c0eF63018AF2Ffb290aC7B2)
 */
export const disputeTemplateRegistryUniversityAbi = [
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
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0xC72b2FB27eD72cF96c0eF63018AF2Ffb290aC7B2)
 */
export const disputeTemplateRegistryUniversityAddress = {
  421614: "0xC72b2FB27eD72cF96c0eF63018AF2Ffb290aC7B2",
} as const;

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0xC72b2FB27eD72cF96c0eF63018AF2Ffb290aC7B2)
 */
export const disputeTemplateRegistryUniversityConfig = {
  address: disputeTemplateRegistryUniversityAddress,
  abi: disputeTemplateRegistryUniversityAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DisputeTemplateRegistryUniversity_Implementation
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x4106F3143287B5a34dE4aB53C267797a974Bf92E)
 */
export const disputeTemplateRegistryUniversityImplementationAbi = [
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
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x4106F3143287B5a34dE4aB53C267797a974Bf92E)
 */
export const disputeTemplateRegistryUniversityImplementationAddress = {
  421614: "0x4106F3143287B5a34dE4aB53C267797a974Bf92E",
} as const;

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x4106F3143287B5a34dE4aB53C267797a974Bf92E)
 */
export const disputeTemplateRegistryUniversityImplementationConfig = {
  address: disputeTemplateRegistryUniversityImplementationAddress,
  abi: disputeTemplateRegistryUniversityImplementationAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DisputeTemplateRegistryUniversity_Proxy
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0xC72b2FB27eD72cF96c0eF63018AF2Ffb290aC7B2)
 */
export const disputeTemplateRegistryUniversityProxyAbi = [
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
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0xC72b2FB27eD72cF96c0eF63018AF2Ffb290aC7B2)
 */
export const disputeTemplateRegistryUniversityProxyAddress = {
  421614: "0xC72b2FB27eD72cF96c0eF63018AF2Ffb290aC7B2",
} as const;

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0xC72b2FB27eD72cF96c0eF63018AF2Ffb290aC7B2)
 */
export const disputeTemplateRegistryUniversityProxyConfig = {
  address: disputeTemplateRegistryUniversityProxyAddress,
  abi: disputeTemplateRegistryUniversityProxyAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DisputeTemplateRegistry_Implementation
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0xbD51dae8044B8d418c9F86F601Ec48EABb322e7D)
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
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0xbD51dae8044B8d418c9F86F601Ec48EABb322e7D)
 */
export const disputeTemplateRegistryImplementationAddress = {
  421614: "0xbD51dae8044B8d418c9F86F601Ec48EABb322e7D",
} as const;

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0xbD51dae8044B8d418c9F86F601Ec48EABb322e7D)
 */
export const disputeTemplateRegistryImplementationConfig = {
  address: disputeTemplateRegistryImplementationAddress,
  abi: disputeTemplateRegistryImplementationAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DisputeTemplateRegistry_Proxy
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0xa28cA6364B40537B3e73c395cc2B1Bb6de1F1161)
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
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0xa28cA6364B40537B3e73c395cc2B1Bb6de1F1161)
 */
export const disputeTemplateRegistryProxyAddress = {
  421614: "0xa28cA6364B40537B3e73c395cc2B1Bb6de1F1161",
} as const;

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0xa28cA6364B40537B3e73c395cc2B1Bb6de1F1161)
 */
export const disputeTemplateRegistryProxyConfig = {
  address: disputeTemplateRegistryProxyAddress,
  abi: disputeTemplateRegistryProxyAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// EvidenceModule
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x8AAF07ac05E81c92C6FD369aaEdE159E9893508d)
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
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x8AAF07ac05E81c92C6FD369aaEdE159E9893508d)
 */
export const evidenceModuleAddress = {
  421614: "0x8AAF07ac05E81c92C6FD369aaEdE159E9893508d",
} as const;

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x8AAF07ac05E81c92C6FD369aaEdE159E9893508d)
 */
export const evidenceModuleConfig = {
  address: evidenceModuleAddress,
  abi: evidenceModuleAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// EvidenceModule_Implementation
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0xEBd4a08A1f02F0661637CA7D1a920F52A52B3487)
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
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0xEBd4a08A1f02F0661637CA7D1a920F52A52B3487)
 */
export const evidenceModuleImplementationAddress = {
  421614: "0xEBd4a08A1f02F0661637CA7D1a920F52A52B3487",
} as const;

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0xEBd4a08A1f02F0661637CA7D1a920F52A52B3487)
 */
export const evidenceModuleImplementationConfig = {
  address: evidenceModuleImplementationAddress,
  abi: evidenceModuleImplementationAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// EvidenceModule_Proxy
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x8AAF07ac05E81c92C6FD369aaEdE159E9893508d)
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
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x8AAF07ac05E81c92C6FD369aaEdE159E9893508d)
 */
export const evidenceModuleProxyAddress = {
  421614: "0x8AAF07ac05E81c92C6FD369aaEdE159E9893508d",
} as const;

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x8AAF07ac05E81c92C6FD369aaEdE159E9893508d)
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
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x9EfCaeF787d0b53d7a24fdeAB067A4BAFCDb892F)
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
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x9EfCaeF787d0b53d7a24fdeAB067A4BAFCDb892F)
 */
export const klerosCoreAddress = {
  421614: "0x9EfCaeF787d0b53d7a24fdeAB067A4BAFCDb892F",
} as const;

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x9EfCaeF787d0b53d7a24fdeAB067A4BAFCDb892F)
 */
export const klerosCoreConfig = {
  address: klerosCoreAddress,
  abi: klerosCoreAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// KlerosCoreSnapshotProxy
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0xA90cA4E24982e1BC1400A3742593Ed63FDe5746D)
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
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0xA90cA4E24982e1BC1400A3742593Ed63FDe5746D)
 */
export const klerosCoreSnapshotProxyAddress = {
  421614: "0xA90cA4E24982e1BC1400A3742593Ed63FDe5746D",
} as const;

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0xA90cA4E24982e1BC1400A3742593Ed63FDe5746D)
 */
export const klerosCoreSnapshotProxyConfig = {
  address: klerosCoreSnapshotProxyAddress,
  abi: klerosCoreSnapshotProxyAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// KlerosCoreUniversity
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x53451933006f5CbcCdb33fcDd6AC9A00b641C474)
 */
export const klerosCoreUniversityAbi = [
  { type: "fallback", stateMutability: "payable" },
  { type: "receive", stateMutability: "payable" },
  { type: "error", inputs: [], name: "AllJurorsDrawn" },
  { type: "error", inputs: [], name: "AlreadyInitialized" },
  { type: "error", inputs: [], name: "AppealFeesNotEnough" },
  { type: "error", inputs: [], name: "AppealPeriodNotPassed" },
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
  { type: "error", inputs: [], name: "InstructorOnly" },
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
  { type: "error", inputs: [], name: "NoJurorDrawn" },
  { type: "error", inputs: [], name: "NotEvidencePeriod" },
  { type: "error", inputs: [], name: "NotExecutionPeriod" },
  { type: "error", inputs: [], name: "NotInitializing" },
  { type: "error", inputs: [], name: "OwnerOnly" },
  { type: "error", inputs: [], name: "OwnerOrInstructorOnly" },
  { type: "error", inputs: [], name: "RulingAlreadyExecuted" },
  { type: "error", inputs: [], name: "SortitionModuleOnly" },
  { type: "error", inputs: [], name: "StakingInTooManyCourts" },
  { type: "error", inputs: [], name: "StakingLessThanCourtMinStake" },
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
        internalType: "enum KlerosCoreUniversity.Period",
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
    inputs: [{ name: "_instructor", internalType: "address", type: "address" }],
    name: "changeInstructor",
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
        internalType: "contract ISortitionModuleUniversity",
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
        internalType: "enum KlerosCoreUniversity.Period",
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
      { name: "_juror", internalType: "address", type: "address" },
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
        internalType: "struct KlerosCoreUniversity.Round",
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
    inputs: [
      { name: "_owner", internalType: "address", type: "address" },
      { name: "_instructor", internalType: "address", type: "address" },
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
      {
        name: "_sortitionModuleAddress",
        internalType: "contract ISortitionModuleUniversity",
        type: "address",
      },
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "instructor",
    outputs: [{ name: "", internalType: "address", type: "address" }],
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
    outputs: [
      {
        name: "",
        internalType: "contract ISortitionModuleUniversity",
        type: "address",
      },
    ],
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
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x53451933006f5CbcCdb33fcDd6AC9A00b641C474)
 */
export const klerosCoreUniversityAddress = {
  421614: "0x53451933006f5CbcCdb33fcDd6AC9A00b641C474",
} as const;

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x53451933006f5CbcCdb33fcDd6AC9A00b641C474)
 */
export const klerosCoreUniversityConfig = {
  address: klerosCoreUniversityAddress,
  abi: klerosCoreUniversityAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// KlerosCoreUniversity_Implementation
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x504F0BeB05fa3721700b1678D2e317dcc3476920)
 */
export const klerosCoreUniversityImplementationAbi = [
  { type: "constructor", inputs: [], stateMutability: "nonpayable" },
  { type: "error", inputs: [], name: "AllJurorsDrawn" },
  { type: "error", inputs: [], name: "AlreadyInitialized" },
  { type: "error", inputs: [], name: "AppealFeesNotEnough" },
  { type: "error", inputs: [], name: "AppealPeriodNotPassed" },
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
  { type: "error", inputs: [], name: "InstructorOnly" },
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
  { type: "error", inputs: [], name: "NoJurorDrawn" },
  { type: "error", inputs: [], name: "NotEvidencePeriod" },
  { type: "error", inputs: [], name: "NotExecutionPeriod" },
  { type: "error", inputs: [], name: "NotInitializing" },
  { type: "error", inputs: [], name: "OwnerOnly" },
  { type: "error", inputs: [], name: "OwnerOrInstructorOnly" },
  { type: "error", inputs: [], name: "RulingAlreadyExecuted" },
  { type: "error", inputs: [], name: "SortitionModuleOnly" },
  { type: "error", inputs: [], name: "StakingInTooManyCourts" },
  { type: "error", inputs: [], name: "StakingLessThanCourtMinStake" },
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
        internalType: "enum KlerosCoreUniversity.Period",
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
    inputs: [{ name: "_instructor", internalType: "address", type: "address" }],
    name: "changeInstructor",
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
        internalType: "contract ISortitionModuleUniversity",
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
        internalType: "enum KlerosCoreUniversity.Period",
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
      { name: "_juror", internalType: "address", type: "address" },
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
        internalType: "struct KlerosCoreUniversity.Round",
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
    inputs: [
      { name: "_owner", internalType: "address", type: "address" },
      { name: "_instructor", internalType: "address", type: "address" },
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
      {
        name: "_sortitionModuleAddress",
        internalType: "contract ISortitionModuleUniversity",
        type: "address",
      },
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "instructor",
    outputs: [{ name: "", internalType: "address", type: "address" }],
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
    outputs: [
      {
        name: "",
        internalType: "contract ISortitionModuleUniversity",
        type: "address",
      },
    ],
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
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x504F0BeB05fa3721700b1678D2e317dcc3476920)
 */
export const klerosCoreUniversityImplementationAddress = {
  421614: "0x504F0BeB05fa3721700b1678D2e317dcc3476920",
} as const;

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x504F0BeB05fa3721700b1678D2e317dcc3476920)
 */
export const klerosCoreUniversityImplementationConfig = {
  address: klerosCoreUniversityImplementationAddress,
  abi: klerosCoreUniversityImplementationAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// KlerosCoreUniversity_Proxy
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x53451933006f5CbcCdb33fcDd6AC9A00b641C474)
 */
export const klerosCoreUniversityProxyAbi = [
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
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x53451933006f5CbcCdb33fcDd6AC9A00b641C474)
 */
export const klerosCoreUniversityProxyAddress = {
  421614: "0x53451933006f5CbcCdb33fcDd6AC9A00b641C474",
} as const;

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x53451933006f5CbcCdb33fcDd6AC9A00b641C474)
 */
export const klerosCoreUniversityProxyConfig = {
  address: klerosCoreUniversityProxyAddress,
  abi: klerosCoreUniversityProxyAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// KlerosCore_Implementation
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x369DA458B054CfF85F148FC3936baB74D6941c56)
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
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x369DA458B054CfF85F148FC3936baB74D6941c56)
 */
export const klerosCoreImplementationAddress = {
  421614: "0x369DA458B054CfF85F148FC3936baB74D6941c56",
} as const;

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x369DA458B054CfF85F148FC3936baB74D6941c56)
 */
export const klerosCoreImplementationConfig = {
  address: klerosCoreImplementationAddress,
  abi: klerosCoreImplementationAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// KlerosCore_Proxy
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x9EfCaeF787d0b53d7a24fdeAB067A4BAFCDb892F)
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
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x9EfCaeF787d0b53d7a24fdeAB067A4BAFCDb892F)
 */
export const klerosCoreProxyAddress = {
  421614: "0x9EfCaeF787d0b53d7a24fdeAB067A4BAFCDb892F",
} as const;

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x9EfCaeF787d0b53d7a24fdeAB067A4BAFCDb892F)
 */
export const klerosCoreProxyConfig = {
  address: klerosCoreProxyAddress,
  abi: klerosCoreProxyAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// KlerosV2NeoEarlyUser
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x0d60Ff8bbCF49Bc5352328E7E28e141834d7750F)
 */
export const klerosV2NeoEarlyUserAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "_name", internalType: "string", type: "string" },
      { name: "_symbol", internalType: "string", type: "string" },
    ],
    stateMutability: "nonpayable",
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
    inputs: [{ name: "_newOwner", internalType: "address", type: "address" }],
    name: "changeOwner",
    outputs: [],
    stateMutability: "nonpayable",
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
    inputs: [{ name: "to", internalType: "address", type: "address" }],
    name: "safeMint",
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
      { name: "data", internalType: "bytes", type: "bytes" },
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
    inputs: [{ name: "tokenId", internalType: "uint256", type: "uint256" }],
    name: "tokenURI",
    outputs: [{ name: "", internalType: "string", type: "string" }],
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
] as const;

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x0d60Ff8bbCF49Bc5352328E7E28e141834d7750F)
 */
export const klerosV2NeoEarlyUserAddress = {
  421614: "0x0d60Ff8bbCF49Bc5352328E7E28e141834d7750F",
} as const;

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x0d60Ff8bbCF49Bc5352328E7E28e141834d7750F)
 */
export const klerosV2NeoEarlyUserConfig = {
  address: klerosV2NeoEarlyUserAddress,
  abi: klerosV2NeoEarlyUserAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PNK
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x34B944D42cAcfC8266955D07A80181D2054aa225)
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
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x34B944D42cAcfC8266955D07A80181D2054aa225)
 */
export const pnkAddress = {
  421614: "0x34B944D42cAcfC8266955D07A80181D2054aa225",
} as const;

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x34B944D42cAcfC8266955D07A80181D2054aa225)
 */
export const pnkConfig = { address: pnkAddress, abi: pnkAbi } as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PNKFaucet
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x7EFE468003Ad6A858b5350CDE0A67bBED58739dD)
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
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x7EFE468003Ad6A858b5350CDE0A67bBED58739dD)
 */
export const pnkFaucetAddress = {
  421614: "0x7EFE468003Ad6A858b5350CDE0A67bBED58739dD",
} as const;

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x7EFE468003Ad6A858b5350CDE0A67bBED58739dD)
 */
export const pnkFaucetConfig = {
  address: pnkFaucetAddress,
  abi: pnkFaucetAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PinakionV2
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * - [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x34B944D42cAcfC8266955D07A80181D2054aa225)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x593e89704D285B0c3fbF157c7CF2537456CE64b5)
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
 * - [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x34B944D42cAcfC8266955D07A80181D2054aa225)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x593e89704D285B0c3fbF157c7CF2537456CE64b5)
 */
export const pinakionV2Address = {
  421614: "0x34B944D42cAcfC8266955D07A80181D2054aa225",
  11155111: "0x593e89704D285B0c3fbF157c7CF2537456CE64b5",
} as const;

/**
 * - [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x34B944D42cAcfC8266955D07A80181D2054aa225)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x593e89704D285B0c3fbF157c7CF2537456CE64b5)
 */
export const pinakionV2Config = {
  address: pinakionV2Address,
  abi: pinakionV2Abi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PolicyRegistry
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x6445F57d2Bd2AD5BC23bC899731f7D5184d6e893)
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
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x6445F57d2Bd2AD5BC23bC899731f7D5184d6e893)
 */
export const policyRegistryAddress = {
  421614: "0x6445F57d2Bd2AD5BC23bC899731f7D5184d6e893",
} as const;

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x6445F57d2Bd2AD5BC23bC899731f7D5184d6e893)
 */
export const policyRegistryConfig = {
  address: policyRegistryAddress,
  abi: policyRegistryAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PolicyRegistry_Implementation
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x4e3146Af220595Ed3c30E5485673eE27927Ad8F4)
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
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x4e3146Af220595Ed3c30E5485673eE27927Ad8F4)
 */
export const policyRegistryImplementationAddress = {
  421614: "0x4e3146Af220595Ed3c30E5485673eE27927Ad8F4",
} as const;

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x4e3146Af220595Ed3c30E5485673eE27927Ad8F4)
 */
export const policyRegistryImplementationConfig = {
  address: policyRegistryImplementationAddress,
  abi: policyRegistryImplementationAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PolicyRegistry_Proxy
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x6445F57d2Bd2AD5BC23bC899731f7D5184d6e893)
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
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x6445F57d2Bd2AD5BC23bC899731f7D5184d6e893)
 */
export const policyRegistryProxyAddress = {
  421614: "0x6445F57d2Bd2AD5BC23bC899731f7D5184d6e893",
} as const;

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x6445F57d2Bd2AD5BC23bC899731f7D5184d6e893)
 */
export const policyRegistryProxyConfig = {
  address: policyRegistryProxyAddress,
  abi: policyRegistryProxyAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// RNGWithFallback
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0xe2Bdd0d8A8585e889861A101d705511Ff752AD01)
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
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0xe2Bdd0d8A8585e889861A101d705511Ff752AD01)
 */
export const rngWithFallbackAddress = {
  421614: "0xe2Bdd0d8A8585e889861A101d705511Ff752AD01",
} as const;

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0xe2Bdd0d8A8585e889861A101d705511Ff752AD01)
 */
export const rngWithFallbackConfig = {
  address: rngWithFallbackAddress,
  abi: rngWithFallbackAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// RandomizerOracle
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0xE775D7fde1d0D09ae627C0131040012ccBcC4b9b)
 */
export const randomizerOracleAbi = [] as const;

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0xE775D7fde1d0D09ae627C0131040012ccBcC4b9b)
 */
export const randomizerOracleAddress = {
  421614: "0xE775D7fde1d0D09ae627C0131040012ccBcC4b9b",
} as const;

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0xE775D7fde1d0D09ae627C0131040012ccBcC4b9b)
 */
export const randomizerOracleConfig = {
  address: randomizerOracleAddress,
  abi: randomizerOracleAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SortitionModule
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x37760BF7fC6027836E50a4D553A313f112188406)
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
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x37760BF7fC6027836E50a4D553A313f112188406)
 */
export const sortitionModuleAddress = {
  421614: "0x37760BF7fC6027836E50a4D553A313f112188406",
} as const;

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x37760BF7fC6027836E50a4D553A313f112188406)
 */
export const sortitionModuleConfig = {
  address: sortitionModuleAddress,
  abi: sortitionModuleAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SortitionModuleUniversity
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x81db7b7126C98CF9570F8EB2590D646DdD5C00b5)
 */
export const sortitionModuleUniversityAbi = [
  { type: "fallback", stateMutability: "payable" },
  { type: "receive", stateMutability: "payable" },
  { type: "error", inputs: [], name: "AlreadyInitialized" },
  { type: "error", inputs: [], name: "FailedDelegateCall" },
  {
    type: "error",
    inputs: [{ name: "implementation", internalType: "address", type: "address" }],
    name: "InvalidImplementation",
  },
  { type: "error", inputs: [], name: "KlerosCoreOnly" },
  { type: "error", inputs: [], name: "NotEligibleForWithdrawal" },
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
    inputs: [],
    name: "core",
    outputs: [
      {
        name: "",
        internalType: "contract KlerosCoreUniversity",
        type: "address",
      },
    ],
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
    name: "disputesWithoutJurors",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_courtID", internalType: "uint96", type: "uint96" },
      { name: "", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "uint256", type: "uint256" },
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
      {
        name: "_core",
        internalType: "contract KlerosCoreUniversity",
        type: "address",
      },
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
    inputs: [{ name: "_juror", internalType: "address", type: "address" }],
    name: "setTransientJuror",
    outputs: [],
    stateMutability: "nonpayable",
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
      { name: "", internalType: "bool", type: "bool" },
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
    stateMutability: "view",
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
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x81db7b7126C98CF9570F8EB2590D646DdD5C00b5)
 */
export const sortitionModuleUniversityAddress = {
  421614: "0x81db7b7126C98CF9570F8EB2590D646DdD5C00b5",
} as const;

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x81db7b7126C98CF9570F8EB2590D646DdD5C00b5)
 */
export const sortitionModuleUniversityConfig = {
  address: sortitionModuleUniversityAddress,
  abi: sortitionModuleUniversityAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SortitionModuleUniversity_Implementation
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0xdbb76a1437674F42b39592d4402Cb686be6A9bDe)
 */
export const sortitionModuleUniversityImplementationAbi = [
  { type: "constructor", inputs: [], stateMutability: "nonpayable" },
  { type: "error", inputs: [], name: "AlreadyInitialized" },
  { type: "error", inputs: [], name: "FailedDelegateCall" },
  {
    type: "error",
    inputs: [{ name: "implementation", internalType: "address", type: "address" }],
    name: "InvalidImplementation",
  },
  { type: "error", inputs: [], name: "KlerosCoreOnly" },
  { type: "error", inputs: [], name: "NotEligibleForWithdrawal" },
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
    inputs: [],
    name: "core",
    outputs: [
      {
        name: "",
        internalType: "contract KlerosCoreUniversity",
        type: "address",
      },
    ],
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
    name: "disputesWithoutJurors",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_courtID", internalType: "uint96", type: "uint96" },
      { name: "", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "uint256", type: "uint256" },
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
      {
        name: "_core",
        internalType: "contract KlerosCoreUniversity",
        type: "address",
      },
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
    inputs: [{ name: "_juror", internalType: "address", type: "address" }],
    name: "setTransientJuror",
    outputs: [],
    stateMutability: "nonpayable",
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
      { name: "", internalType: "bool", type: "bool" },
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
    stateMutability: "view",
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
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0xdbb76a1437674F42b39592d4402Cb686be6A9bDe)
 */
export const sortitionModuleUniversityImplementationAddress = {
  421614: "0xdbb76a1437674F42b39592d4402Cb686be6A9bDe",
} as const;

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0xdbb76a1437674F42b39592d4402Cb686be6A9bDe)
 */
export const sortitionModuleUniversityImplementationConfig = {
  address: sortitionModuleUniversityImplementationAddress,
  abi: sortitionModuleUniversityImplementationAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SortitionModuleUniversity_Proxy
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x81db7b7126C98CF9570F8EB2590D646DdD5C00b5)
 */
export const sortitionModuleUniversityProxyAbi = [
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
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x81db7b7126C98CF9570F8EB2590D646DdD5C00b5)
 */
export const sortitionModuleUniversityProxyAddress = {
  421614: "0x81db7b7126C98CF9570F8EB2590D646DdD5C00b5",
} as const;

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x81db7b7126C98CF9570F8EB2590D646DdD5C00b5)
 */
export const sortitionModuleUniversityProxyConfig = {
  address: sortitionModuleUniversityProxyAddress,
  abi: sortitionModuleUniversityProxyAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SortitionModule_Implementation
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0xd15138319C9589d85aC94e8587a832df3895a48C)
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
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0xd15138319C9589d85aC94e8587a832df3895a48C)
 */
export const sortitionModuleImplementationAddress = {
  421614: "0xd15138319C9589d85aC94e8587a832df3895a48C",
} as const;

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0xd15138319C9589d85aC94e8587a832df3895a48C)
 */
export const sortitionModuleImplementationConfig = {
  address: sortitionModuleImplementationAddress,
  abi: sortitionModuleImplementationAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SortitionModule_Proxy
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x37760BF7fC6027836E50a4D553A313f112188406)
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
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x37760BF7fC6027836E50a4D553A313f112188406)
 */
export const sortitionModuleProxyAddress = {
  421614: "0x37760BF7fC6027836E50a4D553A313f112188406",
} as const;

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x37760BF7fC6027836E50a4D553A313f112188406)
 */
export const sortitionModuleProxyConfig = {
  address: sortitionModuleProxyAddress,
  abi: sortitionModuleProxyAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// TransactionBatcher
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x35f93986950804ac1F93519BF68C2a7Dd776db0E)
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
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x35f93986950804ac1F93519BF68C2a7Dd776db0E)
 */
export const transactionBatcherAddress = {
  421614: "0x35f93986950804ac1F93519BF68C2a7Dd776db0E",
} as const;

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x35f93986950804ac1F93519BF68C2a7Dd776db0E)
 */
export const transactionBatcherConfig = {
  address: transactionBatcherAddress,
  abi: transactionBatcherAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// WETH
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * - [__View Contract on Gnosis Chiado Blockscout__](https://blockscout.chiadochain.net/address/0x2DFC9c3141268e6eac04a7D6d98Fbf64BDe836a8)
 * - [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x3829A2486d53ee984a0ca2D76552715726b77138)
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
 * - [__View Contract on Gnosis Chiado Blockscout__](https://blockscout.chiadochain.net/address/0x2DFC9c3141268e6eac04a7D6d98Fbf64BDe836a8)
 * - [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x3829A2486d53ee984a0ca2D76552715726b77138)
 */
export const wethAddress = {
  10200: "0x2DFC9c3141268e6eac04a7D6d98Fbf64BDe836a8",
  421614: "0x3829A2486d53ee984a0ca2D76552715726b77138",
} as const;

/**
 * - [__View Contract on Gnosis Chiado Blockscout__](https://blockscout.chiadochain.net/address/0x2DFC9c3141268e6eac04a7D6d98Fbf64BDe836a8)
 * - [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x3829A2486d53ee984a0ca2D76552715726b77138)
 */
export const wethConfig = { address: wethAddress, abi: wethAbi } as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// WETHFaucet
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * - [__View Contract on Gnosis Chiado Blockscout__](https://blockscout.chiadochain.net/address/0x22CB016c4b57413ca4DF5F1AC44a0E0d3c69811F)
 * - [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x6F8C10E0030aDf5B8030a5E282F026ADdB6525fd)
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
 * - [__View Contract on Gnosis Chiado Blockscout__](https://blockscout.chiadochain.net/address/0x22CB016c4b57413ca4DF5F1AC44a0E0d3c69811F)
 * - [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x6F8C10E0030aDf5B8030a5E282F026ADdB6525fd)
 */
export const wethFaucetAddress = {
  10200: "0x22CB016c4b57413ca4DF5F1AC44a0E0d3c69811F",
  421614: "0x6F8C10E0030aDf5B8030a5E282F026ADdB6525fd",
} as const;

/**
 * - [__View Contract on Gnosis Chiado Blockscout__](https://blockscout.chiadochain.net/address/0x22CB016c4b57413ca4DF5F1AC44a0E0d3c69811F)
 * - [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x6F8C10E0030aDf5B8030a5E282F026ADdB6525fd)
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
