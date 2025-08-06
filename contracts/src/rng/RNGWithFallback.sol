// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./IRNG.sol";

/// @title RNG with fallback mechanism
/// @notice Uses multiple RNG implementations with automatic fallback if default RNG does not respond passed a timeout.
contract RNGWithFallback is IRNG {
    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    IRNG public immutable rng; // RNG address.
    address public governor; // Governor address
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

    /// @param _governor Governor address
    /// @param _consumer Consumer address
    /// @param _fallbackTimeoutSeconds Time in seconds to wait before falling back to next RNG
    /// @param _rng The RNG address (e.g. Chainlink)
    constructor(address _governor, address _consumer, uint256 _fallbackTimeoutSeconds, IRNG _rng) {
        require(address(_rng) != address(0), "Invalid default RNG");

        governor = _governor;
        consumer = _consumer;
        fallbackTimeoutSeconds = _fallbackTimeoutSeconds;
        rng = _rng;
    }

    // ************************************* //
    // *        Function Modifiers         * //
    // ************************************* //

    modifier onlyByGovernor() {
        require(msg.sender == governor, "Governor only");
        _;
    }

    modifier onlyByConsumer() {
        require(msg.sender == consumer, "Consumer only");
        _;
    }

    // ************************************* //
    // *         State Modifiers          * //
    // ************************************* //

    /// @dev Request a random number from the RNG
    function requestRandomness() external override onlyByConsumer {
        requestTimestamp = block.timestamp;
        rng.requestRandomness();
    }

    /// @dev Receive the random number with fallback logic
    /// @return randomNumber Random Number
    function receiveRandomness() external override onlyByConsumer returns (uint256 randomNumber) {
        // Try to get random number from the RNG contract
        randomNumber = rng.receiveRandomness();

        // If we got a valid number, clear the request
        if (randomNumber != 0) {
            return randomNumber;
        } else if (block.timestamp > requestTimestamp + fallbackTimeoutSeconds) {
            // If the timeout is exceeded, try the fallback
            randomNumber = uint256(blockhash(block.number - 1));
            emit RNGFallback();
        }
        return randomNumber;
    }

    // ************************************* //
    // *         Governance Functions      * //
    // ************************************* //

    /// @dev Change the governor
    /// @param _newGovernor Address of the new governor
    function changeGovernor(address _newGovernor) external onlyByGovernor {
        governor = _newGovernor;
    }

    /// @dev Change the consumer
    /// @param _consumer Address of the new consumer
    function changeConsumer(address _consumer) external onlyByGovernor {
        consumer = _consumer;
    }

    /// @dev Change the fallback timeout
    /// @param _fallbackTimeoutSeconds New timeout in seconds
    function changeFallbackTimeout(uint256 _fallbackTimeoutSeconds) external onlyByGovernor {
        fallbackTimeoutSeconds = _fallbackTimeoutSeconds;
        emit FallbackTimeoutChanged(_fallbackTimeoutSeconds);
    }
}
