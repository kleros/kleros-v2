// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;

/// @title IEvidence
interface IEvidence {
    /// @dev To be raised when evidence is submitted. Should point to the resource (evidences are not to be stored on chain due to gas considerations).
    /// @param _externalDisputeID Unique identifier for this dispute outside Kleros. It's the submitter responsibility to submit the right external dispute ID.
    /// @param _party The address of the party submiting the evidence. Note that 0x0 refers to evidence not submitted by any party.
    /// @param _evidence Stringified evidence object, example: '{"name" : "Justification", "description" : "Description", "fileURI" : "/ipfs/QmWQV5ZFFhEJiW8Lm7ay2zLxC2XS4wx1b2W7FfdrLMyQQc"}'.
    event Evidence(uint256 indexed _externalDisputeID, address indexed _party, string _evidence);
}
