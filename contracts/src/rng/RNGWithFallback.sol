// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./IRNG.sol";

/// @title RNG with fallback mechanism
/// @notice Uses multiple RNG implementations with automatic fallback if default RNG does not respond passed a timeout.
contract RNGWithFallback is IRNG {
    uint256 public constant DEFAULT_RNG = 0;

    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    address public governor; // Governor address
    address public consumer; // Consumer address
    IRNG[] public rngs; // List of RNG implementations
    uint256 public fallbackTimeoutSeconds; // Time in seconds to wait before falling back to next RNG
    uint256 public requestTimestamp; // Timestamp of the current request
    uint256 public currentRngIndex; // Index of the current RNG
    bool public isRequesting; // Whether a request is in progress

    // ************************************* //
    // *              Events               * //
    // ************************************* //

    event RNGDefaultChanged(address indexed _newDefaultRng);
    event RNGFallback(uint256 _fromIndex, uint256 _toIndex);
    event RNGFailure();
    event RNGFallbackAdded(address indexed _rng);
    event RNGFallbackRemoved(address indexed _rng);
    event FallbackTimeoutChanged(uint256 _newTimeout);

    // ************************************* //
    // *            Constructor            * //
    // ************************************* //

    /// @param _governor Governor address
    /// @param _consumer Consumer address
    /// @param _fallbackTimeoutSeconds Time in seconds to wait before falling back to next RNG
    /// @param _defaultRng The default RNG
    constructor(address _governor, address _consumer, uint256 _fallbackTimeoutSeconds, IRNG _defaultRng) {
        require(address(_defaultRng) != address(0), "Invalid default RNG");

        governor = _governor;
        consumer = _consumer;
        fallbackTimeoutSeconds = _fallbackTimeoutSeconds;
        rngs.push(_defaultRng);
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

    /// @dev Request a random number from the default RNG
    function requestRandomness() external override onlyByConsumer {
        require(!isRequesting, "Request already in progress");
        _requestRandomness(DEFAULT_RNG);
    }

    function _requestRandomness(uint256 _rngIndex) internal {
        isRequesting = true;
        requestTimestamp = block.timestamp;
        currentRngIndex = _rngIndex;
        rngs[_rngIndex].requestRandomness();
    }

    /// @dev Receive the random number with fallback logic
    /// @return randomNumber Random Number
    function receiveRandomness() external override onlyByConsumer returns (uint256 randomNumber) {
        // Try to get random number from current RNG
        randomNumber = rngs[currentRngIndex].receiveRandomness();

        // If we got a valid number, clear the request
        if (randomNumber != 0) {
            isRequesting = false;
            return randomNumber;
        }

        // If the timeout is exceeded, try next RNG
        if (block.timestamp > requestTimestamp + fallbackTimeoutSeconds) {
            uint256 nextIndex = currentRngIndex + 1;

            // If we have another RNG to try, switch to it and request again
            if (nextIndex < rngs.length) {
                emit RNGFallback(currentRngIndex, nextIndex);
                currentRngIndex = nextIndex;
                _requestRandomness(nextIndex);
            } else {
                // No more RNGs to try
                emit RNGFailure();
            }
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

    /// @dev Change the default RNG
    /// @param _newDefaultRng Address of the new default RNG
    function changeDefaultRng(IRNG _newDefaultRng) external onlyByGovernor {
        require(address(_newDefaultRng) != address(0), "Invalid RNG");
        rngs[DEFAULT_RNG] = _newDefaultRng;
        emit RNGDefaultChanged(address(_newDefaultRng));

        // Take over any pending request
        _requestRandomness(DEFAULT_RNG);
    }

    /// @dev Add a new RNG fallback
    /// @param _newFallbackRng Address of the new RNG fallback
    function addRngFallback(IRNG _newFallbackRng) external onlyByGovernor {
        require(address(_newFallbackRng) != address(0), "Invalid RNG");
        rngs.push(_newFallbackRng);
        emit RNGFallbackAdded(address(_newFallbackRng));
    }

    /// @dev Remove an RNG fallback
    function removeLastRngFallback() external onlyByGovernor {
        require(rngs.length > 1, "No fallback RNG");

        // If the removed RNG is the current one, reset the fallback index
        if (currentRngIndex > rngs.length - 2) {
            currentRngIndex = DEFAULT_RNG;
        }

        IRNG removedRng = rngs[rngs.length - 1];
        rngs.pop();
        emit RNGFallbackRemoved(address(removedRng));
    }

    /// @dev Change the fallback timeout
    /// @param _fallbackTimeoutSeconds New timeout in seconds
    function changeFallbackTimeout(uint256 _fallbackTimeoutSeconds) external onlyByGovernor {
        fallbackTimeoutSeconds = _fallbackTimeoutSeconds;
        emit FallbackTimeoutChanged(_fallbackTimeoutSeconds);
    }

    /// @dev Emergency reset the RNG.
    /// Useful for the governor to ensure that re-requesting a random number will not be blocked by a previous request.
    function emergencyReset() external onlyByGovernor {
        isRequesting = false;
        requestTimestamp = 0;
        currentRngIndex = DEFAULT_RNG;
    }

    // ************************************* //
    // *           View Functions          * //
    // ************************************* //

    /// @dev Get the number of RNGs
    /// @return Number of RNGs
    function getRNGsCount() external view returns (uint256) {
        return rngs.length;
    }
}
