// SPDX-License-Identifier: MIT

/**
 * @authors: [@clesaege]
 * @reviewers: [@remedcu]
 * @auditors: []
 * @bounties: []
 * @deployments: []
 */

pragma solidity ^0.8;

/**
 * @title Random Number Generator Standard
 * @author Clément Lesaege - <clement@lesaege.com>
 * @dev This is an abstract contract
 */
abstract contract RNG {
    /**
     * @dev Contribute to the reward of a random number.
     * @param _block Block the random number is linked to.
     */
    function contribute(uint256 _block) public payable virtual;

    /**
     * @dev Request a random number.
     * @param _block Block linked to the request.
     */
    function requestRN(uint256 _block) public payable {
        contribute(_block);
    }

    /**
     * @dev Get the random number.
     * @param _block Block the random number is linked to.
     * @return RN Random Number. If the number is not ready or has not been required 0 instead.
     */
    function getRN(uint256 _block) public virtual returns (uint256 RN);

    /**
     * @dev Get a uncorrelated random number. Act like getRN but give a different number for each sender.
     *      This is to prevent users from getting correlated numbers.
     * @param _block Block the random number is linked to.
     * @return RN Random Number. If the number is not ready or has not been required 0 instead.
     */
    function getUncorrelatedRN(uint256 _block) public returns (uint256 RN) {
        uint256 baseRN = getRN(_block);
        if (baseRN == 0) return 0;
        else return uint256(keccak256(abi.encode(msg.sender, baseRN)));
    }
}
