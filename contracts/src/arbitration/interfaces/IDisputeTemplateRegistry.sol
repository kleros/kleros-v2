// SPDX-License-Identifier: MIT

pragma solidity 0.8.18;

/// @title IDisputeTemplate
/// @notice Dispute Template interface.
interface IDisputeTemplateRegistry {
    /// @dev To be emitted when a new dispute template is created.
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

    function setDisputeTemplate(
        string memory _templateTag,
        string memory _templateData,
        string memory _templateDataMappings
    ) external returns (uint256 templateId);
}
