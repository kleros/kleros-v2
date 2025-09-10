// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;

import "./IArbitratorV2.sol";

/// @title IArbitrableV2
/// @notice Arbitrable interface.
/// @dev When developing arbitrable contracts, we need to:
/// - Define the action taken when a ruling is received by the contract.
/// - Allow dispute creation which calls `arbitrator.createDispute{value: _fee}(_choices,_extraData)`.
interface IArbitrableV2 {
    // ************************************* //
    // *              Events               * //
    // ************************************* //

    /// @notice To be emitted when a dispute is created to link the correct template to the disputeID.
    /// @param _arbitrator The arbitrator of the contract.
    /// @param _arbitratorDisputeID The identifier of the dispute in the Arbitrator contract.
    /// @param _externalDisputeID An identifier created outside Kleros by the protocol requesting arbitration.
    /// @param _templateId The identifier of the dispute template.
    event DisputeRequest(
        IArbitratorV2 indexed _arbitrator,
        uint256 indexed _arbitratorDisputeID,
        uint256 _externalDisputeID,
        uint256 _templateId
    );

    /// @notice To be raised when a ruling is given.
    /// @param _arbitrator The arbitrator giving the ruling.
    /// @param _disputeID The identifier of the dispute in the Arbitrator contract.
    /// @param _ruling The ruling which was given.
    event Ruling(IArbitratorV2 indexed _arbitrator, uint256 indexed _disputeID, uint256 _ruling);

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /// @notice Give a ruling for a dispute.
    ///
    /// @dev This is a callback function for the arbitrator to provide the ruling to this contract.
    /// Only the arbitrator must be allowed to call this function.
    /// Ruling 0 is reserved for "Not able/wanting to make a decision".
    ///
    /// @param _disputeID The identifier of the dispute in the Arbitrator contract.
    /// @param _ruling Ruling given by the arbitrator.
    function rule(uint256 _disputeID, uint256 _ruling) external;
}
