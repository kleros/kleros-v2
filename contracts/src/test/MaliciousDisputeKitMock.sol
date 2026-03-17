// SPDX-License-Identifier: MIT

pragma solidity ^0.8.28;

import {IDisputeKit} from "../arbitration/interfaces/IDisputeKit.sol";
import {DisputeKitClassic} from "../arbitration/dispute-kits/DisputeKitClassic.sol";
import {ONE_BASIS_POINT} from "../libraries/Constants.sol";

/// @title MaliciousDisputeKitMock
/// Mock dispute kit to emulate reward overspending
contract MaliciousDisputeKitMock is DisputeKitClassic {
    /// @notice Gets the rewards for PNK and fees based on coherence and total reward pool.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core, not in the Dispute Kit.
    /// @param _coreRoundID The ID of the round in Kleros Core, not in the Dispute Kit.
    /// @param - voteID The ID of the vote.
    /// @param _coherentCount The number of jurors eligible for reward.
    /// @param _pnkRewardPool Total amount of PNK available for rewards to all coherent jurors.
    /// @param _pnkCoherence The degree of coherence in basis points for the dispute PNK reward.
    /// @param _feeCoherence The degree of coherence in basis points for the dispute fee reward.
    /// @return pnkReward The pnk reward the juror is eligible to.
    /// @return feeReward The fee reward the juror is eligible to.
    function getRewards(
        uint256 _coreDisputeID,
        uint256 _coreRoundID,
        uint256 /*_voteID*/,
        uint256 _coherentCount,
        uint256 _pnkRewardPool,
        uint256 _pnkCoherence,
        uint256 _feeCoherence
    ) external view override returns (uint256 pnkReward, uint256 feeReward) {
        uint256 feeRewardPool = core.getTotalFeesForJurors(_coreDisputeID, _coreRoundID);

        uint256 availablePnkAmount = _pnkRewardPool / _coherentCount;
        // Multiply the rewards
        pnkReward = ((availablePnkAmount * _pnkCoherence) / ONE_BASIS_POINT) * 2;

        uint256 availableFeeAmount = feeRewardPool / _coherentCount;
        feeReward = ((availableFeeAmount * _feeCoherence) / ONE_BASIS_POINT) * 2;
    }
}
