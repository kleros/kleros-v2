// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;

/// @title Random Number Generator interface
interface IRNG {
    /// @dev Request a random number.
    function requestRandomness() external;

    /// @dev Receive the random number.
    /// @return randomNumber Random Number. If the number is not ready or has not been required 0 instead.
    function receiveRandomness() external returns (uint256 randomNumber);
}
