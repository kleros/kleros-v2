// SPDX-License-Identifier: MIT

pragma solidity ^0.8.28;

import {IDisputeKit} from "../arbitration/interfaces/IDisputeKit.sol";
import {DisputeKitClassic} from "../arbitration/dispute-kits/DisputeKitClassic.sol";
import {ONE_BASIS_POINT} from "../libraries/Constants.sol";

/// @title MaliciousDisputeKitMock
/// Mock dispute kit to emulate reward and penalty overspending.
contract MaliciousDisputeKitMock is DisputeKitClassic {
    /// @notice Gets the rewards for PNK and fees.
    /// @notice Intended to be called by KlerosCore. External callers must validate inputs beforehand.
    /// @notice Does not validate that coreDisputeID/coreRoundID is known in this dispute kit. Passing unknown IDs may return data for localDisputeID/localRoundID 0.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core.
    /// @param _coreRoundID The ID of the round in Kleros Core.
    /// @param _voteID The ID of the vote.
    /// @param _feeRewardPool Total amount of fees available for rewards to all coherent jurors.
    /// @param _pnkRewardPool Total amount of PNK available for rewards to all coherent jurors.
    /// @return feeReward The fee reward the juror is eligible to.
    /// @return pnkReward The pnk reward the juror is eligible to.
    function getRewards(
        uint256 _coreDisputeID,
        uint256 _coreRoundID,
        uint256 _voteID,
        uint256 _feeRewardPool,
        uint256 _pnkRewardPool
    ) external view override returns (uint256 feeReward, uint256 pnkReward) {
        Dispute storage dispute = disputes[coreDisputeIDToLocal[_coreDisputeID]];
        Round storage currentRound = dispute.rounds[dispute.coreRoundIDToLocal[_coreRoundID]];
        Vote storage vote = currentRound.votes[_voteID];

        (uint256 winningChoice, bool tied, ) = core.currentRuling(_coreDisputeID);

        uint256 coherentCount = tied ? currentRound.totalVoted : currentRound.counts[winningChoice];
        uint256 coherence;
        if (vote.voted && (vote.choice == winningChoice || tied)) {
            coherence = ONE_BASIS_POINT;
        } else if (coherentCount == 0) {
            return (0, 0);
        }

        uint256 availablePnkAmount = _pnkRewardPool / coherentCount;
        // Multiply the rewards
        pnkReward = ((availablePnkAmount * coherence) / ONE_BASIS_POINT) * 2;

        uint256 availableFeeAmount = _feeRewardPool / coherentCount;
        feeReward = ((availableFeeAmount * coherence) / ONE_BASIS_POINT) * 2;
    }

    /// @notice Gets the pnk penalty for incoherent juror.
    /// @notice Intended to be called by KlerosCore. External callers must validate inputs beforehand.
    /// @notice Does not validate that coreDisputeID/coreRoundID is known in this dispute kit. Passing unknown IDs may return data for localDisputeID/localRoundID 0.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core.
    /// @param _coreRoundID The ID of the round in Kleros Core.
    /// @param _voteID The ID of the vote.
    /// @param _pnkAtStake Pnk amount subjected to penalty.
    /// @return penalty Juror's penalty.
    function getPenalty(
        uint256 _coreDisputeID,
        uint256 _coreRoundID,
        uint256 _voteID,
        uint256 _pnkAtStake
    ) external view override returns (uint256 penalty) {
        Dispute storage dispute = disputes[coreDisputeIDToLocal[_coreDisputeID]];
        Vote storage vote = dispute.rounds[dispute.coreRoundIDToLocal[_coreRoundID]].votes[_voteID];

        (uint256 winningChoice, bool tied, ) = core.currentRuling(_coreDisputeID);

        uint256 coherence;
        if (vote.voted && (vote.choice == winningChoice || tied)) {
            coherence = ONE_BASIS_POINT;
        }

        penalty = ((_pnkAtStake * (ONE_BASIS_POINT - coherence)) / ONE_BASIS_POINT) * 5;
    }
}
