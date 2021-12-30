// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../arbitration/IArbitrable.sol";

interface IHomeGateway is IArbitrable {
    /**
     * Relay the createDispute call from the foreign gateway to the arbitrator.
     */
    function relayCreateDispute(
        bytes32 _disputeHash,
        uint256 _choices,
        bytes calldata _extraData
    ) external;
}
