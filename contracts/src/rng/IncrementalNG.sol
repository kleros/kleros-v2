// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import {IRNG} from "./IRNG.sol";

/// @title Incremental Number Generator
/// @dev A Random Number Generator which returns a number incremented by 1 each time.
/// For testing purposes.
contract IncrementalNG is IRNG {
    uint256 public number;

    constructor(uint256 _start) {
        number = _start;
    }

    /// @notice Request a random number.
    function requestRandomness() external override {
        // nop
    }

    /// @notice Get the "random number" (which is always the same).
    /// @return randomNumber The random number or 0 if it is not ready or has not been requested.
    function receiveRandomness() external override returns (uint256 randomNumber) {
        unchecked {
            return number++;
        }
    }
}
