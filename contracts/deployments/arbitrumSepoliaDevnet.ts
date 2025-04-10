export default {
  name: "arbitrumSepoliaDevnet",
  chainId: "421614",
  contracts: {
    ArbitrableExample: {
      address: "0x3Eae72F076c68F5c354C73abC33EAA291ef1b2Fa",
      abi: [
        {
          inputs: [
            {
              internalType: "contract IArbitratorV2",
              name: "_arbitrator",
              type: "address",
            },
            {
              internalType: "string",
              name: "_templateData",
              type: "string",
            },
            {
              internalType: "string",
              name: "_templateDataMappings",
              type: "string",
            },
            {
              internalType: "bytes",
              name: "_arbitratorExtraData",
              type: "bytes",
            },
            {
              internalType: "contract IDisputeTemplateRegistry",
              name: "_templateRegistry",
              type: "address",
            },
            {
              internalType: "contract IERC20",
              name: "_weth",
              type: "address",
            },
          ],
          stateMutability: "nonpayable",
          type: "constructor",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "string",
              name: "_action",
              type: "string",
            },
          ],
          name: "Action",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "contract IArbitratorV2",
              name: "_arbitrator",
              type: "address",
            },
            {
              indexed: true,
              internalType: "uint256",
              name: "_arbitratorDisputeID",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_externalDisputeID",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_templateId",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "string",
              name: "_templateUri",
              type: "string",
            },
          ],
          name: "DisputeRequest",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "contract IArbitratorV2",
              name: "_arbitrator",
              type: "address",
            },
            {
              indexed: true,
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_ruling",
              type: "uint256",
            },
          ],
          name: "Ruling",
          type: "event",
        },
        {
          inputs: [],
          name: "arbitrator",
          outputs: [
            {
              internalType: "contract IArbitratorV2",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "arbitratorExtraData",
          outputs: [
            {
              internalType: "bytes",
              name: "",
              type: "bytes",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "contract IArbitratorV2",
              name: "_arbitrator",
              type: "address",
            },
          ],
          name: "changeArbitrator",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "bytes",
              name: "_arbitratorExtraData",
              type: "bytes",
            },
          ],
          name: "changeArbitratorExtraData",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "string",
              name: "_templateData",
              type: "string",
            },
            {
              internalType: "string",
              name: "_templateDataMappings",
              type: "string",
            },
          ],
          name: "changeDisputeTemplate",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "contract IDisputeTemplateRegistry",
              name: "_templateRegistry",
              type: "address",
            },
          ],
          name: "changeTemplateRegistry",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "string",
              name: "_action",
              type: "string",
            },
            {
              internalType: "uint256",
              name: "_feeInWeth",
              type: "uint256",
            },
          ],
          name: "createDispute",
          outputs: [
            {
              internalType: "uint256",
              name: "disputeID",
              type: "uint256",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "string",
              name: "_action",
              type: "string",
            },
          ],
          name: "createDispute",
          outputs: [
            {
              internalType: "uint256",
              name: "disputeID",
              type: "uint256",
            },
          ],
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          name: "disputes",
          outputs: [
            {
              internalType: "bool",
              name: "isRuled",
              type: "bool",
            },
            {
              internalType: "uint256",
              name: "ruling",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "numberOfRulingOptions",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          name: "externalIDtoLocalID",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "governor",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_arbitratorDisputeID",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_ruling",
              type: "uint256",
            },
          ],
          name: "rule",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "templateId",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "templateRegistry",
          outputs: [
            {
              internalType: "contract IDisputeTemplateRegistry",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "weth",
          outputs: [
            {
              internalType: "contract IERC20",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
      ],
    },
    BlockHashRNG: {
      address: "0x56d6d65Fe202232714794B5D5e4ed9894466Ee01",
      abi: [
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          name: "randomNumbers",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_block",
              type: "uint256",
            },
          ],
          name: "receiveRandomness",
          outputs: [
            {
              internalType: "uint256",
              name: "randomNumber",
              type: "uint256",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_block",
              type: "uint256",
            },
          ],
          name: "requestRandomness",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
      ],
    },
    ChainlinkRNG: {
      address: "0x6c40D7F5d5bE3492fe9EF70e4eCb2BD773c12AF8",
      abi: [
        {
          inputs: [
            {
              internalType: "address",
              name: "_governor",
              type: "address",
            },
            {
              internalType: "address",
              name: "_sortitionModule",
              type: "address",
            },
            {
              internalType: "address",
              name: "_vrfCoordinator",
              type: "address",
            },
            {
              internalType: "bytes32",
              name: "_keyHash",
              type: "bytes32",
            },
            {
              internalType: "uint256",
              name: "_subscriptionId",
              type: "uint256",
            },
            {
              internalType: "uint16",
              name: "_requestConfirmations",
              type: "uint16",
            },
            {
              internalType: "uint32",
              name: "_callbackGasLimit",
              type: "uint32",
            },
          ],
          stateMutability: "nonpayable",
          type: "constructor",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "have",
              type: "address",
            },
            {
              internalType: "address",
              name: "want",
              type: "address",
            },
          ],
          name: "OnlyCoordinatorCanFulfill",
          type: "error",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "have",
              type: "address",
            },
            {
              internalType: "address",
              name: "owner",
              type: "address",
            },
            {
              internalType: "address",
              name: "coordinator",
              type: "address",
            },
          ],
          name: "OnlyOwnerOrCoordinator",
          type: "error",
        },
        {
          inputs: [],
          name: "ZeroAddress",
          type: "error",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: false,
              internalType: "address",
              name: "vrfCoordinator",
              type: "address",
            },
          ],
          name: "CoordinatorSet",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "from",
              type: "address",
            },
            {
              indexed: true,
              internalType: "address",
              name: "to",
              type: "address",
            },
          ],
          name: "OwnershipTransferRequested",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "from",
              type: "address",
            },
            {
              indexed: true,
              internalType: "address",
              name: "to",
              type: "address",
            },
          ],
          name: "OwnershipTransferred",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "requestId",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "randomWord",
              type: "uint256",
            },
          ],
          name: "RequestFulfilled",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "requestId",
              type: "uint256",
            },
          ],
          name: "RequestSent",
          type: "event",
        },
        {
          inputs: [],
          name: "acceptOwnership",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "callbackGasLimit",
          outputs: [
            {
              internalType: "uint32",
              name: "",
              type: "uint32",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint32",
              name: "_callbackGasLimit",
              type: "uint32",
            },
          ],
          name: "changeCallbackGasLimit",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_governor",
              type: "address",
            },
          ],
          name: "changeGovernor",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "bytes32",
              name: "_keyHash",
              type: "bytes32",
            },
          ],
          name: "changeKeyHash",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint16",
              name: "_requestConfirmations",
              type: "uint16",
            },
          ],
          name: "changeRequestConfirmations",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_sortitionModule",
              type: "address",
            },
          ],
          name: "changeSortitionModule",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_subscriptionId",
              type: "uint256",
            },
          ],
          name: "changeSubscriptionId",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_vrfCoordinator",
              type: "address",
            },
          ],
          name: "changeVrfCoordinator",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "governor",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "keyHash",
          outputs: [
            {
              internalType: "bytes32",
              name: "",
              type: "bytes32",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "lastRequestId",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "owner",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "requestId",
              type: "uint256",
            },
          ],
          name: "randomNumbers",
          outputs: [
            {
              internalType: "uint256",
              name: "number",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "requestId",
              type: "uint256",
            },
            {
              internalType: "uint256[]",
              name: "randomWords",
              type: "uint256[]",
            },
          ],
          name: "rawFulfillRandomWords",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          name: "receiveRandomness",
          outputs: [
            {
              internalType: "uint256",
              name: "randomNumber",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "requestConfirmations",
          outputs: [
            {
              internalType: "uint16",
              name: "",
              type: "uint16",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          name: "requestRandomness",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "s_vrfCoordinator",
          outputs: [
            {
              internalType: "contract IVRFCoordinatorV2Plus",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_vrfCoordinator",
              type: "address",
            },
          ],
          name: "setCoordinator",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "sortitionModule",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "subscriptionId",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "to",
              type: "address",
            },
          ],
          name: "transferOwnership",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
      ],
    },
    ChainlinkVRFCoordinator: {
      address: "0x5CE8D5A2BC84beb22a398CCA51996F7930313D61",
      abi: [
        {
          inputs: [
            {
              internalType: "address",
              name: "blockhashStore",
              type: "address",
            },
          ],
          stateMutability: "nonpayable",
          type: "constructor",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "internalBalance",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "externalBalance",
              type: "uint256",
            },
          ],
          name: "BalanceInvariantViolated",
          type: "error",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "blockNum",
              type: "uint256",
            },
          ],
          name: "BlockhashNotInStore",
          type: "error",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "coordinatorAddress",
              type: "address",
            },
          ],
          name: "CoordinatorAlreadyRegistered",
          type: "error",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "coordinatorAddress",
              type: "address",
            },
          ],
          name: "CoordinatorNotRegistered",
          type: "error",
        },
        {
          inputs: [],
          name: "FailedToSendNative",
          type: "error",
        },
        {
          inputs: [],
          name: "FailedToTransferLink",
          type: "error",
        },
        {
          inputs: [
            {
              internalType: "uint32",
              name: "have",
              type: "uint32",
            },
            {
              internalType: "uint32",
              name: "want",
              type: "uint32",
            },
          ],
          name: "GasLimitTooBig",
          type: "error",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "gasPrice",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "maxGas",
              type: "uint256",
            },
          ],
          name: "GasPriceExceeded",
          type: "error",
        },
        {
          inputs: [],
          name: "IncorrectCommitment",
          type: "error",
        },
        {
          inputs: [],
          name: "IndexOutOfRange",
          type: "error",
        },
        {
          inputs: [],
          name: "InsufficientBalance",
          type: "error",
        },
        {
          inputs: [],
          name: "InvalidCalldata",
          type: "error",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "subId",
              type: "uint256",
            },
            {
              internalType: "address",
              name: "consumer",
              type: "address",
            },
          ],
          name: "InvalidConsumer",
          type: "error",
        },
        {
          inputs: [],
          name: "InvalidExtraArgsTag",
          type: "error",
        },
        {
          inputs: [
            {
              internalType: "int256",
              name: "linkWei",
              type: "int256",
            },
          ],
          name: "InvalidLinkWeiPrice",
          type: "error",
        },
        {
          inputs: [
            {
              internalType: "uint8",
              name: "premiumPercentage",
              type: "uint8",
            },
            {
              internalType: "uint8",
              name: "max",
              type: "uint8",
            },
          ],
          name: "InvalidPremiumPercentage",
          type: "error",
        },
        {
          inputs: [
            {
              internalType: "uint16",
              name: "have",
              type: "uint16",
            },
            {
              internalType: "uint16",
              name: "min",
              type: "uint16",
            },
            {
              internalType: "uint16",
              name: "max",
              type: "uint16",
            },
          ],
          name: "InvalidRequestConfirmations",
          type: "error",
        },
        {
          inputs: [],
          name: "InvalidSubscription",
          type: "error",
        },
        {
          inputs: [],
          name: "LinkAlreadySet",
          type: "error",
        },
        {
          inputs: [
            {
              internalType: "uint32",
              name: "flatFeeLinkDiscountPPM",
              type: "uint32",
            },
            {
              internalType: "uint32",
              name: "flatFeeNativePPM",
              type: "uint32",
            },
          ],
          name: "LinkDiscountTooHigh",
          type: "error",
        },
        {
          inputs: [],
          name: "LinkNotSet",
          type: "error",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "have",
              type: "uint256",
            },
            {
              internalType: "uint32",
              name: "max",
              type: "uint32",
            },
          ],
          name: "MsgDataTooBig",
          type: "error",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "proposedOwner",
              type: "address",
            },
          ],
          name: "MustBeRequestedOwner",
          type: "error",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "owner",
              type: "address",
            },
          ],
          name: "MustBeSubOwner",
          type: "error",
        },
        {
          inputs: [],
          name: "NoCorrespondingRequest",
          type: "error",
        },
        {
          inputs: [
            {
              internalType: "bytes32",
              name: "keyHash",
              type: "bytes32",
            },
          ],
          name: "NoSuchProvingKey",
          type: "error",
        },
        {
          inputs: [
            {
              internalType: "uint32",
              name: "have",
              type: "uint32",
            },
            {
              internalType: "uint32",
              name: "want",
              type: "uint32",
            },
          ],
          name: "NumWordsTooBig",
          type: "error",
        },
        {
          inputs: [],
          name: "OnlyCallableFromLink",
          type: "error",
        },
        {
          inputs: [],
          name: "PaymentTooLarge",
          type: "error",
        },
        {
          inputs: [],
          name: "PendingRequestExists",
          type: "error",
        },
        {
          inputs: [
            {
              internalType: "bytes32",
              name: "keyHash",
              type: "bytes32",
            },
          ],
          name: "ProvingKeyAlreadyRegistered",
          type: "error",
        },
        {
          inputs: [],
          name: "Reentrant",
          type: "error",
        },
        {
          inputs: [],
          name: "TooManyConsumers",
          type: "error",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: false,
              internalType: "uint16",
              name: "minimumRequestConfirmations",
              type: "uint16",
            },
            {
              indexed: false,
              internalType: "uint32",
              name: "maxGasLimit",
              type: "uint32",
            },
            {
              indexed: false,
              internalType: "uint32",
              name: "stalenessSeconds",
              type: "uint32",
            },
            {
              indexed: false,
              internalType: "uint32",
              name: "gasAfterPaymentCalculation",
              type: "uint32",
            },
            {
              indexed: false,
              internalType: "int256",
              name: "fallbackWeiPerUnitLink",
              type: "int256",
            },
            {
              indexed: false,
              internalType: "uint32",
              name: "fulfillmentFlatFeeNativePPM",
              type: "uint32",
            },
            {
              indexed: false,
              internalType: "uint32",
              name: "fulfillmentFlatFeeLinkDiscountPPM",
              type: "uint32",
            },
            {
              indexed: false,
              internalType: "uint8",
              name: "nativePremiumPercentage",
              type: "uint8",
            },
            {
              indexed: false,
              internalType: "uint8",
              name: "linkPremiumPercentage",
              type: "uint8",
            },
          ],
          name: "ConfigSet",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: false,
              internalType: "address",
              name: "coordinatorAddress",
              type: "address",
            },
          ],
          name: "CoordinatorDeregistered",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: false,
              internalType: "address",
              name: "coordinatorAddress",
              type: "address",
            },
          ],
          name: "CoordinatorRegistered",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: false,
              internalType: "uint256",
              name: "requestId",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "int256",
              name: "fallbackWeiPerUnitLink",
              type: "int256",
            },
          ],
          name: "FallbackWeiPerUnitLinkUsed",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: false,
              internalType: "address",
              name: "to",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "amount",
              type: "uint256",
            },
          ],
          name: "FundsRecovered",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: false,
              internalType: "address",
              name: "newCoordinator",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "subId",
              type: "uint256",
            },
          ],
          name: "MigrationCompleted",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: false,
              internalType: "address",
              name: "to",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "amount",
              type: "uint256",
            },
          ],
          name: "NativeFundsRecovered",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "from",
              type: "address",
            },
            {
              indexed: true,
              internalType: "address",
              name: "to",
              type: "address",
            },
          ],
          name: "OwnershipTransferRequested",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "from",
              type: "address",
            },
            {
              indexed: true,
              internalType: "address",
              name: "to",
              type: "address",
            },
          ],
          name: "OwnershipTransferred",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: false,
              internalType: "bytes32",
              name: "keyHash",
              type: "bytes32",
            },
            {
              indexed: false,
              internalType: "uint64",
              name: "maxGas",
              type: "uint64",
            },
          ],
          name: "ProvingKeyDeregistered",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: false,
              internalType: "bytes32",
              name: "keyHash",
              type: "bytes32",
            },
            {
              indexed: false,
              internalType: "uint64",
              name: "maxGas",
              type: "uint64",
            },
          ],
          name: "ProvingKeyRegistered",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "requestId",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "outputSeed",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "uint256",
              name: "subId",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint96",
              name: "payment",
              type: "uint96",
            },
            {
              indexed: false,
              internalType: "bool",
              name: "nativePayment",
              type: "bool",
            },
            {
              indexed: false,
              internalType: "bool",
              name: "success",
              type: "bool",
            },
            {
              indexed: false,
              internalType: "bool",
              name: "onlyPremium",
              type: "bool",
            },
          ],
          name: "RandomWordsFulfilled",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "bytes32",
              name: "keyHash",
              type: "bytes32",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "requestId",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "preSeed",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "uint256",
              name: "subId",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint16",
              name: "minimumRequestConfirmations",
              type: "uint16",
            },
            {
              indexed: false,
              internalType: "uint32",
              name: "callbackGasLimit",
              type: "uint32",
            },
            {
              indexed: false,
              internalType: "uint32",
              name: "numWords",
              type: "uint32",
            },
            {
              indexed: false,
              internalType: "bytes",
              name: "extraArgs",
              type: "bytes",
            },
            {
              indexed: true,
              internalType: "address",
              name: "sender",
              type: "address",
            },
          ],
          name: "RandomWordsRequested",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "subId",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "address",
              name: "to",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "amountLink",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "amountNative",
              type: "uint256",
            },
          ],
          name: "SubscriptionCanceled",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "subId",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "address",
              name: "consumer",
              type: "address",
            },
          ],
          name: "SubscriptionConsumerAdded",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "subId",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "address",
              name: "consumer",
              type: "address",
            },
          ],
          name: "SubscriptionConsumerRemoved",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "subId",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "address",
              name: "owner",
              type: "address",
            },
          ],
          name: "SubscriptionCreated",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "subId",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "oldBalance",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "newBalance",
              type: "uint256",
            },
          ],
          name: "SubscriptionFunded",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "subId",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "oldNativeBalance",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "newNativeBalance",
              type: "uint256",
            },
          ],
          name: "SubscriptionFundedWithNative",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "subId",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "address",
              name: "from",
              type: "address",
            },
            {
              indexed: false,
              internalType: "address",
              name: "to",
              type: "address",
            },
          ],
          name: "SubscriptionOwnerTransferRequested",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "subId",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "address",
              name: "from",
              type: "address",
            },
            {
              indexed: false,
              internalType: "address",
              name: "to",
              type: "address",
            },
          ],
          name: "SubscriptionOwnerTransferred",
          type: "event",
        },
        {
          inputs: [],
          name: "BLOCKHASH_STORE",
          outputs: [
            {
              internalType: "contract BlockhashStoreInterface",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "LINK",
          outputs: [
            {
              internalType: "contract LinkTokenInterface",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "LINK_NATIVE_FEED",
          outputs: [
            {
              internalType: "contract AggregatorV3Interface",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "MAX_CONSUMERS",
          outputs: [
            {
              internalType: "uint16",
              name: "",
              type: "uint16",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "MAX_NUM_WORDS",
          outputs: [
            {
              internalType: "uint32",
              name: "",
              type: "uint32",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "MAX_REQUEST_CONFIRMATIONS",
          outputs: [
            {
              internalType: "uint16",
              name: "",
              type: "uint16",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "acceptOwnership",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "subId",
              type: "uint256",
            },
          ],
          name: "acceptSubscriptionOwnerTransfer",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "subId",
              type: "uint256",
            },
            {
              internalType: "address",
              name: "consumer",
              type: "address",
            },
          ],
          name: "addConsumer",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "subId",
              type: "uint256",
            },
            {
              internalType: "address",
              name: "to",
              type: "address",
            },
          ],
          name: "cancelSubscription",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "createSubscription",
          outputs: [
            {
              internalType: "uint256",
              name: "subId",
              type: "uint256",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "target",
              type: "address",
            },
          ],
          name: "deregisterMigratableCoordinator",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256[2]",
              name: "publicProvingKey",
              type: "uint256[2]",
            },
          ],
          name: "deregisterProvingKey",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              components: [
                {
                  internalType: "uint256[2]",
                  name: "pk",
                  type: "uint256[2]",
                },
                {
                  internalType: "uint256[2]",
                  name: "gamma",
                  type: "uint256[2]",
                },
                {
                  internalType: "uint256",
                  name: "c",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "s",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "seed",
                  type: "uint256",
                },
                {
                  internalType: "address",
                  name: "uWitness",
                  type: "address",
                },
                {
                  internalType: "uint256[2]",
                  name: "cGammaWitness",
                  type: "uint256[2]",
                },
                {
                  internalType: "uint256[2]",
                  name: "sHashWitness",
                  type: "uint256[2]",
                },
                {
                  internalType: "uint256",
                  name: "zInv",
                  type: "uint256",
                },
              ],
              internalType: "struct VRF.Proof",
              name: "proof",
              type: "tuple",
            },
            {
              components: [
                {
                  internalType: "uint64",
                  name: "blockNum",
                  type: "uint64",
                },
                {
                  internalType: "uint256",
                  name: "subId",
                  type: "uint256",
                },
                {
                  internalType: "uint32",
                  name: "callbackGasLimit",
                  type: "uint32",
                },
                {
                  internalType: "uint32",
                  name: "numWords",
                  type: "uint32",
                },
                {
                  internalType: "address",
                  name: "sender",
                  type: "address",
                },
                {
                  internalType: "bytes",
                  name: "extraArgs",
                  type: "bytes",
                },
              ],
              internalType: "struct VRFTypes.RequestCommitmentV2Plus",
              name: "rc",
              type: "tuple",
            },
            {
              internalType: "bool",
              name: "onlyPremium",
              type: "bool",
            },
          ],
          name: "fulfillRandomWords",
          outputs: [
            {
              internalType: "uint96",
              name: "payment",
              type: "uint96",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "subId",
              type: "uint256",
            },
          ],
          name: "fundSubscriptionWithNative",
          outputs: [],
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "startIndex",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "maxCount",
              type: "uint256",
            },
          ],
          name: "getActiveSubscriptionIds",
          outputs: [
            {
              internalType: "uint256[]",
              name: "ids",
              type: "uint256[]",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "subId",
              type: "uint256",
            },
          ],
          name: "getSubscription",
          outputs: [
            {
              internalType: "uint96",
              name: "balance",
              type: "uint96",
            },
            {
              internalType: "uint96",
              name: "nativeBalance",
              type: "uint96",
            },
            {
              internalType: "uint64",
              name: "reqCount",
              type: "uint64",
            },
            {
              internalType: "address",
              name: "subOwner",
              type: "address",
            },
            {
              internalType: "address[]",
              name: "consumers",
              type: "address[]",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256[2]",
              name: "publicKey",
              type: "uint256[2]",
            },
          ],
          name: "hashOfKey",
          outputs: [
            {
              internalType: "bytes32",
              name: "",
              type: "bytes32",
            },
          ],
          stateMutability: "pure",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "subId",
              type: "uint256",
            },
            {
              internalType: "address",
              name: "newCoordinator",
              type: "address",
            },
          ],
          name: "migrate",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "amount",
              type: "uint256",
            },
            {
              internalType: "bytes",
              name: "data",
              type: "bytes",
            },
          ],
          name: "onTokenTransfer",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "owner",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "subId",
              type: "uint256",
            },
          ],
          name: "ownerCancelSubscription",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "subId",
              type: "uint256",
            },
          ],
          name: "pendingRequestExists",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "to",
              type: "address",
            },
          ],
          name: "recoverFunds",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address payable",
              name: "to",
              type: "address",
            },
          ],
          name: "recoverNativeFunds",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "target",
              type: "address",
            },
          ],
          name: "registerMigratableCoordinator",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256[2]",
              name: "publicProvingKey",
              type: "uint256[2]",
            },
            {
              internalType: "uint64",
              name: "maxGas",
              type: "uint64",
            },
          ],
          name: "registerProvingKey",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "subId",
              type: "uint256",
            },
            {
              internalType: "address",
              name: "consumer",
              type: "address",
            },
          ],
          name: "removeConsumer",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              components: [
                {
                  internalType: "bytes32",
                  name: "keyHash",
                  type: "bytes32",
                },
                {
                  internalType: "uint256",
                  name: "subId",
                  type: "uint256",
                },
                {
                  internalType: "uint16",
                  name: "requestConfirmations",
                  type: "uint16",
                },
                {
                  internalType: "uint32",
                  name: "callbackGasLimit",
                  type: "uint32",
                },
                {
                  internalType: "uint32",
                  name: "numWords",
                  type: "uint32",
                },
                {
                  internalType: "bytes",
                  name: "extraArgs",
                  type: "bytes",
                },
              ],
              internalType: "struct VRFV2PlusClient.RandomWordsRequest",
              name: "req",
              type: "tuple",
            },
          ],
          name: "requestRandomWords",
          outputs: [
            {
              internalType: "uint256",
              name: "requestId",
              type: "uint256",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "subId",
              type: "uint256",
            },
            {
              internalType: "address",
              name: "newOwner",
              type: "address",
            },
          ],
          name: "requestSubscriptionOwnerTransfer",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "s_config",
          outputs: [
            {
              internalType: "uint16",
              name: "minimumRequestConfirmations",
              type: "uint16",
            },
            {
              internalType: "uint32",
              name: "maxGasLimit",
              type: "uint32",
            },
            {
              internalType: "bool",
              name: "reentrancyLock",
              type: "bool",
            },
            {
              internalType: "uint32",
              name: "stalenessSeconds",
              type: "uint32",
            },
            {
              internalType: "uint32",
              name: "gasAfterPaymentCalculation",
              type: "uint32",
            },
            {
              internalType: "uint32",
              name: "fulfillmentFlatFeeNativePPM",
              type: "uint32",
            },
            {
              internalType: "uint32",
              name: "fulfillmentFlatFeeLinkDiscountPPM",
              type: "uint32",
            },
            {
              internalType: "uint8",
              name: "nativePremiumPercentage",
              type: "uint8",
            },
            {
              internalType: "uint8",
              name: "linkPremiumPercentage",
              type: "uint8",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "s_currentSubNonce",
          outputs: [
            {
              internalType: "uint64",
              name: "",
              type: "uint64",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "s_fallbackWeiPerUnitLink",
          outputs: [
            {
              internalType: "int256",
              name: "",
              type: "int256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          name: "s_provingKeyHashes",
          outputs: [
            {
              internalType: "bytes32",
              name: "",
              type: "bytes32",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "bytes32",
              name: "",
              type: "bytes32",
            },
          ],
          name: "s_provingKeys",
          outputs: [
            {
              internalType: "bool",
              name: "exists",
              type: "bool",
            },
            {
              internalType: "uint64",
              name: "maxGas",
              type: "uint64",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          name: "s_requestCommitments",
          outputs: [
            {
              internalType: "bytes32",
              name: "",
              type: "bytes32",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "s_totalBalance",
          outputs: [
            {
              internalType: "uint96",
              name: "",
              type: "uint96",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "s_totalNativeBalance",
          outputs: [
            {
              internalType: "uint96",
              name: "",
              type: "uint96",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint16",
              name: "minimumRequestConfirmations",
              type: "uint16",
            },
            {
              internalType: "uint32",
              name: "maxGasLimit",
              type: "uint32",
            },
            {
              internalType: "uint32",
              name: "stalenessSeconds",
              type: "uint32",
            },
            {
              internalType: "uint32",
              name: "gasAfterPaymentCalculation",
              type: "uint32",
            },
            {
              internalType: "int256",
              name: "fallbackWeiPerUnitLink",
              type: "int256",
            },
            {
              internalType: "uint32",
              name: "fulfillmentFlatFeeNativePPM",
              type: "uint32",
            },
            {
              internalType: "uint32",
              name: "fulfillmentFlatFeeLinkDiscountPPM",
              type: "uint32",
            },
            {
              internalType: "uint8",
              name: "nativePremiumPercentage",
              type: "uint8",
            },
            {
              internalType: "uint8",
              name: "linkPremiumPercentage",
              type: "uint8",
            },
          ],
          name: "setConfig",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "link",
              type: "address",
            },
            {
              internalType: "address",
              name: "linkNativeFeed",
              type: "address",
            },
          ],
          name: "setLINKAndLINKNativeFeed",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "to",
              type: "address",
            },
          ],
          name: "transferOwnership",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "recipient",
              type: "address",
            },
          ],
          name: "withdraw",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address payable",
              name: "recipient",
              type: "address",
            },
          ],
          name: "withdrawNative",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
      ],
    },
    DAI: {
      address: "0x593e89704D285B0c3fbF157c7CF2537456CE64b5",
      abi: [
        {
          inputs: [
            {
              internalType: "string",
              name: "_name",
              type: "string",
            },
            {
              internalType: "string",
              name: "_symbol",
              type: "string",
            },
          ],
          stateMutability: "nonpayable",
          type: "constructor",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "owner",
              type: "address",
            },
            {
              indexed: true,
              internalType: "address",
              name: "spender",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "value",
              type: "uint256",
            },
          ],
          name: "Approval",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "from",
              type: "address",
            },
            {
              indexed: true,
              internalType: "address",
              name: "to",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "value",
              type: "uint256",
            },
          ],
          name: "Transfer",
          type: "event",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "owner",
              type: "address",
            },
            {
              internalType: "address",
              name: "spender",
              type: "address",
            },
          ],
          name: "allowance",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "spender",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "amount",
              type: "uint256",
            },
          ],
          name: "approve",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "account",
              type: "address",
            },
          ],
          name: "balanceOf",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "decimals",
          outputs: [
            {
              internalType: "uint8",
              name: "",
              type: "uint8",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "spender",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "subtractedValue",
              type: "uint256",
            },
          ],
          name: "decreaseAllowance",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "spender",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "addedValue",
              type: "uint256",
            },
          ],
          name: "increaseAllowance",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "name",
          outputs: [
            {
              internalType: "string",
              name: "",
              type: "string",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "symbol",
          outputs: [
            {
              internalType: "string",
              name: "",
              type: "string",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "totalSupply",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "to",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "amount",
              type: "uint256",
            },
          ],
          name: "transfer",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "from",
              type: "address",
            },
            {
              internalType: "address",
              name: "to",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "amount",
              type: "uint256",
            },
          ],
          name: "transferFrom",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
      ],
    },
    DAIFaucet: {
      address: "0xB5b39A1bcD2D7097A8824B3cC18Ebd2dFb0D9B5E",
      abi: [
        {
          inputs: [
            {
              internalType: "contract IERC20",
              name: "_token",
              type: "address",
            },
          ],
          stateMutability: "nonpayable",
          type: "constructor",
        },
        {
          inputs: [],
          name: "amount",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "balance",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_amount",
              type: "uint256",
            },
          ],
          name: "changeAmount",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_governor",
              type: "address",
            },
          ],
          name: "changeGovernor",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "governor",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "request",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "token",
          outputs: [
            {
              internalType: "contract IERC20",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "withdraw",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          name: "withdrewAlready",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
      ],
    },
    DisputeKitClassic: {
      address: "0x2246821E1313A93e2F8CdF7a3422d078f560b457",
      abi: [
        {
          stateMutability: "payable",
          type: "fallback",
        },
        {
          stateMutability: "payable",
          type: "receive",
        },
        {
          inputs: [],
          name: "AlreadyInitialized",
          type: "error",
        },
        {
          inputs: [],
          name: "FailedDelegateCall",
          type: "error",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "implementation",
              type: "address",
            },
          ],
          name: "InvalidImplementation",
          type: "error",
        },
        {
          inputs: [],
          name: "NotInitializing",
          type: "error",
        },
        {
          inputs: [],
          name: "UUPSUnauthorizedCallContext",
          type: "error",
        },
        {
          inputs: [
            {
              internalType: "bytes32",
              name: "slot",
              type: "bytes32",
            },
          ],
          name: "UUPSUnsupportedProxiableUUID",
          type: "error",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "_coreDisputeID",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "uint256",
              name: "_coreRoundID",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "uint256",
              name: "_choice",
              type: "uint256",
            },
          ],
          name: "ChoiceFunded",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "_coreDisputeID",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "address",
              name: "_juror",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256[]",
              name: "_voteIDs",
              type: "uint256[]",
            },
            {
              indexed: false,
              internalType: "bytes32",
              name: "_commit",
              type: "bytes32",
            },
          ],
          name: "CommitCast",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "_coreDisputeID",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "uint256",
              name: "_coreRoundID",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_choice",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "address",
              name: "_contributor",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_amount",
              type: "uint256",
            },
          ],
          name: "Contribution",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "_coreDisputeID",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_numberOfChoices",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "bytes",
              name: "_extraData",
              type: "bytes",
            },
          ],
          name: "DisputeCreation",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: false,
              internalType: "uint64",
              name: "version",
              type: "uint64",
            },
          ],
          name: "Initialized",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "newImplementation",
              type: "address",
            },
          ],
          name: "Upgraded",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "_coreDisputeID",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "address",
              name: "_juror",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256[]",
              name: "_voteIDs",
              type: "uint256[]",
            },
            {
              indexed: true,
              internalType: "uint256",
              name: "_choice",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "string",
              name: "_justification",
              type: "string",
            },
          ],
          name: "VoteCast",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "_coreDisputeID",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "uint256",
              name: "_coreRoundID",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_choice",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "address",
              name: "_contributor",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_amount",
              type: "uint256",
            },
          ],
          name: "Withdrawal",
          type: "event",
        },
        {
          inputs: [],
          name: "LOSER_APPEAL_PERIOD_MULTIPLIER",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "LOSER_STAKE_MULTIPLIER",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "ONE_BASIS_POINT",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "WINNER_STAKE_MULTIPLIER",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_coreDisputeID",
              type: "uint256",
            },
          ],
          name: "areCommitsAllCast",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_coreDisputeID",
              type: "uint256",
            },
          ],
          name: "areVotesAllCast",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_coreDisputeID",
              type: "uint256",
            },
            {
              internalType: "uint256[]",
              name: "_voteIDs",
              type: "uint256[]",
            },
            {
              internalType: "bytes32",
              name: "_commit",
              type: "bytes32",
            },
          ],
          name: "castCommit",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_coreDisputeID",
              type: "uint256",
            },
            {
              internalType: "uint256[]",
              name: "_voteIDs",
              type: "uint256[]",
            },
            {
              internalType: "uint256",
              name: "_choice",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_salt",
              type: "uint256",
            },
            {
              internalType: "string",
              name: "_justification",
              type: "string",
            },
          ],
          name: "castVote",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_core",
              type: "address",
            },
          ],
          name: "changeCore",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address payable",
              name: "_governor",
              type: "address",
            },
          ],
          name: "changeGovernor",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "core",
          outputs: [
            {
              internalType: "contract KlerosCore",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          name: "coreDisputeIDToLocal",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_coreDisputeID",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_numberOfChoices",
              type: "uint256",
            },
            {
              internalType: "bytes",
              name: "_extraData",
              type: "bytes",
            },
            {
              internalType: "uint256",
              name: "_nbVotes",
              type: "uint256",
            },
          ],
          name: "createDispute",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_coreDisputeID",
              type: "uint256",
            },
          ],
          name: "currentRuling",
          outputs: [
            {
              internalType: "uint256",
              name: "ruling",
              type: "uint256",
            },
            {
              internalType: "bool",
              name: "tied",
              type: "bool",
            },
            {
              internalType: "bool",
              name: "overridden",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          name: "disputes",
          outputs: [
            {
              internalType: "uint256",
              name: "numberOfChoices",
              type: "uint256",
            },
            {
              internalType: "bool",
              name: "jumped",
              type: "bool",
            },
            {
              internalType: "bytes",
              name: "extraData",
              type: "bytes",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_coreDisputeID",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_nonce",
              type: "uint256",
            },
          ],
          name: "draw",
          outputs: [
            {
              internalType: "address",
              name: "drawnAddress",
              type: "address",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_destination",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "_amount",
              type: "uint256",
            },
            {
              internalType: "bytes",
              name: "_data",
              type: "bytes",
            },
          ],
          name: "executeGovernorProposal",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_coreDisputeID",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_choice",
              type: "uint256",
            },
          ],
          name: "fundAppeal",
          outputs: [],
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_coreDisputeID",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_coreRoundID",
              type: "uint256",
            },
          ],
          name: "getCoherentCount",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_coreDisputeID",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_coreRoundID",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_voteID",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          name: "getDegreeOfCoherence",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_coreDisputeID",
              type: "uint256",
            },
          ],
          name: "getFundedChoices",
          outputs: [
            {
              internalType: "uint256[]",
              name: "fundedChoices",
              type: "uint256[]",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_coreDisputeID",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_coreRoundID",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_choice",
              type: "uint256",
            },
          ],
          name: "getRoundInfo",
          outputs: [
            {
              internalType: "uint256",
              name: "winningChoice",
              type: "uint256",
            },
            {
              internalType: "bool",
              name: "tied",
              type: "bool",
            },
            {
              internalType: "uint256",
              name: "totalVoted",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "totalCommited",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "nbVoters",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "choiceCount",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_coreDisputeID",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_coreRoundID",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_voteID",
              type: "uint256",
            },
          ],
          name: "getVoteInfo",
          outputs: [
            {
              internalType: "address",
              name: "account",
              type: "address",
            },
            {
              internalType: "bytes32",
              name: "commit",
              type: "bytes32",
            },
            {
              internalType: "uint256",
              name: "choice",
              type: "uint256",
            },
            {
              internalType: "bool",
              name: "voted",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "governor",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_governor",
              type: "address",
            },
            {
              internalType: "contract KlerosCore",
              name: "_core",
              type: "address",
            },
          ],
          name: "initialize",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "initialize2",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_coreDisputeID",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_coreRoundID",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_voteID",
              type: "uint256",
            },
          ],
          name: "isVoteActive",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "proxiableUUID",
          outputs: [
            {
              internalType: "bytes32",
              name: "",
              type: "bytes32",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "singleDrawPerJuror",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "newImplementation",
              type: "address",
            },
            {
              internalType: "bytes",
              name: "data",
              type: "bytes",
            },
          ],
          name: "upgradeToAndCall",
          outputs: [],
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [],
          name: "version",
          outputs: [
            {
              internalType: "string",
              name: "",
              type: "string",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_coreDisputeID",
              type: "uint256",
            },
            {
              internalType: "address payable",
              name: "_beneficiary",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "_coreRoundID",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_choice",
              type: "uint256",
            },
          ],
          name: "withdrawFeesAndRewards",
          outputs: [
            {
              internalType: "uint256",
              name: "amount",
              type: "uint256",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_implementation",
              type: "address",
            },
            {
              internalType: "bytes",
              name: "_data",
              type: "bytes",
            },
          ],
          stateMutability: "nonpayable",
          type: "constructor",
        },
      ],
    },
    DisputeKitClassicUniversity: {
      address: "0xd6E96b7c993763B5CDDa1139C7387B82A7c8B8B5",
      abi: [
        {
          stateMutability: "payable",
          type: "fallback",
        },
        {
          stateMutability: "payable",
          type: "receive",
        },
        {
          inputs: [],
          name: "AlreadyInitialized",
          type: "error",
        },
        {
          inputs: [],
          name: "FailedDelegateCall",
          type: "error",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "implementation",
              type: "address",
            },
          ],
          name: "InvalidImplementation",
          type: "error",
        },
        {
          inputs: [],
          name: "NotInitializing",
          type: "error",
        },
        {
          inputs: [],
          name: "UUPSUnauthorizedCallContext",
          type: "error",
        },
        {
          inputs: [
            {
              internalType: "bytes32",
              name: "slot",
              type: "bytes32",
            },
          ],
          name: "UUPSUnsupportedProxiableUUID",
          type: "error",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "_coreDisputeID",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "uint256",
              name: "_coreRoundID",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "uint256",
              name: "_choice",
              type: "uint256",
            },
          ],
          name: "ChoiceFunded",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "_coreDisputeID",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "address",
              name: "_juror",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256[]",
              name: "_voteIDs",
              type: "uint256[]",
            },
            {
              indexed: false,
              internalType: "bytes32",
              name: "_commit",
              type: "bytes32",
            },
          ],
          name: "CommitCast",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "_coreDisputeID",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "uint256",
              name: "_coreRoundID",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_choice",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "address",
              name: "_contributor",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_amount",
              type: "uint256",
            },
          ],
          name: "Contribution",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "_coreDisputeID",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_numberOfChoices",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "bytes",
              name: "_extraData",
              type: "bytes",
            },
          ],
          name: "DisputeCreation",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: false,
              internalType: "uint64",
              name: "version",
              type: "uint64",
            },
          ],
          name: "Initialized",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "newImplementation",
              type: "address",
            },
          ],
          name: "Upgraded",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "_coreDisputeID",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "address",
              name: "_juror",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256[]",
              name: "_voteIDs",
              type: "uint256[]",
            },
            {
              indexed: true,
              internalType: "uint256",
              name: "_choice",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "string",
              name: "_justification",
              type: "string",
            },
          ],
          name: "VoteCast",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "_coreDisputeID",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "uint256",
              name: "_coreRoundID",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_choice",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "address",
              name: "_contributor",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_amount",
              type: "uint256",
            },
          ],
          name: "Withdrawal",
          type: "event",
        },
        {
          inputs: [],
          name: "LOSER_APPEAL_PERIOD_MULTIPLIER",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "LOSER_STAKE_MULTIPLIER",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "ONE_BASIS_POINT",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "WINNER_STAKE_MULTIPLIER",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_coreDisputeID",
              type: "uint256",
            },
          ],
          name: "areCommitsAllCast",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_coreDisputeID",
              type: "uint256",
            },
          ],
          name: "areVotesAllCast",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_coreDisputeID",
              type: "uint256",
            },
            {
              internalType: "uint256[]",
              name: "_voteIDs",
              type: "uint256[]",
            },
            {
              internalType: "bytes32",
              name: "_commit",
              type: "bytes32",
            },
          ],
          name: "castCommit",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_coreDisputeID",
              type: "uint256",
            },
            {
              internalType: "uint256[]",
              name: "_voteIDs",
              type: "uint256[]",
            },
            {
              internalType: "uint256",
              name: "_choice",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_salt",
              type: "uint256",
            },
            {
              internalType: "string",
              name: "_justification",
              type: "string",
            },
          ],
          name: "castVote",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_core",
              type: "address",
            },
          ],
          name: "changeCore",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address payable",
              name: "_governor",
              type: "address",
            },
          ],
          name: "changeGovernor",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "core",
          outputs: [
            {
              internalType: "contract KlerosCore",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          name: "coreDisputeIDToLocal",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_coreDisputeID",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_numberOfChoices",
              type: "uint256",
            },
            {
              internalType: "bytes",
              name: "_extraData",
              type: "bytes",
            },
            {
              internalType: "uint256",
              name: "_nbVotes",
              type: "uint256",
            },
          ],
          name: "createDispute",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_coreDisputeID",
              type: "uint256",
            },
          ],
          name: "currentRuling",
          outputs: [
            {
              internalType: "uint256",
              name: "ruling",
              type: "uint256",
            },
            {
              internalType: "bool",
              name: "tied",
              type: "bool",
            },
            {
              internalType: "bool",
              name: "overridden",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          name: "disputes",
          outputs: [
            {
              internalType: "uint256",
              name: "numberOfChoices",
              type: "uint256",
            },
            {
              internalType: "bool",
              name: "jumped",
              type: "bool",
            },
            {
              internalType: "bytes",
              name: "extraData",
              type: "bytes",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_coreDisputeID",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_nonce",
              type: "uint256",
            },
          ],
          name: "draw",
          outputs: [
            {
              internalType: "address",
              name: "drawnAddress",
              type: "address",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_destination",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "_amount",
              type: "uint256",
            },
            {
              internalType: "bytes",
              name: "_data",
              type: "bytes",
            },
          ],
          name: "executeGovernorProposal",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_coreDisputeID",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_choice",
              type: "uint256",
            },
          ],
          name: "fundAppeal",
          outputs: [],
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_coreDisputeID",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_coreRoundID",
              type: "uint256",
            },
          ],
          name: "getCoherentCount",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_coreDisputeID",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_coreRoundID",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_voteID",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          name: "getDegreeOfCoherence",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_coreDisputeID",
              type: "uint256",
            },
          ],
          name: "getFundedChoices",
          outputs: [
            {
              internalType: "uint256[]",
              name: "fundedChoices",
              type: "uint256[]",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_coreDisputeID",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_coreRoundID",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_choice",
              type: "uint256",
            },
          ],
          name: "getRoundInfo",
          outputs: [
            {
              internalType: "uint256",
              name: "winningChoice",
              type: "uint256",
            },
            {
              internalType: "bool",
              name: "tied",
              type: "bool",
            },
            {
              internalType: "uint256",
              name: "totalVoted",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "totalCommited",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "nbVoters",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "choiceCount",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_coreDisputeID",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_coreRoundID",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_voteID",
              type: "uint256",
            },
          ],
          name: "getVoteInfo",
          outputs: [
            {
              internalType: "address",
              name: "account",
              type: "address",
            },
            {
              internalType: "bytes32",
              name: "commit",
              type: "bytes32",
            },
            {
              internalType: "uint256",
              name: "choice",
              type: "uint256",
            },
            {
              internalType: "bool",
              name: "voted",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "governor",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_governor",
              type: "address",
            },
            {
              internalType: "contract KlerosCore",
              name: "_core",
              type: "address",
            },
          ],
          name: "initialize",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_coreDisputeID",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_coreRoundID",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_voteID",
              type: "uint256",
            },
          ],
          name: "isVoteActive",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "proxiableUUID",
          outputs: [
            {
              internalType: "bytes32",
              name: "",
              type: "bytes32",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "newImplementation",
              type: "address",
            },
            {
              internalType: "bytes",
              name: "data",
              type: "bytes",
            },
          ],
          name: "upgradeToAndCall",
          outputs: [],
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_coreDisputeID",
              type: "uint256",
            },
            {
              internalType: "address payable",
              name: "_beneficiary",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "_coreRoundID",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_choice",
              type: "uint256",
            },
          ],
          name: "withdrawFeesAndRewards",
          outputs: [
            {
              internalType: "uint256",
              name: "amount",
              type: "uint256",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_implementation",
              type: "address",
            },
            {
              internalType: "bytes",
              name: "_data",
              type: "bytes",
            },
          ],
          stateMutability: "nonpayable",
          type: "constructor",
        },
      ],
    },
    DisputeKitClassicUniversity_Implementation: {
      address: "0x87e863b94d2CB79A8aB53bD87Dc4A10E11C0918B",
      abi: [
        {
          inputs: [],
          stateMutability: "nonpayable",
          type: "constructor",
        },
        {
          inputs: [],
          name: "AlreadyInitialized",
          type: "error",
        },
        {
          inputs: [],
          name: "FailedDelegateCall",
          type: "error",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "implementation",
              type: "address",
            },
          ],
          name: "InvalidImplementation",
          type: "error",
        },
        {
          inputs: [],
          name: "NotInitializing",
          type: "error",
        },
        {
          inputs: [],
          name: "UUPSUnauthorizedCallContext",
          type: "error",
        },
        {
          inputs: [
            {
              internalType: "bytes32",
              name: "slot",
              type: "bytes32",
            },
          ],
          name: "UUPSUnsupportedProxiableUUID",
          type: "error",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "_coreDisputeID",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "uint256",
              name: "_coreRoundID",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "uint256",
              name: "_choice",
              type: "uint256",
            },
          ],
          name: "ChoiceFunded",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "_coreDisputeID",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "address",
              name: "_juror",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256[]",
              name: "_voteIDs",
              type: "uint256[]",
            },
            {
              indexed: false,
              internalType: "bytes32",
              name: "_commit",
              type: "bytes32",
            },
          ],
          name: "CommitCast",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "_coreDisputeID",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "uint256",
              name: "_coreRoundID",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_choice",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "address",
              name: "_contributor",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_amount",
              type: "uint256",
            },
          ],
          name: "Contribution",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "_coreDisputeID",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_numberOfChoices",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "bytes",
              name: "_extraData",
              type: "bytes",
            },
          ],
          name: "DisputeCreation",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: false,
              internalType: "uint64",
              name: "version",
              type: "uint64",
            },
          ],
          name: "Initialized",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "newImplementation",
              type: "address",
            },
          ],
          name: "Upgraded",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "_coreDisputeID",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "address",
              name: "_juror",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256[]",
              name: "_voteIDs",
              type: "uint256[]",
            },
            {
              indexed: true,
              internalType: "uint256",
              name: "_choice",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "string",
              name: "_justification",
              type: "string",
            },
          ],
          name: "VoteCast",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "_coreDisputeID",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "uint256",
              name: "_coreRoundID",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_choice",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "address",
              name: "_contributor",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_amount",
              type: "uint256",
            },
          ],
          name: "Withdrawal",
          type: "event",
        },
        {
          inputs: [],
          name: "LOSER_APPEAL_PERIOD_MULTIPLIER",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "LOSER_STAKE_MULTIPLIER",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "ONE_BASIS_POINT",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "WINNER_STAKE_MULTIPLIER",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_coreDisputeID",
              type: "uint256",
            },
          ],
          name: "areCommitsAllCast",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_coreDisputeID",
              type: "uint256",
            },
          ],
          name: "areVotesAllCast",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_coreDisputeID",
              type: "uint256",
            },
            {
              internalType: "uint256[]",
              name: "_voteIDs",
              type: "uint256[]",
            },
            {
              internalType: "bytes32",
              name: "_commit",
              type: "bytes32",
            },
          ],
          name: "castCommit",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_coreDisputeID",
              type: "uint256",
            },
            {
              internalType: "uint256[]",
              name: "_voteIDs",
              type: "uint256[]",
            },
            {
              internalType: "uint256",
              name: "_choice",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_salt",
              type: "uint256",
            },
            {
              internalType: "string",
              name: "_justification",
              type: "string",
            },
          ],
          name: "castVote",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_core",
              type: "address",
            },
          ],
          name: "changeCore",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address payable",
              name: "_governor",
              type: "address",
            },
          ],
          name: "changeGovernor",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "core",
          outputs: [
            {
              internalType: "contract KlerosCore",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          name: "coreDisputeIDToLocal",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_coreDisputeID",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_numberOfChoices",
              type: "uint256",
            },
            {
              internalType: "bytes",
              name: "_extraData",
              type: "bytes",
            },
            {
              internalType: "uint256",
              name: "_nbVotes",
              type: "uint256",
            },
          ],
          name: "createDispute",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_coreDisputeID",
              type: "uint256",
            },
          ],
          name: "currentRuling",
          outputs: [
            {
              internalType: "uint256",
              name: "ruling",
              type: "uint256",
            },
            {
              internalType: "bool",
              name: "tied",
              type: "bool",
            },
            {
              internalType: "bool",
              name: "overridden",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          name: "disputes",
          outputs: [
            {
              internalType: "uint256",
              name: "numberOfChoices",
              type: "uint256",
            },
            {
              internalType: "bool",
              name: "jumped",
              type: "bool",
            },
            {
              internalType: "bytes",
              name: "extraData",
              type: "bytes",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_coreDisputeID",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_nonce",
              type: "uint256",
            },
          ],
          name: "draw",
          outputs: [
            {
              internalType: "address",
              name: "drawnAddress",
              type: "address",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_destination",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "_amount",
              type: "uint256",
            },
            {
              internalType: "bytes",
              name: "_data",
              type: "bytes",
            },
          ],
          name: "executeGovernorProposal",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_coreDisputeID",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_choice",
              type: "uint256",
            },
          ],
          name: "fundAppeal",
          outputs: [],
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_coreDisputeID",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_coreRoundID",
              type: "uint256",
            },
          ],
          name: "getCoherentCount",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_coreDisputeID",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_coreRoundID",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_voteID",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          name: "getDegreeOfCoherence",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_coreDisputeID",
              type: "uint256",
            },
          ],
          name: "getFundedChoices",
          outputs: [
            {
              internalType: "uint256[]",
              name: "fundedChoices",
              type: "uint256[]",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_coreDisputeID",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_coreRoundID",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_choice",
              type: "uint256",
            },
          ],
          name: "getRoundInfo",
          outputs: [
            {
              internalType: "uint256",
              name: "winningChoice",
              type: "uint256",
            },
            {
              internalType: "bool",
              name: "tied",
              type: "bool",
            },
            {
              internalType: "uint256",
              name: "totalVoted",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "totalCommited",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "nbVoters",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "choiceCount",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_coreDisputeID",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_coreRoundID",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_voteID",
              type: "uint256",
            },
          ],
          name: "getVoteInfo",
          outputs: [
            {
              internalType: "address",
              name: "account",
              type: "address",
            },
            {
              internalType: "bytes32",
              name: "commit",
              type: "bytes32",
            },
            {
              internalType: "uint256",
              name: "choice",
              type: "uint256",
            },
            {
              internalType: "bool",
              name: "voted",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "governor",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_governor",
              type: "address",
            },
            {
              internalType: "contract KlerosCore",
              name: "_core",
              type: "address",
            },
          ],
          name: "initialize",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_coreDisputeID",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_coreRoundID",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_voteID",
              type: "uint256",
            },
          ],
          name: "isVoteActive",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "proxiableUUID",
          outputs: [
            {
              internalType: "bytes32",
              name: "",
              type: "bytes32",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "newImplementation",
              type: "address",
            },
            {
              internalType: "bytes",
              name: "data",
              type: "bytes",
            },
          ],
          name: "upgradeToAndCall",
          outputs: [],
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_coreDisputeID",
              type: "uint256",
            },
            {
              internalType: "address payable",
              name: "_beneficiary",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "_coreRoundID",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_choice",
              type: "uint256",
            },
          ],
          name: "withdrawFeesAndRewards",
          outputs: [
            {
              internalType: "uint256",
              name: "amount",
              type: "uint256",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
      ],
    },
    DisputeKitClassicUniversity_Proxy: {
      address: "0xd6E96b7c993763B5CDDa1139C7387B82A7c8B8B5",
      abi: [
        {
          inputs: [
            {
              internalType: "address",
              name: "_implementation",
              type: "address",
            },
            {
              internalType: "bytes",
              name: "_data",
              type: "bytes",
            },
          ],
          stateMutability: "nonpayable",
          type: "constructor",
        },
        {
          stateMutability: "payable",
          type: "fallback",
        },
        {
          stateMutability: "payable",
          type: "receive",
        },
      ],
    },
    DisputeKitClassic_Implementation: {
      address: "0xc51Ac08b07832Cf9b51Ff9E9dd3E85a3D205ff24",
      abi: [
        {
          inputs: [],
          stateMutability: "nonpayable",
          type: "constructor",
        },
        {
          inputs: [],
          name: "AlreadyInitialized",
          type: "error",
        },
        {
          inputs: [],
          name: "FailedDelegateCall",
          type: "error",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "implementation",
              type: "address",
            },
          ],
          name: "InvalidImplementation",
          type: "error",
        },
        {
          inputs: [],
          name: "NotInitializing",
          type: "error",
        },
        {
          inputs: [],
          name: "UUPSUnauthorizedCallContext",
          type: "error",
        },
        {
          inputs: [
            {
              internalType: "bytes32",
              name: "slot",
              type: "bytes32",
            },
          ],
          name: "UUPSUnsupportedProxiableUUID",
          type: "error",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "_coreDisputeID",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "uint256",
              name: "_coreRoundID",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "uint256",
              name: "_choice",
              type: "uint256",
            },
          ],
          name: "ChoiceFunded",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "_coreDisputeID",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "address",
              name: "_juror",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256[]",
              name: "_voteIDs",
              type: "uint256[]",
            },
            {
              indexed: false,
              internalType: "bytes32",
              name: "_commit",
              type: "bytes32",
            },
          ],
          name: "CommitCast",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "_coreDisputeID",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "uint256",
              name: "_coreRoundID",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_choice",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "address",
              name: "_contributor",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_amount",
              type: "uint256",
            },
          ],
          name: "Contribution",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "_coreDisputeID",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_numberOfChoices",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "bytes",
              name: "_extraData",
              type: "bytes",
            },
          ],
          name: "DisputeCreation",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: false,
              internalType: "uint64",
              name: "version",
              type: "uint64",
            },
          ],
          name: "Initialized",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "newImplementation",
              type: "address",
            },
          ],
          name: "Upgraded",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "_coreDisputeID",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "address",
              name: "_juror",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256[]",
              name: "_voteIDs",
              type: "uint256[]",
            },
            {
              indexed: true,
              internalType: "uint256",
              name: "_choice",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "string",
              name: "_justification",
              type: "string",
            },
          ],
          name: "VoteCast",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "_coreDisputeID",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "uint256",
              name: "_coreRoundID",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_choice",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "address",
              name: "_contributor",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_amount",
              type: "uint256",
            },
          ],
          name: "Withdrawal",
          type: "event",
        },
        {
          inputs: [],
          name: "LOSER_APPEAL_PERIOD_MULTIPLIER",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "LOSER_STAKE_MULTIPLIER",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "ONE_BASIS_POINT",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "WINNER_STAKE_MULTIPLIER",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_coreDisputeID",
              type: "uint256",
            },
          ],
          name: "areCommitsAllCast",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_coreDisputeID",
              type: "uint256",
            },
          ],
          name: "areVotesAllCast",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_coreDisputeID",
              type: "uint256",
            },
            {
              internalType: "uint256[]",
              name: "_voteIDs",
              type: "uint256[]",
            },
            {
              internalType: "bytes32",
              name: "_commit",
              type: "bytes32",
            },
          ],
          name: "castCommit",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_coreDisputeID",
              type: "uint256",
            },
            {
              internalType: "uint256[]",
              name: "_voteIDs",
              type: "uint256[]",
            },
            {
              internalType: "uint256",
              name: "_choice",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_salt",
              type: "uint256",
            },
            {
              internalType: "string",
              name: "_justification",
              type: "string",
            },
          ],
          name: "castVote",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_core",
              type: "address",
            },
          ],
          name: "changeCore",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address payable",
              name: "_governor",
              type: "address",
            },
          ],
          name: "changeGovernor",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "core",
          outputs: [
            {
              internalType: "contract KlerosCore",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          name: "coreDisputeIDToLocal",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_coreDisputeID",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_numberOfChoices",
              type: "uint256",
            },
            {
              internalType: "bytes",
              name: "_extraData",
              type: "bytes",
            },
            {
              internalType: "uint256",
              name: "_nbVotes",
              type: "uint256",
            },
          ],
          name: "createDispute",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_coreDisputeID",
              type: "uint256",
            },
          ],
          name: "currentRuling",
          outputs: [
            {
              internalType: "uint256",
              name: "ruling",
              type: "uint256",
            },
            {
              internalType: "bool",
              name: "tied",
              type: "bool",
            },
            {
              internalType: "bool",
              name: "overridden",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          name: "disputes",
          outputs: [
            {
              internalType: "uint256",
              name: "numberOfChoices",
              type: "uint256",
            },
            {
              internalType: "bool",
              name: "jumped",
              type: "bool",
            },
            {
              internalType: "bytes",
              name: "extraData",
              type: "bytes",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_coreDisputeID",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_nonce",
              type: "uint256",
            },
          ],
          name: "draw",
          outputs: [
            {
              internalType: "address",
              name: "drawnAddress",
              type: "address",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_destination",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "_amount",
              type: "uint256",
            },
            {
              internalType: "bytes",
              name: "_data",
              type: "bytes",
            },
          ],
          name: "executeGovernorProposal",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_coreDisputeID",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_choice",
              type: "uint256",
            },
          ],
          name: "fundAppeal",
          outputs: [],
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_coreDisputeID",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_coreRoundID",
              type: "uint256",
            },
          ],
          name: "getCoherentCount",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_coreDisputeID",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_coreRoundID",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_voteID",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          name: "getDegreeOfCoherence",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_coreDisputeID",
              type: "uint256",
            },
          ],
          name: "getFundedChoices",
          outputs: [
            {
              internalType: "uint256[]",
              name: "fundedChoices",
              type: "uint256[]",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_coreDisputeID",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_coreRoundID",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_choice",
              type: "uint256",
            },
          ],
          name: "getRoundInfo",
          outputs: [
            {
              internalType: "uint256",
              name: "winningChoice",
              type: "uint256",
            },
            {
              internalType: "bool",
              name: "tied",
              type: "bool",
            },
            {
              internalType: "uint256",
              name: "totalVoted",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "totalCommited",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "nbVoters",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "choiceCount",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_coreDisputeID",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_coreRoundID",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_voteID",
              type: "uint256",
            },
          ],
          name: "getVoteInfo",
          outputs: [
            {
              internalType: "address",
              name: "account",
              type: "address",
            },
            {
              internalType: "bytes32",
              name: "commit",
              type: "bytes32",
            },
            {
              internalType: "uint256",
              name: "choice",
              type: "uint256",
            },
            {
              internalType: "bool",
              name: "voted",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "governor",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_governor",
              type: "address",
            },
            {
              internalType: "contract KlerosCore",
              name: "_core",
              type: "address",
            },
          ],
          name: "initialize",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "initialize2",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_coreDisputeID",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_coreRoundID",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_voteID",
              type: "uint256",
            },
          ],
          name: "isVoteActive",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "proxiableUUID",
          outputs: [
            {
              internalType: "bytes32",
              name: "",
              type: "bytes32",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "singleDrawPerJuror",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "newImplementation",
              type: "address",
            },
            {
              internalType: "bytes",
              name: "data",
              type: "bytes",
            },
          ],
          name: "upgradeToAndCall",
          outputs: [],
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [],
          name: "version",
          outputs: [
            {
              internalType: "string",
              name: "",
              type: "string",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_coreDisputeID",
              type: "uint256",
            },
            {
              internalType: "address payable",
              name: "_beneficiary",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "_coreRoundID",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_choice",
              type: "uint256",
            },
          ],
          name: "withdrawFeesAndRewards",
          outputs: [
            {
              internalType: "uint256",
              name: "amount",
              type: "uint256",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
      ],
    },
    DisputeKitClassic_Proxy: {
      address: "0x2246821E1313A93e2F8CdF7a3422d078f560b457",
      abi: [
        {
          inputs: [
            {
              internalType: "address",
              name: "_implementation",
              type: "address",
            },
            {
              internalType: "bytes",
              name: "_data",
              type: "bytes",
            },
          ],
          stateMutability: "nonpayable",
          type: "constructor",
        },
        {
          stateMutability: "payable",
          type: "fallback",
        },
        {
          stateMutability: "payable",
          type: "receive",
        },
      ],
    },
    DisputeResolver: {
      address: "0x524C5541f440204E0B4577334c439277018F971f",
      abi: [
        {
          inputs: [
            {
              internalType: "contract IArbitratorV2",
              name: "_arbitrator",
              type: "address",
            },
            {
              internalType: "contract IDisputeTemplateRegistry",
              name: "_templateRegistry",
              type: "address",
            },
          ],
          stateMutability: "nonpayable",
          type: "constructor",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "contract IArbitratorV2",
              name: "_arbitrator",
              type: "address",
            },
            {
              indexed: true,
              internalType: "uint256",
              name: "_arbitratorDisputeID",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_externalDisputeID",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_templateId",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "string",
              name: "_templateUri",
              type: "string",
            },
          ],
          name: "DisputeRequest",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "contract IArbitratorV2",
              name: "_arbitrator",
              type: "address",
            },
            {
              indexed: true,
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_ruling",
              type: "uint256",
            },
          ],
          name: "Ruling",
          type: "event",
        },
        {
          inputs: [],
          name: "arbitrator",
          outputs: [
            {
              internalType: "contract IArbitratorV2",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          name: "arbitratorDisputeIDToLocalID",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "contract IArbitratorV2",
              name: "_arbitrator",
              type: "address",
            },
          ],
          name: "changeArbitrator",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_governor",
              type: "address",
            },
          ],
          name: "changeGovernor",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "contract IDisputeTemplateRegistry",
              name: "_templateRegistry",
              type: "address",
            },
          ],
          name: "changeTemplateRegistry",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "bytes",
              name: "_arbitratorExtraData",
              type: "bytes",
            },
            {
              internalType: "string",
              name: "_disputeTemplate",
              type: "string",
            },
            {
              internalType: "string",
              name: "_disputeTemplateDataMappings",
              type: "string",
            },
            {
              internalType: "uint256",
              name: "_numberOfRulingOptions",
              type: "uint256",
            },
          ],
          name: "createDisputeForTemplate",
          outputs: [
            {
              internalType: "uint256",
              name: "disputeID",
              type: "uint256",
            },
          ],
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "bytes",
              name: "_arbitratorExtraData",
              type: "bytes",
            },
            {
              internalType: "string",
              name: "_disputeTemplateUri",
              type: "string",
            },
            {
              internalType: "uint256",
              name: "_numberOfRulingOptions",
              type: "uint256",
            },
          ],
          name: "createDisputeForTemplateUri",
          outputs: [
            {
              internalType: "uint256",
              name: "disputeID",
              type: "uint256",
            },
          ],
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          name: "disputes",
          outputs: [
            {
              internalType: "bytes",
              name: "arbitratorExtraData",
              type: "bytes",
            },
            {
              internalType: "bool",
              name: "isRuled",
              type: "bool",
            },
            {
              internalType: "uint256",
              name: "ruling",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "numberOfRulingOptions",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "governor",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_arbitratorDisputeID",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_ruling",
              type: "uint256",
            },
          ],
          name: "rule",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "templateRegistry",
          outputs: [
            {
              internalType: "contract IDisputeTemplateRegistry",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
      ],
    },
    DisputeResolverRuler: {
      address: "0x199893232ECC74cC7898B24b5Ff58d613029f6B7",
      abi: [
        {
          inputs: [
            {
              internalType: "contract IArbitratorV2",
              name: "_arbitrator",
              type: "address",
            },
            {
              internalType: "contract IDisputeTemplateRegistry",
              name: "_templateRegistry",
              type: "address",
            },
          ],
          stateMutability: "nonpayable",
          type: "constructor",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "contract IArbitratorV2",
              name: "_arbitrator",
              type: "address",
            },
            {
              indexed: true,
              internalType: "uint256",
              name: "_arbitratorDisputeID",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_externalDisputeID",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_templateId",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "string",
              name: "_templateUri",
              type: "string",
            },
          ],
          name: "DisputeRequest",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "contract IArbitratorV2",
              name: "_arbitrator",
              type: "address",
            },
            {
              indexed: true,
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_ruling",
              type: "uint256",
            },
          ],
          name: "Ruling",
          type: "event",
        },
        {
          inputs: [],
          name: "arbitrator",
          outputs: [
            {
              internalType: "contract IArbitratorV2",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          name: "arbitratorDisputeIDToLocalID",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "contract IArbitratorV2",
              name: "_arbitrator",
              type: "address",
            },
          ],
          name: "changeArbitrator",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_governor",
              type: "address",
            },
          ],
          name: "changeGovernor",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "contract IDisputeTemplateRegistry",
              name: "_templateRegistry",
              type: "address",
            },
          ],
          name: "changeTemplateRegistry",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "bytes",
              name: "_arbitratorExtraData",
              type: "bytes",
            },
            {
              internalType: "string",
              name: "_disputeTemplate",
              type: "string",
            },
            {
              internalType: "string",
              name: "_disputeTemplateDataMappings",
              type: "string",
            },
            {
              internalType: "uint256",
              name: "_numberOfRulingOptions",
              type: "uint256",
            },
          ],
          name: "createDisputeForTemplate",
          outputs: [
            {
              internalType: "uint256",
              name: "disputeID",
              type: "uint256",
            },
          ],
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "bytes",
              name: "_arbitratorExtraData",
              type: "bytes",
            },
            {
              internalType: "string",
              name: "_disputeTemplateUri",
              type: "string",
            },
            {
              internalType: "uint256",
              name: "_numberOfRulingOptions",
              type: "uint256",
            },
          ],
          name: "createDisputeForTemplateUri",
          outputs: [
            {
              internalType: "uint256",
              name: "disputeID",
              type: "uint256",
            },
          ],
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          name: "disputes",
          outputs: [
            {
              internalType: "bytes",
              name: "arbitratorExtraData",
              type: "bytes",
            },
            {
              internalType: "bool",
              name: "isRuled",
              type: "bool",
            },
            {
              internalType: "uint256",
              name: "ruling",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "numberOfRulingOptions",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "governor",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_arbitratorDisputeID",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_ruling",
              type: "uint256",
            },
          ],
          name: "rule",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "templateRegistry",
          outputs: [
            {
              internalType: "contract IDisputeTemplateRegistry",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
      ],
    },
    DisputeResolverUniversity: {
      address: "0x2Aa1a94307E772BeE42E9EfbD137b1053F1fCfd4",
      abi: [
        {
          inputs: [
            {
              internalType: "contract IArbitratorV2",
              name: "_arbitrator",
              type: "address",
            },
            {
              internalType: "contract IDisputeTemplateRegistry",
              name: "_templateRegistry",
              type: "address",
            },
          ],
          stateMutability: "nonpayable",
          type: "constructor",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "contract IArbitratorV2",
              name: "_arbitrator",
              type: "address",
            },
            {
              indexed: true,
              internalType: "uint256",
              name: "_arbitratorDisputeID",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_externalDisputeID",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_templateId",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "string",
              name: "_templateUri",
              type: "string",
            },
          ],
          name: "DisputeRequest",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "contract IArbitratorV2",
              name: "_arbitrator",
              type: "address",
            },
            {
              indexed: true,
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_ruling",
              type: "uint256",
            },
          ],
          name: "Ruling",
          type: "event",
        },
        {
          inputs: [],
          name: "arbitrator",
          outputs: [
            {
              internalType: "contract IArbitratorV2",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          name: "arbitratorDisputeIDToLocalID",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "contract IArbitratorV2",
              name: "_arbitrator",
              type: "address",
            },
          ],
          name: "changeArbitrator",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_governor",
              type: "address",
            },
          ],
          name: "changeGovernor",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "contract IDisputeTemplateRegistry",
              name: "_templateRegistry",
              type: "address",
            },
          ],
          name: "changeTemplateRegistry",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "bytes",
              name: "_arbitratorExtraData",
              type: "bytes",
            },
            {
              internalType: "string",
              name: "_disputeTemplate",
              type: "string",
            },
            {
              internalType: "string",
              name: "_disputeTemplateDataMappings",
              type: "string",
            },
            {
              internalType: "uint256",
              name: "_numberOfRulingOptions",
              type: "uint256",
            },
          ],
          name: "createDisputeForTemplate",
          outputs: [
            {
              internalType: "uint256",
              name: "disputeID",
              type: "uint256",
            },
          ],
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "bytes",
              name: "_arbitratorExtraData",
              type: "bytes",
            },
            {
              internalType: "string",
              name: "_disputeTemplateUri",
              type: "string",
            },
            {
              internalType: "uint256",
              name: "_numberOfRulingOptions",
              type: "uint256",
            },
          ],
          name: "createDisputeForTemplateUri",
          outputs: [
            {
              internalType: "uint256",
              name: "disputeID",
              type: "uint256",
            },
          ],
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          name: "disputes",
          outputs: [
            {
              internalType: "bytes",
              name: "arbitratorExtraData",
              type: "bytes",
            },
            {
              internalType: "bool",
              name: "isRuled",
              type: "bool",
            },
            {
              internalType: "uint256",
              name: "ruling",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "numberOfRulingOptions",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "governor",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_arbitratorDisputeID",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_ruling",
              type: "uint256",
            },
          ],
          name: "rule",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "templateRegistry",
          outputs: [
            {
              internalType: "contract IDisputeTemplateRegistry",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
      ],
    },
    DisputeTemplateRegistry: {
      address: "0x45f0662ec4aA4164b187c1bd39D35D0E3168787a",
      abi: [
        {
          stateMutability: "payable",
          type: "fallback",
        },
        {
          stateMutability: "payable",
          type: "receive",
        },
        {
          inputs: [],
          name: "AlreadyInitialized",
          type: "error",
        },
        {
          inputs: [],
          name: "FailedDelegateCall",
          type: "error",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "implementation",
              type: "address",
            },
          ],
          name: "InvalidImplementation",
          type: "error",
        },
        {
          inputs: [],
          name: "NotInitializing",
          type: "error",
        },
        {
          inputs: [],
          name: "UUPSUnauthorizedCallContext",
          type: "error",
        },
        {
          inputs: [
            {
              internalType: "bytes32",
              name: "slot",
              type: "bytes32",
            },
          ],
          name: "UUPSUnsupportedProxiableUUID",
          type: "error",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "_templateId",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "string",
              name: "_templateTag",
              type: "string",
            },
            {
              indexed: false,
              internalType: "string",
              name: "_templateData",
              type: "string",
            },
            {
              indexed: false,
              internalType: "string",
              name: "_templateDataMappings",
              type: "string",
            },
          ],
          name: "DisputeTemplate",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: false,
              internalType: "uint64",
              name: "version",
              type: "uint64",
            },
          ],
          name: "Initialized",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "newImplementation",
              type: "address",
            },
          ],
          name: "Upgraded",
          type: "event",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_governor",
              type: "address",
            },
          ],
          name: "changeGovernor",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "governor",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_governor",
              type: "address",
            },
          ],
          name: "initialize",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "initialize2",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "proxiableUUID",
          outputs: [
            {
              internalType: "bytes32",
              name: "",
              type: "bytes32",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "string",
              name: "_templateTag",
              type: "string",
            },
            {
              internalType: "string",
              name: "_templateData",
              type: "string",
            },
            {
              internalType: "string",
              name: "_templateDataMappings",
              type: "string",
            },
          ],
          name: "setDisputeTemplate",
          outputs: [
            {
              internalType: "uint256",
              name: "templateId",
              type: "uint256",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "templates",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "newImplementation",
              type: "address",
            },
            {
              internalType: "bytes",
              name: "data",
              type: "bytes",
            },
          ],
          name: "upgradeToAndCall",
          outputs: [],
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [],
          name: "version",
          outputs: [
            {
              internalType: "string",
              name: "",
              type: "string",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_implementation",
              type: "address",
            },
            {
              internalType: "bytes",
              name: "_data",
              type: "bytes",
            },
          ],
          stateMutability: "nonpayable",
          type: "constructor",
        },
      ],
    },
    DisputeTemplateRegistry_Implementation: {
      address: "0x0406ea6E28fAb9A23BF0d6f0f23f4352383A8592",
      abi: [
        {
          inputs: [],
          stateMutability: "nonpayable",
          type: "constructor",
        },
        {
          inputs: [],
          name: "AlreadyInitialized",
          type: "error",
        },
        {
          inputs: [],
          name: "FailedDelegateCall",
          type: "error",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "implementation",
              type: "address",
            },
          ],
          name: "InvalidImplementation",
          type: "error",
        },
        {
          inputs: [],
          name: "NotInitializing",
          type: "error",
        },
        {
          inputs: [],
          name: "UUPSUnauthorizedCallContext",
          type: "error",
        },
        {
          inputs: [
            {
              internalType: "bytes32",
              name: "slot",
              type: "bytes32",
            },
          ],
          name: "UUPSUnsupportedProxiableUUID",
          type: "error",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "_templateId",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "string",
              name: "_templateTag",
              type: "string",
            },
            {
              indexed: false,
              internalType: "string",
              name: "_templateData",
              type: "string",
            },
            {
              indexed: false,
              internalType: "string",
              name: "_templateDataMappings",
              type: "string",
            },
          ],
          name: "DisputeTemplate",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: false,
              internalType: "uint64",
              name: "version",
              type: "uint64",
            },
          ],
          name: "Initialized",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "newImplementation",
              type: "address",
            },
          ],
          name: "Upgraded",
          type: "event",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_governor",
              type: "address",
            },
          ],
          name: "changeGovernor",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "governor",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_governor",
              type: "address",
            },
          ],
          name: "initialize",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "initialize2",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "proxiableUUID",
          outputs: [
            {
              internalType: "bytes32",
              name: "",
              type: "bytes32",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "string",
              name: "_templateTag",
              type: "string",
            },
            {
              internalType: "string",
              name: "_templateData",
              type: "string",
            },
            {
              internalType: "string",
              name: "_templateDataMappings",
              type: "string",
            },
          ],
          name: "setDisputeTemplate",
          outputs: [
            {
              internalType: "uint256",
              name: "templateId",
              type: "uint256",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "templates",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "newImplementation",
              type: "address",
            },
            {
              internalType: "bytes",
              name: "data",
              type: "bytes",
            },
          ],
          name: "upgradeToAndCall",
          outputs: [],
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [],
          name: "version",
          outputs: [
            {
              internalType: "string",
              name: "",
              type: "string",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
      ],
    },
    DisputeTemplateRegistry_Proxy: {
      address: "0x45f0662ec4aA4164b187c1bd39D35D0E3168787a",
      abi: [
        {
          inputs: [
            {
              internalType: "address",
              name: "_implementation",
              type: "address",
            },
            {
              internalType: "bytes",
              name: "_data",
              type: "bytes",
            },
          ],
          stateMutability: "nonpayable",
          type: "constructor",
        },
        {
          stateMutability: "payable",
          type: "fallback",
        },
        {
          stateMutability: "payable",
          type: "receive",
        },
      ],
    },
    EvidenceModule: {
      address: "0x990f44d19a5F46889801B31bf58e0536fBECf27C",
      abi: [
        {
          stateMutability: "payable",
          type: "fallback",
        },
        {
          stateMutability: "payable",
          type: "receive",
        },
        {
          inputs: [],
          name: "AlreadyInitialized",
          type: "error",
        },
        {
          inputs: [],
          name: "FailedDelegateCall",
          type: "error",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "implementation",
              type: "address",
            },
          ],
          name: "InvalidImplementation",
          type: "error",
        },
        {
          inputs: [],
          name: "NotInitializing",
          type: "error",
        },
        {
          inputs: [],
          name: "UUPSUnauthorizedCallContext",
          type: "error",
        },
        {
          inputs: [
            {
              internalType: "bytes32",
              name: "slot",
              type: "bytes32",
            },
          ],
          name: "UUPSUnsupportedProxiableUUID",
          type: "error",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "_externalDisputeID",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "address",
              name: "_party",
              type: "address",
            },
            {
              indexed: false,
              internalType: "string",
              name: "_evidence",
              type: "string",
            },
          ],
          name: "Evidence",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: false,
              internalType: "uint64",
              name: "version",
              type: "uint64",
            },
          ],
          name: "Initialized",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "newImplementation",
              type: "address",
            },
          ],
          name: "Upgraded",
          type: "event",
        },
        {
          inputs: [],
          name: "governor",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_governor",
              type: "address",
            },
          ],
          name: "initialize",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "initialize2",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "proxiableUUID",
          outputs: [
            {
              internalType: "bytes32",
              name: "",
              type: "bytes32",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_externalDisputeID",
              type: "uint256",
            },
            {
              internalType: "string",
              name: "_evidence",
              type: "string",
            },
          ],
          name: "submitEvidence",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "newImplementation",
              type: "address",
            },
            {
              internalType: "bytes",
              name: "data",
              type: "bytes",
            },
          ],
          name: "upgradeToAndCall",
          outputs: [],
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [],
          name: "version",
          outputs: [
            {
              internalType: "string",
              name: "",
              type: "string",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_implementation",
              type: "address",
            },
            {
              internalType: "bytes",
              name: "_data",
              type: "bytes",
            },
          ],
          stateMutability: "nonpayable",
          type: "constructor",
        },
      ],
    },
    EvidenceModule_Implementation: {
      address: "0xf9f41910696DadF83a7B0b3e856a175D6aEEC8e8",
      abi: [
        {
          inputs: [],
          stateMutability: "nonpayable",
          type: "constructor",
        },
        {
          inputs: [],
          name: "AlreadyInitialized",
          type: "error",
        },
        {
          inputs: [],
          name: "FailedDelegateCall",
          type: "error",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "implementation",
              type: "address",
            },
          ],
          name: "InvalidImplementation",
          type: "error",
        },
        {
          inputs: [],
          name: "NotInitializing",
          type: "error",
        },
        {
          inputs: [],
          name: "UUPSUnauthorizedCallContext",
          type: "error",
        },
        {
          inputs: [
            {
              internalType: "bytes32",
              name: "slot",
              type: "bytes32",
            },
          ],
          name: "UUPSUnsupportedProxiableUUID",
          type: "error",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "_externalDisputeID",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "address",
              name: "_party",
              type: "address",
            },
            {
              indexed: false,
              internalType: "string",
              name: "_evidence",
              type: "string",
            },
          ],
          name: "Evidence",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: false,
              internalType: "uint64",
              name: "version",
              type: "uint64",
            },
          ],
          name: "Initialized",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "newImplementation",
              type: "address",
            },
          ],
          name: "Upgraded",
          type: "event",
        },
        {
          inputs: [],
          name: "governor",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_governor",
              type: "address",
            },
          ],
          name: "initialize",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "initialize2",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "proxiableUUID",
          outputs: [
            {
              internalType: "bytes32",
              name: "",
              type: "bytes32",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_externalDisputeID",
              type: "uint256",
            },
            {
              internalType: "string",
              name: "_evidence",
              type: "string",
            },
          ],
          name: "submitEvidence",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "newImplementation",
              type: "address",
            },
            {
              internalType: "bytes",
              name: "data",
              type: "bytes",
            },
          ],
          name: "upgradeToAndCall",
          outputs: [],
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [],
          name: "version",
          outputs: [
            {
              internalType: "string",
              name: "",
              type: "string",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
      ],
    },
    EvidenceModule_Proxy: {
      address: "0x990f44d19a5F46889801B31bf58e0536fBECf27C",
      abi: [
        {
          inputs: [
            {
              internalType: "address",
              name: "_implementation",
              type: "address",
            },
            {
              internalType: "bytes",
              name: "_data",
              type: "bytes",
            },
          ],
          stateMutability: "nonpayable",
          type: "constructor",
        },
        {
          stateMutability: "payable",
          type: "fallback",
        },
        {
          stateMutability: "payable",
          type: "receive",
        },
      ],
    },
    KlerosCore: {
      address: "0x4838e31E0ea315232c431598110FE677cAF2D6E6",
      abi: [
        {
          stateMutability: "payable",
          type: "fallback",
        },
        {
          stateMutability: "payable",
          type: "receive",
        },
        {
          inputs: [],
          name: "AlreadyInitialized",
          type: "error",
        },
        {
          inputs: [],
          name: "AppealFeesNotEnough",
          type: "error",
        },
        {
          inputs: [],
          name: "AppealPeriodNotPassed",
          type: "error",
        },
        {
          inputs: [],
          name: "ArbitrationFeesNotEnough",
          type: "error",
        },
        {
          inputs: [],
          name: "CannotDisableClassicDK",
          type: "error",
        },
        {
          inputs: [],
          name: "CommitPeriodNotPassed",
          type: "error",
        },
        {
          inputs: [],
          name: "DisputeKitNotSupportedByCourt",
          type: "error",
        },
        {
          inputs: [],
          name: "DisputeKitOnly",
          type: "error",
        },
        {
          inputs: [],
          name: "DisputeNotAppealable",
          type: "error",
        },
        {
          inputs: [],
          name: "DisputePeriodIsFinal",
          type: "error",
        },
        {
          inputs: [],
          name: "DisputeStillDrawing",
          type: "error",
        },
        {
          inputs: [],
          name: "EvidenceNotPassedAndNotAppeal",
          type: "error",
        },
        {
          inputs: [],
          name: "FailedDelegateCall",
          type: "error",
        },
        {
          inputs: [],
          name: "GovernorOnly",
          type: "error",
        },
        {
          inputs: [],
          name: "GuardianOrGovernorOnly",
          type: "error",
        },
        {
          inputs: [],
          name: "InvalidDisputKitParent",
          type: "error",
        },
        {
          inputs: [],
          name: "InvalidForkingCourtAsParent",
          type: "error",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "implementation",
              type: "address",
            },
          ],
          name: "InvalidImplementation",
          type: "error",
        },
        {
          inputs: [],
          name: "MinStakeLowerThanParentCourt",
          type: "error",
        },
        {
          inputs: [],
          name: "MustSupportDisputeKitClassic",
          type: "error",
        },
        {
          inputs: [],
          name: "NotEvidencePeriod",
          type: "error",
        },
        {
          inputs: [],
          name: "NotExecutionPeriod",
          type: "error",
        },
        {
          inputs: [],
          name: "NotInitializing",
          type: "error",
        },
        {
          inputs: [],
          name: "RulingAlreadyExecuted",
          type: "error",
        },
        {
          inputs: [],
          name: "SortitionModuleOnly",
          type: "error",
        },
        {
          inputs: [],
          name: "StakingInTooManyCourts",
          type: "error",
        },
        {
          inputs: [],
          name: "StakingLessThanCourtMinStake",
          type: "error",
        },
        {
          inputs: [],
          name: "StakingNotPossibeInThisCourt",
          type: "error",
        },
        {
          inputs: [],
          name: "StakingTransferFailed",
          type: "error",
        },
        {
          inputs: [],
          name: "StakingZeroWhenNoStake",
          type: "error",
        },
        {
          inputs: [],
          name: "TokenNotAccepted",
          type: "error",
        },
        {
          inputs: [],
          name: "TransferFailed",
          type: "error",
        },
        {
          inputs: [],
          name: "UUPSUnauthorizedCallContext",
          type: "error",
        },
        {
          inputs: [
            {
              internalType: "bytes32",
              name: "slot",
              type: "bytes32",
            },
          ],
          name: "UUPSUnsupportedProxiableUUID",
          type: "error",
        },
        {
          inputs: [],
          name: "UnstakingTransferFailed",
          type: "error",
        },
        {
          inputs: [],
          name: "UnsuccessfulCall",
          type: "error",
        },
        {
          inputs: [],
          name: "UnsupportedDisputeKit",
          type: "error",
        },
        {
          inputs: [],
          name: "VotePeriodNotPassed",
          type: "error",
        },
        {
          inputs: [],
          name: "WhenNotPausedOnly",
          type: "error",
        },
        {
          inputs: [],
          name: "WhenPausedOnly",
          type: "error",
        },
        {
          inputs: [],
          name: "WrongDisputeKitIndex",
          type: "error",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "contract IERC20",
              name: "_token",
              type: "address",
            },
            {
              indexed: true,
              internalType: "bool",
              name: "_accepted",
              type: "bool",
            },
          ],
          name: "AcceptedFeeToken",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "contract IArbitrableV2",
              name: "_arbitrable",
              type: "address",
            },
          ],
          name: "AppealDecision",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "contract IArbitrableV2",
              name: "_arbitrable",
              type: "address",
            },
          ],
          name: "AppealPossible",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint96",
              name: "_courtID",
              type: "uint96",
            },
            {
              indexed: true,
              internalType: "uint96",
              name: "_parent",
              type: "uint96",
            },
            {
              indexed: false,
              internalType: "bool",
              name: "_hiddenVotes",
              type: "bool",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_minStake",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_alpha",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_feeForJuror",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_jurorsForCourtJump",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256[4]",
              name: "_timesPerPeriod",
              type: "uint256[4]",
            },
            {
              indexed: false,
              internalType: "uint256[]",
              name: "_supportedDisputeKits",
              type: "uint256[]",
            },
          ],
          name: "CourtCreated",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "uint256",
              name: "_roundID",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "uint96",
              name: "_fromCourtID",
              type: "uint96",
            },
            {
              indexed: false,
              internalType: "uint96",
              name: "_toCourtID",
              type: "uint96",
            },
          ],
          name: "CourtJump",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint96",
              name: "_courtID",
              type: "uint96",
            },
            {
              indexed: false,
              internalType: "bool",
              name: "_hiddenVotes",
              type: "bool",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_minStake",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_alpha",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_feeForJuror",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_jurorsForCourtJump",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256[4]",
              name: "_timesPerPeriod",
              type: "uint256[4]",
            },
          ],
          name: "CourtModified",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "contract IArbitrableV2",
              name: "_arbitrable",
              type: "address",
            },
          ],
          name: "DisputeCreation",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "_disputeKitID",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "contract IDisputeKit",
              name: "_disputeKitAddress",
              type: "address",
            },
          ],
          name: "DisputeKitCreated",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint96",
              name: "_courtID",
              type: "uint96",
            },
            {
              indexed: true,
              internalType: "uint256",
              name: "_disputeKitID",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "bool",
              name: "_enable",
              type: "bool",
            },
          ],
          name: "DisputeKitEnabled",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "uint256",
              name: "_roundID",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "uint256",
              name: "_fromDisputeKitID",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_toDisputeKitID",
              type: "uint256",
            },
          ],
          name: "DisputeKitJump",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "_address",
              type: "address",
            },
            {
              indexed: true,
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_roundID",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_voteID",
              type: "uint256",
            },
          ],
          name: "Draw",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: false,
              internalType: "uint64",
              name: "version",
              type: "uint64",
            },
          ],
          name: "Initialized",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "uint256",
              name: "_roundID",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_pnkAmount",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_feeAmount",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "contract IERC20",
              name: "_feeToken",
              type: "address",
            },
          ],
          name: "LeftoverRewardSent",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "contract IERC20",
              name: "_feeToken",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint64",
              name: "_rateInEth",
              type: "uint64",
            },
            {
              indexed: false,
              internalType: "uint8",
              name: "_rateDecimals",
              type: "uint8",
            },
          ],
          name: "NewCurrencyRate",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "enum KlerosCoreBase.Period",
              name: "_period",
              type: "uint8",
            },
          ],
          name: "NewPeriod",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [],
          name: "Paused",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "contract IArbitrableV2",
              name: "_arbitrable",
              type: "address",
            },
            {
              indexed: true,
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_ruling",
              type: "uint256",
            },
          ],
          name: "Ruling",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "_account",
              type: "address",
            },
            {
              indexed: true,
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "uint256",
              name: "_roundID",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_degreeOfCoherency",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "int256",
              name: "_pnkAmount",
              type: "int256",
            },
            {
              indexed: false,
              internalType: "int256",
              name: "_feeAmount",
              type: "int256",
            },
            {
              indexed: false,
              internalType: "contract IERC20",
              name: "_feeToken",
              type: "address",
            },
          ],
          name: "TokenAndETHShift",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [],
          name: "Unpaused",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "newImplementation",
              type: "address",
            },
          ],
          name: "Upgraded",
          type: "event",
        },
        {
          inputs: [
            {
              internalType: "contract IDisputeKit",
              name: "_disputeKitAddress",
              type: "address",
            },
          ],
          name: "addNewDisputeKit",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_numberOfChoices",
              type: "uint256",
            },
            {
              internalType: "bytes",
              name: "_extraData",
              type: "bytes",
            },
          ],
          name: "appeal",
          outputs: [],
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
          ],
          name: "appealCost",
          outputs: [
            {
              internalType: "uint256",
              name: "cost",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
          ],
          name: "appealPeriod",
          outputs: [
            {
              internalType: "uint256",
              name: "start",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "end",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "bytes",
              name: "_extraData",
              type: "bytes",
            },
            {
              internalType: "contract IERC20",
              name: "_feeToken",
              type: "address",
            },
          ],
          name: "arbitrationCost",
          outputs: [
            {
              internalType: "uint256",
              name: "cost",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "bytes",
              name: "_extraData",
              type: "bytes",
            },
          ],
          name: "arbitrationCost",
          outputs: [
            {
              internalType: "uint256",
              name: "cost",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "contract IERC20",
              name: "_feeToken",
              type: "address",
            },
            {
              internalType: "bool",
              name: "_accepted",
              type: "bool",
            },
          ],
          name: "changeAcceptedFeeTokens",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint96",
              name: "_courtID",
              type: "uint96",
            },
            {
              internalType: "bool",
              name: "_hiddenVotes",
              type: "bool",
            },
            {
              internalType: "uint256",
              name: "_minStake",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_alpha",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_feeForJuror",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_jurorsForCourtJump",
              type: "uint256",
            },
            {
              internalType: "uint256[4]",
              name: "_timesPerPeriod",
              type: "uint256[4]",
            },
          ],
          name: "changeCourtParameters",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "contract IERC20",
              name: "_feeToken",
              type: "address",
            },
            {
              internalType: "uint64",
              name: "_rateInEth",
              type: "uint64",
            },
            {
              internalType: "uint8",
              name: "_rateDecimals",
              type: "uint8",
            },
          ],
          name: "changeCurrencyRates",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address payable",
              name: "_governor",
              type: "address",
            },
          ],
          name: "changeGovernor",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_guardian",
              type: "address",
            },
          ],
          name: "changeGuardian",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_jurorProsecutionModule",
              type: "address",
            },
          ],
          name: "changeJurorProsecutionModule",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "contract IERC20",
              name: "_pinakion",
              type: "address",
            },
          ],
          name: "changePinakion",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "contract ISortitionModule",
              name: "_sortitionModule",
              type: "address",
            },
          ],
          name: "changeSortitionModule",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "contract IERC20",
              name: "_toToken",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "_amountInEth",
              type: "uint256",
            },
          ],
          name: "convertEthToTokenAmount",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          name: "courts",
          outputs: [
            {
              internalType: "uint96",
              name: "parent",
              type: "uint96",
            },
            {
              internalType: "bool",
              name: "hiddenVotes",
              type: "bool",
            },
            {
              internalType: "uint256",
              name: "minStake",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "alpha",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "feeForJuror",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "jurorsForCourtJump",
              type: "uint256",
            },
            {
              internalType: "bool",
              name: "disabled",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint96",
              name: "_parent",
              type: "uint96",
            },
            {
              internalType: "bool",
              name: "_hiddenVotes",
              type: "bool",
            },
            {
              internalType: "uint256",
              name: "_minStake",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_alpha",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_feeForJuror",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_jurorsForCourtJump",
              type: "uint256",
            },
            {
              internalType: "uint256[4]",
              name: "_timesPerPeriod",
              type: "uint256[4]",
            },
            {
              internalType: "bytes",
              name: "_sortitionExtraData",
              type: "bytes",
            },
            {
              internalType: "uint256[]",
              name: "_supportedDisputeKits",
              type: "uint256[]",
            },
          ],
          name: "createCourt",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_numberOfChoices",
              type: "uint256",
            },
            {
              internalType: "bytes",
              name: "_extraData",
              type: "bytes",
            },
          ],
          name: "createDispute",
          outputs: [
            {
              internalType: "uint256",
              name: "disputeID",
              type: "uint256",
            },
          ],
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_numberOfChoices",
              type: "uint256",
            },
            {
              internalType: "bytes",
              name: "_extraData",
              type: "bytes",
            },
            {
              internalType: "contract IERC20",
              name: "_feeToken",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "_feeAmount",
              type: "uint256",
            },
          ],
          name: "createDispute",
          outputs: [
            {
              internalType: "uint256",
              name: "disputeID",
              type: "uint256",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "contract IERC20",
              name: "",
              type: "address",
            },
          ],
          name: "currencyRates",
          outputs: [
            {
              internalType: "bool",
              name: "feePaymentAccepted",
              type: "bool",
            },
            {
              internalType: "uint64",
              name: "rateInEth",
              type: "uint64",
            },
            {
              internalType: "uint8",
              name: "rateDecimals",
              type: "uint8",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
          ],
          name: "currentRuling",
          outputs: [
            {
              internalType: "uint256",
              name: "ruling",
              type: "uint256",
            },
            {
              internalType: "bool",
              name: "tied",
              type: "bool",
            },
            {
              internalType: "bool",
              name: "overridden",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          name: "disputeKits",
          outputs: [
            {
              internalType: "contract IDisputeKit",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          name: "disputes",
          outputs: [
            {
              internalType: "uint96",
              name: "courtID",
              type: "uint96",
            },
            {
              internalType: "contract IArbitrableV2",
              name: "arbitrated",
              type: "address",
            },
            {
              internalType: "enum KlerosCoreBase.Period",
              name: "period",
              type: "uint8",
            },
            {
              internalType: "bool",
              name: "ruled",
              type: "bool",
            },
            {
              internalType: "uint256",
              name: "lastPeriodChange",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_iterations",
              type: "uint256",
            },
          ],
          name: "draw",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint96",
              name: "_courtID",
              type: "uint96",
            },
            {
              internalType: "uint256[]",
              name: "_disputeKitIDs",
              type: "uint256[]",
            },
            {
              internalType: "bool",
              name: "_enable",
              type: "bool",
            },
          ],
          name: "enableDisputeKits",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_round",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_iterations",
              type: "uint256",
            },
          ],
          name: "execute",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_destination",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "_amount",
              type: "uint256",
            },
            {
              internalType: "bytes",
              name: "_data",
              type: "bytes",
            },
          ],
          name: "executeGovernorProposal",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
          ],
          name: "executeRuling",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "getDisputeKitsLength",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
          ],
          name: "getNumberOfRounds",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
          ],
          name: "getNumberOfVotes",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_round",
              type: "uint256",
            },
          ],
          name: "getRoundInfo",
          outputs: [
            {
              components: [
                {
                  internalType: "uint256",
                  name: "disputeKitID",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "pnkAtStakePerJuror",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "totalFeesForJurors",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "nbVotes",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "repartitions",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "pnkPenalties",
                  type: "uint256",
                },
                {
                  internalType: "address[]",
                  name: "drawnJurors",
                  type: "address[]",
                },
                {
                  internalType: "uint256",
                  name: "sumFeeRewardPaid",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "sumPnkRewardPaid",
                  type: "uint256",
                },
                {
                  internalType: "contract IERC20",
                  name: "feeToken",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "drawIterations",
                  type: "uint256",
                },
              ],
              internalType: "struct KlerosCoreBase.Round",
              name: "",
              type: "tuple",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint96",
              name: "_courtID",
              type: "uint96",
            },
          ],
          name: "getTimesPerPeriod",
          outputs: [
            {
              internalType: "uint256[4]",
              name: "timesPerPeriod",
              type: "uint256[4]",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "governor",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "guardian",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_governor",
              type: "address",
            },
            {
              internalType: "address",
              name: "_guardian",
              type: "address",
            },
            {
              internalType: "contract IERC20",
              name: "_pinakion",
              type: "address",
            },
            {
              internalType: "address",
              name: "_jurorProsecutionModule",
              type: "address",
            },
            {
              internalType: "contract IDisputeKit",
              name: "_disputeKit",
              type: "address",
            },
            {
              internalType: "bool",
              name: "_hiddenVotes",
              type: "bool",
            },
            {
              internalType: "uint256[4]",
              name: "_courtParameters",
              type: "uint256[4]",
            },
            {
              internalType: "uint256[4]",
              name: "_timesPerPeriod",
              type: "uint256[4]",
            },
            {
              internalType: "bytes",
              name: "_sortitionExtraData",
              type: "bytes",
            },
            {
              internalType: "contract ISortitionModule",
              name: "_sortitionModuleAddress",
              type: "address",
            },
          ],
          name: "initialize",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "initialize3",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
          ],
          name: "isDisputeKitJumping",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint96",
              name: "_courtID",
              type: "uint96",
            },
            {
              internalType: "uint256",
              name: "_disputeKitID",
              type: "uint256",
            },
          ],
          name: "isSupported",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "jurorProsecutionModule",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
          ],
          name: "passPeriod",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "pause",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "paused",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "pinakion",
          outputs: [
            {
              internalType: "contract IERC20",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "proxiableUUID",
          outputs: [
            {
              internalType: "bytes32",
              name: "",
              type: "bytes32",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint96",
              name: "_courtID",
              type: "uint96",
            },
            {
              internalType: "uint256",
              name: "_newStake",
              type: "uint256",
            },
          ],
          name: "setStake",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_account",
              type: "address",
            },
            {
              internalType: "uint96",
              name: "_courtID",
              type: "uint96",
            },
            {
              internalType: "uint256",
              name: "_newStake",
              type: "uint256",
            },
            {
              internalType: "bool",
              name: "_alreadyTransferred",
              type: "bool",
            },
          ],
          name: "setStakeBySortitionModule",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "sortitionModule",
          outputs: [
            {
              internalType: "contract ISortitionModule",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "unpause",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "newImplementation",
              type: "address",
            },
            {
              internalType: "bytes",
              name: "data",
              type: "bytes",
            },
          ],
          name: "upgradeToAndCall",
          outputs: [],
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [],
          name: "version",
          outputs: [
            {
              internalType: "string",
              name: "",
              type: "string",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_implementation",
              type: "address",
            },
            {
              internalType: "bytes",
              name: "_data",
              type: "bytes",
            },
          ],
          stateMutability: "nonpayable",
          type: "constructor",
        },
      ],
    },
    KlerosCoreRuler: {
      address: "0x7ffcd32A0521645E6fCFd071A68F0e26957775a5",
      abi: [
        {
          stateMutability: "payable",
          type: "fallback",
        },
        {
          stateMutability: "payable",
          type: "receive",
        },
        {
          inputs: [],
          name: "AlreadyInitialized",
          type: "error",
        },
        {
          inputs: [],
          name: "AppealFeesNotEnough",
          type: "error",
        },
        {
          inputs: [],
          name: "ArbitrationFeesNotEnough",
          type: "error",
        },
        {
          inputs: [],
          name: "DisputeNotAppealable",
          type: "error",
        },
        {
          inputs: [],
          name: "FailedDelegateCall",
          type: "error",
        },
        {
          inputs: [],
          name: "GovernorOnly",
          type: "error",
        },
        {
          inputs: [],
          name: "GovernorOrInstructorOnly",
          type: "error",
        },
        {
          inputs: [],
          name: "InvalidForkingCourtAsParent",
          type: "error",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "implementation",
              type: "address",
            },
          ],
          name: "InvalidImplementation",
          type: "error",
        },
        {
          inputs: [],
          name: "NoRulerSet",
          type: "error",
        },
        {
          inputs: [],
          name: "NotInitializing",
          type: "error",
        },
        {
          inputs: [],
          name: "RulerOnly",
          type: "error",
        },
        {
          inputs: [],
          name: "RulingAlreadyExecuted",
          type: "error",
        },
        {
          inputs: [],
          name: "RulingModeNotSet",
          type: "error",
        },
        {
          inputs: [],
          name: "TokenNotAccepted",
          type: "error",
        },
        {
          inputs: [],
          name: "TransferFailed",
          type: "error",
        },
        {
          inputs: [],
          name: "UUPSUnauthorizedCallContext",
          type: "error",
        },
        {
          inputs: [
            {
              internalType: "bytes32",
              name: "slot",
              type: "bytes32",
            },
          ],
          name: "UUPSUnsupportedProxiableUUID",
          type: "error",
        },
        {
          inputs: [],
          name: "UnsuccessfulCall",
          type: "error",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "contract IERC20",
              name: "_token",
              type: "address",
            },
            {
              indexed: true,
              internalType: "bool",
              name: "_accepted",
              type: "bool",
            },
          ],
          name: "AcceptedFeeToken",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "contract IArbitrableV2",
              name: "_arbitrable",
              type: "address",
            },
          ],
          name: "AppealDecision",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "contract IArbitrableV2",
              name: "_arbitrable",
              type: "address",
            },
          ],
          name: "AppealPossible",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "contract IArbitrableV2",
              name: "_arbitrable",
              type: "address",
            },
            {
              indexed: true,
              internalType: "enum KlerosCoreRuler.RulingMode",
              name: "mode",
              type: "uint8",
            },
            {
              indexed: true,
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_ruling",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "bool",
              name: "tied",
              type: "bool",
            },
            {
              indexed: false,
              internalType: "bool",
              name: "overridden",
              type: "bool",
            },
          ],
          name: "AutoRuled",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "_courtID",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "uint96",
              name: "_parent",
              type: "uint96",
            },
            {
              indexed: false,
              internalType: "bool",
              name: "_hiddenVotes",
              type: "bool",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_minStake",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_alpha",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_feeForJuror",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_jurorsForCourtJump",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256[4]",
              name: "_timesPerPeriod",
              type: "uint256[4]",
            },
          ],
          name: "CourtCreated",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "uint256",
              name: "_roundID",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "uint96",
              name: "_fromCourtID",
              type: "uint96",
            },
            {
              indexed: false,
              internalType: "uint96",
              name: "_toCourtID",
              type: "uint96",
            },
          ],
          name: "CourtJump",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint96",
              name: "_courtID",
              type: "uint96",
            },
            {
              indexed: false,
              internalType: "bool",
              name: "_hiddenVotes",
              type: "bool",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_minStake",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_alpha",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_feeForJuror",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_jurorsForCourtJump",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256[4]",
              name: "_timesPerPeriod",
              type: "uint256[4]",
            },
          ],
          name: "CourtModified",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "contract IArbitrableV2",
              name: "_arbitrable",
              type: "address",
            },
          ],
          name: "DisputeCreation",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: false,
              internalType: "uint64",
              name: "version",
              type: "uint64",
            },
          ],
          name: "Initialized",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "uint256",
              name: "_roundID",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_pnkAmount",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_feeAmount",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "contract IERC20",
              name: "_feeToken",
              type: "address",
            },
          ],
          name: "LeftoverRewardSent",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "contract IERC20",
              name: "_feeToken",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint64",
              name: "_rateInEth",
              type: "uint64",
            },
            {
              indexed: false,
              internalType: "uint8",
              name: "_rateDecimals",
              type: "uint8",
            },
          ],
          name: "NewCurrencyRate",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "enum KlerosCoreRuler.Period",
              name: "_period",
              type: "uint8",
            },
          ],
          name: "NewPeriod",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "contract IArbitrableV2",
              name: "_arbitrable",
              type: "address",
            },
            {
              indexed: true,
              internalType: "address",
              name: "_oldRuler",
              type: "address",
            },
            {
              indexed: true,
              internalType: "address",
              name: "_newRuler",
              type: "address",
            },
          ],
          name: "RulerChanged",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "contract IArbitrableV2",
              name: "_arbitrable",
              type: "address",
            },
            {
              components: [
                {
                  internalType: "enum KlerosCoreRuler.RulingMode",
                  name: "rulingMode",
                  type: "uint8",
                },
                {
                  internalType: "uint256",
                  name: "presetRuling",
                  type: "uint256",
                },
                {
                  internalType: "bool",
                  name: "presetTied",
                  type: "bool",
                },
                {
                  internalType: "bool",
                  name: "presetOverridden",
                  type: "bool",
                },
              ],
              indexed: false,
              internalType: "struct KlerosCoreRuler.RulerSettings",
              name: "_settings",
              type: "tuple",
            },
          ],
          name: "RulerSettingsChanged",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "contract IArbitrableV2",
              name: "_arbitrable",
              type: "address",
            },
            {
              indexed: true,
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_ruling",
              type: "uint256",
            },
          ],
          name: "Ruling",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "_account",
              type: "address",
            },
            {
              indexed: true,
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "uint256",
              name: "_roundID",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_degreeOfCoherency",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "int256",
              name: "_pnkAmount",
              type: "int256",
            },
            {
              indexed: false,
              internalType: "int256",
              name: "_feeAmount",
              type: "int256",
            },
            {
              indexed: false,
              internalType: "contract IERC20",
              name: "_feeToken",
              type: "address",
            },
          ],
          name: "TokenAndETHShift",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "newImplementation",
              type: "address",
            },
          ],
          name: "Upgraded",
          type: "event",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_numberOfChoices",
              type: "uint256",
            },
            {
              internalType: "bytes",
              name: "",
              type: "bytes",
            },
            {
              internalType: "bool",
              name: "_jump",
              type: "bool",
            },
          ],
          name: "appeal",
          outputs: [],
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
            {
              internalType: "bool",
              name: "_jump",
              type: "bool",
            },
          ],
          name: "appealCost",
          outputs: [
            {
              internalType: "uint256",
              name: "cost",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "bytes",
              name: "_extraData",
              type: "bytes",
            },
            {
              internalType: "contract IERC20",
              name: "_feeToken",
              type: "address",
            },
          ],
          name: "arbitrationCost",
          outputs: [
            {
              internalType: "uint256",
              name: "cost",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "bytes",
              name: "_extraData",
              type: "bytes",
            },
          ],
          name: "arbitrationCost",
          outputs: [
            {
              internalType: "uint256",
              name: "cost",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "contract IERC20",
              name: "_feeToken",
              type: "address",
            },
            {
              internalType: "bool",
              name: "_accepted",
              type: "bool",
            },
          ],
          name: "changeAcceptedFeeTokens",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint96",
              name: "_courtID",
              type: "uint96",
            },
            {
              internalType: "bool",
              name: "_hiddenVotes",
              type: "bool",
            },
            {
              internalType: "uint256",
              name: "_minStake",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_alpha",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_feeForJuror",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_jurorsForCourtJump",
              type: "uint256",
            },
            {
              internalType: "uint256[4]",
              name: "_timesPerPeriod",
              type: "uint256[4]",
            },
          ],
          name: "changeCourtParameters",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "contract IERC20",
              name: "_feeToken",
              type: "address",
            },
            {
              internalType: "uint64",
              name: "_rateInEth",
              type: "uint64",
            },
            {
              internalType: "uint8",
              name: "_rateDecimals",
              type: "uint8",
            },
          ],
          name: "changeCurrencyRates",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address payable",
              name: "_governor",
              type: "address",
            },
          ],
          name: "changeGovernor",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "contract IERC20",
              name: "_pinakion",
              type: "address",
            },
          ],
          name: "changePinakion",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "contract IArbitrableV2",
              name: "_arbitrable",
              type: "address",
            },
            {
              internalType: "address",
              name: "_newRuler",
              type: "address",
            },
          ],
          name: "changeRuler",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "contract IArbitrableV2",
              name: "_arbitrable",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "_presetRuling",
              type: "uint256",
            },
            {
              internalType: "bool",
              name: "_presetTied",
              type: "bool",
            },
            {
              internalType: "bool",
              name: "_presetOverridden",
              type: "bool",
            },
          ],
          name: "changeRulingModeToAutomaticPreset",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "contract IArbitrableV2",
              name: "_arbitrable",
              type: "address",
            },
          ],
          name: "changeRulingModeToAutomaticRandom",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "contract IArbitrableV2",
              name: "_arbitrable",
              type: "address",
            },
          ],
          name: "changeRulingModeToManual",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "contract IERC20",
              name: "_toToken",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "_amountInEth",
              type: "uint256",
            },
          ],
          name: "convertEthToTokenAmount",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          name: "courts",
          outputs: [
            {
              internalType: "uint96",
              name: "parent",
              type: "uint96",
            },
            {
              internalType: "bool",
              name: "hiddenVotes",
              type: "bool",
            },
            {
              internalType: "uint256",
              name: "minStake",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "alpha",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "feeForJuror",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "jurorsForCourtJump",
              type: "uint256",
            },
            {
              internalType: "bool",
              name: "disabled",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint96",
              name: "_parent",
              type: "uint96",
            },
            {
              internalType: "bool",
              name: "_hiddenVotes",
              type: "bool",
            },
            {
              internalType: "uint256",
              name: "_minStake",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_alpha",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_feeForJuror",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_jurorsForCourtJump",
              type: "uint256",
            },
            {
              internalType: "uint256[4]",
              name: "_timesPerPeriod",
              type: "uint256[4]",
            },
          ],
          name: "createCourt",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_numberOfChoices",
              type: "uint256",
            },
            {
              internalType: "bytes",
              name: "_extraData",
              type: "bytes",
            },
          ],
          name: "createDispute",
          outputs: [
            {
              internalType: "uint256",
              name: "disputeID",
              type: "uint256",
            },
          ],
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_numberOfChoices",
              type: "uint256",
            },
            {
              internalType: "bytes",
              name: "_extraData",
              type: "bytes",
            },
            {
              internalType: "contract IERC20",
              name: "_feeToken",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "_feeAmount",
              type: "uint256",
            },
          ],
          name: "createDispute",
          outputs: [
            {
              internalType: "uint256",
              name: "disputeID",
              type: "uint256",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "contract IERC20",
              name: "",
              type: "address",
            },
          ],
          name: "currencyRates",
          outputs: [
            {
              internalType: "bool",
              name: "feePaymentAccepted",
              type: "bool",
            },
            {
              internalType: "uint64",
              name: "rateInEth",
              type: "uint64",
            },
            {
              internalType: "uint8",
              name: "rateDecimals",
              type: "uint8",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
          ],
          name: "currentRuling",
          outputs: [
            {
              internalType: "uint256",
              name: "ruling",
              type: "uint256",
            },
            {
              internalType: "bool",
              name: "tied",
              type: "bool",
            },
            {
              internalType: "bool",
              name: "overridden",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          name: "disputes",
          outputs: [
            {
              internalType: "uint96",
              name: "courtID",
              type: "uint96",
            },
            {
              internalType: "contract IArbitrableV2",
              name: "arbitrated",
              type: "address",
            },
            {
              internalType: "enum KlerosCoreRuler.Period",
              name: "period",
              type: "uint8",
            },
            {
              internalType: "bool",
              name: "ruled",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_round",
              type: "uint256",
            },
          ],
          name: "execute",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_destination",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "_amount",
              type: "uint256",
            },
            {
              internalType: "bytes",
              name: "_data",
              type: "bytes",
            },
          ],
          name: "executeGovernorProposal",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_ruling",
              type: "uint256",
            },
            {
              internalType: "bool",
              name: "tied",
              type: "bool",
            },
            {
              internalType: "bool",
              name: "overridden",
              type: "bool",
            },
          ],
          name: "executeRuling",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "getNextDisputeID",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
          ],
          name: "getNumberOfRounds",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
          ],
          name: "getNumberOfVotes",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_round",
              type: "uint256",
            },
          ],
          name: "getRoundInfo",
          outputs: [
            {
              components: [
                {
                  internalType: "uint256",
                  name: "totalFeesForJurors",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "sumFeeRewardPaid",
                  type: "uint256",
                },
                {
                  internalType: "contract IERC20",
                  name: "feeToken",
                  type: "address",
                },
              ],
              internalType: "struct KlerosCoreRuler.Round",
              name: "",
              type: "tuple",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint96",
              name: "_courtID",
              type: "uint96",
            },
          ],
          name: "getTimesPerPeriod",
          outputs: [
            {
              internalType: "uint256[4]",
              name: "timesPerPeriod",
              type: "uint256[4]",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "governor",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_governor",
              type: "address",
            },
            {
              internalType: "contract IERC20",
              name: "_pinakion",
              type: "address",
            },
            {
              internalType: "uint256[4]",
              name: "_courtParameters",
              type: "uint256[4]",
            },
          ],
          name: "initialize",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "pinakion",
          outputs: [
            {
              internalType: "contract IERC20",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "proxiableUUID",
          outputs: [
            {
              internalType: "bytes32",
              name: "",
              type: "bytes32",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "contract IArbitrableV2",
              name: "arbitrable",
              type: "address",
            },
          ],
          name: "rulers",
          outputs: [
            {
              internalType: "address",
              name: "ruler",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "disputeID",
              type: "uint256",
            },
          ],
          name: "rulingResults",
          outputs: [
            {
              internalType: "uint256",
              name: "ruling",
              type: "uint256",
            },
            {
              internalType: "bool",
              name: "tied",
              type: "bool",
            },
            {
              internalType: "bool",
              name: "overridden",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "contract IArbitrableV2",
              name: "arbitrable",
              type: "address",
            },
          ],
          name: "settings",
          outputs: [
            {
              internalType: "enum KlerosCoreRuler.RulingMode",
              name: "rulingMode",
              type: "uint8",
            },
            {
              internalType: "uint256",
              name: "presetRuling",
              type: "uint256",
            },
            {
              internalType: "bool",
              name: "presetTied",
              type: "bool",
            },
            {
              internalType: "bool",
              name: "presetOverridden",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "newImplementation",
              type: "address",
            },
            {
              internalType: "bytes",
              name: "data",
              type: "bytes",
            },
          ],
          name: "upgradeToAndCall",
          outputs: [],
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_implementation",
              type: "address",
            },
            {
              internalType: "bytes",
              name: "_data",
              type: "bytes",
            },
          ],
          stateMutability: "nonpayable",
          type: "constructor",
        },
      ],
    },
    KlerosCoreRuler_Implementation: {
      address: "0x97e30A3A940856A3913437912C746f1aF6ccC76c",
      abi: [
        {
          inputs: [],
          stateMutability: "nonpayable",
          type: "constructor",
        },
        {
          inputs: [],
          name: "AlreadyInitialized",
          type: "error",
        },
        {
          inputs: [],
          name: "AppealFeesNotEnough",
          type: "error",
        },
        {
          inputs: [],
          name: "ArbitrationFeesNotEnough",
          type: "error",
        },
        {
          inputs: [],
          name: "DisputeNotAppealable",
          type: "error",
        },
        {
          inputs: [],
          name: "FailedDelegateCall",
          type: "error",
        },
        {
          inputs: [],
          name: "GovernorOnly",
          type: "error",
        },
        {
          inputs: [],
          name: "GovernorOrInstructorOnly",
          type: "error",
        },
        {
          inputs: [],
          name: "InvalidForkingCourtAsParent",
          type: "error",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "implementation",
              type: "address",
            },
          ],
          name: "InvalidImplementation",
          type: "error",
        },
        {
          inputs: [],
          name: "NoRulerSet",
          type: "error",
        },
        {
          inputs: [],
          name: "NotInitializing",
          type: "error",
        },
        {
          inputs: [],
          name: "RulerOnly",
          type: "error",
        },
        {
          inputs: [],
          name: "RulingAlreadyExecuted",
          type: "error",
        },
        {
          inputs: [],
          name: "RulingModeNotSet",
          type: "error",
        },
        {
          inputs: [],
          name: "TokenNotAccepted",
          type: "error",
        },
        {
          inputs: [],
          name: "TransferFailed",
          type: "error",
        },
        {
          inputs: [],
          name: "UUPSUnauthorizedCallContext",
          type: "error",
        },
        {
          inputs: [
            {
              internalType: "bytes32",
              name: "slot",
              type: "bytes32",
            },
          ],
          name: "UUPSUnsupportedProxiableUUID",
          type: "error",
        },
        {
          inputs: [],
          name: "UnsuccessfulCall",
          type: "error",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "contract IERC20",
              name: "_token",
              type: "address",
            },
            {
              indexed: true,
              internalType: "bool",
              name: "_accepted",
              type: "bool",
            },
          ],
          name: "AcceptedFeeToken",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "contract IArbitrableV2",
              name: "_arbitrable",
              type: "address",
            },
          ],
          name: "AppealDecision",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "contract IArbitrableV2",
              name: "_arbitrable",
              type: "address",
            },
          ],
          name: "AppealPossible",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "contract IArbitrableV2",
              name: "_arbitrable",
              type: "address",
            },
            {
              indexed: true,
              internalType: "enum KlerosCoreRuler.RulingMode",
              name: "mode",
              type: "uint8",
            },
            {
              indexed: true,
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_ruling",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "bool",
              name: "tied",
              type: "bool",
            },
            {
              indexed: false,
              internalType: "bool",
              name: "overridden",
              type: "bool",
            },
          ],
          name: "AutoRuled",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "_courtID",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "uint96",
              name: "_parent",
              type: "uint96",
            },
            {
              indexed: false,
              internalType: "bool",
              name: "_hiddenVotes",
              type: "bool",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_minStake",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_alpha",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_feeForJuror",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_jurorsForCourtJump",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256[4]",
              name: "_timesPerPeriod",
              type: "uint256[4]",
            },
          ],
          name: "CourtCreated",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "uint256",
              name: "_roundID",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "uint96",
              name: "_fromCourtID",
              type: "uint96",
            },
            {
              indexed: false,
              internalType: "uint96",
              name: "_toCourtID",
              type: "uint96",
            },
          ],
          name: "CourtJump",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint96",
              name: "_courtID",
              type: "uint96",
            },
            {
              indexed: false,
              internalType: "bool",
              name: "_hiddenVotes",
              type: "bool",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_minStake",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_alpha",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_feeForJuror",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_jurorsForCourtJump",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256[4]",
              name: "_timesPerPeriod",
              type: "uint256[4]",
            },
          ],
          name: "CourtModified",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "contract IArbitrableV2",
              name: "_arbitrable",
              type: "address",
            },
          ],
          name: "DisputeCreation",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: false,
              internalType: "uint64",
              name: "version",
              type: "uint64",
            },
          ],
          name: "Initialized",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "uint256",
              name: "_roundID",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_pnkAmount",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_feeAmount",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "contract IERC20",
              name: "_feeToken",
              type: "address",
            },
          ],
          name: "LeftoverRewardSent",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "contract IERC20",
              name: "_feeToken",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint64",
              name: "_rateInEth",
              type: "uint64",
            },
            {
              indexed: false,
              internalType: "uint8",
              name: "_rateDecimals",
              type: "uint8",
            },
          ],
          name: "NewCurrencyRate",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "enum KlerosCoreRuler.Period",
              name: "_period",
              type: "uint8",
            },
          ],
          name: "NewPeriod",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "contract IArbitrableV2",
              name: "_arbitrable",
              type: "address",
            },
            {
              indexed: true,
              internalType: "address",
              name: "_oldRuler",
              type: "address",
            },
            {
              indexed: true,
              internalType: "address",
              name: "_newRuler",
              type: "address",
            },
          ],
          name: "RulerChanged",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "contract IArbitrableV2",
              name: "_arbitrable",
              type: "address",
            },
            {
              components: [
                {
                  internalType: "enum KlerosCoreRuler.RulingMode",
                  name: "rulingMode",
                  type: "uint8",
                },
                {
                  internalType: "uint256",
                  name: "presetRuling",
                  type: "uint256",
                },
                {
                  internalType: "bool",
                  name: "presetTied",
                  type: "bool",
                },
                {
                  internalType: "bool",
                  name: "presetOverridden",
                  type: "bool",
                },
              ],
              indexed: false,
              internalType: "struct KlerosCoreRuler.RulerSettings",
              name: "_settings",
              type: "tuple",
            },
          ],
          name: "RulerSettingsChanged",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "contract IArbitrableV2",
              name: "_arbitrable",
              type: "address",
            },
            {
              indexed: true,
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_ruling",
              type: "uint256",
            },
          ],
          name: "Ruling",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "_account",
              type: "address",
            },
            {
              indexed: true,
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "uint256",
              name: "_roundID",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_degreeOfCoherency",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "int256",
              name: "_pnkAmount",
              type: "int256",
            },
            {
              indexed: false,
              internalType: "int256",
              name: "_feeAmount",
              type: "int256",
            },
            {
              indexed: false,
              internalType: "contract IERC20",
              name: "_feeToken",
              type: "address",
            },
          ],
          name: "TokenAndETHShift",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "newImplementation",
              type: "address",
            },
          ],
          name: "Upgraded",
          type: "event",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_numberOfChoices",
              type: "uint256",
            },
            {
              internalType: "bytes",
              name: "",
              type: "bytes",
            },
            {
              internalType: "bool",
              name: "_jump",
              type: "bool",
            },
          ],
          name: "appeal",
          outputs: [],
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
            {
              internalType: "bool",
              name: "_jump",
              type: "bool",
            },
          ],
          name: "appealCost",
          outputs: [
            {
              internalType: "uint256",
              name: "cost",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "bytes",
              name: "_extraData",
              type: "bytes",
            },
            {
              internalType: "contract IERC20",
              name: "_feeToken",
              type: "address",
            },
          ],
          name: "arbitrationCost",
          outputs: [
            {
              internalType: "uint256",
              name: "cost",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "bytes",
              name: "_extraData",
              type: "bytes",
            },
          ],
          name: "arbitrationCost",
          outputs: [
            {
              internalType: "uint256",
              name: "cost",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "contract IERC20",
              name: "_feeToken",
              type: "address",
            },
            {
              internalType: "bool",
              name: "_accepted",
              type: "bool",
            },
          ],
          name: "changeAcceptedFeeTokens",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint96",
              name: "_courtID",
              type: "uint96",
            },
            {
              internalType: "bool",
              name: "_hiddenVotes",
              type: "bool",
            },
            {
              internalType: "uint256",
              name: "_minStake",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_alpha",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_feeForJuror",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_jurorsForCourtJump",
              type: "uint256",
            },
            {
              internalType: "uint256[4]",
              name: "_timesPerPeriod",
              type: "uint256[4]",
            },
          ],
          name: "changeCourtParameters",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "contract IERC20",
              name: "_feeToken",
              type: "address",
            },
            {
              internalType: "uint64",
              name: "_rateInEth",
              type: "uint64",
            },
            {
              internalType: "uint8",
              name: "_rateDecimals",
              type: "uint8",
            },
          ],
          name: "changeCurrencyRates",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address payable",
              name: "_governor",
              type: "address",
            },
          ],
          name: "changeGovernor",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "contract IERC20",
              name: "_pinakion",
              type: "address",
            },
          ],
          name: "changePinakion",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "contract IArbitrableV2",
              name: "_arbitrable",
              type: "address",
            },
            {
              internalType: "address",
              name: "_newRuler",
              type: "address",
            },
          ],
          name: "changeRuler",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "contract IArbitrableV2",
              name: "_arbitrable",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "_presetRuling",
              type: "uint256",
            },
            {
              internalType: "bool",
              name: "_presetTied",
              type: "bool",
            },
            {
              internalType: "bool",
              name: "_presetOverridden",
              type: "bool",
            },
          ],
          name: "changeRulingModeToAutomaticPreset",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "contract IArbitrableV2",
              name: "_arbitrable",
              type: "address",
            },
          ],
          name: "changeRulingModeToAutomaticRandom",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "contract IArbitrableV2",
              name: "_arbitrable",
              type: "address",
            },
          ],
          name: "changeRulingModeToManual",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "contract IERC20",
              name: "_toToken",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "_amountInEth",
              type: "uint256",
            },
          ],
          name: "convertEthToTokenAmount",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          name: "courts",
          outputs: [
            {
              internalType: "uint96",
              name: "parent",
              type: "uint96",
            },
            {
              internalType: "bool",
              name: "hiddenVotes",
              type: "bool",
            },
            {
              internalType: "uint256",
              name: "minStake",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "alpha",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "feeForJuror",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "jurorsForCourtJump",
              type: "uint256",
            },
            {
              internalType: "bool",
              name: "disabled",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint96",
              name: "_parent",
              type: "uint96",
            },
            {
              internalType: "bool",
              name: "_hiddenVotes",
              type: "bool",
            },
            {
              internalType: "uint256",
              name: "_minStake",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_alpha",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_feeForJuror",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_jurorsForCourtJump",
              type: "uint256",
            },
            {
              internalType: "uint256[4]",
              name: "_timesPerPeriod",
              type: "uint256[4]",
            },
          ],
          name: "createCourt",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_numberOfChoices",
              type: "uint256",
            },
            {
              internalType: "bytes",
              name: "_extraData",
              type: "bytes",
            },
          ],
          name: "createDispute",
          outputs: [
            {
              internalType: "uint256",
              name: "disputeID",
              type: "uint256",
            },
          ],
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_numberOfChoices",
              type: "uint256",
            },
            {
              internalType: "bytes",
              name: "_extraData",
              type: "bytes",
            },
            {
              internalType: "contract IERC20",
              name: "_feeToken",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "_feeAmount",
              type: "uint256",
            },
          ],
          name: "createDispute",
          outputs: [
            {
              internalType: "uint256",
              name: "disputeID",
              type: "uint256",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "contract IERC20",
              name: "",
              type: "address",
            },
          ],
          name: "currencyRates",
          outputs: [
            {
              internalType: "bool",
              name: "feePaymentAccepted",
              type: "bool",
            },
            {
              internalType: "uint64",
              name: "rateInEth",
              type: "uint64",
            },
            {
              internalType: "uint8",
              name: "rateDecimals",
              type: "uint8",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
          ],
          name: "currentRuling",
          outputs: [
            {
              internalType: "uint256",
              name: "ruling",
              type: "uint256",
            },
            {
              internalType: "bool",
              name: "tied",
              type: "bool",
            },
            {
              internalType: "bool",
              name: "overridden",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          name: "disputes",
          outputs: [
            {
              internalType: "uint96",
              name: "courtID",
              type: "uint96",
            },
            {
              internalType: "contract IArbitrableV2",
              name: "arbitrated",
              type: "address",
            },
            {
              internalType: "enum KlerosCoreRuler.Period",
              name: "period",
              type: "uint8",
            },
            {
              internalType: "bool",
              name: "ruled",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_round",
              type: "uint256",
            },
          ],
          name: "execute",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_destination",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "_amount",
              type: "uint256",
            },
            {
              internalType: "bytes",
              name: "_data",
              type: "bytes",
            },
          ],
          name: "executeGovernorProposal",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_ruling",
              type: "uint256",
            },
            {
              internalType: "bool",
              name: "tied",
              type: "bool",
            },
            {
              internalType: "bool",
              name: "overridden",
              type: "bool",
            },
          ],
          name: "executeRuling",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "getNextDisputeID",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
          ],
          name: "getNumberOfRounds",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
          ],
          name: "getNumberOfVotes",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_round",
              type: "uint256",
            },
          ],
          name: "getRoundInfo",
          outputs: [
            {
              components: [
                {
                  internalType: "uint256",
                  name: "totalFeesForJurors",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "sumFeeRewardPaid",
                  type: "uint256",
                },
                {
                  internalType: "contract IERC20",
                  name: "feeToken",
                  type: "address",
                },
              ],
              internalType: "struct KlerosCoreRuler.Round",
              name: "",
              type: "tuple",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint96",
              name: "_courtID",
              type: "uint96",
            },
          ],
          name: "getTimesPerPeriod",
          outputs: [
            {
              internalType: "uint256[4]",
              name: "timesPerPeriod",
              type: "uint256[4]",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "governor",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_governor",
              type: "address",
            },
            {
              internalType: "contract IERC20",
              name: "_pinakion",
              type: "address",
            },
            {
              internalType: "uint256[4]",
              name: "_courtParameters",
              type: "uint256[4]",
            },
          ],
          name: "initialize",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "pinakion",
          outputs: [
            {
              internalType: "contract IERC20",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "proxiableUUID",
          outputs: [
            {
              internalType: "bytes32",
              name: "",
              type: "bytes32",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "contract IArbitrableV2",
              name: "arbitrable",
              type: "address",
            },
          ],
          name: "rulers",
          outputs: [
            {
              internalType: "address",
              name: "ruler",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "disputeID",
              type: "uint256",
            },
          ],
          name: "rulingResults",
          outputs: [
            {
              internalType: "uint256",
              name: "ruling",
              type: "uint256",
            },
            {
              internalType: "bool",
              name: "tied",
              type: "bool",
            },
            {
              internalType: "bool",
              name: "overridden",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "contract IArbitrableV2",
              name: "arbitrable",
              type: "address",
            },
          ],
          name: "settings",
          outputs: [
            {
              internalType: "enum KlerosCoreRuler.RulingMode",
              name: "rulingMode",
              type: "uint8",
            },
            {
              internalType: "uint256",
              name: "presetRuling",
              type: "uint256",
            },
            {
              internalType: "bool",
              name: "presetTied",
              type: "bool",
            },
            {
              internalType: "bool",
              name: "presetOverridden",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "newImplementation",
              type: "address",
            },
            {
              internalType: "bytes",
              name: "data",
              type: "bytes",
            },
          ],
          name: "upgradeToAndCall",
          outputs: [],
          stateMutability: "payable",
          type: "function",
        },
      ],
    },
    KlerosCoreRuler_Proxy: {
      address: "0x7ffcd32A0521645E6fCFd071A68F0e26957775a5",
      abi: [
        {
          inputs: [
            {
              internalType: "address",
              name: "_implementation",
              type: "address",
            },
            {
              internalType: "bytes",
              name: "_data",
              type: "bytes",
            },
          ],
          stateMutability: "nonpayable",
          type: "constructor",
        },
        {
          stateMutability: "payable",
          type: "fallback",
        },
        {
          stateMutability: "payable",
          type: "receive",
        },
      ],
    },
    KlerosCoreSnapshotProxy: {
      address: "0xa2425b724B32D40cbB85ea6e181cfb023CE9c014",
      abi: [
        {
          inputs: [
            {
              internalType: "address",
              name: "_governor",
              type: "address",
            },
            {
              internalType: "contract IKlerosCore",
              name: "_core",
              type: "address",
            },
          ],
          stateMutability: "nonpayable",
          type: "constructor",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_account",
              type: "address",
            },
          ],
          name: "balanceOf",
          outputs: [
            {
              internalType: "uint256",
              name: "totalStaked",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "contract IKlerosCore",
              name: "_core",
              type: "address",
            },
          ],
          name: "changeCore",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_governor",
              type: "address",
            },
          ],
          name: "changeGovernor",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "core",
          outputs: [
            {
              internalType: "contract IKlerosCore",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "decimals",
          outputs: [
            {
              internalType: "uint8",
              name: "",
              type: "uint8",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "governor",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "name",
          outputs: [
            {
              internalType: "string",
              name: "",
              type: "string",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "symbol",
          outputs: [
            {
              internalType: "string",
              name: "",
              type: "string",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
      ],
    },
    KlerosCoreUniversity: {
      address: "0x5AB37F38778Bc175852fA353056591D91c744ce6",
      abi: [
        {
          stateMutability: "payable",
          type: "fallback",
        },
        {
          stateMutability: "payable",
          type: "receive",
        },
        {
          inputs: [],
          name: "AllJurorsDrawn",
          type: "error",
        },
        {
          inputs: [],
          name: "AlreadyInitialized",
          type: "error",
        },
        {
          inputs: [],
          name: "AppealFeesNotEnough",
          type: "error",
        },
        {
          inputs: [],
          name: "AppealPeriodNotPassed",
          type: "error",
        },
        {
          inputs: [],
          name: "ArbitrationFeesNotEnough",
          type: "error",
        },
        {
          inputs: [],
          name: "ArraysLengthMismatch",
          type: "error",
        },
        {
          inputs: [],
          name: "CannotDisableClassicDK",
          type: "error",
        },
        {
          inputs: [],
          name: "CommitPeriodNotPassed",
          type: "error",
        },
        {
          inputs: [],
          name: "DepthLevelMax",
          type: "error",
        },
        {
          inputs: [],
          name: "DisputeKitNotSupportedByCourt",
          type: "error",
        },
        {
          inputs: [],
          name: "DisputeKitOnly",
          type: "error",
        },
        {
          inputs: [],
          name: "DisputeNotAppealable",
          type: "error",
        },
        {
          inputs: [],
          name: "DisputePeriodIsFinal",
          type: "error",
        },
        {
          inputs: [],
          name: "DisputeStillDrawing",
          type: "error",
        },
        {
          inputs: [],
          name: "EvidenceNotPassedAndNotAppeal",
          type: "error",
        },
        {
          inputs: [],
          name: "FailedDelegateCall",
          type: "error",
        },
        {
          inputs: [],
          name: "GovernorOnly",
          type: "error",
        },
        {
          inputs: [],
          name: "GovernorOrInstructorOnly",
          type: "error",
        },
        {
          inputs: [],
          name: "InstructorOnly",
          type: "error",
        },
        {
          inputs: [],
          name: "InvalidDisputKitParent",
          type: "error",
        },
        {
          inputs: [],
          name: "InvalidForkingCourtAsParent",
          type: "error",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "implementation",
              type: "address",
            },
          ],
          name: "InvalidImplementation",
          type: "error",
        },
        {
          inputs: [],
          name: "MinStakeLowerThanParentCourt",
          type: "error",
        },
        {
          inputs: [],
          name: "MustSupportDisputeKitClassic",
          type: "error",
        },
        {
          inputs: [],
          name: "NoJurorDrawn",
          type: "error",
        },
        {
          inputs: [],
          name: "NotEvidencePeriod",
          type: "error",
        },
        {
          inputs: [],
          name: "NotExecutionPeriod",
          type: "error",
        },
        {
          inputs: [],
          name: "NotInitializing",
          type: "error",
        },
        {
          inputs: [],
          name: "RulingAlreadyExecuted",
          type: "error",
        },
        {
          inputs: [],
          name: "SortitionModuleOnly",
          type: "error",
        },
        {
          inputs: [],
          name: "StakingInTooManyCourts",
          type: "error",
        },
        {
          inputs: [],
          name: "StakingLessThanCourtMinStake",
          type: "error",
        },
        {
          inputs: [],
          name: "StakingNotPossibeInThisCourt",
          type: "error",
        },
        {
          inputs: [],
          name: "StakingTransferFailed",
          type: "error",
        },
        {
          inputs: [],
          name: "TokenNotAccepted",
          type: "error",
        },
        {
          inputs: [],
          name: "TransferFailed",
          type: "error",
        },
        {
          inputs: [],
          name: "UUPSUnauthorizedCallContext",
          type: "error",
        },
        {
          inputs: [
            {
              internalType: "bytes32",
              name: "slot",
              type: "bytes32",
            },
          ],
          name: "UUPSUnsupportedProxiableUUID",
          type: "error",
        },
        {
          inputs: [],
          name: "UnstakingTransferFailed",
          type: "error",
        },
        {
          inputs: [],
          name: "UnsuccessfulCall",
          type: "error",
        },
        {
          inputs: [],
          name: "UnsupportedDisputeKit",
          type: "error",
        },
        {
          inputs: [],
          name: "VotePeriodNotPassed",
          type: "error",
        },
        {
          inputs: [],
          name: "WrongDisputeKitIndex",
          type: "error",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "contract IERC20",
              name: "_token",
              type: "address",
            },
            {
              indexed: true,
              internalType: "bool",
              name: "_accepted",
              type: "bool",
            },
          ],
          name: "AcceptedFeeToken",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "contract IArbitrableV2",
              name: "_arbitrable",
              type: "address",
            },
          ],
          name: "AppealDecision",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "contract IArbitrableV2",
              name: "_arbitrable",
              type: "address",
            },
          ],
          name: "AppealPossible",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "_courtID",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "uint96",
              name: "_parent",
              type: "uint96",
            },
            {
              indexed: false,
              internalType: "bool",
              name: "_hiddenVotes",
              type: "bool",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_minStake",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_alpha",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_feeForJuror",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_jurorsForCourtJump",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256[4]",
              name: "_timesPerPeriod",
              type: "uint256[4]",
            },
            {
              indexed: false,
              internalType: "uint256[]",
              name: "_supportedDisputeKits",
              type: "uint256[]",
            },
          ],
          name: "CourtCreated",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "uint256",
              name: "_roundID",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "uint96",
              name: "_fromCourtID",
              type: "uint96",
            },
            {
              indexed: false,
              internalType: "uint96",
              name: "_toCourtID",
              type: "uint96",
            },
          ],
          name: "CourtJump",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint96",
              name: "_courtID",
              type: "uint96",
            },
            {
              indexed: false,
              internalType: "bool",
              name: "_hiddenVotes",
              type: "bool",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_minStake",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_alpha",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_feeForJuror",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_jurorsForCourtJump",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256[4]",
              name: "_timesPerPeriod",
              type: "uint256[4]",
            },
          ],
          name: "CourtModified",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "contract IArbitrableV2",
              name: "_arbitrable",
              type: "address",
            },
          ],
          name: "DisputeCreation",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "_disputeKitID",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "contract IDisputeKit",
              name: "_disputeKitAddress",
              type: "address",
            },
          ],
          name: "DisputeKitCreated",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint96",
              name: "_courtID",
              type: "uint96",
            },
            {
              indexed: true,
              internalType: "uint256",
              name: "_disputeKitID",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "bool",
              name: "_enable",
              type: "bool",
            },
          ],
          name: "DisputeKitEnabled",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "uint256",
              name: "_roundID",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "uint256",
              name: "_fromDisputeKitID",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_toDisputeKitID",
              type: "uint256",
            },
          ],
          name: "DisputeKitJump",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "_address",
              type: "address",
            },
            {
              indexed: true,
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_roundID",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_voteID",
              type: "uint256",
            },
          ],
          name: "Draw",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: false,
              internalType: "uint64",
              name: "version",
              type: "uint64",
            },
          ],
          name: "Initialized",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "uint256",
              name: "_roundID",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_pnkAmount",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_feeAmount",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "contract IERC20",
              name: "_feeToken",
              type: "address",
            },
          ],
          name: "LeftoverRewardSent",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "contract IERC20",
              name: "_feeToken",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint64",
              name: "_rateInEth",
              type: "uint64",
            },
            {
              indexed: false,
              internalType: "uint8",
              name: "_rateDecimals",
              type: "uint8",
            },
          ],
          name: "NewCurrencyRate",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "enum KlerosCoreUniversity.Period",
              name: "_period",
              type: "uint8",
            },
          ],
          name: "NewPeriod",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "contract IArbitrableV2",
              name: "_arbitrable",
              type: "address",
            },
            {
              indexed: true,
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_ruling",
              type: "uint256",
            },
          ],
          name: "Ruling",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "_account",
              type: "address",
            },
            {
              indexed: true,
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "uint256",
              name: "_roundID",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_degreeOfCoherency",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "int256",
              name: "_pnkAmount",
              type: "int256",
            },
            {
              indexed: false,
              internalType: "int256",
              name: "_feeAmount",
              type: "int256",
            },
            {
              indexed: false,
              internalType: "contract IERC20",
              name: "_feeToken",
              type: "address",
            },
          ],
          name: "TokenAndETHShift",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "newImplementation",
              type: "address",
            },
          ],
          name: "Upgraded",
          type: "event",
        },
        {
          inputs: [
            {
              internalType: "contract IDisputeKit",
              name: "_disputeKitAddress",
              type: "address",
            },
          ],
          name: "addNewDisputeKit",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_numberOfChoices",
              type: "uint256",
            },
            {
              internalType: "bytes",
              name: "_extraData",
              type: "bytes",
            },
          ],
          name: "appeal",
          outputs: [],
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
          ],
          name: "appealCost",
          outputs: [
            {
              internalType: "uint256",
              name: "cost",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
          ],
          name: "appealPeriod",
          outputs: [
            {
              internalType: "uint256",
              name: "start",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "end",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "bytes",
              name: "_extraData",
              type: "bytes",
            },
            {
              internalType: "contract IERC20",
              name: "_feeToken",
              type: "address",
            },
          ],
          name: "arbitrationCost",
          outputs: [
            {
              internalType: "uint256",
              name: "cost",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "bytes",
              name: "_extraData",
              type: "bytes",
            },
          ],
          name: "arbitrationCost",
          outputs: [
            {
              internalType: "uint256",
              name: "cost",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "contract IERC20",
              name: "_feeToken",
              type: "address",
            },
            {
              internalType: "bool",
              name: "_accepted",
              type: "bool",
            },
          ],
          name: "changeAcceptedFeeTokens",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint96",
              name: "_courtID",
              type: "uint96",
            },
            {
              internalType: "bool",
              name: "_hiddenVotes",
              type: "bool",
            },
            {
              internalType: "uint256",
              name: "_minStake",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_alpha",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_feeForJuror",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_jurorsForCourtJump",
              type: "uint256",
            },
            {
              internalType: "uint256[4]",
              name: "_timesPerPeriod",
              type: "uint256[4]",
            },
          ],
          name: "changeCourtParameters",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "contract IERC20",
              name: "_feeToken",
              type: "address",
            },
            {
              internalType: "uint64",
              name: "_rateInEth",
              type: "uint64",
            },
            {
              internalType: "uint8",
              name: "_rateDecimals",
              type: "uint8",
            },
          ],
          name: "changeCurrencyRates",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address payable",
              name: "_governor",
              type: "address",
            },
          ],
          name: "changeGovernor",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_instructor",
              type: "address",
            },
          ],
          name: "changeInstructor",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_jurorProsecutionModule",
              type: "address",
            },
          ],
          name: "changeJurorProsecutionModule",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "contract IERC20",
              name: "_pinakion",
              type: "address",
            },
          ],
          name: "changePinakion",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "contract ISortitionModuleUniversity",
              name: "_sortitionModule",
              type: "address",
            },
          ],
          name: "changeSortitionModule",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "contract IERC20",
              name: "_toToken",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "_amountInEth",
              type: "uint256",
            },
          ],
          name: "convertEthToTokenAmount",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          name: "courts",
          outputs: [
            {
              internalType: "uint96",
              name: "parent",
              type: "uint96",
            },
            {
              internalType: "bool",
              name: "hiddenVotes",
              type: "bool",
            },
            {
              internalType: "uint256",
              name: "minStake",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "alpha",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "feeForJuror",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "jurorsForCourtJump",
              type: "uint256",
            },
            {
              internalType: "bool",
              name: "disabled",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint96",
              name: "_parent",
              type: "uint96",
            },
            {
              internalType: "bool",
              name: "_hiddenVotes",
              type: "bool",
            },
            {
              internalType: "uint256",
              name: "_minStake",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_alpha",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_feeForJuror",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_jurorsForCourtJump",
              type: "uint256",
            },
            {
              internalType: "uint256[4]",
              name: "_timesPerPeriod",
              type: "uint256[4]",
            },
            {
              internalType: "uint256[]",
              name: "_supportedDisputeKits",
              type: "uint256[]",
            },
          ],
          name: "createCourt",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_numberOfChoices",
              type: "uint256",
            },
            {
              internalType: "bytes",
              name: "_extraData",
              type: "bytes",
            },
          ],
          name: "createDispute",
          outputs: [
            {
              internalType: "uint256",
              name: "disputeID",
              type: "uint256",
            },
          ],
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_numberOfChoices",
              type: "uint256",
            },
            {
              internalType: "bytes",
              name: "_extraData",
              type: "bytes",
            },
            {
              internalType: "contract IERC20",
              name: "_feeToken",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "_feeAmount",
              type: "uint256",
            },
          ],
          name: "createDispute",
          outputs: [
            {
              internalType: "uint256",
              name: "disputeID",
              type: "uint256",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "contract IERC20",
              name: "",
              type: "address",
            },
          ],
          name: "currencyRates",
          outputs: [
            {
              internalType: "bool",
              name: "feePaymentAccepted",
              type: "bool",
            },
            {
              internalType: "uint64",
              name: "rateInEth",
              type: "uint64",
            },
            {
              internalType: "uint8",
              name: "rateDecimals",
              type: "uint8",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
          ],
          name: "currentRuling",
          outputs: [
            {
              internalType: "uint256",
              name: "ruling",
              type: "uint256",
            },
            {
              internalType: "bool",
              name: "tied",
              type: "bool",
            },
            {
              internalType: "bool",
              name: "overridden",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          name: "disputeKits",
          outputs: [
            {
              internalType: "contract IDisputeKit",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          name: "disputes",
          outputs: [
            {
              internalType: "uint96",
              name: "courtID",
              type: "uint96",
            },
            {
              internalType: "contract IArbitrableV2",
              name: "arbitrated",
              type: "address",
            },
            {
              internalType: "enum KlerosCoreUniversity.Period",
              name: "period",
              type: "uint8",
            },
            {
              internalType: "bool",
              name: "ruled",
              type: "bool",
            },
            {
              internalType: "uint256",
              name: "lastPeriodChange",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
            {
              internalType: "address",
              name: "_juror",
              type: "address",
            },
          ],
          name: "draw",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint96",
              name: "_courtID",
              type: "uint96",
            },
            {
              internalType: "uint256[]",
              name: "_disputeKitIDs",
              type: "uint256[]",
            },
            {
              internalType: "bool",
              name: "_enable",
              type: "bool",
            },
          ],
          name: "enableDisputeKits",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_round",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_iterations",
              type: "uint256",
            },
          ],
          name: "execute",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_destination",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "_amount",
              type: "uint256",
            },
            {
              internalType: "bytes",
              name: "_data",
              type: "bytes",
            },
          ],
          name: "executeGovernorProposal",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
          ],
          name: "executeRuling",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "getDisputeKitsLength",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
          ],
          name: "getNumberOfRounds",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
          ],
          name: "getNumberOfVotes",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_round",
              type: "uint256",
            },
          ],
          name: "getRoundInfo",
          outputs: [
            {
              components: [
                {
                  internalType: "uint256",
                  name: "disputeKitID",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "pnkAtStakePerJuror",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "totalFeesForJurors",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "nbVotes",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "repartitions",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "pnkPenalties",
                  type: "uint256",
                },
                {
                  internalType: "address[]",
                  name: "drawnJurors",
                  type: "address[]",
                },
                {
                  internalType: "uint256",
                  name: "sumFeeRewardPaid",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "sumPnkRewardPaid",
                  type: "uint256",
                },
                {
                  internalType: "contract IERC20",
                  name: "feeToken",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "drawIterations",
                  type: "uint256",
                },
              ],
              internalType: "struct KlerosCoreUniversity.Round",
              name: "",
              type: "tuple",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint96",
              name: "_courtID",
              type: "uint96",
            },
          ],
          name: "getTimesPerPeriod",
          outputs: [
            {
              internalType: "uint256[4]",
              name: "timesPerPeriod",
              type: "uint256[4]",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "governor",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_governor",
              type: "address",
            },
            {
              internalType: "address",
              name: "_instructor",
              type: "address",
            },
            {
              internalType: "contract IERC20",
              name: "_pinakion",
              type: "address",
            },
            {
              internalType: "address",
              name: "_jurorProsecutionModule",
              type: "address",
            },
            {
              internalType: "contract IDisputeKit",
              name: "_disputeKit",
              type: "address",
            },
            {
              internalType: "bool",
              name: "_hiddenVotes",
              type: "bool",
            },
            {
              internalType: "uint256[4]",
              name: "_courtParameters",
              type: "uint256[4]",
            },
            {
              internalType: "uint256[4]",
              name: "_timesPerPeriod",
              type: "uint256[4]",
            },
            {
              internalType: "contract ISortitionModuleUniversity",
              name: "_sortitionModuleAddress",
              type: "address",
            },
          ],
          name: "initialize",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "instructor",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
          ],
          name: "isDisputeKitJumping",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint96",
              name: "_courtID",
              type: "uint96",
            },
            {
              internalType: "uint256",
              name: "_disputeKitID",
              type: "uint256",
            },
          ],
          name: "isSupported",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "jurorProsecutionModule",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
          ],
          name: "passPeriod",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "pinakion",
          outputs: [
            {
              internalType: "contract IERC20",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "proxiableUUID",
          outputs: [
            {
              internalType: "bytes32",
              name: "",
              type: "bytes32",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint96",
              name: "_courtID",
              type: "uint96",
            },
            {
              internalType: "uint256",
              name: "_newStake",
              type: "uint256",
            },
          ],
          name: "setStake",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_account",
              type: "address",
            },
            {
              internalType: "uint96",
              name: "_courtID",
              type: "uint96",
            },
            {
              internalType: "uint256",
              name: "_newStake",
              type: "uint256",
            },
            {
              internalType: "bool",
              name: "_alreadyTransferred",
              type: "bool",
            },
          ],
          name: "setStakeBySortitionModule",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "sortitionModule",
          outputs: [
            {
              internalType: "contract ISortitionModuleUniversity",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "newImplementation",
              type: "address",
            },
            {
              internalType: "bytes",
              name: "data",
              type: "bytes",
            },
          ],
          name: "upgradeToAndCall",
          outputs: [],
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_implementation",
              type: "address",
            },
            {
              internalType: "bytes",
              name: "_data",
              type: "bytes",
            },
          ],
          stateMutability: "nonpayable",
          type: "constructor",
        },
      ],
    },
    KlerosCoreUniversity_Implementation: {
      address: "0xF74DaBfC5F5dbdBD07636637204d9C35326D2906",
      abi: [
        {
          inputs: [],
          stateMutability: "nonpayable",
          type: "constructor",
        },
        {
          inputs: [],
          name: "AllJurorsDrawn",
          type: "error",
        },
        {
          inputs: [],
          name: "AlreadyInitialized",
          type: "error",
        },
        {
          inputs: [],
          name: "AppealFeesNotEnough",
          type: "error",
        },
        {
          inputs: [],
          name: "AppealPeriodNotPassed",
          type: "error",
        },
        {
          inputs: [],
          name: "ArbitrationFeesNotEnough",
          type: "error",
        },
        {
          inputs: [],
          name: "ArraysLengthMismatch",
          type: "error",
        },
        {
          inputs: [],
          name: "CannotDisableClassicDK",
          type: "error",
        },
        {
          inputs: [],
          name: "CommitPeriodNotPassed",
          type: "error",
        },
        {
          inputs: [],
          name: "DepthLevelMax",
          type: "error",
        },
        {
          inputs: [],
          name: "DisputeKitNotSupportedByCourt",
          type: "error",
        },
        {
          inputs: [],
          name: "DisputeKitOnly",
          type: "error",
        },
        {
          inputs: [],
          name: "DisputeNotAppealable",
          type: "error",
        },
        {
          inputs: [],
          name: "DisputePeriodIsFinal",
          type: "error",
        },
        {
          inputs: [],
          name: "DisputeStillDrawing",
          type: "error",
        },
        {
          inputs: [],
          name: "EvidenceNotPassedAndNotAppeal",
          type: "error",
        },
        {
          inputs: [],
          name: "FailedDelegateCall",
          type: "error",
        },
        {
          inputs: [],
          name: "GovernorOnly",
          type: "error",
        },
        {
          inputs: [],
          name: "GovernorOrInstructorOnly",
          type: "error",
        },
        {
          inputs: [],
          name: "InstructorOnly",
          type: "error",
        },
        {
          inputs: [],
          name: "InvalidDisputKitParent",
          type: "error",
        },
        {
          inputs: [],
          name: "InvalidForkingCourtAsParent",
          type: "error",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "implementation",
              type: "address",
            },
          ],
          name: "InvalidImplementation",
          type: "error",
        },
        {
          inputs: [],
          name: "MinStakeLowerThanParentCourt",
          type: "error",
        },
        {
          inputs: [],
          name: "MustSupportDisputeKitClassic",
          type: "error",
        },
        {
          inputs: [],
          name: "NoJurorDrawn",
          type: "error",
        },
        {
          inputs: [],
          name: "NotEvidencePeriod",
          type: "error",
        },
        {
          inputs: [],
          name: "NotExecutionPeriod",
          type: "error",
        },
        {
          inputs: [],
          name: "NotInitializing",
          type: "error",
        },
        {
          inputs: [],
          name: "RulingAlreadyExecuted",
          type: "error",
        },
        {
          inputs: [],
          name: "SortitionModuleOnly",
          type: "error",
        },
        {
          inputs: [],
          name: "StakingInTooManyCourts",
          type: "error",
        },
        {
          inputs: [],
          name: "StakingLessThanCourtMinStake",
          type: "error",
        },
        {
          inputs: [],
          name: "StakingNotPossibeInThisCourt",
          type: "error",
        },
        {
          inputs: [],
          name: "StakingTransferFailed",
          type: "error",
        },
        {
          inputs: [],
          name: "TokenNotAccepted",
          type: "error",
        },
        {
          inputs: [],
          name: "TransferFailed",
          type: "error",
        },
        {
          inputs: [],
          name: "UUPSUnauthorizedCallContext",
          type: "error",
        },
        {
          inputs: [
            {
              internalType: "bytes32",
              name: "slot",
              type: "bytes32",
            },
          ],
          name: "UUPSUnsupportedProxiableUUID",
          type: "error",
        },
        {
          inputs: [],
          name: "UnstakingTransferFailed",
          type: "error",
        },
        {
          inputs: [],
          name: "UnsuccessfulCall",
          type: "error",
        },
        {
          inputs: [],
          name: "UnsupportedDisputeKit",
          type: "error",
        },
        {
          inputs: [],
          name: "VotePeriodNotPassed",
          type: "error",
        },
        {
          inputs: [],
          name: "WrongDisputeKitIndex",
          type: "error",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "contract IERC20",
              name: "_token",
              type: "address",
            },
            {
              indexed: true,
              internalType: "bool",
              name: "_accepted",
              type: "bool",
            },
          ],
          name: "AcceptedFeeToken",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "contract IArbitrableV2",
              name: "_arbitrable",
              type: "address",
            },
          ],
          name: "AppealDecision",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "contract IArbitrableV2",
              name: "_arbitrable",
              type: "address",
            },
          ],
          name: "AppealPossible",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "_courtID",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "uint96",
              name: "_parent",
              type: "uint96",
            },
            {
              indexed: false,
              internalType: "bool",
              name: "_hiddenVotes",
              type: "bool",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_minStake",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_alpha",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_feeForJuror",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_jurorsForCourtJump",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256[4]",
              name: "_timesPerPeriod",
              type: "uint256[4]",
            },
            {
              indexed: false,
              internalType: "uint256[]",
              name: "_supportedDisputeKits",
              type: "uint256[]",
            },
          ],
          name: "CourtCreated",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "uint256",
              name: "_roundID",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "uint96",
              name: "_fromCourtID",
              type: "uint96",
            },
            {
              indexed: false,
              internalType: "uint96",
              name: "_toCourtID",
              type: "uint96",
            },
          ],
          name: "CourtJump",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint96",
              name: "_courtID",
              type: "uint96",
            },
            {
              indexed: false,
              internalType: "bool",
              name: "_hiddenVotes",
              type: "bool",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_minStake",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_alpha",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_feeForJuror",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_jurorsForCourtJump",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256[4]",
              name: "_timesPerPeriod",
              type: "uint256[4]",
            },
          ],
          name: "CourtModified",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "contract IArbitrableV2",
              name: "_arbitrable",
              type: "address",
            },
          ],
          name: "DisputeCreation",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "_disputeKitID",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "contract IDisputeKit",
              name: "_disputeKitAddress",
              type: "address",
            },
          ],
          name: "DisputeKitCreated",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint96",
              name: "_courtID",
              type: "uint96",
            },
            {
              indexed: true,
              internalType: "uint256",
              name: "_disputeKitID",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "bool",
              name: "_enable",
              type: "bool",
            },
          ],
          name: "DisputeKitEnabled",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "uint256",
              name: "_roundID",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "uint256",
              name: "_fromDisputeKitID",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_toDisputeKitID",
              type: "uint256",
            },
          ],
          name: "DisputeKitJump",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "_address",
              type: "address",
            },
            {
              indexed: true,
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_roundID",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_voteID",
              type: "uint256",
            },
          ],
          name: "Draw",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: false,
              internalType: "uint64",
              name: "version",
              type: "uint64",
            },
          ],
          name: "Initialized",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "uint256",
              name: "_roundID",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_pnkAmount",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_feeAmount",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "contract IERC20",
              name: "_feeToken",
              type: "address",
            },
          ],
          name: "LeftoverRewardSent",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "contract IERC20",
              name: "_feeToken",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint64",
              name: "_rateInEth",
              type: "uint64",
            },
            {
              indexed: false,
              internalType: "uint8",
              name: "_rateDecimals",
              type: "uint8",
            },
          ],
          name: "NewCurrencyRate",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "enum KlerosCoreUniversity.Period",
              name: "_period",
              type: "uint8",
            },
          ],
          name: "NewPeriod",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "contract IArbitrableV2",
              name: "_arbitrable",
              type: "address",
            },
            {
              indexed: true,
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_ruling",
              type: "uint256",
            },
          ],
          name: "Ruling",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "_account",
              type: "address",
            },
            {
              indexed: true,
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "uint256",
              name: "_roundID",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_degreeOfCoherency",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "int256",
              name: "_pnkAmount",
              type: "int256",
            },
            {
              indexed: false,
              internalType: "int256",
              name: "_feeAmount",
              type: "int256",
            },
            {
              indexed: false,
              internalType: "contract IERC20",
              name: "_feeToken",
              type: "address",
            },
          ],
          name: "TokenAndETHShift",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "newImplementation",
              type: "address",
            },
          ],
          name: "Upgraded",
          type: "event",
        },
        {
          inputs: [
            {
              internalType: "contract IDisputeKit",
              name: "_disputeKitAddress",
              type: "address",
            },
          ],
          name: "addNewDisputeKit",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_numberOfChoices",
              type: "uint256",
            },
            {
              internalType: "bytes",
              name: "_extraData",
              type: "bytes",
            },
          ],
          name: "appeal",
          outputs: [],
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
          ],
          name: "appealCost",
          outputs: [
            {
              internalType: "uint256",
              name: "cost",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
          ],
          name: "appealPeriod",
          outputs: [
            {
              internalType: "uint256",
              name: "start",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "end",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "bytes",
              name: "_extraData",
              type: "bytes",
            },
            {
              internalType: "contract IERC20",
              name: "_feeToken",
              type: "address",
            },
          ],
          name: "arbitrationCost",
          outputs: [
            {
              internalType: "uint256",
              name: "cost",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "bytes",
              name: "_extraData",
              type: "bytes",
            },
          ],
          name: "arbitrationCost",
          outputs: [
            {
              internalType: "uint256",
              name: "cost",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "contract IERC20",
              name: "_feeToken",
              type: "address",
            },
            {
              internalType: "bool",
              name: "_accepted",
              type: "bool",
            },
          ],
          name: "changeAcceptedFeeTokens",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint96",
              name: "_courtID",
              type: "uint96",
            },
            {
              internalType: "bool",
              name: "_hiddenVotes",
              type: "bool",
            },
            {
              internalType: "uint256",
              name: "_minStake",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_alpha",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_feeForJuror",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_jurorsForCourtJump",
              type: "uint256",
            },
            {
              internalType: "uint256[4]",
              name: "_timesPerPeriod",
              type: "uint256[4]",
            },
          ],
          name: "changeCourtParameters",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "contract IERC20",
              name: "_feeToken",
              type: "address",
            },
            {
              internalType: "uint64",
              name: "_rateInEth",
              type: "uint64",
            },
            {
              internalType: "uint8",
              name: "_rateDecimals",
              type: "uint8",
            },
          ],
          name: "changeCurrencyRates",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address payable",
              name: "_governor",
              type: "address",
            },
          ],
          name: "changeGovernor",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_instructor",
              type: "address",
            },
          ],
          name: "changeInstructor",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_jurorProsecutionModule",
              type: "address",
            },
          ],
          name: "changeJurorProsecutionModule",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "contract IERC20",
              name: "_pinakion",
              type: "address",
            },
          ],
          name: "changePinakion",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "contract ISortitionModuleUniversity",
              name: "_sortitionModule",
              type: "address",
            },
          ],
          name: "changeSortitionModule",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "contract IERC20",
              name: "_toToken",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "_amountInEth",
              type: "uint256",
            },
          ],
          name: "convertEthToTokenAmount",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          name: "courts",
          outputs: [
            {
              internalType: "uint96",
              name: "parent",
              type: "uint96",
            },
            {
              internalType: "bool",
              name: "hiddenVotes",
              type: "bool",
            },
            {
              internalType: "uint256",
              name: "minStake",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "alpha",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "feeForJuror",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "jurorsForCourtJump",
              type: "uint256",
            },
            {
              internalType: "bool",
              name: "disabled",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint96",
              name: "_parent",
              type: "uint96",
            },
            {
              internalType: "bool",
              name: "_hiddenVotes",
              type: "bool",
            },
            {
              internalType: "uint256",
              name: "_minStake",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_alpha",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_feeForJuror",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_jurorsForCourtJump",
              type: "uint256",
            },
            {
              internalType: "uint256[4]",
              name: "_timesPerPeriod",
              type: "uint256[4]",
            },
            {
              internalType: "uint256[]",
              name: "_supportedDisputeKits",
              type: "uint256[]",
            },
          ],
          name: "createCourt",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_numberOfChoices",
              type: "uint256",
            },
            {
              internalType: "bytes",
              name: "_extraData",
              type: "bytes",
            },
          ],
          name: "createDispute",
          outputs: [
            {
              internalType: "uint256",
              name: "disputeID",
              type: "uint256",
            },
          ],
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_numberOfChoices",
              type: "uint256",
            },
            {
              internalType: "bytes",
              name: "_extraData",
              type: "bytes",
            },
            {
              internalType: "contract IERC20",
              name: "_feeToken",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "_feeAmount",
              type: "uint256",
            },
          ],
          name: "createDispute",
          outputs: [
            {
              internalType: "uint256",
              name: "disputeID",
              type: "uint256",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "contract IERC20",
              name: "",
              type: "address",
            },
          ],
          name: "currencyRates",
          outputs: [
            {
              internalType: "bool",
              name: "feePaymentAccepted",
              type: "bool",
            },
            {
              internalType: "uint64",
              name: "rateInEth",
              type: "uint64",
            },
            {
              internalType: "uint8",
              name: "rateDecimals",
              type: "uint8",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
          ],
          name: "currentRuling",
          outputs: [
            {
              internalType: "uint256",
              name: "ruling",
              type: "uint256",
            },
            {
              internalType: "bool",
              name: "tied",
              type: "bool",
            },
            {
              internalType: "bool",
              name: "overridden",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          name: "disputeKits",
          outputs: [
            {
              internalType: "contract IDisputeKit",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          name: "disputes",
          outputs: [
            {
              internalType: "uint96",
              name: "courtID",
              type: "uint96",
            },
            {
              internalType: "contract IArbitrableV2",
              name: "arbitrated",
              type: "address",
            },
            {
              internalType: "enum KlerosCoreUniversity.Period",
              name: "period",
              type: "uint8",
            },
            {
              internalType: "bool",
              name: "ruled",
              type: "bool",
            },
            {
              internalType: "uint256",
              name: "lastPeriodChange",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
            {
              internalType: "address",
              name: "_juror",
              type: "address",
            },
          ],
          name: "draw",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint96",
              name: "_courtID",
              type: "uint96",
            },
            {
              internalType: "uint256[]",
              name: "_disputeKitIDs",
              type: "uint256[]",
            },
            {
              internalType: "bool",
              name: "_enable",
              type: "bool",
            },
          ],
          name: "enableDisputeKits",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_round",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_iterations",
              type: "uint256",
            },
          ],
          name: "execute",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_destination",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "_amount",
              type: "uint256",
            },
            {
              internalType: "bytes",
              name: "_data",
              type: "bytes",
            },
          ],
          name: "executeGovernorProposal",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
          ],
          name: "executeRuling",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "getDisputeKitsLength",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
          ],
          name: "getNumberOfRounds",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
          ],
          name: "getNumberOfVotes",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_round",
              type: "uint256",
            },
          ],
          name: "getRoundInfo",
          outputs: [
            {
              components: [
                {
                  internalType: "uint256",
                  name: "disputeKitID",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "pnkAtStakePerJuror",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "totalFeesForJurors",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "nbVotes",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "repartitions",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "pnkPenalties",
                  type: "uint256",
                },
                {
                  internalType: "address[]",
                  name: "drawnJurors",
                  type: "address[]",
                },
                {
                  internalType: "uint256",
                  name: "sumFeeRewardPaid",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "sumPnkRewardPaid",
                  type: "uint256",
                },
                {
                  internalType: "contract IERC20",
                  name: "feeToken",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "drawIterations",
                  type: "uint256",
                },
              ],
              internalType: "struct KlerosCoreUniversity.Round",
              name: "",
              type: "tuple",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint96",
              name: "_courtID",
              type: "uint96",
            },
          ],
          name: "getTimesPerPeriod",
          outputs: [
            {
              internalType: "uint256[4]",
              name: "timesPerPeriod",
              type: "uint256[4]",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "governor",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_governor",
              type: "address",
            },
            {
              internalType: "address",
              name: "_instructor",
              type: "address",
            },
            {
              internalType: "contract IERC20",
              name: "_pinakion",
              type: "address",
            },
            {
              internalType: "address",
              name: "_jurorProsecutionModule",
              type: "address",
            },
            {
              internalType: "contract IDisputeKit",
              name: "_disputeKit",
              type: "address",
            },
            {
              internalType: "bool",
              name: "_hiddenVotes",
              type: "bool",
            },
            {
              internalType: "uint256[4]",
              name: "_courtParameters",
              type: "uint256[4]",
            },
            {
              internalType: "uint256[4]",
              name: "_timesPerPeriod",
              type: "uint256[4]",
            },
            {
              internalType: "contract ISortitionModuleUniversity",
              name: "_sortitionModuleAddress",
              type: "address",
            },
          ],
          name: "initialize",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "instructor",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
          ],
          name: "isDisputeKitJumping",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint96",
              name: "_courtID",
              type: "uint96",
            },
            {
              internalType: "uint256",
              name: "_disputeKitID",
              type: "uint256",
            },
          ],
          name: "isSupported",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "jurorProsecutionModule",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
          ],
          name: "passPeriod",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "pinakion",
          outputs: [
            {
              internalType: "contract IERC20",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "proxiableUUID",
          outputs: [
            {
              internalType: "bytes32",
              name: "",
              type: "bytes32",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint96",
              name: "_courtID",
              type: "uint96",
            },
            {
              internalType: "uint256",
              name: "_newStake",
              type: "uint256",
            },
          ],
          name: "setStake",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_account",
              type: "address",
            },
            {
              internalType: "uint96",
              name: "_courtID",
              type: "uint96",
            },
            {
              internalType: "uint256",
              name: "_newStake",
              type: "uint256",
            },
            {
              internalType: "bool",
              name: "_alreadyTransferred",
              type: "bool",
            },
          ],
          name: "setStakeBySortitionModule",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "sortitionModule",
          outputs: [
            {
              internalType: "contract ISortitionModuleUniversity",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "newImplementation",
              type: "address",
            },
            {
              internalType: "bytes",
              name: "data",
              type: "bytes",
            },
          ],
          name: "upgradeToAndCall",
          outputs: [],
          stateMutability: "payable",
          type: "function",
        },
      ],
    },
    KlerosCoreUniversity_Proxy: {
      address: "0x5AB37F38778Bc175852fA353056591D91c744ce6",
      abi: [
        {
          inputs: [
            {
              internalType: "address",
              name: "_implementation",
              type: "address",
            },
            {
              internalType: "bytes",
              name: "_data",
              type: "bytes",
            },
          ],
          stateMutability: "nonpayable",
          type: "constructor",
        },
        {
          stateMutability: "payable",
          type: "fallback",
        },
        {
          stateMutability: "payable",
          type: "receive",
        },
      ],
    },
    KlerosCore_Implementation: {
      address: "0xb6839061C3aD03c208EFd697409453bf9900cAb2",
      abi: [
        {
          inputs: [],
          stateMutability: "nonpayable",
          type: "constructor",
        },
        {
          inputs: [],
          name: "AlreadyInitialized",
          type: "error",
        },
        {
          inputs: [],
          name: "AppealFeesNotEnough",
          type: "error",
        },
        {
          inputs: [],
          name: "AppealPeriodNotPassed",
          type: "error",
        },
        {
          inputs: [],
          name: "ArbitrationFeesNotEnough",
          type: "error",
        },
        {
          inputs: [],
          name: "CannotDisableClassicDK",
          type: "error",
        },
        {
          inputs: [],
          name: "CommitPeriodNotPassed",
          type: "error",
        },
        {
          inputs: [],
          name: "DisputeKitNotSupportedByCourt",
          type: "error",
        },
        {
          inputs: [],
          name: "DisputeKitOnly",
          type: "error",
        },
        {
          inputs: [],
          name: "DisputeNotAppealable",
          type: "error",
        },
        {
          inputs: [],
          name: "DisputePeriodIsFinal",
          type: "error",
        },
        {
          inputs: [],
          name: "DisputeStillDrawing",
          type: "error",
        },
        {
          inputs: [],
          name: "EvidenceNotPassedAndNotAppeal",
          type: "error",
        },
        {
          inputs: [],
          name: "FailedDelegateCall",
          type: "error",
        },
        {
          inputs: [],
          name: "GovernorOnly",
          type: "error",
        },
        {
          inputs: [],
          name: "GuardianOrGovernorOnly",
          type: "error",
        },
        {
          inputs: [],
          name: "InvalidDisputKitParent",
          type: "error",
        },
        {
          inputs: [],
          name: "InvalidForkingCourtAsParent",
          type: "error",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "implementation",
              type: "address",
            },
          ],
          name: "InvalidImplementation",
          type: "error",
        },
        {
          inputs: [],
          name: "MinStakeLowerThanParentCourt",
          type: "error",
        },
        {
          inputs: [],
          name: "MustSupportDisputeKitClassic",
          type: "error",
        },
        {
          inputs: [],
          name: "NotEvidencePeriod",
          type: "error",
        },
        {
          inputs: [],
          name: "NotExecutionPeriod",
          type: "error",
        },
        {
          inputs: [],
          name: "NotInitializing",
          type: "error",
        },
        {
          inputs: [],
          name: "RulingAlreadyExecuted",
          type: "error",
        },
        {
          inputs: [],
          name: "SortitionModuleOnly",
          type: "error",
        },
        {
          inputs: [],
          name: "StakingInTooManyCourts",
          type: "error",
        },
        {
          inputs: [],
          name: "StakingLessThanCourtMinStake",
          type: "error",
        },
        {
          inputs: [],
          name: "StakingNotPossibeInThisCourt",
          type: "error",
        },
        {
          inputs: [],
          name: "StakingTransferFailed",
          type: "error",
        },
        {
          inputs: [],
          name: "StakingZeroWhenNoStake",
          type: "error",
        },
        {
          inputs: [],
          name: "TokenNotAccepted",
          type: "error",
        },
        {
          inputs: [],
          name: "TransferFailed",
          type: "error",
        },
        {
          inputs: [],
          name: "UUPSUnauthorizedCallContext",
          type: "error",
        },
        {
          inputs: [
            {
              internalType: "bytes32",
              name: "slot",
              type: "bytes32",
            },
          ],
          name: "UUPSUnsupportedProxiableUUID",
          type: "error",
        },
        {
          inputs: [],
          name: "UnstakingTransferFailed",
          type: "error",
        },
        {
          inputs: [],
          name: "UnsuccessfulCall",
          type: "error",
        },
        {
          inputs: [],
          name: "UnsupportedDisputeKit",
          type: "error",
        },
        {
          inputs: [],
          name: "VotePeriodNotPassed",
          type: "error",
        },
        {
          inputs: [],
          name: "WhenNotPausedOnly",
          type: "error",
        },
        {
          inputs: [],
          name: "WhenPausedOnly",
          type: "error",
        },
        {
          inputs: [],
          name: "WrongDisputeKitIndex",
          type: "error",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "contract IERC20",
              name: "_token",
              type: "address",
            },
            {
              indexed: true,
              internalType: "bool",
              name: "_accepted",
              type: "bool",
            },
          ],
          name: "AcceptedFeeToken",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "contract IArbitrableV2",
              name: "_arbitrable",
              type: "address",
            },
          ],
          name: "AppealDecision",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "contract IArbitrableV2",
              name: "_arbitrable",
              type: "address",
            },
          ],
          name: "AppealPossible",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint96",
              name: "_courtID",
              type: "uint96",
            },
            {
              indexed: true,
              internalType: "uint96",
              name: "_parent",
              type: "uint96",
            },
            {
              indexed: false,
              internalType: "bool",
              name: "_hiddenVotes",
              type: "bool",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_minStake",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_alpha",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_feeForJuror",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_jurorsForCourtJump",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256[4]",
              name: "_timesPerPeriod",
              type: "uint256[4]",
            },
            {
              indexed: false,
              internalType: "uint256[]",
              name: "_supportedDisputeKits",
              type: "uint256[]",
            },
          ],
          name: "CourtCreated",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "uint256",
              name: "_roundID",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "uint96",
              name: "_fromCourtID",
              type: "uint96",
            },
            {
              indexed: false,
              internalType: "uint96",
              name: "_toCourtID",
              type: "uint96",
            },
          ],
          name: "CourtJump",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint96",
              name: "_courtID",
              type: "uint96",
            },
            {
              indexed: false,
              internalType: "bool",
              name: "_hiddenVotes",
              type: "bool",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_minStake",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_alpha",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_feeForJuror",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_jurorsForCourtJump",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256[4]",
              name: "_timesPerPeriod",
              type: "uint256[4]",
            },
          ],
          name: "CourtModified",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "contract IArbitrableV2",
              name: "_arbitrable",
              type: "address",
            },
          ],
          name: "DisputeCreation",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "_disputeKitID",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "contract IDisputeKit",
              name: "_disputeKitAddress",
              type: "address",
            },
          ],
          name: "DisputeKitCreated",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint96",
              name: "_courtID",
              type: "uint96",
            },
            {
              indexed: true,
              internalType: "uint256",
              name: "_disputeKitID",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "bool",
              name: "_enable",
              type: "bool",
            },
          ],
          name: "DisputeKitEnabled",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "uint256",
              name: "_roundID",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "uint256",
              name: "_fromDisputeKitID",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_toDisputeKitID",
              type: "uint256",
            },
          ],
          name: "DisputeKitJump",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "_address",
              type: "address",
            },
            {
              indexed: true,
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_roundID",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_voteID",
              type: "uint256",
            },
          ],
          name: "Draw",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: false,
              internalType: "uint64",
              name: "version",
              type: "uint64",
            },
          ],
          name: "Initialized",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "uint256",
              name: "_roundID",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_pnkAmount",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_feeAmount",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "contract IERC20",
              name: "_feeToken",
              type: "address",
            },
          ],
          name: "LeftoverRewardSent",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "contract IERC20",
              name: "_feeToken",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint64",
              name: "_rateInEth",
              type: "uint64",
            },
            {
              indexed: false,
              internalType: "uint8",
              name: "_rateDecimals",
              type: "uint8",
            },
          ],
          name: "NewCurrencyRate",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "enum KlerosCoreBase.Period",
              name: "_period",
              type: "uint8",
            },
          ],
          name: "NewPeriod",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [],
          name: "Paused",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "contract IArbitrableV2",
              name: "_arbitrable",
              type: "address",
            },
            {
              indexed: true,
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_ruling",
              type: "uint256",
            },
          ],
          name: "Ruling",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "_account",
              type: "address",
            },
            {
              indexed: true,
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "uint256",
              name: "_roundID",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_degreeOfCoherency",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "int256",
              name: "_pnkAmount",
              type: "int256",
            },
            {
              indexed: false,
              internalType: "int256",
              name: "_feeAmount",
              type: "int256",
            },
            {
              indexed: false,
              internalType: "contract IERC20",
              name: "_feeToken",
              type: "address",
            },
          ],
          name: "TokenAndETHShift",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [],
          name: "Unpaused",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "newImplementation",
              type: "address",
            },
          ],
          name: "Upgraded",
          type: "event",
        },
        {
          inputs: [
            {
              internalType: "contract IDisputeKit",
              name: "_disputeKitAddress",
              type: "address",
            },
          ],
          name: "addNewDisputeKit",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_numberOfChoices",
              type: "uint256",
            },
            {
              internalType: "bytes",
              name: "_extraData",
              type: "bytes",
            },
          ],
          name: "appeal",
          outputs: [],
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
          ],
          name: "appealCost",
          outputs: [
            {
              internalType: "uint256",
              name: "cost",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
          ],
          name: "appealPeriod",
          outputs: [
            {
              internalType: "uint256",
              name: "start",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "end",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "bytes",
              name: "_extraData",
              type: "bytes",
            },
            {
              internalType: "contract IERC20",
              name: "_feeToken",
              type: "address",
            },
          ],
          name: "arbitrationCost",
          outputs: [
            {
              internalType: "uint256",
              name: "cost",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "bytes",
              name: "_extraData",
              type: "bytes",
            },
          ],
          name: "arbitrationCost",
          outputs: [
            {
              internalType: "uint256",
              name: "cost",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "contract IERC20",
              name: "_feeToken",
              type: "address",
            },
            {
              internalType: "bool",
              name: "_accepted",
              type: "bool",
            },
          ],
          name: "changeAcceptedFeeTokens",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint96",
              name: "_courtID",
              type: "uint96",
            },
            {
              internalType: "bool",
              name: "_hiddenVotes",
              type: "bool",
            },
            {
              internalType: "uint256",
              name: "_minStake",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_alpha",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_feeForJuror",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_jurorsForCourtJump",
              type: "uint256",
            },
            {
              internalType: "uint256[4]",
              name: "_timesPerPeriod",
              type: "uint256[4]",
            },
          ],
          name: "changeCourtParameters",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "contract IERC20",
              name: "_feeToken",
              type: "address",
            },
            {
              internalType: "uint64",
              name: "_rateInEth",
              type: "uint64",
            },
            {
              internalType: "uint8",
              name: "_rateDecimals",
              type: "uint8",
            },
          ],
          name: "changeCurrencyRates",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address payable",
              name: "_governor",
              type: "address",
            },
          ],
          name: "changeGovernor",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_guardian",
              type: "address",
            },
          ],
          name: "changeGuardian",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_jurorProsecutionModule",
              type: "address",
            },
          ],
          name: "changeJurorProsecutionModule",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "contract IERC20",
              name: "_pinakion",
              type: "address",
            },
          ],
          name: "changePinakion",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "contract ISortitionModule",
              name: "_sortitionModule",
              type: "address",
            },
          ],
          name: "changeSortitionModule",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "contract IERC20",
              name: "_toToken",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "_amountInEth",
              type: "uint256",
            },
          ],
          name: "convertEthToTokenAmount",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          name: "courts",
          outputs: [
            {
              internalType: "uint96",
              name: "parent",
              type: "uint96",
            },
            {
              internalType: "bool",
              name: "hiddenVotes",
              type: "bool",
            },
            {
              internalType: "uint256",
              name: "minStake",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "alpha",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "feeForJuror",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "jurorsForCourtJump",
              type: "uint256",
            },
            {
              internalType: "bool",
              name: "disabled",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint96",
              name: "_parent",
              type: "uint96",
            },
            {
              internalType: "bool",
              name: "_hiddenVotes",
              type: "bool",
            },
            {
              internalType: "uint256",
              name: "_minStake",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_alpha",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_feeForJuror",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_jurorsForCourtJump",
              type: "uint256",
            },
            {
              internalType: "uint256[4]",
              name: "_timesPerPeriod",
              type: "uint256[4]",
            },
            {
              internalType: "bytes",
              name: "_sortitionExtraData",
              type: "bytes",
            },
            {
              internalType: "uint256[]",
              name: "_supportedDisputeKits",
              type: "uint256[]",
            },
          ],
          name: "createCourt",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_numberOfChoices",
              type: "uint256",
            },
            {
              internalType: "bytes",
              name: "_extraData",
              type: "bytes",
            },
          ],
          name: "createDispute",
          outputs: [
            {
              internalType: "uint256",
              name: "disputeID",
              type: "uint256",
            },
          ],
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_numberOfChoices",
              type: "uint256",
            },
            {
              internalType: "bytes",
              name: "_extraData",
              type: "bytes",
            },
            {
              internalType: "contract IERC20",
              name: "_feeToken",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "_feeAmount",
              type: "uint256",
            },
          ],
          name: "createDispute",
          outputs: [
            {
              internalType: "uint256",
              name: "disputeID",
              type: "uint256",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "contract IERC20",
              name: "",
              type: "address",
            },
          ],
          name: "currencyRates",
          outputs: [
            {
              internalType: "bool",
              name: "feePaymentAccepted",
              type: "bool",
            },
            {
              internalType: "uint64",
              name: "rateInEth",
              type: "uint64",
            },
            {
              internalType: "uint8",
              name: "rateDecimals",
              type: "uint8",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
          ],
          name: "currentRuling",
          outputs: [
            {
              internalType: "uint256",
              name: "ruling",
              type: "uint256",
            },
            {
              internalType: "bool",
              name: "tied",
              type: "bool",
            },
            {
              internalType: "bool",
              name: "overridden",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          name: "disputeKits",
          outputs: [
            {
              internalType: "contract IDisputeKit",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          name: "disputes",
          outputs: [
            {
              internalType: "uint96",
              name: "courtID",
              type: "uint96",
            },
            {
              internalType: "contract IArbitrableV2",
              name: "arbitrated",
              type: "address",
            },
            {
              internalType: "enum KlerosCoreBase.Period",
              name: "period",
              type: "uint8",
            },
            {
              internalType: "bool",
              name: "ruled",
              type: "bool",
            },
            {
              internalType: "uint256",
              name: "lastPeriodChange",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_iterations",
              type: "uint256",
            },
          ],
          name: "draw",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint96",
              name: "_courtID",
              type: "uint96",
            },
            {
              internalType: "uint256[]",
              name: "_disputeKitIDs",
              type: "uint256[]",
            },
            {
              internalType: "bool",
              name: "_enable",
              type: "bool",
            },
          ],
          name: "enableDisputeKits",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_round",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_iterations",
              type: "uint256",
            },
          ],
          name: "execute",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_destination",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "_amount",
              type: "uint256",
            },
            {
              internalType: "bytes",
              name: "_data",
              type: "bytes",
            },
          ],
          name: "executeGovernorProposal",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
          ],
          name: "executeRuling",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "getDisputeKitsLength",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
          ],
          name: "getNumberOfRounds",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
          ],
          name: "getNumberOfVotes",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_round",
              type: "uint256",
            },
          ],
          name: "getRoundInfo",
          outputs: [
            {
              components: [
                {
                  internalType: "uint256",
                  name: "disputeKitID",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "pnkAtStakePerJuror",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "totalFeesForJurors",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "nbVotes",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "repartitions",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "pnkPenalties",
                  type: "uint256",
                },
                {
                  internalType: "address[]",
                  name: "drawnJurors",
                  type: "address[]",
                },
                {
                  internalType: "uint256",
                  name: "sumFeeRewardPaid",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "sumPnkRewardPaid",
                  type: "uint256",
                },
                {
                  internalType: "contract IERC20",
                  name: "feeToken",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "drawIterations",
                  type: "uint256",
                },
              ],
              internalType: "struct KlerosCoreBase.Round",
              name: "",
              type: "tuple",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint96",
              name: "_courtID",
              type: "uint96",
            },
          ],
          name: "getTimesPerPeriod",
          outputs: [
            {
              internalType: "uint256[4]",
              name: "timesPerPeriod",
              type: "uint256[4]",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "governor",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "guardian",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_governor",
              type: "address",
            },
            {
              internalType: "address",
              name: "_guardian",
              type: "address",
            },
            {
              internalType: "contract IERC20",
              name: "_pinakion",
              type: "address",
            },
            {
              internalType: "address",
              name: "_jurorProsecutionModule",
              type: "address",
            },
            {
              internalType: "contract IDisputeKit",
              name: "_disputeKit",
              type: "address",
            },
            {
              internalType: "bool",
              name: "_hiddenVotes",
              type: "bool",
            },
            {
              internalType: "uint256[4]",
              name: "_courtParameters",
              type: "uint256[4]",
            },
            {
              internalType: "uint256[4]",
              name: "_timesPerPeriod",
              type: "uint256[4]",
            },
            {
              internalType: "bytes",
              name: "_sortitionExtraData",
              type: "bytes",
            },
            {
              internalType: "contract ISortitionModule",
              name: "_sortitionModuleAddress",
              type: "address",
            },
          ],
          name: "initialize",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "initialize3",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
          ],
          name: "isDisputeKitJumping",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint96",
              name: "_courtID",
              type: "uint96",
            },
            {
              internalType: "uint256",
              name: "_disputeKitID",
              type: "uint256",
            },
          ],
          name: "isSupported",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "jurorProsecutionModule",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_disputeID",
              type: "uint256",
            },
          ],
          name: "passPeriod",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "pause",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "paused",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "pinakion",
          outputs: [
            {
              internalType: "contract IERC20",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "proxiableUUID",
          outputs: [
            {
              internalType: "bytes32",
              name: "",
              type: "bytes32",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint96",
              name: "_courtID",
              type: "uint96",
            },
            {
              internalType: "uint256",
              name: "_newStake",
              type: "uint256",
            },
          ],
          name: "setStake",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_account",
              type: "address",
            },
            {
              internalType: "uint96",
              name: "_courtID",
              type: "uint96",
            },
            {
              internalType: "uint256",
              name: "_newStake",
              type: "uint256",
            },
            {
              internalType: "bool",
              name: "_alreadyTransferred",
              type: "bool",
            },
          ],
          name: "setStakeBySortitionModule",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "sortitionModule",
          outputs: [
            {
              internalType: "contract ISortitionModule",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "unpause",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "newImplementation",
              type: "address",
            },
            {
              internalType: "bytes",
              name: "data",
              type: "bytes",
            },
          ],
          name: "upgradeToAndCall",
          outputs: [],
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [],
          name: "version",
          outputs: [
            {
              internalType: "string",
              name: "",
              type: "string",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
      ],
    },
    KlerosCore_Proxy: {
      address: "0x4838e31E0ea315232c431598110FE677cAF2D6E6",
      abi: [
        {
          inputs: [
            {
              internalType: "address",
              name: "_implementation",
              type: "address",
            },
            {
              internalType: "bytes",
              name: "_data",
              type: "bytes",
            },
          ],
          stateMutability: "nonpayable",
          type: "constructor",
        },
        {
          stateMutability: "payable",
          type: "fallback",
        },
        {
          stateMutability: "payable",
          type: "receive",
        },
      ],
    },
    KlerosV2NeoEarlyUser: {
      address: "0x0d60Ff8bbCF49Bc5352328E7E28e141834d7750F",
      abi: [
        {
          inputs: [
            {
              internalType: "string",
              name: "_name",
              type: "string",
            },
            {
              internalType: "string",
              name: "_symbol",
              type: "string",
            },
          ],
          stateMutability: "nonpayable",
          type: "constructor",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "owner",
              type: "address",
            },
            {
              indexed: true,
              internalType: "address",
              name: "approved",
              type: "address",
            },
            {
              indexed: true,
              internalType: "uint256",
              name: "tokenId",
              type: "uint256",
            },
          ],
          name: "Approval",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "owner",
              type: "address",
            },
            {
              indexed: true,
              internalType: "address",
              name: "operator",
              type: "address",
            },
            {
              indexed: false,
              internalType: "bool",
              name: "approved",
              type: "bool",
            },
          ],
          name: "ApprovalForAll",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "from",
              type: "address",
            },
            {
              indexed: true,
              internalType: "address",
              name: "to",
              type: "address",
            },
            {
              indexed: true,
              internalType: "uint256",
              name: "tokenId",
              type: "uint256",
            },
          ],
          name: "Transfer",
          type: "event",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "to",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "tokenId",
              type: "uint256",
            },
          ],
          name: "approve",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "owner",
              type: "address",
            },
          ],
          name: "balanceOf",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_newOwner",
              type: "address",
            },
          ],
          name: "changeOwner",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "tokenId",
              type: "uint256",
            },
          ],
          name: "getApproved",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "owner",
              type: "address",
            },
            {
              internalType: "address",
              name: "operator",
              type: "address",
            },
          ],
          name: "isApprovedForAll",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "name",
          outputs: [
            {
              internalType: "string",
              name: "",
              type: "string",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "owner",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "tokenId",
              type: "uint256",
            },
          ],
          name: "ownerOf",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "to",
              type: "address",
            },
          ],
          name: "safeMint",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "from",
              type: "address",
            },
            {
              internalType: "address",
              name: "to",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "tokenId",
              type: "uint256",
            },
          ],
          name: "safeTransferFrom",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "from",
              type: "address",
            },
            {
              internalType: "address",
              name: "to",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "tokenId",
              type: "uint256",
            },
            {
              internalType: "bytes",
              name: "data",
              type: "bytes",
            },
          ],
          name: "safeTransferFrom",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "operator",
              type: "address",
            },
            {
              internalType: "bool",
              name: "approved",
              type: "bool",
            },
          ],
          name: "setApprovalForAll",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "bytes4",
              name: "interfaceId",
              type: "bytes4",
            },
          ],
          name: "supportsInterface",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "symbol",
          outputs: [
            {
              internalType: "string",
              name: "",
              type: "string",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "tokenId",
              type: "uint256",
            },
          ],
          name: "tokenURI",
          outputs: [
            {
              internalType: "string",
              name: "",
              type: "string",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "from",
              type: "address",
            },
            {
              internalType: "address",
              name: "to",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "tokenId",
              type: "uint256",
            },
          ],
          name: "transferFrom",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
      ],
    },
    PNK: {
      address: "0x34B944D42cAcfC8266955D07A80181D2054aa225",
      abi: [
        {
          inputs: [],
          stateMutability: "nonpayable",
          type: "constructor",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "owner",
              type: "address",
            },
            {
              indexed: true,
              internalType: "address",
              name: "spender",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "value",
              type: "uint256",
            },
          ],
          name: "Approval",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "from",
              type: "address",
            },
            {
              indexed: true,
              internalType: "address",
              name: "to",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "value",
              type: "uint256",
            },
          ],
          name: "Transfer",
          type: "event",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "owner",
              type: "address",
            },
            {
              internalType: "address",
              name: "spender",
              type: "address",
            },
          ],
          name: "allowance",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "spender",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "amount",
              type: "uint256",
            },
          ],
          name: "approve",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "account",
              type: "address",
            },
          ],
          name: "balanceOf",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "decimals",
          outputs: [
            {
              internalType: "uint8",
              name: "",
              type: "uint8",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "spender",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "subtractedValue",
              type: "uint256",
            },
          ],
          name: "decreaseAllowance",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "spender",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "addedValue",
              type: "uint256",
            },
          ],
          name: "increaseAllowance",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "name",
          outputs: [
            {
              internalType: "string",
              name: "",
              type: "string",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "symbol",
          outputs: [
            {
              internalType: "string",
              name: "",
              type: "string",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "totalSupply",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "to",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "amount",
              type: "uint256",
            },
          ],
          name: "transfer",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "from",
              type: "address",
            },
            {
              internalType: "address",
              name: "to",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "amount",
              type: "uint256",
            },
          ],
          name: "transferFrom",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
      ],
    },
    PNKFaucet: {
      address: "0x7EFE468003Ad6A858b5350CDE0A67bBED58739dD",
      abi: [
        {
          inputs: [
            {
              internalType: "contract IERC20",
              name: "_token",
              type: "address",
            },
          ],
          stateMutability: "nonpayable",
          type: "constructor",
        },
        {
          inputs: [],
          name: "amount",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "balance",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_amount",
              type: "uint256",
            },
          ],
          name: "changeAmount",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_governor",
              type: "address",
            },
          ],
          name: "changeGovernor",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "governor",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "request",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "token",
          outputs: [
            {
              internalType: "contract IERC20",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "withdraw",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          name: "withdrewAlready",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
      ],
    },
    PinakionV2: {
      address: "0x34B944D42cAcfC8266955D07A80181D2054aa225",
      abi: [
        {
          inputs: [],
          stateMutability: "nonpayable",
          type: "constructor",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "owner",
              type: "address",
            },
            {
              indexed: true,
              internalType: "address",
              name: "spender",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "value",
              type: "uint256",
            },
          ],
          name: "Approval",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "from",
              type: "address",
            },
            {
              indexed: true,
              internalType: "address",
              name: "to",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "value",
              type: "uint256",
            },
          ],
          name: "Transfer",
          type: "event",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "owner",
              type: "address",
            },
            {
              internalType: "address",
              name: "spender",
              type: "address",
            },
          ],
          name: "allowance",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "spender",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "amount",
              type: "uint256",
            },
          ],
          name: "approve",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "account",
              type: "address",
            },
          ],
          name: "balanceOf",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "decimals",
          outputs: [
            {
              internalType: "uint8",
              name: "",
              type: "uint8",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "spender",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "subtractedValue",
              type: "uint256",
            },
          ],
          name: "decreaseAllowance",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "spender",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "addedValue",
              type: "uint256",
            },
          ],
          name: "increaseAllowance",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "name",
          outputs: [
            {
              internalType: "string",
              name: "",
              type: "string",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "symbol",
          outputs: [
            {
              internalType: "string",
              name: "",
              type: "string",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "totalSupply",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "to",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "amount",
              type: "uint256",
            },
          ],
          name: "transfer",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "from",
              type: "address",
            },
            {
              internalType: "address",
              name: "to",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "amount",
              type: "uint256",
            },
          ],
          name: "transferFrom",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
      ],
    },
    PolicyRegistry: {
      address: "0x31d067405184d7FaA64b0834511cBcFAF32CdC4b",
      abi: [
        {
          stateMutability: "payable",
          type: "fallback",
        },
        {
          stateMutability: "payable",
          type: "receive",
        },
        {
          inputs: [],
          name: "AlreadyInitialized",
          type: "error",
        },
        {
          inputs: [],
          name: "FailedDelegateCall",
          type: "error",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "implementation",
              type: "address",
            },
          ],
          name: "InvalidImplementation",
          type: "error",
        },
        {
          inputs: [],
          name: "NotInitializing",
          type: "error",
        },
        {
          inputs: [],
          name: "UUPSUnauthorizedCallContext",
          type: "error",
        },
        {
          inputs: [
            {
              internalType: "bytes32",
              name: "slot",
              type: "bytes32",
            },
          ],
          name: "UUPSUnsupportedProxiableUUID",
          type: "error",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: false,
              internalType: "uint64",
              name: "version",
              type: "uint64",
            },
          ],
          name: "Initialized",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "_courtID",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "string",
              name: "_courtName",
              type: "string",
            },
            {
              indexed: false,
              internalType: "string",
              name: "_policy",
              type: "string",
            },
          ],
          name: "PolicyUpdate",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "newImplementation",
              type: "address",
            },
          ],
          name: "Upgraded",
          type: "event",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_governor",
              type: "address",
            },
          ],
          name: "changeGovernor",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "governor",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_governor",
              type: "address",
            },
          ],
          name: "initialize",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "initialize2",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          name: "policies",
          outputs: [
            {
              internalType: "string",
              name: "",
              type: "string",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "proxiableUUID",
          outputs: [
            {
              internalType: "bytes32",
              name: "",
              type: "bytes32",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_courtID",
              type: "uint256",
            },
            {
              internalType: "string",
              name: "_courtName",
              type: "string",
            },
            {
              internalType: "string",
              name: "_policy",
              type: "string",
            },
          ],
          name: "setPolicy",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "newImplementation",
              type: "address",
            },
            {
              internalType: "bytes",
              name: "data",
              type: "bytes",
            },
          ],
          name: "upgradeToAndCall",
          outputs: [],
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [],
          name: "version",
          outputs: [
            {
              internalType: "string",
              name: "",
              type: "string",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_implementation",
              type: "address",
            },
            {
              internalType: "bytes",
              name: "_data",
              type: "bytes",
            },
          ],
          stateMutability: "nonpayable",
          type: "constructor",
        },
      ],
    },
    PolicyRegistry_Implementation: {
      address: "0x09ba3234B3aD786aE46EcDAF388C93D54c145DC0",
      abi: [
        {
          inputs: [],
          stateMutability: "nonpayable",
          type: "constructor",
        },
        {
          inputs: [],
          name: "AlreadyInitialized",
          type: "error",
        },
        {
          inputs: [],
          name: "FailedDelegateCall",
          type: "error",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "implementation",
              type: "address",
            },
          ],
          name: "InvalidImplementation",
          type: "error",
        },
        {
          inputs: [],
          name: "NotInitializing",
          type: "error",
        },
        {
          inputs: [],
          name: "UUPSUnauthorizedCallContext",
          type: "error",
        },
        {
          inputs: [
            {
              internalType: "bytes32",
              name: "slot",
              type: "bytes32",
            },
          ],
          name: "UUPSUnsupportedProxiableUUID",
          type: "error",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: false,
              internalType: "uint64",
              name: "version",
              type: "uint64",
            },
          ],
          name: "Initialized",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "_courtID",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "string",
              name: "_courtName",
              type: "string",
            },
            {
              indexed: false,
              internalType: "string",
              name: "_policy",
              type: "string",
            },
          ],
          name: "PolicyUpdate",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "newImplementation",
              type: "address",
            },
          ],
          name: "Upgraded",
          type: "event",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_governor",
              type: "address",
            },
          ],
          name: "changeGovernor",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "governor",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_governor",
              type: "address",
            },
          ],
          name: "initialize",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "initialize2",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          name: "policies",
          outputs: [
            {
              internalType: "string",
              name: "",
              type: "string",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "proxiableUUID",
          outputs: [
            {
              internalType: "bytes32",
              name: "",
              type: "bytes32",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_courtID",
              type: "uint256",
            },
            {
              internalType: "string",
              name: "_courtName",
              type: "string",
            },
            {
              internalType: "string",
              name: "_policy",
              type: "string",
            },
          ],
          name: "setPolicy",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "newImplementation",
              type: "address",
            },
            {
              internalType: "bytes",
              name: "data",
              type: "bytes",
            },
          ],
          name: "upgradeToAndCall",
          outputs: [],
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [],
          name: "version",
          outputs: [
            {
              internalType: "string",
              name: "",
              type: "string",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
      ],
    },
    PolicyRegistry_Proxy: {
      address: "0x31d067405184d7FaA64b0834511cBcFAF32CdC4b",
      abi: [
        {
          inputs: [
            {
              internalType: "address",
              name: "_implementation",
              type: "address",
            },
            {
              internalType: "bytes",
              name: "_data",
              type: "bytes",
            },
          ],
          stateMutability: "nonpayable",
          type: "constructor",
        },
        {
          stateMutability: "payable",
          type: "fallback",
        },
        {
          stateMutability: "payable",
          type: "receive",
        },
      ],
    },
    RandomizerOracle: {
      address: "0xE775D7fde1d0D09ae627C0131040012ccBcC4b9b",
      abi: [],
    },
    SortitionModule: {
      address: "0xb34651b65A40553C444c6F0D27286C80ec34fbfD",
      abi: [
        {
          stateMutability: "payable",
          type: "fallback",
        },
        {
          stateMutability: "payable",
          type: "receive",
        },
        {
          inputs: [],
          name: "AlreadyInitialized",
          type: "error",
        },
        {
          inputs: [],
          name: "FailedDelegateCall",
          type: "error",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "implementation",
              type: "address",
            },
          ],
          name: "InvalidImplementation",
          type: "error",
        },
        {
          inputs: [],
          name: "NotInitializing",
          type: "error",
        },
        {
          inputs: [],
          name: "UUPSUnauthorizedCallContext",
          type: "error",
        },
        {
          inputs: [
            {
              internalType: "bytes32",
              name: "slot",
              type: "bytes32",
            },
          ],
          name: "UUPSUnsupportedProxiableUUID",
          type: "error",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: false,
              internalType: "uint64",
              name: "version",
              type: "uint64",
            },
          ],
          name: "Initialized",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: false,
              internalType: "enum ISortitionModule.Phase",
              name: "_phase",
              type: "uint8",
            },
          ],
          name: "NewPhase",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "_address",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_courtID",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_amount",
              type: "uint256",
            },
          ],
          name: "StakeDelayedAlreadyTransferredDeposited",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "_address",
              type: "address",
            },
            {
              indexed: true,
              internalType: "uint96",
              name: "_courtID",
              type: "uint96",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_amount",
              type: "uint256",
            },
          ],
          name: "StakeDelayedAlreadyTransferredWithdrawn",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "_address",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_courtID",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_amount",
              type: "uint256",
            },
          ],
          name: "StakeDelayedNotTransferred",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "_address",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_relativeAmount",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "bool",
              name: "_unlock",
              type: "bool",
            },
          ],
          name: "StakeLocked",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "_address",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_courtID",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_amount",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_amountAllCourts",
              type: "uint256",
            },
          ],
          name: "StakeSet",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "newImplementation",
              type: "address",
            },
          ],
          name: "Upgraded",
          type: "event",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_governor",
              type: "address",
            },
          ],
          name: "changeGovernor",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_maxDrawingTime",
              type: "uint256",
            },
          ],
          name: "changeMaxDrawingTime",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_minStakingTime",
              type: "uint256",
            },
          ],
          name: "changeMinStakingTime",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "contract RNG",
              name: "_rng",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "_rngLookahead",
              type: "uint256",
            },
          ],
          name: "changeRandomNumberGenerator",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "core",
          outputs: [
            {
              internalType: "contract KlerosCore",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          name: "createDisputeHook",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "bytes32",
              name: "_key",
              type: "bytes32",
            },
            {
              internalType: "bytes",
              name: "_extraData",
              type: "bytes",
            },
          ],
          name: "createTree",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "delayedStakeReadIndex",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "delayedStakeWriteIndex",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          name: "delayedStakes",
          outputs: [
            {
              internalType: "address",
              name: "account",
              type: "address",
            },
            {
              internalType: "uint96",
              name: "courtID",
              type: "uint96",
            },
            {
              internalType: "uint256",
              name: "stake",
              type: "uint256",
            },
            {
              internalType: "bool",
              name: "alreadyTransferred",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "disputesWithoutJurors",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "bytes32",
              name: "_key",
              type: "bytes32",
            },
            {
              internalType: "uint256",
              name: "_coreDisputeID",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_nonce",
              type: "uint256",
            },
          ],
          name: "draw",
          outputs: [
            {
              internalType: "address",
              name: "drawnAddress",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_iterations",
              type: "uint256",
            },
          ],
          name: "executeDelayedStakes",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_juror",
              type: "address",
            },
            {
              internalType: "uint96",
              name: "_courtID",
              type: "uint96",
            },
          ],
          name: "getJurorBalance",
          outputs: [
            {
              internalType: "uint256",
              name: "totalStaked",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "totalLocked",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "stakedInCourt",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "nbCourts",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_juror",
              type: "address",
            },
          ],
          name: "getJurorCourtIDs",
          outputs: [
            {
              internalType: "uint96[]",
              name: "",
              type: "uint96[]",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "governor",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_governor",
              type: "address",
            },
            {
              internalType: "contract KlerosCore",
              name: "_core",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "_minStakingTime",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_maxDrawingTime",
              type: "uint256",
            },
            {
              internalType: "contract RNG",
              name: "_rng",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "_rngLookahead",
              type: "uint256",
            },
          ],
          name: "initialize",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "initialize3",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_juror",
              type: "address",
            },
          ],
          name: "isJurorStaked",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "account",
              type: "address",
            },
          ],
          name: "jurors",
          outputs: [
            {
              internalType: "uint256",
              name: "stakedPnk",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "lockedPnk",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "lastPhaseChange",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "jurorAccount",
              type: "address",
            },
            {
              internalType: "uint96",
              name: "courtId",
              type: "uint96",
            },
          ],
          name: "latestDelayedStakeIndex",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_account",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "_relativeAmount",
              type: "uint256",
            },
          ],
          name: "lockStake",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "maxDrawingTime",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "minStakingTime",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_randomNumber",
              type: "uint256",
            },
          ],
          name: "notifyRandomNumber",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "passPhase",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_account",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "_relativeAmount",
              type: "uint256",
            },
          ],
          name: "penalizeStake",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "phase",
          outputs: [
            {
              internalType: "enum ISortitionModule.Phase",
              name: "",
              type: "uint8",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          name: "postDrawHook",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "proxiableUUID",
          outputs: [
            {
              internalType: "bytes32",
              name: "",
              type: "bytes32",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "randomNumber",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "randomNumberRequestBlock",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "rng",
          outputs: [
            {
              internalType: "contract RNG",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "rngLookahead",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_account",
              type: "address",
            },
          ],
          name: "setJurorInactive",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_account",
              type: "address",
            },
            {
              internalType: "uint96",
              name: "_courtID",
              type: "uint96",
            },
            {
              internalType: "uint256",
              name: "_newStake",
              type: "uint256",
            },
            {
              internalType: "bool",
              name: "_alreadyTransferred",
              type: "bool",
            },
          ],
          name: "setStake",
          outputs: [
            {
              internalType: "uint256",
              name: "pnkDeposit",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "pnkWithdrawal",
              type: "uint256",
            },
            {
              internalType: "enum StakingResult",
              name: "stakingResult",
              type: "uint8",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "bytes32",
              name: "_key",
              type: "bytes32",
            },
            {
              internalType: "bytes32",
              name: "_ID",
              type: "bytes32",
            },
          ],
          name: "stakeOf",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_juror",
              type: "address",
            },
            {
              internalType: "uint96",
              name: "_courtID",
              type: "uint96",
            },
          ],
          name: "stakeOf",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_account",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "_relativeAmount",
              type: "uint256",
            },
          ],
          name: "unlockStake",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "newImplementation",
              type: "address",
            },
            {
              internalType: "bytes",
              name: "data",
              type: "bytes",
            },
          ],
          name: "upgradeToAndCall",
          outputs: [],
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [],
          name: "version",
          outputs: [
            {
              internalType: "string",
              name: "",
              type: "string",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_implementation",
              type: "address",
            },
            {
              internalType: "bytes",
              name: "_data",
              type: "bytes",
            },
          ],
          stateMutability: "nonpayable",
          type: "constructor",
        },
      ],
    },
    SortitionModuleUniversity: {
      address: "0x4B2c2d048921f694cCE3AEa35698c6B1f5fcbb79",
      abi: [
        {
          stateMutability: "payable",
          type: "fallback",
        },
        {
          stateMutability: "payable",
          type: "receive",
        },
        {
          inputs: [],
          name: "AlreadyInitialized",
          type: "error",
        },
        {
          inputs: [],
          name: "FailedDelegateCall",
          type: "error",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "implementation",
              type: "address",
            },
          ],
          name: "InvalidImplementation",
          type: "error",
        },
        {
          inputs: [],
          name: "NotInitializing",
          type: "error",
        },
        {
          inputs: [],
          name: "UUPSUnauthorizedCallContext",
          type: "error",
        },
        {
          inputs: [
            {
              internalType: "bytes32",
              name: "slot",
              type: "bytes32",
            },
          ],
          name: "UUPSUnsupportedProxiableUUID",
          type: "error",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: false,
              internalType: "uint64",
              name: "version",
              type: "uint64",
            },
          ],
          name: "Initialized",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: false,
              internalType: "enum ISortitionModule.Phase",
              name: "_phase",
              type: "uint8",
            },
          ],
          name: "NewPhase",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "_address",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_relativeAmount",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "bool",
              name: "_unlock",
              type: "bool",
            },
          ],
          name: "StakeLocked",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "_address",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_courtID",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_amount",
              type: "uint256",
            },
          ],
          name: "StakeSet",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "newImplementation",
              type: "address",
            },
          ],
          name: "Upgraded",
          type: "event",
        },
        {
          inputs: [],
          name: "core",
          outputs: [
            {
              internalType: "contract KlerosCoreUniversity",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          name: "createDisputeHook",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "bytes32",
              name: "_key",
              type: "bytes32",
            },
            {
              internalType: "bytes",
              name: "_extraData",
              type: "bytes",
            },
          ],
          name: "createTree",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "disputesWithoutJurors",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "bytes32",
              name: "",
              type: "bytes32",
            },
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          name: "draw",
          outputs: [
            {
              internalType: "address",
              name: "drawnAddress",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_juror",
              type: "address",
            },
            {
              internalType: "uint96",
              name: "_courtID",
              type: "uint96",
            },
          ],
          name: "getJurorBalance",
          outputs: [
            {
              internalType: "uint256",
              name: "totalStaked",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "totalLocked",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "stakedInCourt",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "nbCourts",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_juror",
              type: "address",
            },
          ],
          name: "getJurorCourtIDs",
          outputs: [
            {
              internalType: "uint96[]",
              name: "",
              type: "uint96[]",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "governor",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_governor",
              type: "address",
            },
            {
              internalType: "contract KlerosCoreUniversity",
              name: "_core",
              type: "address",
            },
          ],
          name: "initialize",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_juror",
              type: "address",
            },
          ],
          name: "isJurorStaked",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "account",
              type: "address",
            },
          ],
          name: "jurors",
          outputs: [
            {
              internalType: "uint256",
              name: "stakedPnk",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "lockedPnk",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_account",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "_relativeAmount",
              type: "uint256",
            },
          ],
          name: "lockStake",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_randomNumber",
              type: "uint256",
            },
          ],
          name: "notifyRandomNumber",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_account",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "_relativeAmount",
              type: "uint256",
            },
          ],
          name: "penalizeStake",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          name: "postDrawHook",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "proxiableUUID",
          outputs: [
            {
              internalType: "bytes32",
              name: "",
              type: "bytes32",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_account",
              type: "address",
            },
          ],
          name: "setJurorInactive",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_account",
              type: "address",
            },
            {
              internalType: "uint96",
              name: "_courtID",
              type: "uint96",
            },
            {
              internalType: "uint256",
              name: "_newStake",
              type: "uint256",
            },
            {
              internalType: "bool",
              name: "_alreadyTransferred",
              type: "bool",
            },
          ],
          name: "setStake",
          outputs: [
            {
              internalType: "uint256",
              name: "pnkDeposit",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "pnkWithdrawal",
              type: "uint256",
            },
            {
              internalType: "enum StakingResult",
              name: "stakingResult",
              type: "uint8",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_juror",
              type: "address",
            },
          ],
          name: "setTransientJuror",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_account",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "_relativeAmount",
              type: "uint256",
            },
          ],
          name: "unlockStake",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "newImplementation",
              type: "address",
            },
            {
              internalType: "bytes",
              name: "data",
              type: "bytes",
            },
          ],
          name: "upgradeToAndCall",
          outputs: [],
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_implementation",
              type: "address",
            },
            {
              internalType: "bytes",
              name: "_data",
              type: "bytes",
            },
          ],
          stateMutability: "nonpayable",
          type: "constructor",
        },
      ],
    },
    SortitionModuleUniversity_Implementation: {
      address: "0x5CAD621D69E0535422aCFaCC0017bC32beC7A486",
      abi: [
        {
          inputs: [],
          stateMutability: "nonpayable",
          type: "constructor",
        },
        {
          inputs: [],
          name: "AlreadyInitialized",
          type: "error",
        },
        {
          inputs: [],
          name: "FailedDelegateCall",
          type: "error",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "implementation",
              type: "address",
            },
          ],
          name: "InvalidImplementation",
          type: "error",
        },
        {
          inputs: [],
          name: "NotInitializing",
          type: "error",
        },
        {
          inputs: [],
          name: "UUPSUnauthorizedCallContext",
          type: "error",
        },
        {
          inputs: [
            {
              internalType: "bytes32",
              name: "slot",
              type: "bytes32",
            },
          ],
          name: "UUPSUnsupportedProxiableUUID",
          type: "error",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: false,
              internalType: "uint64",
              name: "version",
              type: "uint64",
            },
          ],
          name: "Initialized",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: false,
              internalType: "enum ISortitionModule.Phase",
              name: "_phase",
              type: "uint8",
            },
          ],
          name: "NewPhase",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "_address",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_relativeAmount",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "bool",
              name: "_unlock",
              type: "bool",
            },
          ],
          name: "StakeLocked",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "_address",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_courtID",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_amount",
              type: "uint256",
            },
          ],
          name: "StakeSet",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "newImplementation",
              type: "address",
            },
          ],
          name: "Upgraded",
          type: "event",
        },
        {
          inputs: [],
          name: "core",
          outputs: [
            {
              internalType: "contract KlerosCoreUniversity",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          name: "createDisputeHook",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "bytes32",
              name: "_key",
              type: "bytes32",
            },
            {
              internalType: "bytes",
              name: "_extraData",
              type: "bytes",
            },
          ],
          name: "createTree",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "disputesWithoutJurors",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "bytes32",
              name: "",
              type: "bytes32",
            },
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          name: "draw",
          outputs: [
            {
              internalType: "address",
              name: "drawnAddress",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_juror",
              type: "address",
            },
            {
              internalType: "uint96",
              name: "_courtID",
              type: "uint96",
            },
          ],
          name: "getJurorBalance",
          outputs: [
            {
              internalType: "uint256",
              name: "totalStaked",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "totalLocked",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "stakedInCourt",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "nbCourts",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_juror",
              type: "address",
            },
          ],
          name: "getJurorCourtIDs",
          outputs: [
            {
              internalType: "uint96[]",
              name: "",
              type: "uint96[]",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "governor",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_governor",
              type: "address",
            },
            {
              internalType: "contract KlerosCoreUniversity",
              name: "_core",
              type: "address",
            },
          ],
          name: "initialize",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_juror",
              type: "address",
            },
          ],
          name: "isJurorStaked",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "account",
              type: "address",
            },
          ],
          name: "jurors",
          outputs: [
            {
              internalType: "uint256",
              name: "stakedPnk",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "lockedPnk",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_account",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "_relativeAmount",
              type: "uint256",
            },
          ],
          name: "lockStake",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_randomNumber",
              type: "uint256",
            },
          ],
          name: "notifyRandomNumber",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_account",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "_relativeAmount",
              type: "uint256",
            },
          ],
          name: "penalizeStake",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          name: "postDrawHook",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "proxiableUUID",
          outputs: [
            {
              internalType: "bytes32",
              name: "",
              type: "bytes32",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_account",
              type: "address",
            },
          ],
          name: "setJurorInactive",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_account",
              type: "address",
            },
            {
              internalType: "uint96",
              name: "_courtID",
              type: "uint96",
            },
            {
              internalType: "uint256",
              name: "_newStake",
              type: "uint256",
            },
            {
              internalType: "bool",
              name: "_alreadyTransferred",
              type: "bool",
            },
          ],
          name: "setStake",
          outputs: [
            {
              internalType: "uint256",
              name: "pnkDeposit",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "pnkWithdrawal",
              type: "uint256",
            },
            {
              internalType: "enum StakingResult",
              name: "stakingResult",
              type: "uint8",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_juror",
              type: "address",
            },
          ],
          name: "setTransientJuror",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_account",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "_relativeAmount",
              type: "uint256",
            },
          ],
          name: "unlockStake",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "newImplementation",
              type: "address",
            },
            {
              internalType: "bytes",
              name: "data",
              type: "bytes",
            },
          ],
          name: "upgradeToAndCall",
          outputs: [],
          stateMutability: "payable",
          type: "function",
        },
      ],
    },
    SortitionModuleUniversity_Proxy: {
      address: "0x4B2c2d048921f694cCE3AEa35698c6B1f5fcbb79",
      abi: [
        {
          inputs: [
            {
              internalType: "address",
              name: "_implementation",
              type: "address",
            },
            {
              internalType: "bytes",
              name: "_data",
              type: "bytes",
            },
          ],
          stateMutability: "nonpayable",
          type: "constructor",
        },
        {
          stateMutability: "payable",
          type: "fallback",
        },
        {
          stateMutability: "payable",
          type: "receive",
        },
      ],
    },
    SortitionModule_Implementation: {
      address: "0xB37919A50d3BddA9982e3c84aA47e501c454364B",
      abi: [
        {
          inputs: [],
          stateMutability: "nonpayable",
          type: "constructor",
        },
        {
          inputs: [],
          name: "AlreadyInitialized",
          type: "error",
        },
        {
          inputs: [],
          name: "FailedDelegateCall",
          type: "error",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "implementation",
              type: "address",
            },
          ],
          name: "InvalidImplementation",
          type: "error",
        },
        {
          inputs: [],
          name: "NotInitializing",
          type: "error",
        },
        {
          inputs: [],
          name: "UUPSUnauthorizedCallContext",
          type: "error",
        },
        {
          inputs: [
            {
              internalType: "bytes32",
              name: "slot",
              type: "bytes32",
            },
          ],
          name: "UUPSUnsupportedProxiableUUID",
          type: "error",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: false,
              internalType: "uint64",
              name: "version",
              type: "uint64",
            },
          ],
          name: "Initialized",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: false,
              internalType: "enum ISortitionModule.Phase",
              name: "_phase",
              type: "uint8",
            },
          ],
          name: "NewPhase",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "_address",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_courtID",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_amount",
              type: "uint256",
            },
          ],
          name: "StakeDelayedAlreadyTransferredDeposited",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "_address",
              type: "address",
            },
            {
              indexed: true,
              internalType: "uint96",
              name: "_courtID",
              type: "uint96",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_amount",
              type: "uint256",
            },
          ],
          name: "StakeDelayedAlreadyTransferredWithdrawn",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "_address",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_courtID",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_amount",
              type: "uint256",
            },
          ],
          name: "StakeDelayedNotTransferred",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "_address",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_relativeAmount",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "bool",
              name: "_unlock",
              type: "bool",
            },
          ],
          name: "StakeLocked",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "_address",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_courtID",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_amount",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_amountAllCourts",
              type: "uint256",
            },
          ],
          name: "StakeSet",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "newImplementation",
              type: "address",
            },
          ],
          name: "Upgraded",
          type: "event",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_governor",
              type: "address",
            },
          ],
          name: "changeGovernor",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_maxDrawingTime",
              type: "uint256",
            },
          ],
          name: "changeMaxDrawingTime",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_minStakingTime",
              type: "uint256",
            },
          ],
          name: "changeMinStakingTime",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "contract RNG",
              name: "_rng",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "_rngLookahead",
              type: "uint256",
            },
          ],
          name: "changeRandomNumberGenerator",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "core",
          outputs: [
            {
              internalType: "contract KlerosCore",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          name: "createDisputeHook",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "bytes32",
              name: "_key",
              type: "bytes32",
            },
            {
              internalType: "bytes",
              name: "_extraData",
              type: "bytes",
            },
          ],
          name: "createTree",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "delayedStakeReadIndex",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "delayedStakeWriteIndex",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          name: "delayedStakes",
          outputs: [
            {
              internalType: "address",
              name: "account",
              type: "address",
            },
            {
              internalType: "uint96",
              name: "courtID",
              type: "uint96",
            },
            {
              internalType: "uint256",
              name: "stake",
              type: "uint256",
            },
            {
              internalType: "bool",
              name: "alreadyTransferred",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "disputesWithoutJurors",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "bytes32",
              name: "_key",
              type: "bytes32",
            },
            {
              internalType: "uint256",
              name: "_coreDisputeID",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_nonce",
              type: "uint256",
            },
          ],
          name: "draw",
          outputs: [
            {
              internalType: "address",
              name: "drawnAddress",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_iterations",
              type: "uint256",
            },
          ],
          name: "executeDelayedStakes",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_juror",
              type: "address",
            },
            {
              internalType: "uint96",
              name: "_courtID",
              type: "uint96",
            },
          ],
          name: "getJurorBalance",
          outputs: [
            {
              internalType: "uint256",
              name: "totalStaked",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "totalLocked",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "stakedInCourt",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "nbCourts",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_juror",
              type: "address",
            },
          ],
          name: "getJurorCourtIDs",
          outputs: [
            {
              internalType: "uint96[]",
              name: "",
              type: "uint96[]",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "governor",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_governor",
              type: "address",
            },
            {
              internalType: "contract KlerosCore",
              name: "_core",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "_minStakingTime",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_maxDrawingTime",
              type: "uint256",
            },
            {
              internalType: "contract RNG",
              name: "_rng",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "_rngLookahead",
              type: "uint256",
            },
          ],
          name: "initialize",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "initialize3",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_juror",
              type: "address",
            },
          ],
          name: "isJurorStaked",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "account",
              type: "address",
            },
          ],
          name: "jurors",
          outputs: [
            {
              internalType: "uint256",
              name: "stakedPnk",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "lockedPnk",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "lastPhaseChange",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "jurorAccount",
              type: "address",
            },
            {
              internalType: "uint96",
              name: "courtId",
              type: "uint96",
            },
          ],
          name: "latestDelayedStakeIndex",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_account",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "_relativeAmount",
              type: "uint256",
            },
          ],
          name: "lockStake",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "maxDrawingTime",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "minStakingTime",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_randomNumber",
              type: "uint256",
            },
          ],
          name: "notifyRandomNumber",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "passPhase",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_account",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "_relativeAmount",
              type: "uint256",
            },
          ],
          name: "penalizeStake",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "phase",
          outputs: [
            {
              internalType: "enum ISortitionModule.Phase",
              name: "",
              type: "uint8",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          name: "postDrawHook",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "proxiableUUID",
          outputs: [
            {
              internalType: "bytes32",
              name: "",
              type: "bytes32",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "randomNumber",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "randomNumberRequestBlock",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "rng",
          outputs: [
            {
              internalType: "contract RNG",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "rngLookahead",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_account",
              type: "address",
            },
          ],
          name: "setJurorInactive",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_account",
              type: "address",
            },
            {
              internalType: "uint96",
              name: "_courtID",
              type: "uint96",
            },
            {
              internalType: "uint256",
              name: "_newStake",
              type: "uint256",
            },
            {
              internalType: "bool",
              name: "_alreadyTransferred",
              type: "bool",
            },
          ],
          name: "setStake",
          outputs: [
            {
              internalType: "uint256",
              name: "pnkDeposit",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "pnkWithdrawal",
              type: "uint256",
            },
            {
              internalType: "enum StakingResult",
              name: "stakingResult",
              type: "uint8",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "bytes32",
              name: "_key",
              type: "bytes32",
            },
            {
              internalType: "bytes32",
              name: "_ID",
              type: "bytes32",
            },
          ],
          name: "stakeOf",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_juror",
              type: "address",
            },
            {
              internalType: "uint96",
              name: "_courtID",
              type: "uint96",
            },
          ],
          name: "stakeOf",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_account",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "_relativeAmount",
              type: "uint256",
            },
          ],
          name: "unlockStake",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "newImplementation",
              type: "address",
            },
            {
              internalType: "bytes",
              name: "data",
              type: "bytes",
            },
          ],
          name: "upgradeToAndCall",
          outputs: [],
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [],
          name: "version",
          outputs: [
            {
              internalType: "string",
              name: "",
              type: "string",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
      ],
    },
    SortitionModule_Proxy: {
      address: "0xb34651b65A40553C444c6F0D27286C80ec34fbfD",
      abi: [
        {
          inputs: [
            {
              internalType: "address",
              name: "_implementation",
              type: "address",
            },
            {
              internalType: "bytes",
              name: "_data",
              type: "bytes",
            },
          ],
          stateMutability: "nonpayable",
          type: "constructor",
        },
        {
          stateMutability: "payable",
          type: "fallback",
        },
        {
          stateMutability: "payable",
          type: "receive",
        },
      ],
    },
    TransactionBatcher: {
      address: "0x35f93986950804ac1F93519BF68C2a7Dd776db0E",
      abi: [
        {
          inputs: [
            {
              internalType: "address[]",
              name: "targets",
              type: "address[]",
            },
            {
              internalType: "uint256[]",
              name: "values",
              type: "uint256[]",
            },
            {
              internalType: "bytes[]",
              name: "datas",
              type: "bytes[]",
            },
          ],
          name: "batchSend",
          outputs: [],
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address[]",
              name: "targets",
              type: "address[]",
            },
            {
              internalType: "uint256[]",
              name: "values",
              type: "uint256[]",
            },
            {
              internalType: "bytes[]",
              name: "datas",
              type: "bytes[]",
            },
          ],
          name: "batchSendUnchecked",
          outputs: [],
          stateMutability: "payable",
          type: "function",
        },
      ],
    },
    WETH: {
      address: "0x3829A2486d53ee984a0ca2D76552715726b77138",
      abi: [
        {
          inputs: [
            {
              internalType: "string",
              name: "_name",
              type: "string",
            },
            {
              internalType: "string",
              name: "_symbol",
              type: "string",
            },
          ],
          stateMutability: "nonpayable",
          type: "constructor",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "owner",
              type: "address",
            },
            {
              indexed: true,
              internalType: "address",
              name: "spender",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "value",
              type: "uint256",
            },
          ],
          name: "Approval",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "from",
              type: "address",
            },
            {
              indexed: true,
              internalType: "address",
              name: "to",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "value",
              type: "uint256",
            },
          ],
          name: "Transfer",
          type: "event",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "owner",
              type: "address",
            },
            {
              internalType: "address",
              name: "spender",
              type: "address",
            },
          ],
          name: "allowance",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "spender",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "amount",
              type: "uint256",
            },
          ],
          name: "approve",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "account",
              type: "address",
            },
          ],
          name: "balanceOf",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "decimals",
          outputs: [
            {
              internalType: "uint8",
              name: "",
              type: "uint8",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "spender",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "subtractedValue",
              type: "uint256",
            },
          ],
          name: "decreaseAllowance",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "spender",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "addedValue",
              type: "uint256",
            },
          ],
          name: "increaseAllowance",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "name",
          outputs: [
            {
              internalType: "string",
              name: "",
              type: "string",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "symbol",
          outputs: [
            {
              internalType: "string",
              name: "",
              type: "string",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "totalSupply",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "to",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "amount",
              type: "uint256",
            },
          ],
          name: "transfer",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "from",
              type: "address",
            },
            {
              internalType: "address",
              name: "to",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "amount",
              type: "uint256",
            },
          ],
          name: "transferFrom",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
      ],
    },
    WETHFaucet: {
      address: "0x6F8C10E0030aDf5B8030a5E282F026ADdB6525fd",
      abi: [
        {
          inputs: [
            {
              internalType: "contract IERC20",
              name: "_token",
              type: "address",
            },
          ],
          stateMutability: "nonpayable",
          type: "constructor",
        },
        {
          inputs: [],
          name: "amount",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "balance",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_amount",
              type: "uint256",
            },
          ],
          name: "changeAmount",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_governor",
              type: "address",
            },
          ],
          name: "changeGovernor",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "governor",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "request",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "token",
          outputs: [
            {
              internalType: "contract IERC20",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "withdraw",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          name: "withdrewAlready",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
      ],
    },
    VeaInboxArbToEthDevnet: {
      address: "0xF6C5640de593fEf76129F1F1A863F7ddc65776C9",
      abi: [
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_epochPeriod",
              type: "uint256",
            },
            {
              internalType: "address",
              name: "_veaOutboxArbToEth",
              type: "address",
            },
          ],
          stateMutability: "nonpayable",
          type: "constructor",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: false,
              internalType: "bytes",
              name: "_nodeData",
              type: "bytes",
            },
          ],
          name: "MessageSent",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: false,
              internalType: "bytes32",
              name: "_snapshot",
              type: "bytes32",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_epoch",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint64",
              name: "_count",
              type: "uint64",
            },
          ],
          name: "SnapshotSaved",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "_epochSent",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "bytes32",
              name: "_ticketId",
              type: "bytes32",
            },
          ],
          name: "SnapshotSent",
          type: "event",
        },
        {
          inputs: [],
          name: "count",
          outputs: [
            {
              internalType: "uint64",
              name: "",
              type: "uint64",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_timestamp",
              type: "uint256",
            },
          ],
          name: "epochAt",
          outputs: [
            {
              internalType: "uint256",
              name: "epoch",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "epochFinalized",
          outputs: [
            {
              internalType: "uint256",
              name: "epoch",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "epochNow",
          outputs: [
            {
              internalType: "uint256",
              name: "epoch",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "epochPeriod",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "saveSnapshot",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_to",
              type: "address",
            },
            {
              internalType: "bytes4",
              name: "_fnSelector",
              type: "bytes4",
            },
            {
              internalType: "bytes",
              name: "_data",
              type: "bytes",
            },
          ],
          name: "sendMessage",
          outputs: [
            {
              internalType: "uint64",
              name: "",
              type: "uint64",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_epoch",
              type: "uint256",
            },
            {
              components: [
                {
                  internalType: "bytes32",
                  name: "stateRoot",
                  type: "bytes32",
                },
                {
                  internalType: "address",
                  name: "claimer",
                  type: "address",
                },
                {
                  internalType: "uint32",
                  name: "timestampClaimed",
                  type: "uint32",
                },
                {
                  internalType: "uint32",
                  name: "timestampVerification",
                  type: "uint32",
                },
                {
                  internalType: "uint32",
                  name: "blocknumberVerification",
                  type: "uint32",
                },
                {
                  internalType: "enum Party",
                  name: "honest",
                  type: "uint8",
                },
                {
                  internalType: "address",
                  name: "challenger",
                  type: "address",
                },
              ],
              internalType: "struct Claim",
              name: "_claim",
              type: "tuple",
            },
          ],
          name: "sendSnapshot",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "epoch",
              type: "uint256",
            },
          ],
          name: "snapshots",
          outputs: [
            {
              internalType: "bytes32",
              name: "",
              type: "bytes32",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "veaOutboxArbToEth",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
      ],
    },
    VeaInboxArbToEthTestnet: {
      address: "0xE12daFE59Bc3A996362d54b37DFd2BA9279cAd06",
      abi: [
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_epochPeriod",
              type: "uint256",
            },
            {
              internalType: "address",
              name: "_veaOutboxArbToEth",
              type: "address",
            },
          ],
          stateMutability: "nonpayable",
          type: "constructor",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: false,
              internalType: "bytes",
              name: "_nodeData",
              type: "bytes",
            },
          ],
          name: "MessageSent",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: false,
              internalType: "bytes32",
              name: "_snapshot",
              type: "bytes32",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_epoch",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint64",
              name: "_count",
              type: "uint64",
            },
          ],
          name: "SnapshotSaved",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "_epochSent",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "bytes32",
              name: "_ticketId",
              type: "bytes32",
            },
          ],
          name: "SnapshotSent",
          type: "event",
        },
        {
          inputs: [],
          name: "count",
          outputs: [
            {
              internalType: "uint64",
              name: "",
              type: "uint64",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_timestamp",
              type: "uint256",
            },
          ],
          name: "epochAt",
          outputs: [
            {
              internalType: "uint256",
              name: "epoch",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "epochFinalized",
          outputs: [
            {
              internalType: "uint256",
              name: "epoch",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "epochNow",
          outputs: [
            {
              internalType: "uint256",
              name: "epoch",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "epochPeriod",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "saveSnapshot",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_to",
              type: "address",
            },
            {
              internalType: "bytes4",
              name: "_fnSelector",
              type: "bytes4",
            },
            {
              internalType: "bytes",
              name: "_data",
              type: "bytes",
            },
          ],
          name: "sendMessage",
          outputs: [
            {
              internalType: "uint64",
              name: "",
              type: "uint64",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_epoch",
              type: "uint256",
            },
            {
              components: [
                {
                  internalType: "bytes32",
                  name: "stateRoot",
                  type: "bytes32",
                },
                {
                  internalType: "address",
                  name: "claimer",
                  type: "address",
                },
                {
                  internalType: "uint32",
                  name: "timestampClaimed",
                  type: "uint32",
                },
                {
                  internalType: "uint32",
                  name: "timestampVerification",
                  type: "uint32",
                },
                {
                  internalType: "uint32",
                  name: "blocknumberVerification",
                  type: "uint32",
                },
                {
                  internalType: "enum Party",
                  name: "honest",
                  type: "uint8",
                },
                {
                  internalType: "address",
                  name: "challenger",
                  type: "address",
                },
              ],
              internalType: "struct Claim",
              name: "_claim",
              type: "tuple",
            },
          ],
          name: "sendSnapshot",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "epoch",
              type: "uint256",
            },
          ],
          name: "snapshots",
          outputs: [
            {
              internalType: "bytes32",
              name: "",
              type: "bytes32",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "veaOutboxArbToEth",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
      ],
    },
    VeaInboxArbToGnosisDevnet: {
      address: "0xF6286b9C6c7F1B33Ea976FA43434027c7b8421A7",
      abi: [
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_epochPeriod",
              type: "uint256",
            },
            {
              internalType: "address",
              name: "_routerArbToGnosis",
              type: "address",
            },
          ],
          stateMutability: "nonpayable",
          type: "constructor",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: false,
              internalType: "bytes",
              name: "_nodeData",
              type: "bytes",
            },
          ],
          name: "MessageSent",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: false,
              internalType: "bytes32",
              name: "_snapshot",
              type: "bytes32",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_epoch",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint64",
              name: "_count",
              type: "uint64",
            },
          ],
          name: "SnapshotSaved",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "_epochSent",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "bytes32",
              name: "_ticketId",
              type: "bytes32",
            },
          ],
          name: "SnapshotSent",
          type: "event",
        },
        {
          inputs: [],
          name: "count",
          outputs: [
            {
              internalType: "uint64",
              name: "",
              type: "uint64",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_timestamp",
              type: "uint256",
            },
          ],
          name: "epochAt",
          outputs: [
            {
              internalType: "uint256",
              name: "epoch",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "epochFinalized",
          outputs: [
            {
              internalType: "uint256",
              name: "epoch",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "epochNow",
          outputs: [
            {
              internalType: "uint256",
              name: "epoch",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "epochPeriod",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "routerArbToGnosis",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "saveSnapshot",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_to",
              type: "address",
            },
            {
              internalType: "bytes4",
              name: "_fnSelector",
              type: "bytes4",
            },
            {
              internalType: "bytes",
              name: "_data",
              type: "bytes",
            },
          ],
          name: "sendMessage",
          outputs: [
            {
              internalType: "uint64",
              name: "",
              type: "uint64",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_epoch",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_gasLimit",
              type: "uint256",
            },
            {
              components: [
                {
                  internalType: "bytes32",
                  name: "stateRoot",
                  type: "bytes32",
                },
                {
                  internalType: "address",
                  name: "claimer",
                  type: "address",
                },
                {
                  internalType: "uint32",
                  name: "timestampClaimed",
                  type: "uint32",
                },
                {
                  internalType: "uint32",
                  name: "timestampVerification",
                  type: "uint32",
                },
                {
                  internalType: "uint32",
                  name: "blocknumberVerification",
                  type: "uint32",
                },
                {
                  internalType: "enum Party",
                  name: "honest",
                  type: "uint8",
                },
                {
                  internalType: "address",
                  name: "challenger",
                  type: "address",
                },
              ],
              internalType: "struct Claim",
              name: "_claim",
              type: "tuple",
            },
          ],
          name: "sendSnapshot",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "epoch",
              type: "uint256",
            },
          ],
          name: "snapshots",
          outputs: [
            {
              internalType: "bytes32",
              name: "",
              type: "bytes32",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
      ],
    },
    VeaInboxArbToGnosisTestnet: {
      address: "0x62403e9Fbac618301175C89fb21920e4FF235A6a",
      abi: [
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_epochPeriod",
              type: "uint256",
            },
            {
              internalType: "address",
              name: "_routerArbToGnosis",
              type: "address",
            },
          ],
          stateMutability: "nonpayable",
          type: "constructor",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: false,
              internalType: "bytes",
              name: "_nodeData",
              type: "bytes",
            },
          ],
          name: "MessageSent",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: false,
              internalType: "bytes32",
              name: "_snapshot",
              type: "bytes32",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_epoch",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint64",
              name: "_count",
              type: "uint64",
            },
          ],
          name: "SnapshotSaved",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "_epochSent",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "bytes32",
              name: "_ticketId",
              type: "bytes32",
            },
          ],
          name: "SnapshotSent",
          type: "event",
        },
        {
          inputs: [],
          name: "count",
          outputs: [
            {
              internalType: "uint64",
              name: "",
              type: "uint64",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_timestamp",
              type: "uint256",
            },
          ],
          name: "epochAt",
          outputs: [
            {
              internalType: "uint256",
              name: "epoch",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "epochFinalized",
          outputs: [
            {
              internalType: "uint256",
              name: "epoch",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "epochNow",
          outputs: [
            {
              internalType: "uint256",
              name: "epoch",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "epochPeriod",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "routerArbToGnosis",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "saveSnapshot",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_to",
              type: "address",
            },
            {
              internalType: "bytes4",
              name: "_fnSelector",
              type: "bytes4",
            },
            {
              internalType: "bytes",
              name: "_data",
              type: "bytes",
            },
          ],
          name: "sendMessage",
          outputs: [
            {
              internalType: "uint64",
              name: "",
              type: "uint64",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_epoch",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_gasLimit",
              type: "uint256",
            },
            {
              components: [
                {
                  internalType: "bytes32",
                  name: "stateRoot",
                  type: "bytes32",
                },
                {
                  internalType: "address",
                  name: "claimer",
                  type: "address",
                },
                {
                  internalType: "uint32",
                  name: "timestampClaimed",
                  type: "uint32",
                },
                {
                  internalType: "uint32",
                  name: "timestampVerification",
                  type: "uint32",
                },
                {
                  internalType: "uint32",
                  name: "blocknumberVerification",
                  type: "uint32",
                },
                {
                  internalType: "enum Party",
                  name: "honest",
                  type: "uint8",
                },
                {
                  internalType: "address",
                  name: "challenger",
                  type: "address",
                },
              ],
              internalType: "struct Claim",
              name: "_claim",
              type: "tuple",
            },
          ],
          name: "sendSnapshot",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "epoch",
              type: "uint256",
            },
          ],
          name: "snapshots",
          outputs: [
            {
              internalType: "bytes32",
              name: "",
              type: "bytes32",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
      ],
    },
  },
} as const;
