// SPDX-License-Identifier: MIT

/**
 * @title Incremental Number Generator
 * @author JayBuidl <jb@kleros.io>
 * @dev A Random Number Generator which returns a number incremented by 1 each time. Useful as a fallback method.
 */

pragma solidity ^0.8;
import "./RNG.sol";

contract IncrementalNG is RNG {
    uint256 public number;

    /**
     * @dev Contribute to the reward of a random number. All the ETH will be lost forever.
     * @param _block Block the random number is linked to.
     */
    function contribute(uint256 _block) public payable override {
        /* NOP */
    }

    /**
     * @dev Get the "random number", which is predictable.
     * @param _block Block the random number is linked to.
     * @return RN Random Number. If the number is not ready or has not been required 0 instead.
     */
    function getRN(uint256 _block) public override returns (uint256 RN) {
        unchecked {
            return number++;
        }
    }
}
