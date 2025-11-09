// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;

/// @title Random Number Generator interface
interface IRNG {
    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /// @notice Request a random number.
    function requestRandomness() external;

    /// @notice Receive the random number.
    /// @return randomNumber Random number or 0 if not available
    function receiveRandomness() external returns (uint256 randomNumber);

    // ************************************* //
    // *              Errors               * //
    // ************************************* //

    error OwnerOnly();
    error ConsumerOnly();
}
