// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IRNG} from "../rng/IRNG.sol";

/// @title Simple mock rng to check fallback
contract RNGMock is IRNG {
    uint256 public randomNumber; // The number to return;

    function setRN(uint256 _rn) external {
        randomNumber = _rn;
    }

    function requestRandomness() external override {}

    function receiveRandomness() external view override returns (uint256) {
        return randomNumber;
    }
}
