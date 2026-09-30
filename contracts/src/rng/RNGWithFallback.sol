// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IRNG} from "./IRNG.sol";

/// @title RNG with fallback mechanism.
/// @notice Uses a primary RNG implementation with automatic fallback to a Blockhash RNG if the primary RNG does not respond passed a timeout.
/// @dev The blockhash fallback prioritizes liveness over manipulation resistance but it should only be reached when the primary RNG is unavailable.
/// @dev Timely advancement by honest keepers limits opportunities to select a favorable fallback seed.
contract RNGWithFallback is IRNG {
    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    IRNG public immutable rng; // RNG address.
    address public owner; // Owner address.
    address public consumer; // Consumer address.
    uint256 public fallbackTimeoutSeconds; // Time in seconds to wait before falling back to next RNG.
    uint256 public requestTimestamp; // Timestamp of the current request.

    bool public requestAccepted; // Whether the primary RNG accepted the current request

    /// @dev Gas forwarded to the primary RNG, set well above what a request actually costs. A
    ///      failure with this much available is a refusal rather than an out-of-gas, and the cap
    ///      bounds what a failing primary can burn.
    uint256 internal constant MIN_GAS_CATCH = 500_000;

    // ************************************* //
    // *              Events               * //
    // ************************************* //

    event RNGFallback();
    event FallbackTimeoutChanged(uint256 _newTimeout);
    event RNGRequestFailed();

    // ************************************* //
    // *            Constructor            * //
    // ************************************* //

    /// @notice Constructor.
    /// @param _owner Owner address.
    /// @param _consumer Consumer address.
    /// @param _fallbackTimeoutSeconds Time in seconds to wait before falling back to next RNG.
    /// @param _rng The RNG address (e.g. Chainlink).
    constructor(address _owner, address _consumer, uint256 _fallbackTimeoutSeconds, IRNG _rng) {
        owner = _owner;
        consumer = _consumer;
        fallbackTimeoutSeconds = _fallbackTimeoutSeconds;
        rng = _rng;
    }

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

    // ************************************* //
    // *         Governance Functions      * //
    // ************************************* //

    /// @notice Change the owner.
    /// @param _newOwner Address of the new owner.
    function changeOwner(address _newOwner) external onlyOwner {
        owner = _newOwner;
    }

    /// @notice Change the consumer.
    /// @param _consumer Address of the new consumer.
    function changeConsumer(address _consumer) external onlyOwner {
        consumer = _consumer;
    }

    /// @notice Change the fallback timeout.
    /// @param _fallbackTimeoutSeconds New timeout in seconds.
    function changeFallbackTimeout(uint256 _fallbackTimeoutSeconds) external onlyOwner {
        fallbackTimeoutSeconds = _fallbackTimeoutSeconds;
        emit FallbackTimeoutChanged(_fallbackTimeoutSeconds);
    }

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /// @notice Request a random number from the primary RNG.
    /// @dev The consumer is trusted not to make concurrent requests.
    /// @dev A refusal must not revert, or it would block the consumer's phase transition and the
    ///      fallback could never engage.
    function requestRandomness() external onlyConsumer {
        uint256 gasBefore = gasleft();
        try rng.requestRandomness{gas: MIN_GAS_CATCH}() {
            requestAccepted = true;
        } catch {
            // Without this, a caller could starve the request on purpose, let the catch swallow the
            // out-of-gas, and force the manipulable blockhash fallback.
            require(gasBefore >= MIN_GAS_CATCH, InsufficientGasForRequest());
            requestAccepted = false;
            emit RNGRequestFailed();
        }
        requestTimestamp = block.timestamp;
    }

    /// @notice Receive the random number from the primary RNG with fallback to the blockhash RNG if the primary RNG does not respond passed a timeout.
    /// @return randomNumber Random number or 0 if not available.
    function receiveRandomness() external onlyConsumer returns (uint256 randomNumber) {
        // Only read the primary RNG if it accepted this request. Otherwise its stored answer is
        // still the PREVIOUS request's — already public, already used — and would be replayed.
        if (requestAccepted) {
            randomNumber = rng.receiveRandomness();
        }

        // If we didn't get a random number and the timeout is exceeded, try the fallback.
        if (randomNumber == 0 && block.timestamp > requestTimestamp + fallbackTimeoutSeconds) {
            randomNumber = uint256(blockhash(block.number - 1));
            emit RNGFallback();
        }
        return randomNumber;
    }

    // ************************************* //
    // *              Errors               * //
    // ************************************* //

    error OwnerOnly();
    error ConsumerOnly();
    error InsufficientGasForRequest();
}
