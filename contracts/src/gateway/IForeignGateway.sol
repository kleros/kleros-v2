// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../arbitration/IArbitrator.sol";

interface IForeignGateway is IArbitrator {
    /**
     * Relay the rule call from the home gateway to the arbitrable.
     *
     * @param _data The calldata to relay
     */
    function relayRule(bytes memory _data) external;
}
