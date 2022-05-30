// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../../arbitration/IArbitrator.sol";
import "./IForeignGatewayBase.sol";

interface IForeignGateway is IArbitrator, IForeignGatewayBase {
    /**
     * Relay the rule call from the home gateway to the arbitrable.
     */
    function relayRule(
        address _messageSender,
        bytes32 _disputeHash,
        uint256 _ruling,
        address _forwarder
    ) external;

    function withdrawFees(bytes32 _disputeHash) external;

    // For cross-chain Evidence standard
    function disputeHashToForeignID(bytes32 _disputeHash) external view returns (uint256);
}
