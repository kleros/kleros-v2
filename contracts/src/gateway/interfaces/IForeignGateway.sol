// SPDX-License-Identifier: MIT

/// @custom:authors: [@jaybuidl, @shotaronowhere, @shalzz]
/// @custom:reviewers: []
/// @custom:auditors: []
/// @custom:bounties: []
/// @custom:deployments: []

pragma solidity 0.8.18;

import "../../arbitration/IArbitratorV2.sol";
import "@kleros/vea-contracts/src/interfaces/gateways/IReceiverGateway.sol";

interface IForeignGateway is IArbitratorV2, IReceiverGateway {
    /// @dev To be emitted when a dispute is sent to the IHomeGateway.
    /// @param _foreignBlockHash foreignBlockHash
    /// @param _foreignArbitrable The address of the Arbitrable contract.
    /// @param _foreignDisputeID The identifier of the dispute in the Arbitrable contract.
    event CrossChainDisputeOutgoing(
        bytes32 _foreignBlockHash,
        address indexed _foreignArbitrable,
        uint256 indexed _foreignDisputeID,
        uint256 _choices,
        bytes _extraData
    );

    /// Relay the rule call from the home gateway to the arbitrable.
    function relayRule(address _messageSender, bytes32 _disputeHash, uint256 _ruling, address _forwarder) external;

    function withdrawFees(bytes32 _disputeHash) external;

    function disputeHashToForeignID(bytes32 _disputeHash) external view returns (uint256);

    function createDisputeERC20(
        uint256 _choices,
        bytes calldata _extraData,
        uint256 _amount
    ) external returns (uint256 disputeID);
}
