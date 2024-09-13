// SPDX-License-Identifier: MIT

/// @custom:authors: [@unknownunknown1, @jaybuidl]
/// @custom:reviewers: []
/// @custom:auditors: []
/// @custom:bounties: []

import {DisputeResolver, IArbitratorV2, IDisputeTemplateRegistry} from "../arbitrables/DisputeResolver.sol";

pragma solidity 0.8.24;

interface IKlerosCoreRulerFragment {
    function getNextDisputeID() external view returns (uint256);
}

/// @title DisputeResolver
/// DisputeResolver contract adapted for V2 from https://github.com/kleros/arbitrable-proxy-contracts/blob/master/contracts/ArbitrableProxy.sol.
contract DisputeResolverRuler is DisputeResolver {
    // ************************************* //
    // *            Constructor            * //
    // ************************************* //

    /// @dev Constructor
    /// @param _arbitrator Target global arbitrator for any disputes.
    constructor(
        IArbitratorV2 _arbitrator,
        IDisputeTemplateRegistry _templateRegistry
    ) DisputeResolver(_arbitrator, _templateRegistry) {
        governor = msg.sender;
    }

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    function _createDispute(
        bytes calldata _arbitratorExtraData,
        string memory _disputeTemplate,
        string memory _disputeTemplateDataMappings,
        string memory _disputeTemplateUri,
        uint256 _numberOfRulingOptions
    ) internal override returns (uint256 disputeID) {
        require(_numberOfRulingOptions > 1, "Should be at least 2 ruling options.");

        uint256 localDisputeID = disputes.length;
        DisputeStruct storage dispute = disputes.push();
        dispute.arbitratorExtraData = _arbitratorExtraData;
        dispute.numberOfRulingOptions = _numberOfRulingOptions;

        disputeID = IKlerosCoreRulerFragment(address(arbitrator)).getNextDisputeID();
        arbitratorDisputeIDToLocalID[disputeID] = localDisputeID;
        uint256 templateId = templateRegistry.setDisputeTemplate("", _disputeTemplate, _disputeTemplateDataMappings);
        emit DisputeRequest(arbitrator, localDisputeID, localDisputeID, templateId, _disputeTemplateUri);

        arbitrator.createDispute{value: msg.value}(_numberOfRulingOptions, _arbitratorExtraData);
    }
}
