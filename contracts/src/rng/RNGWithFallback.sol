// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./IRNG.sol";

/// @title RNG with fallback mechanism
/// @notice Uses a primary RNG implementation with automatic fallback to a Blockhash RNG if the primary RNG does not respond passed a timeout.
contract RNGWithFallback is IRNG {
    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    IRNG public immutable rng; // RNG address.
    address public owner; // Owner address
    address public consumer; // Consumer address
    uint256 public fallbackTimeoutSeconds; // Time in seconds to wait before falling back to next RNG
    uint256 public requestTimestamp; // Timestamp of the current request

    // ************************************* //
    // *              Events               * //
    // ************************************* //

    event RNGFallback();
    event FallbackTimeoutChanged(uint256 _newTimeout);

    // ************************************* //
    // *            Constructor            * //
    // ************************************* //

    /// @notice Constructor
    /// @param _owner Owner address
    /// @param _consumer Consumer address
    /// @param _fallbackTimeoutSeconds Time in seconds to wait before falling back to next RNG
    /// @param _rng The RNG address (e.g. Chainlink)
    constructor(address _owner, address _consumer, uint256 _fallbackTimeoutSeconds, IRNG _rng) {
        if (address(_rng) == address(0)) revert InvalidDefaultRNG();

        owner = _owner;
        consumer = _consumer;
        fallbackTimeoutSeconds = _fallbackTimeoutSeconds;
        rng = _rng;
    }

    // ************************************* //
    // *        Function Modifiers         * //
    // ************************************* //

    modifier onlyByOwner() {
        if (owner != msg.sender) revert OwnerOnly();
        _;
    }

    modifier onlyByConsumer() {
        if (consumer != msg.sender) revert ConsumerOnly();
        _;
    }

    // ************************************* //
    // *         Governance Functions      * //
    // ************************************* //

    /// @notice Change the owner
    /// @param _newOwner Address of the new owner
    function changeOwner(address _newOwner) external onlyByOwner {
        owner = _newOwner;
    }

    /// @notice Change the consumer
    /// @param _consumer Address of the new consumer
    function changeConsumer(address _consumer) external onlyByOwner {
        consumer = _consumer;
    }

    /// @notice Change the fallback timeout
    /// @param _fallbackTimeoutSeconds New timeout in seconds
    function changeFallbackTimeout(uint256 _fallbackTimeoutSeconds) external onlyByOwner {
        fallbackTimeoutSeconds = _fallbackTimeoutSeconds;
        emit FallbackTimeoutChanged(_fallbackTimeoutSeconds);
    }

    // ************************************* //
    // *         State Modifiers          * //
    // ************************************* //

    /// @notice Request a random number from the primary RNG
    /// @dev The consumer is trusted not to make concurrent requests.
    function requestRandomness() external override onlyByConsumer {
        requestTimestamp = block.timestamp;
        rng.requestRandomness();
    }

    /// @notice Receive the random number from the primary RNG with fallback to the blockhash RNG if the primary RNG does not respond passed a timeout.
    /// @return randomNumber Random number or 0 if not available
    function receiveRandomness() external override onlyByConsumer returns (uint256 randomNumber) {
        randomNumber = rng.receiveRandomness();

        // If we didn't get a random number and the timeout is exceeded, try the fallback
        if (randomNumber == 0 && block.timestamp > requestTimestamp + fallbackTimeoutSeconds) {
            randomNumber = uint256(blockhash(block.number - 1));
            emit RNGFallback();
        }
        return randomNumber;
    }

    // ************************************* //
    // *              Errors               * //
    // ************************************* //

    error InvalidDefaultRNG();
}
