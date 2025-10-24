// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;

/// @title IDisputeTemplateRegistry
/// @notice Dispute Template Registry interface.
interface IDisputeTemplateRegistry {
    // ************************************* //
    // *              Events               * //
    // ************************************* //

    /// @notice To be emitted when a new dispute template is created.
    /// @param _templateId The identifier of the dispute template.
    /// @param _templateTag An optional tag for the dispute template, such as "registration" or "removal".
    /// @param _templateData The template data.
    /// @param _templateDataMappings The data mappings.
    event DisputeTemplate(
        uint256 indexed _templateId,
        string indexed _templateTag,
        string _templateData,
        string _templateDataMappings
    );

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /// @notice Registers a new dispute template.
    /// @param _templateTag An optional tag for the dispute template, such as "registration" or "removal".
    /// @param _templateData The template data.
    /// @param _templateDataMappings The data mappings for the template.
    /// @return templateId The identifier of the dispute template.
    function setDisputeTemplate(
        string memory _templateTag,
        string memory _templateData,
        string memory _templateDataMappings
    ) external returns (uint256 templateId);
}
