// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;

/// @title IEvidence
interface IEvidence {
    /// @notice To be raised when evidence is submitted. Should point to the resource (evidences are not to be stored on chain due to gas considerations).
    /// @param _arbitratorDisputeID The identifier of the dispute in the Arbitrator contract.
    /// @param _party The address of the party submitting the evidence.
    /// @param _evidence Stringified evidence object, example: '{"name" : "Justification", "description" : "Description", "fileURI" : "/ipfs/QmWQV5ZFFhEJiW8Lm7ay2zLxC2XS4wx1b2W7FfdrLMyQQc"}'.
    event Evidence(uint256 indexed _arbitratorDisputeID, address indexed _party, string _evidence);
}
