// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IDisputeTemplateRegistry} from "./interfaces/IDisputeTemplateRegistry.sol";

/// @title Dispute Template Registry
/// @notice A contract to maintain a registry of dispute templates.
/// @dev Dispute templates define the structure and ruling options of disputes submitted to Kleros.
/// Data mappings allow template fields to be populated with dispute-specific data, so the same template
/// can be reused across multiple disputes.
contract DisputeTemplateRegistry is IDisputeTemplateRegistry {
    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    /// @notice The number of templates.
    uint256 public templates;

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /// @notice Registers a new dispute template.
    /// @param _templateTag An optional tag for the dispute template, such as "registration" or "removal".
    /// @param _templateData The template data.
    /// @param _templateDataMappings The data mappings for the template.
    /// @return templateId The identifier of the dispute template.
    function setDisputeTemplate(
        string calldata _templateTag,
        string calldata _templateData,
        string calldata _templateDataMappings
    ) external returns (uint256 templateId) {
        templateId = templates++;
        emit DisputeTemplate(templateId, _templateTag, _templateData, _templateDataMappings);
    }
}
