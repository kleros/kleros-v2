// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

abstract contract ISafeBridgeReceiver {
    /**
     * Note: Access restricted to the Safe Bridge.
     * @dev Resolves any challenge of the optimistic claim for '_epoch'.
     * @param _epoch The epoch associated with the _batchmerkleRoot.
     * @param _batchMerkleRoot The true batch merkle root for the epoch sent by the safe bridge.
     */
    function verifySafe(uint256 _epoch, bytes32 _batchMerkleRoot) external virtual;

    function isSentBySafeBridge() internal view virtual returns (bool);

    modifier onlyFromSafeBridge() {
        require(isSentBySafeBridge(), "Safe Bridge only.");
        _;
    }
}
