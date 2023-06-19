//SPDX-License-Identifier: MIT

/**
 *  @authors: [@malatrax]
 *  @reviewers: []
 *  @auditors: []
 *  @bounties: []
 *  @deployments: []
 */
pragma solidity 0.8.18;

import "./RNG.sol";
import "./VRFConsumerBaseV2.sol";
import "./interfaces/VRFCoordinatorV2Interface.sol";

// Interface to call passPhase in the callback function
interface ISortitionModule {
    function passPhase() external;
}

/**
 * @title Random Number Generator using Chainlink Verifiable Resolution Mechanism v2 on Arbitrum - Subscription Method - Consumer
 * @author Simon Malatrait <simon.malatrait@grenoble-inp.org>
 * @dev This contract implements the RNG standard and inherits from VRFConsumerBaseV2 to use Chainlink Verifiable Randomness Mechanism.
 * @dev It allows to store the random number associated to the requests made.
 * @dev Chainlink Subscription Method Documentation: https://docs.chain.link/vrf/v2/subscription
 * @dev Chainlink Subscription Method Network Parameters: https://docs.chain.link/vrf/v2/subscription/supported-networks#arbitrum-mainnet
 * @dev For SECURITY CONSIDERATIONS, you might also have look to: https://github.com/smartcontractkit/chainlink/blob/develop/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol
 * @dev For SECURITY CONSIDERATIONS, you might also have look to: https://github.com/smartcontractkit/chainlink/blob/develop/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol
 */
