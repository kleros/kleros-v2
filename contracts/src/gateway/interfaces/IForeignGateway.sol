// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;

import "../../arbitration/interfaces/IArbitratorV2.sol";
import "@kleros/vea-contracts/src/interfaces/gateways/IReceiverGateway.sol";

/// @title Foreign Gateway Interface
interface IForeignGateway is IArbitratorV2, IReceiverGateway {
    // ************************************* //
    // *              Events               * //
    // ************************************* //

    /// @notice To be emitted when a dispute is sent to the IHomeGateway.
    /// @param _foreignBlockHash foreignBlockHash
    /// @param _foreignArbitrable The address of the Arbitrable contract.
    /// @param _foreignDisputeID The identifier of the dispute in the Arbitrable contract.
    /// @param _choices The number of choices the arbitrator can choose from in this dispute.
    /// @param _extraData Any extra data to attach.
    event CrossChainDisputeOutgoing(
        bytes32 _foreignBlockHash,
        address indexed _foreignArbitrable,
        uint256 indexed _foreignDisputeID,
        uint256 _choices,
        bytes _extraData
    );

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /// @notice Relay the rule call from the home gateway to the arbitrable.
    /// @param _messageSender The address of the message sender.
    /// @param _disputeHash The dispute hash.
    /// @param _ruling The ruling.
    /// @param _forwarder The address of the forwarder.
    function relayRule(address _messageSender, bytes32 _disputeHash, uint256 _ruling, address _forwarder) external;

    /// @notice Reimburses the dispute fees to the relayer who paid for these fees on the home chain.
    /// @param _disputeHash The dispute hash for which to withdraw the fees.
    function withdrawFees(bytes32 _disputeHash) external;

    // ************************************* //
    // *           Public Views            * //
    // ************************************* //

    /// @notice Looks up the local foreign disputeID for a disputeHash
    /// @param _disputeHash The dispute hash.
    /// @return The local foreign disputeID.
    function disputeHashToForeignID(bytes32 _disputeHash) external view returns (uint256);

    /// @notice Home chain identifier.
    /// @return The chain ID where the corresponding home gateway is deployed.
    function homeChainID() external view returns (uint256);

    /// @notice Home gateway address.
    /// @return The address of the corresponding home gateway.
    function homeGateway() external view returns (address);
}
