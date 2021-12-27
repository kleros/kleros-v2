// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../arbitration/IArbitrable.sol";

interface IHomeGateway is IArbitrable {
    /**
     * Relay the createDispute call from the foreign gateway to the arbitrator.
     *
     * @param _data The calldata to relay
     */
    function relayCreateDispute(bytes memory _data) external;
}
