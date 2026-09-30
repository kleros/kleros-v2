// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;

import {IArbitrableV2} from "./IArbitrableV2.sol";

/// @title Arbitrator
/// @notice Arbitrator interface for the Kleros V2 protocol.
/// @dev Unlike the ERC-792 this standard is not concerned with appeals, so each arbitrator can implement an appeal system that suits it the most.
interface IArbitratorV2 {
    // ************************************* //
    // *              Events               * //
    // ************************************* //

    /// @notice To be emitted when a dispute is created.
    /// @param _disputeID The identifier of the dispute in the Arbitrator contract.
    /// @param _arbitrable The contract which created the dispute.
    event DisputeCreation(uint256 indexed _disputeID, IArbitrableV2 indexed _arbitrable);

    /// @notice To be emitted when a ruling becomes final.
    /// @param _arbitrable The arbitrable receiving the ruling.
    /// @param _disputeID The identifier of the dispute in the Arbitrator contract.
    /// @param _ruling The ruling which was given.
    event Ruling(IArbitrableV2 indexed _arbitrable, uint256 indexed _disputeID, uint256 _ruling);

    /// @notice To be raised when a ruling is relayed to arbitrable.
    /// @param _arbitrable The arbitrable receiving the ruling.
    /// @param _disputeID The identifier of the dispute in the Arbitrator contract.
    /// @param _ruling The ruling which was executed.
    event RulingExecuted(IArbitrableV2 indexed _arbitrable, uint256 indexed _disputeID, uint256 _ruling);

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /// @notice Create a dispute and pay for the fees.
    /// @dev Must be called by the arbitrable contract and pay at least `arbitrationCost(_extraData)`.
    /// @param _numberOfChoices The number of choices the arbitrator can choose from in this dispute.
    /// @param _extraData Additional info about the dispute. We use it to pass the ID of the dispute's court (first 32 bytes), the minimum number of jurors required (next 32 bytes) and the ID of the specific dispute kit (last 32 bytes).
    /// @return disputeID The identifier of the dispute created.
    function createDispute(
        uint256 _numberOfChoices,
        bytes calldata _extraData
    ) external payable returns (uint256 disputeID);

    // ************************************* //
    // *           Public Views            * //
    // ************************************* //

    /// @notice Compute the cost of arbitration.
    /// @dev It is recommended not to increase it often, as it can be highly time and gas consuming for the arbitrated contracts to cope with fee augmentation.
    /// @param _extraData Additional info about the dispute. We use it to pass the ID of the dispute's court (first 32 bytes), the minimum number of jurors required (next 32 bytes) and the ID of the specific dispute kit (last 32 bytes).
    /// @return cost The arbitration cost in ETH.
    function arbitrationCost(bytes calldata _extraData) external view returns (uint256 cost);

    /// @notice Gets the current ruling of a specified dispute.
    /// @param _disputeID The ID of the dispute.
    /// @return ruling The current ruling.
    /// @return tied Whether it's a tie or not.
    /// @return overridden Whether the ruling was overridden by appeal funding or not.
    function currentRuling(uint256 _disputeID) external view returns (uint256 ruling, bool tied, bool overridden);
}
