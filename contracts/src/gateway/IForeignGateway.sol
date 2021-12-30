// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../arbitration/IArbitrator.sol";

interface IForeignGateway is IArbitrator {
    /**
     * Relay the rule call from the home gateway to the arbitrable.
     */
    function relayRule(bytes32 _disputeHash, uint256 _ruling) external;
}
