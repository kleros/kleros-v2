// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;

/// @title Random Number Generator interface
interface IRNG {
    /// @dev Request a random number.
    function requestRandomness() external;

    /// @dev Receive the random number.
    /// @return randomNumber Random number or 0 if not available
    function receiveRandomness() external returns (uint256 randomNumber);
}
