// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;

/// @title Random Number Generator interface.
/// @notice Randomness is requested first and will become available at a later time.
/// Call `receiveRandomness` to retrieve it. A return value of 0 means it is not yet available.
interface IRNG {
    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /// @notice Request a random number.
    function requestRandomness() external;

    /// @notice Receive the random number.
    /// @return randomNumber Random number or 0 if not available.
    function receiveRandomness() external returns (uint256 randomNumber);
}
