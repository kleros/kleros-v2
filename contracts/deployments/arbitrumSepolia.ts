export default {
  name: "arbitrumSepolia",
  chainId: "421614",
  contracts: {
    ArbitrableExample: {
      address: "0xE22500Fa27f696d06702367246bd17Bd2C8a4c5d",
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
              name: "_arbitrableDisputeID",
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
              name: "_externalDisputeID",
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
      address: "0x991d2df165670b9cac3B022f4B68D65b664222ea",
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
    DAI: {
      address: "0xc34aeFEa232956542C5b2f2EE55fD5c378B35c03",
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
      address: "0x1Fa58B52326488D62A406E71DBaD839560e810fF",
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
      address: "0x8078C2A3bf93f6f69BDD4D38233E7e219eA1914e",
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
    DisputeKitClassic_Implementation: {
      address: "0x2507018D785CE92115CfebE0d92CC496C42e99b7",
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
    DisputeKitClassic_Proxy: {
      address: "0x8078C2A3bf93f6f69BDD4D38233E7e219eA1914e",
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
      address: "0x48e052B4A6dC4F30e90930F1CeaAFd83b3981EB3",
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
              name: "_arbitrableDisputeID",
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
              name: "_externalDisputeID",
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
      address: "0x553dcbF6aB3aE06a1064b5200Df1B5A9fB403d3c",
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
      address: "0x15E5964C7751dF8563eA4bC000301582C79BC454",
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
      ],
    },
    DisputeTemplateRegistry_Proxy: {
      address: "0x553dcbF6aB3aE06a1064b5200Df1B5A9fB403d3c",
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
    Escrow: {
      address: "0xF1a7Cd3115F5852966430f8E3877D2221F074A2e",
      abi: [
        {
          inputs: [
            {
              internalType: "contract IArbitratorV2",
              name: "_arbitrator",
              type: "address",
            },
            {
              internalType: "bytes",
              name: "_arbitratorExtraData",
              type: "bytes",
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
              internalType: "contract IDisputeTemplateRegistry",
              name: "_templateRegistry",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "_feeTimeout",
              type: "uint256",
            },
          ],
          stateMutability: "nonpayable",
          type: "constructor",
        },
        {
          inputs: [],
          name: "ArbitratorOnly",
          type: "error",
        },
        {
          inputs: [],
          name: "BuyerFeeNotCoverArbitrationCosts",
          type: "error",
        },
        {
          inputs: [],
          name: "BuyerOnly",
          type: "error",
        },
        {
          inputs: [],
          name: "DeadlineNotPassed",
          type: "error",
        },
        {
          inputs: [],
          name: "DisputeAlreadyCreatedOrTransactionAlreadyExecuted",
          type: "error",
        },
        {
          inputs: [],
          name: "DisputeAlreadyResolved",
          type: "error",
        },
        {
          inputs: [],
          name: "GovernorOnly",
          type: "error",
        },
        {
          inputs: [],
          name: "InvalidRuling",
          type: "error",
        },
        {
          inputs: [],
          name: "MaximumPaymentAmountExceeded",
          type: "error",
        },
        {
          inputs: [],
          name: "NotWaitingForBuyerFees",
          type: "error",
        },
        {
          inputs: [],
          name: "NotWaitingForSellerFees",
          type: "error",
        },
        {
          inputs: [],
          name: "SellerFeeNotCoverArbitrationCosts",
          type: "error",
        },
        {
          inputs: [],
          name: "SellerOnly",
          type: "error",
        },
        {
          inputs: [],
          name: "TimeoutNotPassed",
          type: "error",
        },
        {
          inputs: [],
          name: "TransactionDisputed",
          type: "error",
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
              name: "_arbitrableDisputeID",
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
              internalType: "uint256",
              name: "_transactionID",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "enum Escrow.Party",
              name: "_party",
              type: "uint8",
            },
          ],
          name: "HasToPayFee",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "_transactionID",
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
              internalType: "address",
              name: "_party",
              type: "address",
            },
          ],
          name: "Payment",
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
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "_transactionID",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "address",
              name: "_buyer",
              type: "address",
            },
            {
              indexed: true,
              internalType: "address",
              name: "_seller",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_amount",
              type: "uint256",
            },
          ],
          name: "TransactionCreated",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "_transactionID",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "enum Escrow.Resolution",
              name: "_resolution",
              type: "uint8",
            },
          ],
          name: "TransactionResolved",
          type: "event",
        },
        {
          inputs: [],
          name: "AMOUNT_OF_CHOICES",
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
              internalType: "uint256",
              name: "_timeoutPayment",
              type: "uint256",
            },
            {
              internalType: "address payable",
              name: "_seller",
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
          ],
          name: "createTransaction",
          outputs: [
            {
              internalType: "uint256",
              name: "transactionID",
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
          name: "disputeIDtoTransactionID",
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
              name: "_transactionID",
              type: "uint256",
            },
          ],
          name: "executeTransaction",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "feeTimeout",
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
          name: "getCountTransactions",
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
              name: "_transactionID",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_amount",
              type: "uint256",
            },
          ],
          name: "pay",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_transactionID",
              type: "uint256",
            },
          ],
          name: "payArbitrationFeeByBuyer",
          outputs: [],
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_transactionID",
              type: "uint256",
            },
          ],
          name: "payArbitrationFeeBySeller",
          outputs: [],
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_transactionID",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_amountReimbursed",
              type: "uint256",
            },
          ],
          name: "reimburse",
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
          inputs: [
            {
              internalType: "uint256",
              name: "_transactionID",
              type: "uint256",
            },
          ],
          name: "timeOutByBuyer",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_transactionID",
              type: "uint256",
            },
          ],
          name: "timeOutBySeller",
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
          name: "transactions",
          outputs: [
            {
              internalType: "address payable",
              name: "buyer",
              type: "address",
            },
            {
              internalType: "address payable",
              name: "seller",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "amount",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "deadline",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "disputeID",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "buyerFee",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "sellerFee",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "lastFeePaymentTime",
              type: "uint256",
            },
            {
              internalType: "string",
              name: "templateData",
              type: "string",
            },
            {
              internalType: "string",
              name: "templateDataMappings",
              type: "string",
            },
            {
              internalType: "enum Escrow.Status",
              name: "status",
              type: "uint8",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
      ],
    },
    EvidenceModule: {
      address: "0xE4066AE16685F66e30fb22e932B67E49220095c0",
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
      address: "0xD8609345DEe222051337b3A8335581Cc630Df2E9",
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
      ],
    },
    EvidenceModule_Proxy: {
      address: "0xE4066AE16685F66e30fb22e932B67E49220095c0",
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
      address: "0x33d0b8879368acD8ca868e656Ade97bB97b90468",
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
          name: "StakingFailed",
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
              internalType: "enum KlerosCore.Period",
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
              internalType: "enum KlerosCore.Period",
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
              internalType: "struct KlerosCore.Round",
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
              internalType: "contract ISortitionModule",
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
    KlerosCore_Implementation: {
      address: "0x6FDc191b55a03e840b36793e433A932EeCEa40BE",
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
          name: "StakingFailed",
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
              internalType: "enum KlerosCore.Period",
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
              internalType: "enum KlerosCore.Period",
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
              internalType: "struct KlerosCore.Round",
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
              internalType: "contract ISortitionModule",
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
    KlerosCore_Proxy: {
      address: "0x33d0b8879368acD8ca868e656Ade97bB97b90468",
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
      address: "0x0273512759B5E80031725332da12E91E9F8Bf667",
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
      address: "0xb177AC8827146AC74C412688c6b10676ca170096",
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
      address: "0xd543D50dcba2c3E067296210D64c8F91206Df908",
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
      ],
    },
    PolicyRegistry_Proxy: {
      address: "0xb177AC8827146AC74C412688c6b10676ca170096",
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
    RandomizerRNG: {
      address: "0xaE7F3AcA5c1E40D5E51eE61e20929bbDA0CAf4DC",
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
          name: "callbackGasLimit",
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
              internalType: "contract IRandomizer",
              name: "_randomizer",
              type: "address",
            },
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
          inputs: [],
          name: "randomizer",
          outputs: [
            {
              internalType: "contract IRandomizer",
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
              name: "_id",
              type: "uint256",
            },
            {
              internalType: "bytes32",
              name: "_value",
              type: "bytes32",
            },
          ],
          name: "randomizerCallback",
          outputs: [],
          stateMutability: "nonpayable",
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
          name: "randomizerWithdraw",
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
          inputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          name: "requesterToID",
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
              name: "_callbackGasLimit",
              type: "uint256",
            },
          ],
          name: "setCallbackGasLimit",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_randomizer",
              type: "address",
            },
          ],
          name: "setRandomizer",
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
    RandomizerRNG_Implementation: {
      address: "0x121F321f8F803fb88A895b969D6E26C672121149",
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
          name: "callbackGasLimit",
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
              internalType: "contract IRandomizer",
              name: "_randomizer",
              type: "address",
            },
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
          inputs: [],
          name: "randomizer",
          outputs: [
            {
              internalType: "contract IRandomizer",
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
              name: "_id",
              type: "uint256",
            },
            {
              internalType: "bytes32",
              name: "_value",
              type: "bytes32",
            },
          ],
          name: "randomizerCallback",
          outputs: [],
          stateMutability: "nonpayable",
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
          name: "randomizerWithdraw",
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
          inputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          name: "requesterToID",
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
              name: "_callbackGasLimit",
              type: "uint256",
            },
          ],
          name: "setCallbackGasLimit",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_randomizer",
              type: "address",
            },
          ],
          name: "setRandomizer",
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
    RandomizerRNG_Proxy: {
      address: "0xaE7F3AcA5c1E40D5E51eE61e20929bbDA0CAf4DC",
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
    SortitionModule: {
      address: "0x3645F9e08D80E47c82aD9E33fCB4EA703822C831",
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
          name: "StakeDelayedAlreadyTransferred",
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
          name: "DEFAULT_K",
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
          name: "MAX_STAKE_PATHS",
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
              name: "",
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
              name: "",
              type: "address",
            },
            {
              internalType: "uint96",
              name: "",
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
              internalType: "bool",
              name: "succeeded",
              type: "bool",
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
    SortitionModule_Implementation: {
      address: "0xAf48e32f89339438572a04455b1C4B2fF1659c8f",
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
          name: "StakeDelayedAlreadyTransferred",
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
          name: "DEFAULT_K",
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
          name: "MAX_STAKE_PATHS",
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
              name: "",
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
              name: "",
              type: "address",
            },
            {
              internalType: "uint96",
              name: "",
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
              internalType: "bool",
              name: "succeeded",
              type: "bool",
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
      ],
    },
    SortitionModule_Proxy: {
      address: "0x3645F9e08D80E47c82aD9E33fCB4EA703822C831",
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
    WETH: {
      address: "0xAEE953CC26DbDeA52beBE3F97f281981f2B9d511",
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
      address: "0x922B84134e41BC5c9EDE7D5EFCE22Ba3D0e71835",
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
  },
} as const;
