// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "./IRNG.sol";

/// @title RNG with fallback mechanism
/// @notice Uses multiple RNG implementations with automatic fallback if default RNG does not respond passed a timeout.
contract RNGWithFallback is IRNG {
    uint256 public constant DEFAULT_RNG = 0;

    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    address public governor; // Governor address
    IRNG[] public rngs; // List of RNG implementations
    uint256 public fallbackTimeout; // Number of blocks to wait before falling back to next RNG
    uint256 public requestBlock; // Block number of the current request
    uint256 public currentRngIndex; // Index of the current RNG
    bool public isRequesting; // Whether a request is in progress

    // ************************************* //
    // *              Events               * //
    // ************************************* //

    event RNGDefaultChanged(address indexed _newDefaultRng);
    event RNGFallback(uint256 _fromIndex, uint256 _toIndex);
    event RNGFallbackAdded(address indexed _rng);
    event RNGFallbackRemoved(address indexed _rng);
    event FallbackTimeoutChanged(uint256 _newTimeout);

    // ************************************* //
    // *            Constructor            * //
    // ************************************* //

    /// @param _governor Governor address
    /// @param _fallbackTimeout Number of blocks to wait before falling back to next RNG
    /// @param _defaultRng The default RNG
    constructor(address _governor, uint256 _fallbackTimeout, IRNG _defaultRng) {
        require(address(_defaultRng) != address(0), "Invalid default RNG");
        require(_fallbackTimeout > 0, "Invalid fallback timeout");

        governor = _governor;
        fallbackTimeout = _fallbackTimeout;
        rngs.push(_defaultRng);
    }

    // ************************************* //
    // *        Function Modifiers         * //
    // ************************************* //

    modifier onlyByGovernor() {
        require(msg.sender == governor, "Governor only");
        _;
    }

    // ************************************* //
    // *         State Modifiers          * //
    // ************************************* //

    /// @dev Request a random number from the default RNG
    function requestRandomness() external override {
        require(!isRequesting, "Request already in progress");
        _requestRandomness();
    }

    function _requestRandomness() internal {
        isRequesting = true;
        requestBlock = block.number;
        currentRngIndex = DEFAULT_RNG;
        rngs[DEFAULT_RNG].requestRandomness();
    }

    /// @dev Receive the random number with fallback logic
    /// @return randomNumber Random Number
    function receiveRandomness() external override returns (uint256 randomNumber) {
        // Try to get random number from current RNG
        randomNumber = rngs[currentRngIndex].receiveRandomness();

        // If we got a valid number, clear the request
        if (randomNumber != 0) {
            isRequesting = false;
            return randomNumber;
        }

        // If the timeout is exceeded, try next RNG
        if (block.number > requestBlock + fallbackTimeout) {
            uint256 nextIndex = currentRngIndex + 1;

            // If we have another RNG to try, switch to it and request again
            if (nextIndex < rngs.length) {
                emit RNGFallback(currentRngIndex, nextIndex);
                currentRngIndex = nextIndex;
                rngs[nextIndex].requestRandomness();
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
        require(_newGovernor != address(0), "Invalid governor");
        governor = _newGovernor;
    }

    /// @dev Change the default RNG
    /// @param _newDefaultRng Address of the new default RNG
    function changeDefaultRng(IRNG _newDefaultRng) external onlyByGovernor {
        require(address(_newDefaultRng) != address(0), "Invalid RNG");
        rngs[DEFAULT_RNG] = _newDefaultRng;
        emit RNGDefaultChanged(address(_newDefaultRng));

        // Take over any pending request
        _requestRandomness();
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
    /// @param _newTimeout New timeout in blocks
    function changeFallbackTimeout(uint256 _newTimeout) external onlyByGovernor {
        require(_newTimeout > 0, "Invalid timeout");
        fallbackTimeout = _newTimeout;
        emit FallbackTimeoutChanged(_newTimeout);
    }

    /// @dev Drop the pending request.
    /// Useful for the governor to ensure that re-requesting a random number will not be blocked by a previous request.
    function dropPendingRequest() external onlyByGovernor {
        isRequesting = false;
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
