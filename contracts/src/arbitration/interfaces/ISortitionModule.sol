// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

interface ISortitionModule {
    enum Phase {
        staking, // Stake sum trees can be updated. Pass after `minStakingTime` passes and there is at least one dispute without jurors.
        generating, // Waiting for a random number. Pass as soon as it is ready.
        drawing // Jurors can be drawn. Pass after all disputes have jurors or `maxDrawingTime` passes.
    }

    event NewPhase(Phase _phase);

    function createTree(bytes32 _key, bytes memory _extraData) external;

    function setStake(
        address _account,
        uint96 _courtID,
        uint256 _newStake,
        bool _alreadyTransferred
    ) external returns (uint256 pnkDeposit, uint256 pnkWithdrawal, bool succeeded);

    function setJurorInactive(address _account) external;

    function lockStake(address _account, uint256 _relativeAmount) external;

    function unlockStake(address _account, uint256 _relativeAmount) external;

    function penalizeStake(address _account, uint256 _relativeAmount) external;

    function notifyRandomNumber(uint256 _drawnNumber) external;

    function draw(bytes32 _court, uint256 _coreDisputeID, uint256 _nonce) external view returns (address);

    function getJurorBalance(
        address _juror,
        uint96 _courtID
    ) external view returns (uint256 totalStaked, uint256 totalLocked, uint256 stakedInCourt, uint256 nbCourts);

    function getJurorCourtIDs(address _juror) external view returns (uint96[] memory);

    function isJurorStaked(address _juror) external view returns (bool);

    function createDisputeHook(uint256 _disputeID, uint256 _roundID) external;

    function postDrawHook(uint256 _disputeID, uint256 _roundID) external;
}
