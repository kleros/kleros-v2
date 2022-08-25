// SPDX-License-Identifier: MIT

pragma solidity ^0.8;

interface RNG {
    /**
     * @dev Request a random number.
     * @param _block Block linked to the request.
     */
    function requestRandomness(uint256 _block) external;

    /**
     * @dev Receive the random number.
     * @param _block Block the random number is linked to.
     * @return randomNumber Random Number. If the number is not ready or has not been required 0 instead.
     */
    function receiveRandomness(uint256 _block) external returns (uint256 randomNumber);
}
