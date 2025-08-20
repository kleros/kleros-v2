// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import {VRFConsumerBaseV2Plus, IVRFCoordinatorV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";

import "./IRNG.sol";

/// @title Random Number Generator that uses Chainlink VRF v2.5
/// https://blog.chain.link/introducing-vrf-v2-5/
contract ChainlinkRNG is IRNG, VRFConsumerBaseV2Plus {
    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    address public governor; // The address that can withdraw funds.
    address public consumer; // The address that can request random numbers.
    bytes32 public keyHash; // The gas lane key hash value - Defines the maximum gas price you are willing to pay for a request in wei (ID of the off-chain VRF job).
    uint256 public subscriptionId; // The unique identifier of the subscription used for funding requests.
    uint16 public requestConfirmations; // How many confirmations the Chainlink node should wait before responding.
    // 22 bytes remaining in slot
    uint32 public callbackGasLimit; // Gas limit for the Chainlink callback.
    uint256 public lastRequestId; // The last request ID.
    mapping(uint256 requestId => uint256 number) public randomNumbers; // randomNumbers[requestID] is the random number for this request id, 0 otherwise.

    // ************************************* //
    // *              Events               * //
    // ************************************* //

    /// @dev Emitted when a request is sent to the VRF Coordinator
    /// @param _requestId The ID of the request
    event RequestSent(uint256 indexed _requestId);

    /// Emitted when a request has been fulfilled.
    /// @param _requestId The ID of the request
    /// @param _randomWord The random value answering the request.
    event RequestFulfilled(uint256 indexed _requestId, uint256 _randomWord);

    // ************************************* //
    // *        Function Modifiers         * //
    // ************************************* //

    modifier onlyByGovernor() {
        if (governor != msg.sender) revert GovernorOnly();
        _;
    }

    modifier onlyByConsumer() {
        if (consumer != msg.sender) revert ConsumerOnly();
        _;
    }

    // ************************************* //
    // *            Constructor            * //
    // ************************************* //

    /// @dev Constructor, initializing the implementation to reduce attack surface.
    /// @param _governor The Governor of the contract.
    /// @param _consumer The address that can request random numbers.
    /// @param _vrfCoordinator The address of the VRFCoordinator contract.
    /// @param _keyHash The gas lane key hash value - Defines the maximum gas price you are willing to pay for a request in wei (ID of the off-chain VRF job).
    /// @param _subscriptionId The unique identifier of the subscription used for funding requests.
    /// @param _requestConfirmations How many confirmations the Chainlink node should wait before responding.
    /// @param _callbackGasLimit The limit for how much gas to use for the callback request to the contract's fulfillRandomWords() function.
    /// @dev https://docs.chain.link/vrf/v2-5/subscription/get-a-random-number
    constructor(
        address _governor,
        address _consumer,
        address _vrfCoordinator,
        bytes32 _keyHash,
        uint256 _subscriptionId,
        uint16 _requestConfirmations,
        uint32 _callbackGasLimit
    ) VRFConsumerBaseV2Plus(_vrfCoordinator) {
        governor = _governor;
        consumer = _consumer;
        keyHash = _keyHash;
        subscriptionId = _subscriptionId;
        requestConfirmations = _requestConfirmations;
        callbackGasLimit = _callbackGasLimit;
    }

    // ************************************* //
    // *             Governance            * //
    // ************************************* //

    /// @dev Changes the governor of the contract.
    /// @param _governor The new governor.
    function changeGovernor(address _governor) external onlyByGovernor {
        governor = _governor;
    }

    /// @dev Changes the consumer of the RNG.
    /// @param _consumer The new consumer.
    function changeConsumer(address _consumer) external onlyByGovernor {
        consumer = _consumer;
    }

    /// @dev Changes the VRF Coordinator of the contract.
    /// @param _vrfCoordinator The new VRF Coordinator.
    function changeVrfCoordinator(address _vrfCoordinator) external onlyByGovernor {
        s_vrfCoordinator = IVRFCoordinatorV2Plus(_vrfCoordinator);
        emit CoordinatorSet(_vrfCoordinator);
    }

    /// @dev Changes the key hash of the contract.
    /// @param _keyHash The new key hash.
    function changeKeyHash(bytes32 _keyHash) external onlyByGovernor {
        keyHash = _keyHash;
    }

    /// @dev Changes the subscription ID of the contract.
    /// @param _subscriptionId The new subscription ID.
    function changeSubscriptionId(uint256 _subscriptionId) external onlyByGovernor {
        subscriptionId = _subscriptionId;
    }

    /// @dev Changes the request confirmations of the contract.
    /// @param _requestConfirmations The new request confirmations.
    function changeRequestConfirmations(uint16 _requestConfirmations) external onlyByGovernor {
        requestConfirmations = _requestConfirmations;
    }

    /// @dev Changes the callback gas limit of the contract.
    /// @param _callbackGasLimit The new callback gas limit.
    function changeCallbackGasLimit(uint32 _callbackGasLimit) external onlyByGovernor {
        callbackGasLimit = _callbackGasLimit;
    }

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /// @dev Request a random number. Consumer only.
    function requestRandomness() external override onlyByConsumer {
        // Will revert if subscription is not set and funded.
        uint256 requestId = s_vrfCoordinator.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash: keyHash,
                subId: subscriptionId,
                requestConfirmations: requestConfirmations,
                callbackGasLimit: callbackGasLimit,
                numWords: 1,
                extraArgs: VRFV2PlusClient._argsToBytes(
                    // Set nativePayment to true to pay for VRF requests with ETH instead of LINK
                    VRFV2PlusClient.ExtraArgsV1({nativePayment: true})
                )
            })
        );
        lastRequestId = requestId;
        emit RequestSent(requestId);
    }

    /// @dev Callback function called by the VRF Coordinator when the random value is generated.
    /// @param _requestId The ID of the request.
    /// @param _randomWords The random values answering the request.
    function fulfillRandomWords(uint256 _requestId, uint256[] calldata _randomWords) internal override {
        // Access control is handled by the parent VRFCoordinator.rawFulfillRandomWords()
        randomNumbers[_requestId] = _randomWords[0];
        emit RequestFulfilled(_requestId, _randomWords[0]);
    }

    // ************************************* //
    // *           Public Views            * //
    // ************************************* //

    /// @dev Return the random number.
    /// @return randomNumber The random number or 0 if it is not ready or has not been requested.
    function receiveRandomness() external view override returns (uint256 randomNumber) {
        randomNumber = randomNumbers[lastRequestId];
    }
}
