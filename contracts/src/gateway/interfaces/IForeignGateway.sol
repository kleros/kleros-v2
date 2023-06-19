// SPDX-License-Identifier: MIT

/// @custom:authors: [@jaybuidl, @shotaronowhere, @shalzz]
/// @custom:reviewers: []
/// @custom:auditors: []
/// @custom:bounties: []
/// @custom:deployments: []

pragma solidity 0.8.18;

import "../../arbitration/IArbitrator.sol";
import "@kleros/vea-contracts/src/interfaces/gateways/IReceiverGateway.sol";

interface IForeignGateway is IArbitrator, IReceiverGateway {
    /// @dev To be emitted when a dispute is sent to the IHomeGateway.
    /// @param _arbitrator The arbitrator of the contract.
    /// @param _arbitrableChainId The chain identifier where the Arbitrable contract is deployed.
    /// @param _arbitrable The address of the Arbitrable contract.
    /// @param _arbitrableDisputeID The identifier of the dispute in the Arbitrable contract.
    /// @param _externalDisputeID An identifier created outside Kleros by the protocol requesting arbitration.
    /// @param _templateId The identifier of the dispute template. Should not be used with _templateUri.
    /// @param _templateUri IPFS path to the dispute template starting with '/ipfs/'. Should not be used with _templateId.
    event CrossChainDisputeOutgoing(
        IArbitratorV2 indexed _arbitrator,
        uint256 _arbitrableChainId,
        address indexed _arbitrable,
        uint256 indexed _arbitrableDisputeID,
        uint256 _externalDisputeID,
        uint256 _templateId,
        string _templateUri
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
