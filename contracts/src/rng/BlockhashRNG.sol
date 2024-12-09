// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

import "./IRNG.sol";

/// @title Random Number Generator using blockhash with fallback.
/// @dev
///  Random Number Generator returning the blockhash with a fallback behaviour.
///  In case no one called it within the 256 blocks, it returns the previous blockhash.
///  This contract must be used when returning 0 is a worse failure mode than returning another blockhash.
///  Allows saving the random number for use in the future. It allows the contract to still access the blockhash even after 256 blocks.
contract BlockHashRNG is IRNG {
    uint256 public immutable lookahead; // Minimal block distance between requesting and obtaining a random number.
    uint256 public requestBlock; // Block number of the current request
    mapping(uint256 block => uint256 number) public randomNumbers; // randomNumbers[block] is the random number for this block, 0 otherwise.

    constructor(uint256 _lookahead) {
        lookahead = _lookahead + lookahead;
    }

    /// @dev Request a random number.
    function requestRandomness() external override {
        requestBlock = block.number;
    }

    /// @dev Return the random number. If it has not been saved and is still computable compute it.
    /// @return randomNumber The random number or 0 if it is not ready or has not been requested.
    function receiveRandomness() external override returns (uint256 randomNumber) {
        uint256 expectedBlock = requestBlock;
        randomNumber = randomNumbers[expectedBlock];
        if (randomNumber != 0) {
            return randomNumber;
        }

        if (expectedBlock < block.number) {
            // The random number is not already set and can be.
            if (blockhash(expectedBlock) != 0x0) {
                // Normal case.
                randomNumber = uint256(blockhash(expectedBlock));
            } else {
                // The contract was not called in time. Fallback to returning previous blockhash.
                randomNumber = uint256(blockhash(block.number - 1));
            }
        }
        randomNumbers[expectedBlock] = randomNumber;
    }
}
