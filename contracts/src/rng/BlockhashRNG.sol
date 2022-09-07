// SPDX-License-Identifier: MIT

pragma solidity ^0.8;

import "./RNG.sol";

/**
 *  @title Random Number Generator using blockhash with fallback.
 *  @author Clément Lesaege - <clement@lesaege.com>
 *
 *  Random Number Generator returning the blockhash with a fallback behaviour.
 *  In case no one called it within the 256 blocks, it returns the previous blockhash.
 *  This contract must be used when returning 0 is a worse failure mode than returning another blockhash.
 *  Allows saving the random number for use in the future. It allows the contract to still access the blockhash even after 256 blocks.
 */
contract BlockHashRNG is RNG {
    mapping(uint256 => uint256) public randomNumbers; // randomNumbers[block] is the random number for this block, 0 otherwise.

    /**
     *  @dev Request a random number.
     *  @param _block Block the random number is linked to.
     */
    function requestRandomness(uint256 _block) external override {
        // nop
    }

    /**
     *  @dev Return the random number. If it has not been saved and is still computable compute it.
     *  @param _block Block the random number is linked to.
     *  @return randomNumber The random number or 0 if it is not ready or has not been requested.
     */
    function receiveRandomness(uint256 _block) external override returns (uint256 randomNumber) {
        randomNumber = randomNumbers[_block];
        if (randomNumber != 0) {
            return randomNumber;
        }

        if (_block < block.number) {
            // The random number is not already set and can be.
            if (blockhash(_block) != 0x0) {
                // Normal case.
                randomNumber = uint256(blockhash(_block));
            } else {
                // The contract was not called in time. Fallback to returning previous blockhash.
                randomNumber = uint256(blockhash(block.number - 1));
            }
        }
        randomNumbers[_block] = randomNumber;
    }
}
