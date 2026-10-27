// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;

import "../../arbitration/interfaces/IArbitrableV2.sol";

/// @dev An arbitrable whose disputes are relayed to the home chain through the ForeignGateway (`relayDispute`).
interface IForeignGatewayArbitrable is IArbitrableV2 {
    /// @dev Called by the ForeignGateway instead of `rule` when the home chain could not create the dispute, which
    /// closes it. Its juror fees are then claimable with `ForeignGateway.claimRefund`. As with `rule`, a revert here
    /// leaves the failure undelivered, so do not claim from here: the fees may already be swept, and the claim would
    /// revert until new ones come in.
    /// @param _disputeID The dispute ID on the ForeignGateway.
    function onDisputeCreationFailed(uint256 _disputeID) external;
}
