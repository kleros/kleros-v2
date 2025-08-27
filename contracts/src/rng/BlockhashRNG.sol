// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import "./IRNG.sol";

/// @title Random Number Generator using blockhash with fallback.
/// @dev
///  Random Number Generator returning the blockhash with a fallback behaviour.
///  On L2 like Arbitrum block production is sporadic so block timestamp is more reliable than block number.
///  Returns 0 when no random number is available.
///  Allows saving the random number for use in the future. It allows the contract to retrieve the blockhash even after the time window.
contract BlockHashRNG is IRNG {
    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    address public owner; // The address that can withdraw funds.
    address public consumer; // The address that can request random numbers.
    uint256 public immutable lookaheadTime; // Minimal time in seconds between requesting and obtaining a random number.
    uint256 public requestTimestamp; // Timestamp of the current request
    mapping(uint256 timestamp => uint256 number) public randomNumbers; // randomNumbers[timestamp] is the random number for this timestamp, 0 otherwise.

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
    // *            Constructor            * //
    // ************************************* //

    /// @dev Constructor.
    /// @param _owner The Owner of the contract.
    /// @param _consumer The address that can request random numbers.
    /// @param _lookaheadTime The time lookahead in seconds for the random number.
    constructor(address _owner, address _consumer, uint256 _lookaheadTime) {
        owner = _owner;
        consumer = _consumer;
        lookaheadTime = _lookaheadTime;
    }

    // ************************************* //
    // *             Governance            * //
    // ************************************* //

    /// @dev Changes the owner of the contract.
    /// @param _owner The new owner.
    function changeOwner(address _owner) external onlyByOwner {
        owner = _owner;
    }

    /// @dev Changes the consumer of the RNG.
    /// @param _consumer The new consumer.
    function changeConsumer(address _consumer) external onlyByOwner {
        consumer = _consumer;
    }

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /// @dev Request a random number.
    function requestRandomness() external override onlyByConsumer {
        requestTimestamp = block.timestamp;
    }

    /// @dev Return the random number. If it has not been saved and is still computable compute it.
    /// @return randomNumber The random number or 0 if it is not ready or has not been requested.
    function receiveRandomness() external override onlyByConsumer returns (uint256 randomNumber) {
        if (requestTimestamp == 0) return 0; // No requests were made yet.

        uint256 expectedTimestamp = requestTimestamp + lookaheadTime;

        // Check if enough time has passed
        if (block.timestamp < expectedTimestamp) {
            return 0; // Not ready yet
        }

        // Check if we already have a saved random number for this timestamp window
        randomNumber = randomNumbers[expectedTimestamp];
        if (randomNumber != 0) {
            return randomNumber;
        }

        // Use last block hash for randomness
        randomNumber = uint256(blockhash(block.number - 1));
        if (randomNumber != 0) {
            randomNumbers[expectedTimestamp] = randomNumber;
        }
        return randomNumber;
    }

    // ************************************* //
    // *             View Functions        * //
    // ************************************* //

    /// @dev Check if randomness is ready to be received.
    /// @return ready True if randomness can be received.
    function isRandomnessReady() external view returns (bool ready) {
        if (requestTimestamp == 0) return false; // No requests were made yet.
        return block.timestamp >= requestTimestamp + lookaheadTime;
    }

    /// @dev Get the timestamp when randomness will be ready.
    /// @return readyTimestamp The timestamp when randomness will be available.
    function getRandomnessReadyTimestamp() external view returns (uint256 readyTimestamp) {
        if (requestTimestamp == 0) return 0; // No requests were made yet.
        return requestTimestamp + lookaheadTime;
    }
}
