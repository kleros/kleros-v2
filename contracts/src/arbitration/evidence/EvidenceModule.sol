// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import "../interfaces/IArbitratorV2.sol";
import "../interfaces/IEvidence.sol";
import "../../proxy/UUPSProxiable.sol";
import "../../proxy/Initializable.sol";

/// @title Evidence Module
contract EvidenceModule is IEvidence, Initializable, UUPSProxiable {
    string public constant override version = "2.0.0";

    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    address public owner; // The owner of the contract.

    // ************************************* //
    // *              Modifiers            * //
    // ************************************* //

    modifier onlyByOwner() {
        if (owner != msg.sender) revert OwnerOnly();
        _;
    }

    // ************************************* //
    // *            Constructor            * //
    // ************************************* //

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /// @notice Initializer.
    /// @param _owner The owner's address.
    function initialize(address _owner) external initializer {
        owner = _owner;
    }

    // ************************ //
    // *      Governance      * //
    // ************************ //

    /**
     * @dev Access Control to perform implementation upgrades (UUPS Proxiable)
     * @dev Only the owner can perform upgrades (`onlyByOwner`)
     */
    function _authorizeUpgrade(address) internal view override onlyByOwner {
        // NOP
    }

    // ************************************* //
    // *        Function Modifiers         * //
    // ************************************* //

    /// @notice Submits evidence for a dispute.
    /// @param _arbitratorDisputeID The identifier of the dispute in the Arbitrator contract.
    /// @param _evidence Stringified evidence object, example: `{"name" : "Justification", "description" : "Description", "fileURI" : "/ipfs/QmWQV5ZFFhEJiW8Lm7ay2zLxC2XS4wx1b2W7FfdrLMyQQc"}`.
    function submitEvidence(uint256 _arbitratorDisputeID, string calldata _evidence) external {
        emit Evidence(_arbitratorDisputeID, msg.sender, _evidence);
    }

    // ************************************* //
    // *              Errors               * //
    // ************************************* //

    error OwnerOnly();
}
