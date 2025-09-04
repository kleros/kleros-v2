// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../proxy/UUPSProxiable.sol";
import "../proxy/Initializable.sol";
import "./interfaces/IDisputeTemplateRegistry.sol";

/// @title Dispute Template Registry
/// @dev A contract to maintain a registry of dispute templates.
contract DisputeTemplateRegistry is IDisputeTemplateRegistry, UUPSProxiable, Initializable {
    string public constant override version = "2.0.0";

    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    /// @dev The owner of the contract.
    address public owner;

    /// @dev The number of templates.
    uint256 public templates;

    // ************************************* //
    // *        Function Modifiers         * //
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

    /// @dev Initializer
    /// @param _owner Owner of the contract.
    function initialize(address _owner) external initializer {
        owner = _owner;
    }

    // ************************ //
    // *      Governance      * //
    // ************************ //

    /// @dev Access Control to perform implementation upgrades (UUPS Proxiable)
    ///      Only the owner can perform upgrades (`onlyByOwner`)
    function _authorizeUpgrade(address) internal view override onlyByOwner {
        // NOP
    }

    /// @dev Changes the owner of the contract.
    /// @param _owner The new owner.
    function changeOwner(address _owner) external onlyByOwner {
        owner = _owner;
    }

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /// @dev Registers a new dispute template.
    /// @param _templateTag The tag of the template (optional).
    /// @param _templateData The data of the template.
    /// @param _templateDataMappings The data mappings of the template.
    function setDisputeTemplate(
        string memory _templateTag,
        string memory _templateData,
        string memory _templateDataMappings
    ) external returns (uint256 templateId) {
        templateId = templates++;
        emit DisputeTemplate(templateId, _templateTag, _templateData, _templateDataMappings);
    }

    // ************************************* //
    // *              Errors               * //
    // ************************************* //

    error OwnerOnly();
}
