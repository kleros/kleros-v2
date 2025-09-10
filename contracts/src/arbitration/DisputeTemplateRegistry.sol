// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../proxy/UUPSProxiable.sol";
import "../proxy/Initializable.sol";
import "./interfaces/IDisputeTemplateRegistry.sol";

/// @title Dispute Template Registry
/// @notice A contract to maintain a registry of dispute templates.
contract DisputeTemplateRegistry is IDisputeTemplateRegistry, UUPSProxiable, Initializable {
    string public constant override version = "2.0.0";

    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    /// @notice The owner of the contract.
    address public owner;

    /// @notice The number of templates.
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

    /// @notice Initializer
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

    /// @notice Changes the owner of the contract.
    /// @param _owner The new owner.
    function changeOwner(address _owner) external onlyByOwner {
        owner = _owner;
    }

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /// @inheritdoc IDisputeTemplateRegistry
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
