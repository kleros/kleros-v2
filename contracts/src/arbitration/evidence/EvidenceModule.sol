// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

import "../interfaces/IArbitratorV2.sol";
import "../interfaces/IEvidence.sol";
import "../../proxy/UUPSProxiable.sol";
import "../../proxy/Initializable.sol";

/// @title Evidence Module
contract EvidenceModule is IEvidence, Initializable, UUPSProxiable {
    string public constant override version = "0.8.0";

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

    /// @custom:oz-upgrades-unsafe-allow constructor
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
    /// @param _evidence Stringified evidence object, example: '{"name" : "Justification", "description" : "Description", "fileURI" : "/ipfs/QmWQV5ZFFhEJiW8Lm7ay2zLxC2XS4wx1b2W7FfdrLMyQQc"}'.
    function submitEvidence(uint256 _externalDisputeID, string calldata _evidence) external {
        emit Evidence(_externalDisputeID, msg.sender, _evidence);
    }
}