contract VRFConsumerV2 is VRFConsumerBaseV2, RNG {
    // ************************************* //
    // *              Events               * //
    // ************************************* //

    /**
     * @dev Emitted when a request is sent to the VRF Coordinator
     * @param requestId The ID of the request
     * @param numWords The number of random values requested
     */
    event RequestSent(uint256 indexed requestId, uint32 numWords);

    /**
     * Emitted when a request has been fulfilled.
     * @param requestId The ID of the request
     * @param randomWords The random values answering the request.
     */
    event RequestFulfilled(uint256 indexed requestId, uint256[] randomWords);

    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    address public governor;
    bytes32 public keyHash;
    VRFCoordinatorV2Interface public vrfCoordinator;
    uint64 public subscriptionId;
    uint32 public callbackGasLimit;
    ISortitionModule public sortitionModule;
    uint32 public numWords;
    uint16 public requestConfirmations;
    uint256 public lastRequestId;

    mapping(uint256 => uint256) public requestsToRandomWords; // s_requests[requestId] = randomWord

    // ************************************* //
    // *        Function Modifiers         * //
    // ************************************* //

    modifier onlyBySortitionModule() {
        require(msg.sender == address(sortitionModule), "Access not allowed: SortitionModule only");
        _;
    }

    modifier onlyByGovernor() {
        require(msg.sender == governor, "Access not allowed: Governor only");
        _;
    }

    // ************************************* //
    // *            Constructor            * //
    // ************************************* //

    /**
     * @dev Constructs the ChainlinkRNG contract.
     * @param _governor The Governor of the contract.
     * @param _vrfCoordinator The address of the VRFCoordinator contract.
     * @param _sortitionModule The address of the SortitionModule contract.
     * @param _keyHash The gas lane key hash value - Defines the maximum gas price you are willing to pay for a request in wei (ID of the off-chain VRF job).
     * @param _subscriptionId The unique identifier of the subscription used for funding requests.
     * @param _requestConfirmations How many confirmations the Chainlink node should wait before responding.
     * @param _callbackGasLimit The limit for how much gas to use for the callback request to the contract's fulfillRandomWords() function.
     * @param _numWords How many random values to request.
     * @dev https://docs.chain.link/vrf/v2/subscription/examples/get-a-random-number#analyzing-the-contract
     */
    constructor(
        address _governor,
        address _vrfCoordinator,
        address _sortitionModule,
        bytes32 _keyHash,
        uint64 _subscriptionId,
        uint16 _requestConfirmations,
        uint32 _callbackGasLimit,
        uint32 _numWords
    ) VRFConsumerBaseV2(_vrfCoordinator) {
        governor = _governor;
        vrfCoordinator = VRFCoordinatorV2Interface(_vrfCoordinator);
        sortitionModule = ISortitionModule(_sortitionModule);
        keyHash = _keyHash;
        subscriptionId = _subscriptionId;
        requestConfirmations = _requestConfirmations;
        callbackGasLimit = _callbackGasLimit;
        numWords = _numWords;
    }

    // ************************************* //
    // *             Governance            * //
    // ************************************* //

    /**
     * @dev Changes the `vrfCoordinator` storage variable.
     * @param _vrfCoordinator The new value for the `vrfCoordinator` storage variable.
     */
    function changeVrfCoordinator(address _vrfCoordinator) external onlyByGovernor {
        vrfCoordinator = VRFCoordinatorV2Interface(_vrfCoordinator);
    }

    /**
     * @dev Changes the `sortitionModule` storage variable.
     * @param _sortitionModule The new value for the `sortitionModule` storage variable.
     */
    function changeSortitionModule(address _sortitionModule) external onlyByGovernor {
        sortitionModule = ISortitionModule(_sortitionModule);
    }

    /**
     * @dev Changes the `keyHash` storage variable.
     * @param _keyHash The new value for the `keyHash` storage variable.
     */
    function changeKeyHash(bytes32 _keyHash) external onlyByGovernor {
        keyHash = _keyHash;
    }

    /**
     * @dev Changes the `subscriptionId` storage variable.
     * @param _subscriptionId The new value for the `subscriptionId` storage variable.
     */
    function changeSubscriptionId(uint64 _subscriptionId) external onlyByGovernor {
        subscriptionId = _subscriptionId;
    }

    /**
     * @dev Changes the `requestConfirmations` storage variable.
     * @param _requestConfirmations The new value for the `requestConfirmations` storage variable.
     */
    function changeRequestConfirmations(uint16 _requestConfirmations) external onlyByGovernor {
        requestConfirmations = _requestConfirmations;
    }

    /**
     * @dev Changes the `callbackGasLimit` storage variable.
     * @param _callbackGasLimit The new value for the `callbackGasLimit` storage variable.
     */
    function changeCallbackGasLimit(uint32 _callbackGasLimit) external onlyByGovernor {
        callbackGasLimit = _callbackGasLimit;
    }

    /**
     * @dev Changes the `numWords` storage variable.
     * @param _numWords The new value for the `numWords` storage variable.
     */
    function changeNumWord(uint32 _numWords) external onlyByGovernor {
        numWords = _numWords;
    }

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /**
     * @dev Submit a request to the VRF Coordinator contract with the specified parameters.
     * @dev Assumes the subscription is funded sufficiently; "Words" refers to unit of data in Computer Science
     * Note Buffer of one requestId, as in RandomizerRNG, which should be enough with the callback function.
     */
    function requestRandomness(uint256 /* _block */) external onlyBySortitionModule {
        // Will revert if subscription is not set and funded.
        uint256 requestId = vrfCoordinator.requestRandomWords(
            keyHash,
            subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            numWords
        );
        lastRequestId = requestId;
        emit RequestSent(requestId, numWords);
    }

    // ************************************* //
    // *            Internal               * //
    // ************************************* //

    /**
     * @dev Callback function used by VRF Coordinator
     * @dev Stores the random number given by the VRF Coordinator and calls passPhase function on SortitionModule.
     * @param _requestId The same request Id initially returned by `vrfCoordinator.requestRandomWords` and stored in the `lastRequestId` storage variable.
     * @param _randomWords - array of random results from VRF Coordinator
     */
    function fulfillRandomWords(uint256 _requestId, uint256[] memory _randomWords) internal override {
        requestsToRandomWords[_requestId] = _randomWords[0];
        emit RequestFulfilled(_requestId, _randomWords);
        sortitionModule.passPhase();
    }

    // ************************************* //
    // *           Public Views            * //
    // ************************************* //

    /**
     * @dev Get the random value associated to `lastRequestId`
     * @return randomNumber The random number. If the value is not ready or has not been required it returns 0.
     */
    function receiveRandomness(uint256 /* _block */) external view returns (uint256 randomNumber) {
        randomNumber = requestsToRandomWords[lastRequestId];
    }
}
