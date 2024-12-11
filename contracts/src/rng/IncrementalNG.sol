// SPDX-License-Identifier: MIT

/// @title Incremental Number Generator
/// @author JayBuidl <jb@kleros.io>
/// @dev A Random Number Generator which returns a number incremented by 1 each time. Useful as a fallback method.

pragma solidity 0.8.24;
import "./IRNG.sol";

contract IncrementalNG is IRNG {
    uint256 public number;

    constructor(uint256 _start) {
        number = _start;
    }

    /// @dev Request a random number.
    function requestRandomness() external override {
        // nop
    }

    /// @dev Get the "random number" (which is always the same).
    /// @return randomNumber The random number or 0 if it is not ready or has not been requested.
    function receiveRandomness() external override returns (uint256 randomNumber) {
        unchecked {
            return number++;
        }
    }
}
