// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "../proxy/UUPSProxiable.sol";
import "../proxy/Initializable.sol";
import "./interfaces/IDisputeTemplateRegistry.sol";

/// @title Dispute Template Registry
/// @dev A contract to maintain a registry of dispute templates.
contract DisputeTemplateRegistry is IDisputeTemplateRegistry, UUPSProxiable, Initializable {
    string public constant override version = "0.8.0";

    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    /// @dev The governor of the contract.
    address public governor;

    /// @dev The number of templates.
    uint256 public templates;

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

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /// @dev Initializer
    /// @param _governor Governor of the contract.
    function initialize(address _governor) external reinitializer(1) {
        governor = _governor;
    }

    function initialize2() external reinitializer(2) {
        // NOP
    }

    // ************************ //
    // *      Governance      * //
    // ************************ //

    /// @dev Access Control to perform implementation upgrades (UUPS Proxiable)
    ///      Only the governor can perform upgrades (`onlyByGovernor`)
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
