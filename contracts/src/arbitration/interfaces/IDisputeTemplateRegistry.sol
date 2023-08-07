// SPDX-License-Identifier: MIT

pragma solidity 0.8.18;

import "./IArbitratorV2.sol";

/// @title IDisputeTemplate
/// @notice Dispute Template interface.
interface IDisputeTemplateRegistry {
    /// @dev To be emitted when a new dispute template is created.
    /// @param _templateId The identifier of the dispute template.
    /// @param _templateTag An optional tag for the dispute template, such as "registration" or "removal".
    /// @param _templateData The template data.
    event DisputeTemplate(uint256 indexed _templateId, string indexed _templateTag, string _templateData);

    function setDisputeTemplate(
        string memory _templateTag,
        string memory _disputeTemplate
    ) external returns (uint256 templateId);
}
