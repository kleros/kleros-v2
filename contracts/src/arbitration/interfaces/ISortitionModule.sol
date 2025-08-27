// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;

import "../../libraries/Constants.sol";

interface ISortitionModule {
    enum Phase {
        staking, // Stake sum trees can be updated. Pass after `minStakingTime` passes and there is at least one dispute without jurors.
        generating, // Waiting for a random number. Pass as soon as it is ready.
        drawing // Jurors can be drawn. Pass after all disputes have jurors or `maxDrawingTime` passes.
    }

    event NewPhase(Phase _phase);

    function createTree(uint96 _courtID, bytes memory _extraData) external;

    function validateStake(
        address _account,
        uint96 _courtID,
        uint256 _newStake,
        bool _noDelay
    ) external returns (uint256 pnkDeposit, uint256 pnkWithdrawal, StakingResult stakingResult);

    function setStake(
        address _account,
        uint96 _courtID,
        uint256 _pnkDeposit,
        uint256 _pnkWithdrawal,
        uint256 _newStake
    ) external;

    function setStakePenalty(
        address _account,
        uint96 _courtID,
        uint256 _penalty
    ) external returns (uint256 pnkBalance, uint256 newCourtStake, uint256 availablePenalty);

    function setStakeReward(address _account, uint96 _courtID, uint256 _reward) external returns (bool success);

    function forcedUnstakeAllCourts(address _account) external;

    function forcedUnstake(address _account, uint96 _courtID) external;

    function lockStake(address _account, uint256 _relativeAmount) external;

    function unlockStake(address _account, uint256 _relativeAmount) external;

    function notifyRandomNumber(uint256 _drawnNumber) external;

    function draw(
        uint96 _courtID,
        uint256 _coreDisputeID,
        uint256 _nonce
    ) external view returns (address drawnAddress, uint96 fromSubcourtID);

    function getJurorBalance(
        address _juror,
        uint96 _courtID
    ) external view returns (uint256 totalStaked, uint256 totalLocked, uint256 stakedInCourt, uint256 nbCourts);

    function getJurorCourtIDs(address _juror) external view returns (uint96[] memory);

    function isJurorStaked(address _juror) external view returns (bool);

    function getJurorLeftoverPNK(address _juror) external view returns (uint256);

    function createDisputeHook(uint256 _disputeID, uint256 _roundID) external;

    function postDrawHook(uint256 _disputeID, uint256 _roundID) external;

    function withdrawLeftoverPNK(address _account) external;
}
