// SPDX-License-Identifier: MIT

pragma solidity ^0.8.28;

import {DisputeKitClassic} from "../arbitration/dispute-kits/DisputeKitClassic.sol";

/// @title DisputeKitClassicMockUncheckedNextRoundSettings
/// DisputeKitClassic with unchecked next round settings to test `KlerosCore._getCompatibleNextRoundSettings()` fallback logic.
contract DisputeKitClassicMockUncheckedNextRoundSettings is DisputeKitClassic {
    uint96 public jumpCourtID;
    uint256 public jumpNbVotes;

    function setJumpCourt(uint96 _jumpCourtID) external {
        jumpCourtID = _jumpCourtID;
    }

    function setJumpDK(uint256 _jumpDisputeKitID) external {
        jumpDisputeKitID = _jumpDisputeKitID;
    }

    function setJumpNbVotes(uint256 _jumpNbVotes) external {
        jumpNbVotes = _jumpNbVotes;
    }

    function getNextRoundSettings(uint256 /*_coreDisputeID*/) public view override returns (uint96, uint256, uint256) {
        return (jumpCourtID, jumpDisputeKitID, jumpNbVotes);
    }
}
