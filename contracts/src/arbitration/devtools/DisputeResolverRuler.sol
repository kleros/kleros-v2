// SPDX-License-Identifier: MIT

import {DisputeResolver, IArbitratorV2, IDisputeTemplateRegistry} from "../arbitrables/DisputeResolver.sol";

pragma solidity ^0.8.24;

interface IKlerosCoreRulerFragment {
    function getNextDisputeID() external view returns (uint256);
}

/// @title DisputeResolverRuler
/// @notice Extension of the DisputeResolver for development tooling and testing of the automatic ruling modes.
/// @dev The arbitrator disputeID must be known before dispute creation, otherwise the dispute cannot be retrieved during the immediate call to rule().
contract DisputeResolverRuler is DisputeResolver {
    // ************************************* //
    // *            Constructor            * //
    // ************************************* //

    /// @notice Constructor
    /// @param _arbitrator Target global arbitrator for any disputes.
    constructor(
        IArbitratorV2 _arbitrator,
        IDisputeTemplateRegistry _templateRegistry
    ) DisputeResolver(_arbitrator, _templateRegistry) {
        owner = msg.sender;
    }

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    function _createDispute(
        bytes calldata _arbitratorExtraData,
        string memory _disputeTemplate,
        string memory _disputeTemplateDataMappings,
        uint256 _numberOfRulingOptions
    ) internal override returns (uint256 arbitratorDisputeID) {
        if (_numberOfRulingOptions <= 1) revert ShouldBeAtLeastTwoRulingOptions();

        uint256 localDisputeID = disputes.length;
        DisputeStruct storage dispute = disputes.push();
        dispute.arbitratorExtraData = _arbitratorExtraData;
        dispute.numberOfRulingOptions = _numberOfRulingOptions;

        // Keep track of the upcoming dispute ID before dispute creation, so rule() can be called immediately after.
        arbitratorDisputeID = IKlerosCoreRulerFragment(address(arbitrator)).getNextDisputeID();
        arbitratorDisputeIDToLocalID[arbitratorDisputeID] = localDisputeID;
        uint256 templateId = templateRegistry.setDisputeTemplate("", _disputeTemplate, _disputeTemplateDataMappings);
        emit DisputeRequest(arbitrator, arbitratorDisputeID, localDisputeID, templateId);

        arbitrator.createDispute{value: msg.value}(_numberOfRulingOptions, _arbitratorExtraData);
    }
}
