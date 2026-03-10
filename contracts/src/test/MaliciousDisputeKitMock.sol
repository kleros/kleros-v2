// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import {IDisputeKit} from "../arbitration/interfaces/IDisputeKit.sol";
import {DisputeKitClassic} from "../arbitration/dispute-kits/DisputeKitClassic.sol";
import {ONE_BASIS_POINT} from "../libraries/Constants.sol";

/// @title MaliciousDisputeKitMock
/// Mock dispute kit to emulate reward overspending
contract MaliciousDisputeKitMock is DisputeKitClassic {
    /// @inheritdoc IDisputeKit
    function getRewards(
        uint256 _coreDisputeID,
        uint256 _coreRoundID,
        uint256 /*_voteID*/,
        uint256 _coherentCount,
        uint256 _pnkRewardPool,
        uint256 _pnkCoherence,
        uint256 _feeCoherence
    ) external view override returns (uint256 pnkReward, uint256 feeReward) {
        uint256 feeRewardPool = core.getRoundInfo(_coreDisputeID, _coreRoundID).totalFeesForJurors;

        uint256 availablePnkAmount = _pnkRewardPool / _coherentCount;
        // Multiply the rewards
        pnkReward = ((availablePnkAmount * _pnkCoherence) / ONE_BASIS_POINT) * 2;

        uint256 availableFeeAmount = feeRewardPool / _coherentCount;
        feeReward = ((availableFeeAmount * _feeCoherence) / ONE_BASIS_POINT) * 2;
    }
}
