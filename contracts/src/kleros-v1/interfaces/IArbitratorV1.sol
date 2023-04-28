// SPDX-License-Identifier: MIT

/// @custom:authors: [@ferittuncer, @hbarcelos, @clesaege]
/// @custom:reviewers: [@remedcu]
/// @custom:auditors: []
/// @custom:bounties: []
/// @custom:deployments: []

pragma solidity 0.8.18;

import "./IArbitrableV1.sol";

/// @title Arbitrator
/// Arbitrator abstract contract  compliant with ERC-792.
/// When developing arbitrator contracts we need to:
/// - Define the functions for dispute creation (createDispute) and appeal (appeal). Don't forget to store the arbitrated contract and the disputeID (which should be unique, may nbDisputes).
/// - Define the functions for cost display (arbitrationCost and appealCost).
/// - Allow giving rulings. For this a function must call arbitrable.rule(disputeID, ruling).
interface IArbitratorV1 {
    enum DisputeStatus {
        Waiting,
        Appealable,
        Solved
    }

    /// @dev To be emitted when a dispute is created.
    /// @param _disputeID ID of the dispute.
    /// @param _arbitrable The contract which created the dispute.
    event DisputeCreation(uint256 indexed _disputeID, IArbitrableV1 indexed _arbitrable);

    /// @dev To be emitted when a dispute can be appealed.
    /// @param _disputeID ID of the dispute.
    /// @param _arbitrable The contract which created the dispute.
    event AppealPossible(uint256 indexed _disputeID, IArbitrableV1 indexed _arbitrable);

    /// @dev To be emitted when the current ruling is appealed.
    /// @param _disputeID ID of the dispute.
    /// @param _arbitrable The contract which created the dispute.
    event AppealDecision(uint256 indexed _disputeID, IArbitrableV1 indexed _arbitrable);

    /// @dev Create a dispute. Must be called by the arbitrable contract.
    /// Must be paid at least arbitrationCost(_extraData).
    /// @param _choices Amount of choices the arbitrator can make in this dispute.
    /// @param _extraData Can be used to give additional info on the dispute to be created.
    /// @return disputeID ID of the dispute created.
    function createDispute(uint256 _choices, bytes calldata _extraData) external payable returns (uint256 disputeID);

    /// @dev Compute the cost of arbitration. It is recommended not to increase it often, as it can be highly time and gas consuming for the arbitrated contracts to cope with fee augmentation.
    /// @param _extraData Can be used to give additional info on the dispute to be created.
    /// @return cost Amount to be paid.
    function arbitrationCost(bytes calldata _extraData) external view returns (uint256 cost);

    /// @dev Appeal a ruling. Note that it has to be called before the arbitrator contract calls rule.
    /// @param _disputeID ID of the dispute to be appealed.
    /// @param _extraData Can be used to give extra info on the appeal.
    function appeal(uint256 _disputeID, bytes calldata _extraData) external payable;

    /// @dev Compute the cost of appeal. It is recommended not to increase it often, as it can be higly time and gas consuming for the arbitrated contracts to cope with fee augmentation.
    /// @param _disputeID ID of the dispute to be appealed.
    /// @param _extraData Can be used to give additional info on the dispute to be created.
    /// @return cost Amount to be paid.
    function appealCost(uint256 _disputeID, bytes calldata _extraData) external view returns (uint256 cost);

    /// @dev Compute the start and end of the dispute's current or next appeal period, if possible. If not known or appeal is impossible: should return (0, 0).
    /// @param _disputeID ID of the dispute.
    /// @return start The start of the period.
    /// @return end The end of the period.
    function appealPeriod(uint256 _disputeID) external view returns (uint256 start, uint256 end);

    /// @dev Return the status of a dispute.
    /// @param _disputeID ID of the dispute to rule.
    /// @return status The status of the dispute.
    function disputeStatus(uint256 _disputeID) external view returns (DisputeStatus status);

    /// @dev Return the current ruling of a dispute. This is useful for parties to know if they should appeal.
    /// @param _disputeID ID of the dispute.
    /// @return ruling The ruling which has been given or the one which will be given if there is no appeal.
    function currentRuling(uint256 _disputeID) external view returns (uint256 ruling);
}
