// SPDX-License-Identifier: MIT

pragma solidity 0.8.18;

import "./IArbitratorV2.sol";

/// @title IArbitrableV2
/// @notice Arbitrable interface.
/// When developing arbitrable contracts, we need to:
/// - Define the action taken when a ruling is received by the contract.
/// - Allow dispute creation. For this a function must call arbitrator.createDispute{value: _fee}(_choices,_extraData);
interface IArbitrableV2 {
    /// @dev To be emitted when a dispute is created to link the correct meta-evidence to the disputeID.
    /// @param _arbitrator The arbitrator of the contract.
    /// @param _arbitrableDisputeID The identifier of the dispute in the Arbitrable contract.
    /// @param _externalDisputeID An identifier created outside Kleros by the protocol requesting arbitration.
    /// @param _templateId The identifier of the dispute template. Should not be used with _templateUri.
    /// @param _templateUri The URI to the dispute template. For example on IPFS: starting with '/ipfs/'. Should not be used with _templateId.
    event DisputeRequest(
        IArbitratorV2 indexed _arbitrator,
        uint256 indexed _arbitrableDisputeID,
        uint256 _externalDisputeID,
        uint256 _templateId,
        string _templateUri
    );

    /// @dev To be raised when a ruling is given.
    /// @param _arbitrator The arbitrator giving the ruling.
    /// @param _disputeID The identifier of the dispute in the Arbitrator contract.
    /// @param _ruling The ruling which was given.
    event Ruling(IArbitratorV2 indexed _arbitrator, uint256 indexed _disputeID, uint256 _ruling);

    /// @dev Give a ruling for a dispute.
    ///      Must be called by the arbitrator.
    ///      The purpose of this function is to ensure that the address calling it has the right to rule on the contract.
    /// @param _disputeID The identifier of the dispute in the Arbitrator contract.
    /// @param _ruling Ruling given by the arbitrator.
    /// Note that 0 is reserved for "Not able/wanting to make a decision".
    function rule(uint256 _disputeID, uint256 _ruling) external;
}
