// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import "../proxy/UUPSProxiable.sol";
import "../proxy/Initializable.sol";
import "./interfaces/IDisputeTemplateRegistry.sol";

/// @title Dispute Template Registry
/// @dev A contract to maintain a registry of dispute templates.
contract DisputeTemplateRegistry is IDisputeTemplateRegistry, UUPSProxiable, Initializable {
    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    address public governor; // The address that can withdraw funds.
    uint256 public templates; // The number of templates.

    // ************************************* //
    // *        Function Modifiers         * //
    // ************************************* //

    modifier onlyByGovernor() {
        require(governor == msg.sender, "Governor only");
        _;
    }

    // ************************************* //
    // *            Constructor            * //
    // ************************************* //

    /// @dev Constructor, initializing the implementation to reduce attack surface.
    constructor() {
        _disableInitializers();
    }

    /// @dev Initializer
    /// @param _governor Governor of the contract.
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

    /// @dev Changes the governor of the contract.
    /// @param _governor The new governor.
    function changeGovernor(address _governor) external onlyByGovernor {
        governor = _governor;
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
}
