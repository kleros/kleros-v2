// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import {DisputeKitClassic} from "../arbitration/dispute-kits/DisputeKitClassic.sol";

/// @title DisputeKitClassicMockUncheckedNextRoundSettings
/// DisputeKitClassic with unchecked next round settings to test `KlerosCore._getCompatibleNextRoundSettings()` fallback logic.
contract DisputeKitClassicMockUncheckedNextRoundSettings is DisputeKitClassic {
    function getNextRoundSettings(
        uint256 /* _disputeID */,
        uint96 _currentCourtID,
        uint96 /* _parentCourtID */,
        uint256 /* _currentCourtJurorsForJump */,
        uint256 /* _currentDisputeKitID */,
        uint256 /* _currentRoundNbVotes */
    ) public view override returns (uint96 newCourtID, uint256 newDisputeKitID, uint256 newRoundNbVotes) {
        NextRoundSettings storage nextRoundSettings = courtIDToNextRoundSettings[_currentCourtID];
        newRoundNbVotes = nextRoundSettings.nbVotes;
        newCourtID = nextRoundSettings.jumpCourtID;
        newDisputeKitID = nextRoundSettings.jumpDisputeKitID;
    }
}
