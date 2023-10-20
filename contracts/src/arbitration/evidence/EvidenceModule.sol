// SPDX-License-Identifier: MIT

/// @custom:authors: [@jaybuidl, @fnanni-0]
/// @custom:reviewers: []
/// @custom:auditors: []
/// @custom:bounties: []
/// @custom:deployments: []
/// @custom:tools: []

pragma solidity 0.8.18;

import "../interfaces/IArbitratorV2.sol";
import "../interfaces/IEvidence.sol";
import "../../proxy/UUPSProxiable.sol";
import "../../proxy/Initializable.sol";

/// @title Evidence Module
contract EvidenceModule is IEvidence, Initializable, UUPSProxiable {
    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    address public governor; // The governor of the contract.

    // ************************************* //
    // *              Modifiers            * //
    // ************************************* //

    modifier onlyByGovernor() {
        require(governor == msg.sender, "Access not allowed: Governor only.");
        _;
    }

    // ************************************* //
    // *            Constructor            * //
    // ************************************* //

    /// @dev Constructor, initializing the implementation to reduce attack surface.
    constructor() {
        _disableInitializers();
    }

    /// @dev Initializer.
    /// @param _governor The governor's address.
    function initialize(address _governor) external reinitializer(1) {
        governor = _governor;
    }

    // ************************ //
    // *      Governance      * //
    // ************************ //

    /**
     * @dev Access Control to perform implementation upgrades (UUPS Proxiable)
     * @dev Only the governor can perform upgrades (`onlyByGovernor`)
     */
    function _authorizeUpgrade(address) internal view override onlyByGovernor {
        // NOP
    }

    // ************************************* //
    // *        Function Modifiers         * //
    // ************************************* //

    /// @dev Submits evidence for a dispute.
    /// @param _externalDisputeID Unique identifier for this dispute outside Kleros. It's the submitter responsability to submit the right evidence group ID.
    /// @param _evidence IPFS path to evidence, example: '/ipfs/Qmarwkf7C9RuzDEJNnarT3WZ7kem5bk8DZAzx78acJjMFH/evidence.json'.
    function submitEvidence(uint256 _externalDisputeID, string calldata _evidence) external {
        emit Evidence(_externalDisputeID, msg.sender, _evidence);
    }
}
