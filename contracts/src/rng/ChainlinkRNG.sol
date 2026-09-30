// SPDX-License-Identifier: MIT

pragma solidity ^0.8.28;

import {IVRFCoordinatorV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/interfaces/IVRFCoordinatorV2Plus.sol";
import {IVRFMigratableConsumerV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/interfaces/IVRFMigratableConsumerV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";
import "./IRNG.sol";

/// @title Random Number Generator that uses Chainlink VRF v2.5
/// @dev https://blog.chain.link/introducing-vrf-v2-5/
/// @dev Inlines the consumer logic from Chainlink's VRFConsumerBaseV2Plus:
/// https://github.com/smartcontractkit/chainlink-evm/blob/develop/contracts/src/v0.8/vrf/VRFConsumerBaseV2Plus.sol
/// with the `ConfirmedOwner` dependency removed.
contract ChainlinkRNG is IRNG, IVRFMigratableConsumerV2Plus {
    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    address public owner; // Owner address.
    // s_vrfCoordinator is used by consumers to make requests to vrfCoordinator,
    // so that coordinator reference is updated after migration.
    IVRFCoordinatorV2Plus public s_vrfCoordinator;

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

    /// @notice Emitted when a request is sent to the VRF Coordinator
    /// @param _requestId The ID of the request
    event RequestSent(uint256 indexed _requestId);

    /// Emitted when a request has been fulfilled.
    /// @param _requestId The ID of the request
    /// @param _randomWord The random value answering the request.
    event RequestFulfilled(uint256 indexed _requestId, uint256 _randomWord);

    // ************************************* //
    // *        Function Modifiers         * //
    // ************************************* //

    modifier onlyOwner() {
        require(owner == msg.sender, OwnerOnly());
        _;
    }

    modifier onlyConsumer() {
        require(consumer == msg.sender, ConsumerOnly());
        _;
    }

    modifier onlyOwnerOrCoordinator() {
        if (msg.sender != owner && msg.sender != address(s_vrfCoordinator)) {
            revert OnlyOwnerOrCoordinator();
        }
        _;
    }

    // ************************************* //
    // *            Constructor            * //
    // ************************************* //

    /// @notice Constructor.
    /// @param _owner The owner of the contract.
    /// @param _consumer The address that can request random numbers.
    /// @param _vrfCoordinator The address of the VRFCoordinator contract.
    /// @param _keyHash The gas lane key hash value - Defines the maximum gas price you are willing to pay for a request in wei (ID of the off-chain VRF job).
    /// @param _subscriptionId The unique identifier of the subscription used for funding requests.
    /// @param _requestConfirmations How many confirmations the Chainlink node should wait before responding.
    /// @param _callbackGasLimit The gas limit for the VRF fulfillment callback.
    /// @dev https://docs.chain.link/vrf/v2-5/subscription/get-a-random-number
    constructor(
        address _owner,
        address _consumer,
        address _vrfCoordinator,
        bytes32 _keyHash,
        uint256 _subscriptionId,
        uint16 _requestConfirmations,
        uint32 _callbackGasLimit
    ) {
        owner = _owner;
        s_vrfCoordinator = IVRFCoordinatorV2Plus(_vrfCoordinator);

        consumer = _consumer;
        keyHash = _keyHash;
        subscriptionId = _subscriptionId;
        requestConfirmations = _requestConfirmations;
        callbackGasLimit = _callbackGasLimit;
    }

    // ************************************* //
    // *             Governance            * //
    // ************************************* //

    /// @notice Changes the owner of the contract.
    /// @param _owner The new owner.
    function changeOwner(address _owner) external onlyOwner {
        owner = _owner;
    }

    /// @notice Changes the consumer of the RNG.
    /// @param _consumer The new consumer.
    function changeConsumer(address _consumer) external onlyOwner {
        consumer = _consumer;
    }

    /// @notice Changes the key hash of the contract.
    /// @param _keyHash The new key hash.
    function changeKeyHash(bytes32 _keyHash) external onlyOwner {
        keyHash = _keyHash;
    }

    /// @notice Changes the subscription ID of the contract.
    /// @param _subscriptionId The new subscription ID.
    function changeSubscriptionId(uint256 _subscriptionId) external onlyOwner {
        subscriptionId = _subscriptionId;
    }

    /// @notice Changes the request confirmations of the contract.
    /// @param _requestConfirmations The new request confirmations.
    function changeRequestConfirmations(uint16 _requestConfirmations) external onlyOwner {
        requestConfirmations = _requestConfirmations;
    }

    /// @notice Changes the callback gas limit of the contract.
    /// @param _callbackGasLimit The new callback gas limit.
    function changeCallbackGasLimit(uint32 _callbackGasLimit) external onlyOwner {
        callbackGasLimit = _callbackGasLimit;
    }

    /// @notice Changes the VRF Coordinator of the contract.
    /// @param _vrfCoordinator The new VRF Coordinator.
    function setCoordinator(address _vrfCoordinator) external onlyOwnerOrCoordinator {
        if (_vrfCoordinator == address(0)) {
            revert ZeroAddress();
        }
        s_vrfCoordinator = IVRFCoordinatorV2Plus(_vrfCoordinator);
        emit CoordinatorSet(_vrfCoordinator);
    }

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /// @notice Request a random number.
    /// @dev Ensure that the subscription is set and funded.
    /// @dev Consumer only.
    function requestRandomness() external onlyConsumer {
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

        // A coordinator migration may reuse a historical requestId if the consumer nonce restarts.
        // Clear any previous result before making this request ID active.
        delete randomNumbers[requestId];
        lastRequestId = requestId;
        emit RequestSent(requestId);
    }

    /// @notice Called by the VRF Coordinator to fulfill a randomness request.
    /// @param _requestId The ID initially returned by the randomness request.
    /// @param _randomWords The random words generated by the VRF Coordinator.
    function rawFulfillRandomWords(uint256 _requestId, uint256[] calldata _randomWords) external {
        if (msg.sender != address(s_vrfCoordinator)) {
            revert OnlyCoordinatorCanFulfill();
        }
        randomNumbers[_requestId] = _randomWords[0];
        emit RequestFulfilled(_requestId, _randomWords[0]);
    }

    // ************************************* //
    // *           Public Views            * //
    // ************************************* //

    /// @notice Return the random number.
    /// @return randomNumber The random number or 0 if it is not ready or has not been requested.
    function receiveRandomness() external view returns (uint256 randomNumber) {
        randomNumber = randomNumbers[lastRequestId];
    }

    // ************************************* //
    // *              Errors               * //
    // ************************************* //

    error OnlyCoordinatorCanFulfill();
    error OnlyOwnerOrCoordinator();
    error OwnerOnly();
    error ConsumerOnly();
    error ZeroAddress();
}
