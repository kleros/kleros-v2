// SPDX-License-Identifier: MIT

/**
 * @title Constant Number Generator
 * @author Clément Lesaege - <clement@lesaege.com>
 * @dev A Random Number Generator which always return the same number. Usefull in order to make tests.
 */

pragma solidity ^0.8;
import "./RNG.sol";

contract ConstantNG is RNG {
    uint256 public immutable number;

    /**
     * @dev Constructor.
     * @param _number The number to always return.
     */
    constructor(uint256 _number) {
        number = _number;
    }

    /**
     * @dev Contribute to the reward of a random number. All the ETH will be lost forever.
     * @param _block Block the random number is linked to.
     */
    function contribute(uint256 _block) public payable override {}

    /**
     * @dev Get the "random number" (which is always the same).
     * @param _block Block the random number is linked to.
     * @return RN Random Number. If the number is not ready or has not been required 0 instead.
     */
    function getRN(uint256 _block) public view override returns (uint256 RN) {
        return number;
    }
}
