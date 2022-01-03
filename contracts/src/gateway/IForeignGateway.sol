// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../arbitration/IArbitrator.sol";

interface IForeignGateway is IArbitrator {
    function chainID() external view returns (uint256);

    function foreignDisputeHashToID(bytes32 _disputeHash) external view returns (uint256);

    /**
     * Relay the rule call from the home gateway to the arbitrable.
     */
    function relayRule(bytes32 _disputeHash, uint256 _ruling) external;
}
