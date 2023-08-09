// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import "./interfaces/IDisputeTemplateRegistry.sol";

/// @title Dispute Template Registry
/// @dev A contract to maintain a registry of dispute templates.
contract DisputeTemplateRegistry is IDisputeTemplateRegistry {
    uint256 public templates;

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    function setDisputeTemplate(
        string memory _templateTag,
        string memory _templateData,
        string memory _templateDataMappings
    ) external returns (uint256 templateId) {
        templateId = templates++;
        emit DisputeTemplate(templateId, _templateTag, _templateData, _templateDataMappings);
    }
}
