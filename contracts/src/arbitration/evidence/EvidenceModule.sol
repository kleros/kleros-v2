// SPDX-License-Identifier: MIT

pragma solidity ^0.8.28;

import {IEvidence} from "../interfaces/IEvidence.sol";

/// @title Evidence Module
contract EvidenceModule is IEvidence {
    // ************************************* //
    // *             Functions             * //
    // ************************************* //

    /// @notice Submits evidence for a dispute.
    /// @param _arbitratorDisputeID The identifier of the dispute in the Arbitrator contract.
    /// @param _evidence Stringified evidence object, example: `{"name" : "Justification", "description" : "Description", "fileURI" : "/ipfs/QmWQV5ZFFhEJiW8Lm7ay2zLxC2XS4wx1b2W7FfdrLMyQQc"}`.
    function submitEvidence(uint256 _arbitratorDisputeID, string calldata _evidence) external {
        emit Evidence(_arbitratorDisputeID, msg.sender, _evidence);
    }
}
